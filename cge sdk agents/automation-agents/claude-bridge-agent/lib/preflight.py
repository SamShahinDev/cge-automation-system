"""
Pre-flight Checks
Validates environment before execution
"""

import os
import sys
import subprocess
from pathlib import Path
from typing import Dict, Any, List, Tuple
from anthropic import Anthropic

sys.path.append(str(Path(__file__).parent.parent.parent / "code-review-agent"))
from logger import get_logger

logger = get_logger(__name__)


class PreflightChecker:
    """
    Runs pre-flight checks before enhancement/execution

    Checks:
    - Project path exists
    - Git status
    - Claude Code binary available
    - API key valid
    - Context files exist
    - Pattern files exist
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.checks_config = config.get('pre_flight_checks', {})

    def run_all_checks(self, project_config: Dict[str, Any]) -> Tuple[bool, List[Dict[str, Any]]]:
        """
        Run all pre-flight checks

        Returns:
            (all_passed, check_results)
        """
        logger.info("Running pre-flight checks")

        results = []

        # 1. Project path
        if self.checks_config.get('verify_project_path', True):
            results.append(self._check_project_path(project_config))

        # 2. Git status
        if self.checks_config.get('check_git_status', True):
            results.append(self._check_git_status(project_config))

        # 3. Claude Code binary
        if self.checks_config.get('validate_claude_code', True):
            results.append(self._check_claude_code())

        # 4. API key
        if self.checks_config.get('test_api_key', True):
            results.append(self._check_api_key())

        # 5. Context files
        if self.checks_config.get('check_context_files', True):
            results.append(self._check_context_files(project_config))

        # 6. Pattern files
        if self.checks_config.get('validate_patterns', True):
            results.append(self._check_patterns())

        # Determine overall status
        all_passed = all(r['status'] in ['pass', 'warning'] for r in results)
        critical_failed = any(r['status'] == 'fail' and r['critical'] for r in results)

        logger.info(f"Pre-flight checks: {'PASSED' if all_passed and not critical_failed else 'FAILED'}")

        return (all_passed and not critical_failed, results)

    def _check_project_path(self, project_config: Dict[str, Any]) -> Dict[str, Any]:
        """Check if project path exists"""

        project_path = Path(project_config.get('path', ''))

        if not project_path.exists():
            return {
                'check': 'Project Path',
                'status': 'fail',
                'critical': True,
                'message': f'Project path does not exist: {project_path}',
                'suggestion': 'Update project path in config.yaml'
            }

        if not project_path.is_dir():
            return {
                'check': 'Project Path',
                'status': 'fail',
                'critical': True,
                'message': f'Project path is not a directory: {project_path}',
            }

        return {
            'check': 'Project Path',
            'status': 'pass',
            'critical': True,
            'message': f'Project path exists: {project_path}',
        }

    def _check_git_status(self, project_config: Dict[str, Any]) -> Dict[str, Any]:
        """Check git status for uncommitted changes"""

        project_path = Path(project_config.get('path', ''))

        try:
            result = subprocess.run(
                ['git', 'status', '--porcelain'],
                cwd=project_path,
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode != 0:
                return {
                    'check': 'Git Status',
                    'status': 'warning',
                    'critical': False,
                    'message': 'Not a git repository or git not available',
                }

            uncommitted = result.stdout.strip()

            if uncommitted and self.checks_config.get('warn_uncommitted_changes', True):
                file_count = len(uncommitted.split('\n'))
                return {
                    'check': 'Git Status',
                    'status': 'warning',
                    'critical': False,
                    'message': f'⚠️  {file_count} uncommitted changes detected',
                    'suggestion': 'Consider committing changes before running agent'
                }

            return {
                'check': 'Git Status',
                'status': 'pass',
                'critical': False,
                'message': 'Working tree clean',
            }

        except Exception as e:
            return {
                'check': 'Git Status',
                'status': 'warning',
                'critical': False,
                'message': f'Could not check git status: {e}',
            }

    def _check_claude_code(self) -> Dict[str, Any]:
        """Check if Claude Code binary is accessible"""

        claude_code_path = self.config.get('execution', {}).get('claude_code_path', 'claude-code')

        try:
            result = subprocess.run(
                [claude_code_path, '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode == 0:
                version = result.stdout.strip()
                return {
                    'check': 'Claude Code',
                    'status': 'pass',
                    'critical': True,
                    'message': f'Claude Code found: {version}',
                }
            else:
                return {
                    'check': 'Claude Code',
                    'status': 'fail',
                    'critical': True,
                    'message': 'Claude Code binary found but failed to run',
                    'suggestion': 'Check Claude Code installation'
                }

        except FileNotFoundError:
            return {
                'check': 'Claude Code',
                'status': 'fail',
                'critical': True,
                'message': f'Claude Code binary not found: {claude_code_path}',
                'suggestion': 'Install Claude Code or update claude_code_path in config'
            }
        except Exception as e:
            return {
                'check': 'Claude Code',
                'status': 'fail',
                'critical': True,
                'message': f'Error checking Claude Code: {e}',
            }

    def _check_api_key(self) -> Dict[str, Any]:
        """Test Anthropic API key"""

        api_key = os.getenv('ANTHROPIC_API_KEY') or self.config.get('anthropic', {}).get('api_key')

        if not api_key:
            return {
                'check': 'API Key',
                'status': 'fail',
                'critical': True,
                'message': 'ANTHROPIC_API_KEY not set',
                'suggestion': 'Set ANTHROPIC_API_KEY environment variable'
            }

        if api_key.startswith('${'):
            return {
                'check': 'API Key',
                'status': 'fail',
                'critical': True,
                'message': 'API key is a template variable, not actual key',
                'suggestion': 'Set ANTHROPIC_API_KEY environment variable'
            }

        try:
            client = Anthropic(api_key=api_key)

            # Test with minimal request
            response = client.messages.create(
                model='claude-3-haiku-20240307',  # Cheapest model
                max_tokens=10,
                messages=[{'role': 'user', 'content': 'Hi'}]
            )

            return {
                'check': 'API Key',
                'status': 'pass',
                'critical': True,
                'message': 'API key valid and working',
            }

        except Exception as e:
            return {
                'check': 'API Key',
                'status': 'fail',
                'critical': True,
                'message': f'API key test failed: {str(e)[:100]}',
                'suggestion': 'Check API key is valid and has credits'
            }

    def _check_context_files(self, project_config: Dict[str, Any]) -> Dict[str, Any]:
        """Check if context files exist"""

        project_path = Path(project_config.get('path', ''))
        context_files = project_config.get('context_files', [])

        if not context_files:
            return {
                'check': 'Context Files',
                'status': 'warning',
                'critical': False,
                'message': 'No context files configured',
            }

        missing_files = []
        found_files = []

        for file_path in context_files:
            full_path = project_path / file_path
            if full_path.exists():
                found_files.append(file_path)
            else:
                missing_files.append(file_path)

        if missing_files:
            return {
                'check': 'Context Files',
                'status': 'warning',
                'critical': False,
                'message': f'{len(missing_files)}/{len(context_files)} context files missing',
                'details': missing_files,
                'suggestion': 'Create missing documentation files'
            }

        return {
            'check': 'Context Files',
            'status': 'pass',
            'critical': False,
            'message': f'All {len(context_files)} context files found',
        }

    def _check_patterns(self) -> Dict[str, Any]:
        """Check if pattern files exist"""

        patterns_dir = Path(__file__).parent.parent / self.config.get('patterns', {}).get('library_path', '.claude/patterns')

        if not patterns_dir.exists():
            return {
                'check': 'Pattern Library',
                'status': 'warning',
                'critical': False,
                'message': f'Pattern library directory not found: {patterns_dir}',
                'suggestion': 'Patterns will not be available for suggestions'
            }

        pattern_files = list(patterns_dir.glob('*.md'))

        if not pattern_files:
            return {
                'check': 'Pattern Library',
                'status': 'warning',
                'critical': False,
                'message': 'No pattern files found',
            }

        return {
            'check': 'Pattern Library',
            'status': 'pass',
            'critical': False,
            'message': f'{len(pattern_files)} patterns available',
        }
