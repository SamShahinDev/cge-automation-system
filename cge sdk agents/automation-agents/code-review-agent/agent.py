#!/usr/bin/env python3
"""
Code Review Agent for Crowned Gladiator Projects
Production-ready automated code review using Claude API
"""

import os
import re
import asyncio
import sys
import traceback
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import yaml
from dotenv import load_dotenv
from anthropic import Anthropic, APIError as AnthropicAPIError
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)

from logger import setup_logging, get_logger
from exceptions import (
    CodeReviewError,
    ConfigurationError,
    ProjectNotFoundError,
    InvalidProjectTypeError,
    APIError,
    FileAnalysisError,
    ReportGenerationError,
    AutoFixError,
)

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logging(
    log_level=os.getenv("LOG_LEVEL", "INFO"),
    log_file=os.getenv("LOG_FILE"),
    enable_sentry=os.getenv("ENABLE_SENTRY", "false").lower() == "true"
)


class CodeReviewAgent:
    """Production-ready code review agent with comprehensive error handling"""

    def __init__(self, project_path: str, project_type: str = "crm"):
        """
        Initialize the code review agent

        Args:
            project_path: Path to the project to review
            project_type: Type of project (crm, portal, website)

        Raises:
            ProjectNotFoundError: If project path doesn't exist
            InvalidProjectTypeError: If project type is not supported
            ConfigurationError: If configuration is invalid
        """
        logger.info("Initializing Code Review Agent",
                   project_path=project_path,
                   project_type=project_type)

        # Validate project path
        self.project_path = Path(project_path).resolve()
        if not self.project_path.exists():
            logger.error("Project path does not exist", path=str(self.project_path))
            raise ProjectNotFoundError(f"Project path does not exist: {self.project_path}")

        if not self.project_path.is_dir():
            logger.error("Project path is not a directory", path=str(self.project_path))
            raise ProjectNotFoundError(f"Project path is not a directory: {self.project_path}")

        self.project_type = project_type

        # Initialize Anthropic client with validation
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            logger.error("ANTHROPIC_API_KEY not found in environment")
            raise ConfigurationError("ANTHROPIC_API_KEY environment variable is required")

        try:
            self.client = Anthropic(api_key=api_key)
        except Exception as e:
            logger.error("Failed to initialize Anthropic client", error=str(e))
            raise ConfigurationError(f"Failed to initialize Anthropic client: {e}")

        # Load and validate configuration
        try:
            self.config = self._load_config()
        except Exception as e:
            logger.error("Failed to load configuration", error=str(e))
            raise ConfigurationError(f"Failed to load configuration: {e}")

        # Validate project type
        if project_type not in self.config.get('project_types', {}):
            valid_types = list(self.config.get('project_types', {}).keys())
            logger.error("Invalid project type",
                        project_type=project_type,
                        valid_types=valid_types)
            raise InvalidProjectTypeError(
                f"Invalid project type: {project_type}. Valid types: {valid_types}"
            )

        self.project_config = self.config['project_types'][project_type]

        # Initialize state
        self.issues: List[Dict[str, Any]] = []
        self.stats = {
            'files_checked': 0,
            'files_failed': 0,
            'critical_issues': 0,
            'warnings': 0,
            'auto_fixed': 0,
            'api_calls': 0,
            'api_errors': 0,
        }

        logger.info("Code Review Agent initialized successfully",
                   project_name=self.project_config.get('name'))

    def _load_config(self) -> Dict[str, Any]:
        """Load and validate configuration file"""
        config_path = Path(__file__).parent / "config.yaml"

        if not config_path.exists():
            raise ConfigurationError(f"Configuration file not found: {config_path}")

        try:
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)

            # Validate required fields
            required_fields = ['project_types']
            for field in required_fields:
                if field not in config:
                    raise ConfigurationError(f"Missing required config field: {field}")

            return config

        except yaml.YAMLError as e:
            raise ConfigurationError(f"Invalid YAML in config file: {e}")

    def find_files(self) -> List[Path]:
        """
        Find all relevant files to check

        Returns:
            List of file paths to review

        Raises:
            FileAnalysisError: If file discovery fails
        """
        logger.info("Discovering files to review")

        try:
            files = []
            patterns = self.project_config.get('file_patterns', ['**/*.tsx', '**/*.ts'])
            exclude = self.project_config.get('exclude_patterns', [])

            for pattern in patterns:
                try:
                    for file_path in self.project_path.glob(pattern):
                        # Check if file should be excluded
                        should_exclude = False
                        for exclude_pattern in exclude:
                            if file_path.match(exclude_pattern):
                                should_exclude = True
                                break

                        if not should_exclude and file_path.is_file():
                            files.append(file_path)

                except Exception as e:
                    logger.warning("Error processing pattern",
                                 pattern=pattern,
                                 error=str(e))
                    continue

            logger.info("File discovery complete", file_count=len(files))
            return files

        except Exception as e:
            logger.error("File discovery failed", error=str(e))
            raise FileAnalysisError(f"Failed to discover files: {e}")

    def check_console_logs(self, file_path: Path, content: str) -> List[Dict[str, Any]]:
        """Check for console.log statements with error handling"""
        try:
            issues = []
            lines = content.split('\n')

            for i, line in enumerate(lines, 1):
                try:
                    if re.search(r'console\.(log|debug|info|warn|error)', line):
                        # Skip if it's in a comment
                        if '//' in line:
                            comment_idx = line.index('//')
                            console_idx = line.find('console')
                            if comment_idx < console_idx:
                                continue

                        issues.append({
                            'type': 'console_log',
                            'severity': 'warning',
                            'file': str(file_path.relative_to(self.project_path)),
                            'line': i,
                            'message': 'Console statement found',
                            'code': line.strip()[:100],  # Limit code snippet length
                            'auto_fixable': True
                        })

                except Exception as e:
                    logger.warning("Error checking line for console logs",
                                 file=str(file_path),
                                 line=i,
                                 error=str(e))
                    continue

            return issues

        except Exception as e:
            logger.error("Console log check failed",
                        file=str(file_path),
                        error=str(e))
            return []

    def check_error_handling(self, file_path: Path, content: str) -> List[Dict[str, Any]]:
        """Check for proper error handling with validation"""
        try:
            issues = []

            # Check for try-catch blocks
            has_async = 'async ' in content
            has_fetch = 'fetch(' in content or 'axios' in content
            has_try_catch = 'try {' in content or 'try{' in content

            if (has_async or has_fetch) and not has_try_catch:
                issues.append({
                    'type': 'error_handling',
                    'severity': 'critical',
                    'file': str(file_path.relative_to(self.project_path)),
                    'line': 1,
                    'message': 'Async operations without try-catch block',
                    'auto_fixable': False
                })

            # Check for empty catch blocks
            empty_catch_pattern = r'catch\s*\([^)]*\)\s*\{\s*\}'
            if re.search(empty_catch_pattern, content):
                issues.append({
                    'type': 'error_handling',
                    'severity': 'critical',
                    'file': str(file_path.relative_to(self.project_path)),
                    'line': 1,
                    'message': 'Empty catch block found',
                    'auto_fixable': False
                })

            return issues

        except Exception as e:
            logger.error("Error handling check failed",
                        file=str(file_path),
                        error=str(e))
            return []

    def check_loading_states(self, file_path: Path, content: str) -> List[Dict[str, Any]]:
        """Check for loading states in components"""
        try:
            issues = []

            # Check if component has async data fetching
            has_fetch = 'fetch(' in content or 'axios' in content or 'useQuery' in content
            has_loading_state = 'isLoading' in content or 'loading' in content or 'isPending' in content

            if has_fetch and not has_loading_state:
                issues.append({
                    'type': 'loading_state',
                    'severity': 'warning',
                    'file': str(file_path.relative_to(self.project_path)),
                    'line': 1,
                    'message': 'Data fetching without loading state',
                    'auto_fixable': False
                })

            return issues

        except Exception as e:
            logger.error("Loading state check failed",
                        file=str(file_path),
                        error=str(e))
            return []

    def check_placeholder_data(self, file_path: Path, content: str) -> List[Dict[str, Any]]:
        """Check for placeholder or dummy data"""
        try:
            issues = []
            placeholders = ['TODO', 'FIXME', 'PLACEHOLDER', 'dummy', 'test@test.com', 'lorem ipsum']

            lines = content.split('\n')
            for i, line in enumerate(lines, 1):
                try:
                    for placeholder in placeholders:
                        if placeholder.lower() in line.lower():
                            # Skip if it's in a comment explaining something
                            if '//' in line or '/*' in line or '*/' in line:
                                continue

                            issues.append({
                                'type': 'placeholder_data',
                                'severity': 'critical',
                                'file': str(file_path.relative_to(self.project_path)),
                                'line': i,
                                'message': f'Placeholder found: {placeholder}',
                                'code': line.strip()[:100],
                                'auto_fixable': False
                            })
                            break  # Only report once per line

                except Exception as e:
                    logger.warning("Error checking line for placeholders",
                                 file=str(file_path),
                                 line=i,
                                 error=str(e))
                    continue

            return issues

        except Exception as e:
            logger.error("Placeholder check failed",
                        file=str(file_path),
                        error=str(e))
            return []

    def check_mobile_responsive(self, file_path: Path, content: str) -> List[Dict[str, Any]]:
        """Check for mobile responsiveness patterns"""
        try:
            issues = []

            # Check if component has JSX/TSX
            if not ('.tsx' in str(file_path) or '.jsx' in str(file_path)):
                return issues

            has_jsx = 'return (' in content or 'return(' in content or '<div' in content
            if not has_jsx:
                return issues

            # Check for responsive patterns
            has_responsive = any([
                'sm:' in content,
                'md:' in content,
                'lg:' in content,
                'xl:' in content,
                '@media' in content,
                'useMediaQuery' in content
            ])

            # Check if it's a layout component
            is_layout = 'layout' in file_path.name.lower() or 'page' in file_path.name.lower()

            if is_layout and not has_responsive:
                issues.append({
                    'type': 'mobile_responsive',
                    'severity': 'warning',
                    'file': str(file_path.relative_to(self.project_path)),
                    'line': 1,
                    'message': 'Layout component may lack responsive design',
                    'auto_fixable': False
                })

            return issues

        except Exception as e:
            logger.error("Mobile responsive check failed",
                        file=str(file_path),
                        error=str(e))
            return []

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(AnthropicAPIError),
        before_sleep=before_sleep_log(logger, "WARNING")
    )
    async def analyze_with_claude(self, file_path: Path, content: str) -> List[Dict[str, Any]]:
        """
        Use Claude to perform deep code analysis with retry logic

        Args:
            file_path: Path to the file being analyzed
            content: File content

        Returns:
            List of issues found by Claude

        Raises:
            APIError: If Claude API call fails after retries
        """
        try:
            self.stats['api_calls'] += 1

            # Limit content size to avoid token limits
            max_content_length = 4000
            truncated_content = content[:max_content_length]
            if len(content) > max_content_length:
                logger.debug("Content truncated for analysis",
                           file=str(file_path),
                           original_length=len(content),
                           truncated_length=max_content_length)

            prompt = f"""Analyze this {self.project_type} code file for potential issues:

File: {file_path.name}
Project Type: {self.project_config.get('name', 'Unknown')}

Code:
```
{truncated_content}
```

Check for:
1. Security vulnerabilities (SQL injection, XSS, exposed secrets)
2. Performance issues (unnecessary re-renders, large bundles)
3. Accessibility issues (missing ARIA labels, poor semantics)
4. Best practices violations
5. TypeScript type safety issues

Return findings as a JSON array with this structure:
[
  {{
    "type": "security|performance|accessibility|best_practice|type_safety",
    "severity": "critical|warning|info",
    "line": <line_number>,
    "message": "Description of the issue",
    "suggestion": "How to fix it"
  }}
]

Only include real issues. Return empty array if code is good.
"""

            logger.debug("Calling Claude API", file=str(file_path))

            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Parse Claude's response
            response_text = message.content[0].text

            # Extract JSON from response
            import json
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                try:
                    claude_issues = json.loads(json_match.group())

                    # Format and validate issues
                    formatted_issues = []
                    for issue in claude_issues:
                        if not isinstance(issue, dict):
                            logger.warning("Invalid issue format from Claude", issue=issue)
                            continue

                        formatted_issues.append({
                            'type': issue.get('type', 'unknown'),
                            'severity': issue.get('severity', 'warning'),
                            'file': str(file_path.relative_to(self.project_path)),
                            'line': issue.get('line', 1),
                            'message': issue.get('message', ''),
                            'suggestion': issue.get('suggestion', ''),
                            'auto_fixable': False
                        })

                    logger.debug("Claude analysis complete",
                               file=str(file_path),
                               issues_found=len(formatted_issues))

                    return formatted_issues

                except json.JSONDecodeError as e:
                    logger.warning("Failed to parse Claude response as JSON",
                                 file=str(file_path),
                                 error=str(e))

            return []

        except AnthropicAPIError as e:
            self.stats['api_errors'] += 1
            logger.error("Claude API error",
                        file=str(file_path),
                        error=str(e),
                        error_type=type(e).__name__)
            raise APIError(f"Claude API call failed: {e}")

        except Exception as e:
            self.stats['api_errors'] += 1
            logger.error("Unexpected error in Claude analysis",
                        file=str(file_path),
                        error=str(e),
                        traceback=traceback.format_exc())
            return []

    def auto_fix_issues(self, file_path: Path, content: str, issues: List[Dict[str, Any]]) -> Optional[str]:
        """
        Auto-fix simple issues with error handling

        Args:
            file_path: Path to the file
            content: Original content
            issues: List of issues to fix

        Returns:
            Fixed content or None if no fixes applied

        Raises:
            AutoFixError: If auto-fix fails
        """
        if not self.config.get('auto_fix_enabled', False):
            return None

        try:
            fixed_content = content
            auto_fix_checks = self.config.get('auto_fix_checks', [])
            fixes_applied = 0

            for issue in issues:
                try:
                    if issue['type'] in auto_fix_checks and issue.get('auto_fixable', False):
                        if issue['type'] == 'console_logs':
                            # Remove console.log statements
                            lines = fixed_content.split('\n')
                            line_num = issue['line'] - 1

                            if 0 <= line_num < len(lines):
                                original_line = lines[line_num]
                                # Comment out instead of removing
                                lines[line_num] = '// ' + lines[line_num]
                                fixed_content = '\n'.join(lines)
                                fixes_applied += 1

                                logger.debug("Auto-fixed console log",
                                           file=str(file_path),
                                           line=issue['line'])

                except Exception as e:
                    logger.warning("Failed to auto-fix issue",
                                 file=str(file_path),
                                 issue_type=issue['type'],
                                 error=str(e))
                    continue

            if fixes_applied > 0:
                self.stats['auto_fixed'] += fixes_applied
                logger.info("Auto-fixes applied",
                          file=str(file_path),
                          fixes_count=fixes_applied)
                return fixed_content

            return None

        except Exception as e:
            logger.error("Auto-fix failed",
                        file=str(file_path),
                        error=str(e))
            raise AutoFixError(f"Auto-fix failed for {file_path}: {e}")

    async def review_file(self, file_path: Path):
        """
        Review a single file with comprehensive error handling

        Args:
            file_path: Path to the file to review
        """
        logger.debug("Reviewing file", file=str(file_path))

        try:
            # Read file with error handling
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                # Try different encoding
                try:
                    with open(file_path, 'r', encoding='latin-1') as f:
                        content = f.read()
                    logger.warning("File read with latin-1 encoding", file=str(file_path))
                except Exception as e:
                    logger.error("Failed to read file", file=str(file_path), error=str(e))
                    self.stats['files_failed'] += 1
                    return
            except Exception as e:
                logger.error("Failed to read file", file=str(file_path), error=str(e))
                self.stats['files_failed'] += 1
                return

            file_issues = []
            checks = self.project_config.get('checks', [])

            # Run static checks with individual error handling
            if 'console_logs' in checks:
                file_issues.extend(self.check_console_logs(file_path, content))

            if 'error_handling' in checks:
                file_issues.extend(self.check_error_handling(file_path, content))

            if 'loading_states' in checks:
                file_issues.extend(self.check_loading_states(file_path, content))

            if 'placeholder_data' in checks:
                file_issues.extend(self.check_placeholder_data(file_path, content))

            if 'mobile_responsive' in checks:
                file_issues.extend(self.check_mobile_responsive(file_path, content))

            # Use Claude for deep analysis on critical files
            critical_paths = self.project_config.get('critical_paths', [])
            is_critical = any(file_path.match(pattern) for pattern in critical_paths)

            if is_critical:
                try:
                    claude_issues = await self.analyze_with_claude(file_path, content)
                    file_issues.extend(claude_issues)
                except APIError as e:
                    logger.warning("Skipping Claude analysis due to API error",
                                 file=str(file_path),
                                 error=str(e))
                except Exception as e:
                    logger.error("Unexpected error in Claude analysis",
                               file=str(file_path),
                               error=str(e))

            # Auto-fix if enabled
            if file_issues and self.config.get('auto_fix_enabled', False):
                try:
                    fixed_content = self.auto_fix_issues(file_path, content, file_issues)
                    if fixed_content and fixed_content != content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(fixed_content)
                        logger.info("File auto-fixed", file=str(file_path))
                except AutoFixError as e:
                    logger.error("Auto-fix failed", file=str(file_path), error=str(e))
                except Exception as e:
                    logger.error("Unexpected error during auto-fix",
                               file=str(file_path),
                               error=str(e))

            # Update stats
            for issue in file_issues:
                if issue['severity'] == 'critical':
                    self.stats['critical_issues'] += 1
                elif issue['severity'] == 'warning':
                    self.stats['warnings'] += 1

            self.issues.extend(file_issues)
            self.stats['files_checked'] += 1

            if file_issues:
                logger.debug("Issues found in file",
                           file=str(file_path),
                           issue_count=len(file_issues))

        except Exception as e:
            logger.error("File review failed",
                        file=str(file_path),
                        error=str(e),
                        traceback=traceback.format_exc())
            self.stats['files_failed'] += 1

    async def run_review(self):
        """
        Run the complete code review with error handling

        Raises:
            FileAnalysisError: If file discovery fails
        """
        logger.info("Starting code review",
                   project_type=self.project_type,
                   project_path=str(self.project_path))

        start_time = datetime.now()

        try:
            files = self.find_files()

            if not files:
                logger.warning("No files found to review")
                return

            logger.info("Files discovered", file_count=len(files))

            # Review files concurrently with semaphore to limit concurrency
            semaphore = asyncio.Semaphore(5)  # Max 5 concurrent reviews

            async def review_with_semaphore(file_path):
                async with semaphore:
                    await self.review_file(file_path)

            tasks = [review_with_semaphore(file_path) for file_path in files]

            # Use gather with return_exceptions to handle failures gracefully
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Log any exceptions
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error("Task failed", file=str(files[i]), error=str(result))

            duration = (datetime.now() - start_time).total_seconds()

            logger.info("Code review complete",
                       duration_seconds=duration,
                       files_checked=self.stats['files_checked'],
                       files_failed=self.stats['files_failed'],
                       critical_issues=self.stats['critical_issues'],
                       warnings=self.stats['warnings'],
                       auto_fixed=self.stats['auto_fixed'],
                       api_calls=self.stats['api_calls'],
                       api_errors=self.stats['api_errors'])

        except Exception as e:
            logger.error("Code review failed",
                        error=str(e),
                        traceback=traceback.format_exc())
            raise

    def generate_report(self) -> str:
        """
        Generate markdown report

        Returns:
            Formatted markdown report

        Raises:
            ReportGenerationError: If report generation fails
        """
        try:
            logger.info("Generating report")

            report = f"""# Code Review Report
**Project Type:** {self.project_config.get('name', 'Unknown')}
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Project Path:** {self.project_path}

## Summary
- **Files Checked:** {self.stats['files_checked']}
- **Files Failed:** {self.stats['files_failed']}
- **Critical Issues:** {self.stats['critical_issues']}
- **Warnings:** {self.stats['warnings']}
- **Auto-Fixed:** {self.stats['auto_fixed']}
- **API Calls:** {self.stats['api_calls']}
- **API Errors:** {self.stats['api_errors']}

## Status
"""

            if self.stats['critical_issues'] == 0 and self.stats['warnings'] == 0:
                report += "✅ **PASS** - No issues found. Ready for demo!\n\n"
            elif self.stats['critical_issues'] == 0:
                report += "⚠️ **PASS WITH WARNINGS** - Review warnings before demo.\n\n"
            else:
                report += "❌ **FAIL** - Critical issues must be fixed before demo!\n\n"

            # Group issues by type
            issues_by_type = {}
            for issue in self.issues:
                issue_type = issue['type']
                if issue_type not in issues_by_type:
                    issues_by_type[issue_type] = []
                issues_by_type[issue_type].append(issue)

            # Critical Issues
            critical = [i for i in self.issues if i['severity'] == 'critical']
            if critical:
                report += "## 🚨 Critical Issues\n\n"
                for issue in critical:
                    report += f"### {issue['file']}:{issue['line']}\n"
                    report += f"**Type:** {issue['type']}\n"
                    report += f"**Message:** {issue['message']}\n"
                    if 'code' in issue:
                        report += f"```\n{issue['code']}\n```\n"
                    if 'suggestion' in issue:
                        report += f"**Fix:** {issue['suggestion']}\n"
                    report += "\n"

            # Warnings
            warnings = [i for i in self.issues if i['severity'] == 'warning']
            if warnings:
                report += "## ⚠️ Warnings\n\n"
                for issue in warnings:
                    report += f"### {issue['file']}:{issue['line']}\n"
                    report += f"**Type:** {issue['type']}\n"
                    report += f"**Message:** {issue['message']}\n"
                    if 'code' in issue:
                        report += f"```\n{issue['code']}\n```\n"
                    if 'suggestion' in issue:
                        report += f"**Fix:** {issue['suggestion']}\n"
                    report += "\n"

            # Fix Checklist
            report += "## Fix Checklist\n\n"
            for i, issue in enumerate(self.issues, 1):
                status = "✅" if issue.get('auto_fixable') and self.config.get('auto_fix_enabled') else "⬜"
                report += f"{status} {issue['file']}:{issue['line']} - {issue['message']}\n"

            logger.info("Report generated successfully")
            return report

        except Exception as e:
            logger.error("Report generation failed",
                        error=str(e),
                        traceback=traceback.format_exc())
            raise ReportGenerationError(f"Failed to generate report: {e}")

    def save_report(self, report: str):
        """
        Save report to file

        Args:
            report: Report content to save

        Raises:
            ReportGenerationError: If saving fails
        """
        try:
            output_file = self.project_path / self.config.get('output_file', 'code-review-report.md')

            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report)

            logger.info("Report saved", output_file=str(output_file))

        except Exception as e:
            logger.error("Failed to save report",
                        error=str(e))
            raise ReportGenerationError(f"Failed to save report: {e}")


