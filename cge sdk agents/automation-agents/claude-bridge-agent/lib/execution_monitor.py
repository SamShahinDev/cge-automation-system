"""
Execution Monitoring
Monitors execution for file changes, errors, and success criteria
"""

import os
import sys
import time
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
import subprocess

sys.path.append(str(Path(__file__).parent.parent.parent / "code-review-agent"))
from logger import get_logger

logger = get_logger(__name__)


class ExecutionMonitor:
    """
    Monitors execution in real-time

    Features:
    - File change detection
    - Error detection in output
    - Screenshot capture
    - Success criteria checking
    - Automatic rollback on failure
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.project_path = None
        self.start_time = None
        self.git_checkpoint = None

        # Tracking
        self.files_changed = []
        self.errors_detected = []
        self.warnings_detected = []

    async def start_monitoring(
        self,
        project_path: str,
        session_id: str,
        progress_callback: Optional[Callable] = None
    ):
        """
        Start monitoring execution

        Args:
            project_path: Path to project being modified
            session_id: Session ID for tracking
            progress_callback: Callback for progress updates
        """
        self.project_path = Path(project_path)
        self.start_time = time.time()

        logger.info(f"Starting execution monitoring for {session_id}")

        # Create git checkpoint
        if await self._create_git_checkpoint():
            logger.info("Git checkpoint created")
            if progress_callback:
                await progress_callback("✅ Git checkpoint created")
        else:
            logger.warning("Could not create git checkpoint")
            if progress_callback:
                await progress_callback("⚠️  No git checkpoint (not a git repo)")

        # Start file watcher
        asyncio.create_task(self._watch_files(progress_callback))

    async def _create_git_checkpoint(self) -> bool:
        """Create git checkpoint/stash before execution"""

        try:
            # Check if git repo
            result = subprocess.run(
                ['git', 'rev-parse', '--git-dir'],
                cwd=self.project_path,
                capture_output=True,
                timeout=5
            )

            if result.returncode != 0:
                return False

            # Get current commit
            result = subprocess.run(
                ['git', 'rev-parse', 'HEAD'],
                cwd=self.project_path,
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode == 0:
                self.git_checkpoint = result.stdout.strip()
                logger.info(f"Git checkpoint: {self.git_checkpoint[:8]}")
                return True

            return False

        except Exception as e:
            logger.error(f"Failed to create git checkpoint: {e}")
            return False

    async def _watch_files(self, progress_callback: Optional[Callable] = None):
        """Watch for file changes during execution"""

        initial_state = self._get_directory_state()

        while True:
            await asyncio.sleep(2)  # Check every 2 seconds

            current_state = self._get_directory_state()
            changes = self._detect_changes(initial_state, current_state)

            if changes:
                for change in changes:
                    if change not in self.files_changed:
                        self.files_changed.append(change)
                        logger.info(f"File changed: {change}")

                        if progress_callback:
                            await progress_callback(f"📝 Modified: {change}")

    def _get_directory_state(self) -> Dict[str, float]:
        """Get current state of all files"""

        state = {}

        for file_path in self.project_path.rglob('*'):
            if file_path.is_file() and not self._should_ignore(file_path):
                try:
                    state[str(file_path.relative_to(self.project_path))] = file_path.stat().st_mtime
                except Exception:
                    pass

        return state

    def _detect_changes(
        self,
        before: Dict[str, float],
        after: Dict[str, float]
    ) -> List[str]:
        """Detect changed files"""

        changes = []

        # Check modified files
        for path, mtime in after.items():
            if path not in before or before[path] != mtime:
                changes.append(path)

        return changes

    def _should_ignore(self, path: Path) -> bool:
        """Check if file should be ignored"""

        ignore_patterns = [
            '.git',
            'node_modules',
            '__pycache__',
            '.next',
            'dist',
            'build',
            '.env',
        ]

        return any(pattern in str(path) for pattern in ignore_patterns)

    def detect_errors(self, output: str) -> List[Dict[str, Any]]:
        """
        Detect errors in output

        Returns:
            List of detected errors
        """

        errors = []

        error_patterns = [
            (r'Error: (.+)', 'error'),
            (r'ERROR: (.+)', 'error'),
            (r'FAILED (.+)', 'error'),
            (r'TypeError: (.+)', 'error'),
            (r'SyntaxError: (.+)', 'error'),
            (r'ModuleNotFoundError: (.+)', 'error'),
            (r'Exception: (.+)', 'error'),
        ]

        for line in output.split('\n'):
            for pattern, error_type in error_patterns:
                import re
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    error = {
                        'type': error_type,
                        'message': match.group(1) if len(match.groups()) > 0 else line,
                        'line': line,
                        'timestamp': datetime.now().isoformat()
                    }
                    errors.append(error)
                    self.errors_detected.append(error)

        return errors

    def detect_warnings(self, output: str) -> List[Dict[str, Any]]:
        """Detect warnings in output"""

        warnings = []

        warning_patterns = [
            r'Warning: (.+)',
            r'WARN: (.+)',
            r'Deprecated: (.+)',
        ]

        for line in output.split('\n'):
            for pattern in warning_patterns:
                import re
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    warning = {
                        'message': match.group(1) if len(match.groups()) > 0 else line,
                        'line': line,
                        'timestamp': datetime.now().isoformat()
                    }
                    warnings.append(warning)
                    self.warnings_detected.append(warning)

        return warnings

    async def check_success_criteria(self) -> bool:
        """
        Check if execution met success criteria

        Returns:
            True if successful, False otherwise
        """

        # Criteria 1: No errors detected
        if self.errors_detected:
            logger.warning(f"Errors detected: {len(self.errors_detected)}")
            return False

        # Criteria 2: Files were actually changed
        if not self.files_changed:
            logger.warning("No files were changed")
            return False

        # Criteria 3: Check if localhost is responsive (if web project)
        # TODO: Implement localhost check

        logger.info("Success criteria met")
        return True

    async def rollback(self) -> bool:
        """
        Rollback changes to git checkpoint

        Returns:
            True if rollback successful
        """

        if not self.git_checkpoint:
            logger.error("No git checkpoint available for rollback")
            return False

        try:
            logger.info(f"Rolling back to {self.git_checkpoint[:8]}")

            # Reset to checkpoint
            result = subprocess.run(
                ['git', 'reset', '--hard', self.git_checkpoint],
                cwd=self.project_path,
                capture_output=True,
                timeout=10
            )

            if result.returncode == 0:
                logger.info("Rollback successful")
                return True
            else:
                logger.error(f"Rollback failed: {result.stderr}")
                return False

        except Exception as e:
            logger.error(f"Rollback failed: {e}")
            return False

    def get_execution_summary(self) -> Dict[str, Any]:
        """Get execution summary"""

        duration = time.time() - self.start_time if self.start_time else 0

        return {
            'duration_seconds': round(duration, 2),
            'files_changed': self.files_changed,
            'files_changed_count': len(self.files_changed),
            'errors_detected': self.errors_detected,
            'errors_count': len(self.errors_detected),
            'warnings_detected': self.warnings_detected,
            'warnings_count': len(self.warnings_detected),
            'has_git_checkpoint': bool(self.git_checkpoint),
            'checkpoint_commit': self.git_checkpoint[:8] if self.git_checkpoint else None
        }

    async def capture_screenshot(self, url: str = 'http://localhost:3000') -> Optional[str]:
        """
        Capture screenshot of localhost

        Returns:
            Path to screenshot file or None
        """

        try:
            from playwright.async_api import async_playwright

            async with async_playwright() as p:
                browser = await p.chromium.launch()
                page = await browser.new_page()

                await page.goto(url, timeout=5000)
                await page.wait_for_load_state('networkidle')

                screenshot_path = Path(__file__).parent.parent / 'data' / 'screenshots'
                screenshot_path.mkdir(parents=True, exist_ok=True)

                filename = screenshot_path / f'localhost_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'
                await page.screenshot(path=str(filename), full_page=True)

                await browser.close()

                logger.info(f"Screenshot saved: {filename}")
                return str(filename)

        except Exception as e:
            logger.error(f"Screenshot capture failed: {e}")
            return None
