"""
Post-Execution Actions
Automated actions after successful execution
"""

import sys
import asyncio
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

sys.path.append(str(Path(__file__).parent.parent.parent / "code-review-agent"))
from logger import get_logger

logger = get_logger(__name__)


class PostExecutionHandler:
    """
    Handles post-execution actions

    Actions:
    - Run code review agent
    - Generate implementation summary
    - Create git commit
    - Update documentation
    - Send notifications
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.project_path = None

    async def execute_all(
        self,
        project_path: str,
        session_id: str,
        execution_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute all post-execution actions

        Args:
            project_path: Path to project
            session_id: Session ID
            execution_result: Result from execution

        Returns:
            Results of all actions
        """

        self.project_path = Path(project_path)

        logger.info(f"Running post-execution actions for {session_id}")

        results = {}

        # 1. Run code review
        if self.config.get('post_execution', {}).get('run_code_review', True):
            results['code_review'] = await self.run_code_review()

        # 2. Generate summary
        results['summary'] = await self.generate_summary(execution_result)

        # 3. Create git commit
        if self.config.get('post_execution', {}).get('auto_commit', False):
            results['git_commit'] = await self.create_git_commit(
                session_id,
                execution_result
            )

        # 4. Update documentation
        if self.config.get('post_execution', {}).get('update_docs', False):
            results['documentation'] = await self.update_documentation(
                execution_result
            )

        # 5. Send notification
        if self.config.get('post_execution', {}).get('send_notification', False):
            results['notification'] = await self.send_notification(
                session_id,
                execution_result
            )

        return results

    async def run_code_review(self) -> Dict[str, Any]:
        """Run code review agent on changes"""

        logger.info("Running code review agent")

        try:
            code_review_agent = Path(__file__).parent.parent.parent / 'code-review-agent' / 'agent.py'

            if not code_review_agent.exists():
                logger.warning("Code review agent not found")
                return {'success': False, 'reason': 'Agent not found'}

            result = subprocess.run(
                ['python', str(code_review_agent), str(self.project_path), 'bridge'],
                capture_output=True,
                text=True,
                timeout=300
            )

            if result.returncode == 0:
                logger.info("Code review completed")
                return {
                    'success': True,
                    'output': result.stdout
                }
            else:
                logger.error(f"Code review failed: {result.stderr}")
                return {
                    'success': False,
                    'error': result.stderr
                }

        except Exception as e:
            logger.error(f"Code review failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    async def generate_summary(
        self,
        execution_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate implementation summary

        Returns:
            Summary document
        """

        files_changed = execution_result.get('files_changed', [])
        duration = execution_result.get('duration_seconds', 0)

        summary = {
            'timestamp': datetime.now().isoformat(),
            'duration_seconds': duration,
            'files_changed': files_changed,
            'files_count': len(files_changed),
            'success': execution_result.get('success', False),
            'errors': execution_result.get('errors', []),
            'warnings': execution_result.get('warnings', [])
        }

        # Save summary to file
        summary_dir = self.project_path / '.bridge'
        summary_dir.mkdir(exist_ok=True)

        summary_file = summary_dir / f"summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        import json
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)

        logger.info(f"Summary saved: {summary_file}")

        return {
            'success': True,
            'summary_file': str(summary_file),
            'summary': summary
        }

    async def create_git_commit(
        self,
        session_id: str,
        execution_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create git commit with descriptive message

        Args:
            session_id: Session ID
            execution_result: Execution result

        Returns:
            Commit result
        """

        logger.info("Creating git commit")

        try:
            files_changed = execution_result.get('files_changed', [])

            if not files_changed:
                return {
                    'success': False,
                    'reason': 'No files changed'
                }

            # Stage files
            subprocess.run(
                ['git', 'add', '.'],
                cwd=self.project_path,
                check=True
            )

            # Create commit message
            commit_message = self._generate_commit_message(session_id, execution_result)

            # Commit
            result = subprocess.run(
                ['git', 'commit', '-m', commit_message],
                cwd=self.project_path,
                capture_output=True,
                text=True
            )

            if result.returncode == 0:
                logger.info("Git commit created")
                return {
                    'success': True,
                    'commit_message': commit_message
                }
            else:
                logger.error(f"Git commit failed: {result.stderr}")
                return {
                    'success': False,
                    'error': result.stderr
                }

        except Exception as e:
            logger.error(f"Git commit failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _generate_commit_message(
        self,
        session_id: str,
        execution_result: Dict[str, Any]
    ) -> str:
        """Generate descriptive commit message"""

        files = execution_result.get('files_changed', [])
        file_count = len(files)

        message = f"feat: Implemented via Bridge Agent ({session_id[:8]})\n\n"
        message += f"Changes:\n"

        for file in files[:5]:  # Show first 5 files
            message += f"- {file}\n"

        if file_count > 5:
            message += f"- ... and {file_count - 5} more files\n"

        message += f"\n🌉 Generated via Claude Bridge Agent\n"
        message += f"Session: {session_id}\n"

        return message

    async def update_documentation(
        self,
        execution_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update project documentation"""

        logger.info("Updating documentation")

        # Find CHANGELOG.md or create it
        changelog = self.project_path / 'CHANGELOG.md'

        entry = self._generate_changelog_entry(execution_result)

        try:
            if changelog.exists():
                # Prepend to existing changelog
                with open(changelog, 'r') as f:
                    existing = f.read()

                with open(changelog, 'w') as f:
                    f.write(entry + '\n\n' + existing)
            else:
                # Create new changelog
                with open(changelog, 'w') as f:
                    f.write('# Changelog\n\n')
                    f.write(entry)

            logger.info("Documentation updated")

            return {
                'success': True,
                'changelog': str(changelog)
            }

        except Exception as e:
            logger.error(f"Documentation update failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _generate_changelog_entry(self, execution_result: Dict[str, Any]) -> str:
        """Generate changelog entry"""

        date = datetime.now().strftime('%Y-%m-%d')
        files = execution_result.get('files_changed', [])

        entry = f"## {date} - Bridge Agent Update\n\n"
        entry += f"### Changed\n\n"

        for file in files[:10]:
            entry += f"- Updated `{file}`\n"

        if len(files) > 10:
            entry += f"- ... and {len(files) - 10} more files\n"

        return entry

    async def send_notification(
        self,
        session_id: str,
        execution_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Send notification (Slack/email)

        Currently just logs, can be extended with actual integrations
        """

        logger.info(f"Notification: Execution {session_id} completed")

        # TODO: Implement Slack/Discord/email notifications

        webhook_url = self.config.get('notifications', {}).get('webhook_url')

        if webhook_url:
            # Would send to webhook
            pass

        return {
            'success': True,
            'method': 'log'
        }
