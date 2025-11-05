"""
Claude Code Executor
Executes enhanced prompts in Claude Code CLI with real-time monitoring
"""

import asyncio
import sys
from pathlib import Path
from typing import Dict, Any, Optional, Callable
import subprocess
import re

sys.path.append(str(Path(__file__).parent.parent.parent / "code-review-agent"))
from logger import get_logger

logger = get_logger(__name__)


class ClaudeCodeExecutor:
    """
    Executes prompts in Claude Code CLI

    Features:
    - Subprocess management
    - Real-time output monitoring
    - Question detection and pausing
    - Error handling
    - Timeout management
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.binary = config.get('claude_code', {}).get('binary_path', 'claude-code')
        self.timeout = config.get('claude_code', {}).get('timeout', 3600)

    async def execute(
        self,
        prompt: str,
        project_path: str,
        session_id: str,
        progress_callback: Optional[Callable[[str], None]] = None
    ) -> Dict[str, Any]:
        """
        Execute prompt in Claude Code

        Args:
            prompt: Enhanced prompt to execute
            project_path: Path to project directory
            session_id: Session ID for tracking
            progress_callback: Callback for progress updates

        Returns:
            Execution result
        """
        logger.info(f"Executing session {session_id} in Claude Code")

        if progress_callback:
            await progress_callback("Starting Claude Code...")

        # Prepare command
        cmd = self._build_command(prompt, project_path)

        # Execute with monitoring
        result = await self._run_with_monitoring(
            cmd,
            project_path,
            progress_callback
        )

        return result

    def _build_command(self, prompt: str, project_path: str) -> list:
        """Build Claude Code command"""

        # Use claude-code CLI with prompt
        return [
            self.binary,
            'chat',
            '--prompt', prompt,
            '--project', project_path
        ]

    async def _run_with_monitoring(
        self,
        cmd: list,
        cwd: str,
        progress_callback: Optional[Callable[[str], None]] = None
    ) -> Dict[str, Any]:
        """
        Run command with real-time monitoring

        Monitors for:
        - Progress updates
        - Questions from Claude Code
        - Errors
        - Completion
        """

        output_lines = []
        error_lines = []
        questions_detected = []

        try:
            # Start process
            process = await asyncio.create_subprocess_exec(
                *cmd,
                cwd=cwd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                stdin=asyncio.subprocess.PIPE
            )

            if progress_callback:
                await progress_callback("Claude Code process started")

            # Monitor output
            async def read_stream(stream, is_error=False):
                while True:
                    line = await stream.readline()
                    if not line:
                        break

                    decoded = line.decode('utf-8').strip()

                    if is_error:
                        error_lines.append(decoded)
                        logger.error(f"STDERR: {decoded}")
                    else:
                        output_lines.append(decoded)
                        logger.debug(f"STDOUT: {decoded}")

                    # Check for questions
                    if self._is_question(decoded):
                        questions_detected.append(decoded)
                        if progress_callback:
                            await progress_callback(f"⚠️  Question detected: {decoded}")

                    # Send progress updates
                    if progress_callback and decoded:
                        await progress_callback(decoded)

            # Read both streams concurrently
            await asyncio.gather(
                read_stream(process.stdout, False),
                read_stream(process.stderr, True)
            )

            # Wait for completion
            returncode = await asyncio.wait_for(
                process.wait(),
                timeout=self.timeout
            )

            if progress_callback:
                await progress_callback("✅ Execution completed")

            return {
                'success': returncode == 0,
                'returncode': returncode,
                'output': '\n'.join(output_lines),
                'errors': '\n'.join(error_lines) if error_lines else None,
                'questions_detected': questions_detected
            }

        except asyncio.TimeoutError:
            logger.error("Execution timed out")
            if progress_callback:
                await progress_callback("❌ Execution timed out")

            return {
                'success': False,
                'error': f'Execution timed out after {self.timeout} seconds',
                'output': '\n'.join(output_lines),
                'errors': '\n'.join(error_lines)
            }

        except Exception as e:
            logger.error(f"Execution failed: {e}")
            if progress_callback:
                await progress_callback(f"❌ Execution failed: {e}")

            return {
                'success': False,
                'error': str(e),
                'output': '\n'.join(output_lines),
                'errors': '\n'.join(error_lines)
            }

    def _is_question(self, line: str) -> bool:
        """
        Detect if Claude Code is asking a question

        Looks for patterns like:
        - Lines ending with '?'
        - '[Y/n]' prompts
        - 'Do you want to...'
        """

        question_patterns = [
            r'\?$',  # Ends with ?
            r'\[Y/n\]',  # Yes/no prompt
            r'\[y/N\]',
            r'Do you want',
            r'Should I',
            r'Would you like',
            r'Confirm:',
        ]

        return any(re.search(pattern, line, re.IGNORECASE) for pattern in question_patterns)

    async def send_input(self, process: asyncio.subprocess.Process, text: str):
        """Send input to running process"""
        if process.stdin:
            process.stdin.write(f"{text}\n".encode('utf-8'))
            await process.stdin.drain()