async def main():
    """Main entry point with error handling"""
    try:
        if len(sys.argv) < 2:
            print("Usage: python agent.py <project_path> [project_type]")
            print("Project types: crm, portal, website")
            sys.exit(1)

        project_path = sys.argv[1]
        project_type = sys.argv[2] if len(sys.argv) > 2 else "crm"

        # Initialize agent
        agent = CodeReviewAgent(project_path, project_type)

        # Run review
        await agent.run_review()

        # Generate and save report
        report = agent.generate_report()
        agent.save_report(report)

        # Print report to console
        print("\n" + report)

        # Exit with error code if critical issues found
        if agent.stats['critical_issues'] > 0:
            logger.warning("Exiting with error code due to critical issues")
            sys.exit(1)

        logger.info("Code review completed successfully")
        sys.exit(0)

    except (ProjectNotFoundError, InvalidProjectTypeError, ConfigurationError) as e:
        logger.error("Configuration error", error=str(e))
        print(f"\n❌ Configuration Error: {e}", file=sys.stderr)
        sys.exit(2)

    except (FileAnalysisError, ReportGenerationError) as e:
        logger.error("Analysis error", error=str(e))
        print(f"\n❌ Analysis Error: {e}", file=sys.stderr)
        sys.exit(3)

    except KeyboardInterrupt:
        logger.warning("Code review interrupted by user")
        print("\n⚠️  Code review interrupted by user", file=sys.stderr)
        sys.exit(130)

    except Exception as e:
        logger.error("Unexpected error",
                    error=str(e),
                    traceback=traceback.format_exc())
        print(f"\n❌ Unexpected Error: {e}", file=sys.stderr)
        print("\nPlease check the logs for more details.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
