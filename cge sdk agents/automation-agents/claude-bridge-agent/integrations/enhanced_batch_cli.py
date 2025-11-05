#!/usr/bin/env python3
"""
Enhanced Batch Processor CLI
Process ENHANCED_PROMPTS.md sequentially with Claude Code
With proper completion monitoring
"""

import os
import sys
import time
import argparse
import subprocess
import re
import logging
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)


class EnhancedPromptProcessor:
    """Process enhanced prompts from ENHANCED_PROMPTS.md"""

    def __init__(
        self,
        prompts_file: str,
        project_path: str,
        start_from: Optional[str] = None,
        auto_approve: bool = False,
        git_commit: bool = False,
        delay: int = 30,
        timeout: int = 600,
        monitor_method: str = 'process',
        continue_on_error: bool = False,
        no_output_timeout: int = 300
    ):
        self.prompts_file = prompts_file
        self.project_path = project_path
        self.start_from = start_from
        self.auto_approve = auto_approve
        self.git_commit = git_commit
        self.delay = delay
        self.timeout = timeout
        self.monitor_method = monitor_method
        self.continue_on_error = continue_on_error
        self.no_output_timeout = no_output_timeout  # Watchdog: 5 minutes without output = stuck
        self.progress_file = Path(project_path).parent / "BUILD_PROGRESS.md"

        # Progress persistence
        self.progress_file_path = Path(project_path).parent / ".claude_build_progress.json"
        self.progress_data = self.load_progress()

    def parse_prompts(self) -> List[Dict[str, str]]:
        """Parse ENHANCED_PROMPTS.md and extract all prompts"""

        with open(self.prompts_file, 'r') as f:
            content = f.read()

        prompts = []
        seen_numbers = set()  # Track prompt numbers to skip duplicates

        # Pattern: ### Enhanced Prompt N: Title (3 hashes, not 2!)
        pattern = r'^###\s+Enhanced Prompt\s+(\d+):\s+(.+)$'
        matches = list(re.finditer(pattern, content, re.MULTILINE))

        for i, match in enumerate(matches):
            prompt_num = match.group(1)
            title = match.group(2).strip()

            # Skip duplicate prompt numbers (keep only first occurrence)
            if int(prompt_num) in seen_numbers:
                logger.debug(f"Skipping duplicate: Prompt {prompt_num}")
                continue
            seen_numbers.add(int(prompt_num))

            # Get content until ---END PROMPT--- or "End of prompt"
            start_pos = match.end()
            end_marker = content.find('---END PROMPT---', start_pos)

            if end_marker != -1:
                prompt_content = content[start_pos:end_marker].strip()
            else:
                # Find next prompt or end
                if i + 1 < len(matches):
                    prompt_content = content[start_pos:matches[i + 1].start()].strip()
                else:
                    prompt_content = content[start_pos:].strip()

            # Clean up: remove "End of prompt" marker if present at the end
            prompt_content = re.sub(r'\s*End of prompt\s*$', '', prompt_content, flags=re.IGNORECASE).strip()
            # Also remove separator lines
            prompt_content = re.sub(r'\s*-{3,}\s*$', '', prompt_content).strip()

            # Extract phase from context
            phase_context = content[max(0, match.start() - 500):match.start()]
            # Match both "## PHASE" and "# Phase" formats
            phase_match = re.search(r'##?\s+(?:PHASE|Phase)\s+(\d+):\s+(.+)', phase_context, re.IGNORECASE)

            phase = f"Phase {phase_match.group(1)}" if phase_match else "Unknown Phase"
            phase_name = phase_match.group(2).strip() if phase_match else ""

            # Create prompt ID
            prompt_id = f"{phase}, Prompt {prompt_num}"

            prompts.append({
                'id': prompt_id,
                'number': int(prompt_num),
                'title': title,
                'phase': phase,
                'phase_name': phase_name,
                'content': prompt_content,
                'full_prompt': f"{title}\n\n{prompt_content}"
            })

        return prompts

    def find_starting_point(self, prompts: List[Dict]) -> int:
        """Find which prompt to start from"""

        if not self.start_from:
            return 0

        # Parse start_from (e.g., "Phase 2, Prompt 3")
        match = re.search(r'Prompt\s+(\d+)', self.start_from, re.IGNORECASE)
        if match:
            prompt_num = int(match.group(1))
            for i, prompt in enumerate(prompts):
                if prompt['number'] == prompt_num:
                    return i

        return 0

    def load_progress(self) -> dict:
        """Load progress from previous runs"""
        if self.progress_file_path.exists():
            try:
                with open(self.progress_file_path, 'r') as f:
                    data = json.load(f)
                    logger.info(f"Loaded progress from previous run: {data.get('last_completed', 'None')}")
                    return data
            except Exception as e:
                logger.warning(f"Could not load progress file: {e}")

        return {
            "started_at": datetime.now().isoformat(),
            "last_completed": None,
            "completed_prompts": [],
            "failed_prompts": [],
            "skipped_prompts": [],
            "total_time_seconds": 0,
            "session_history": []
        }

    def save_progress(self):
        """Save current progress to file"""
        try:
            with open(self.progress_file_path, 'w') as f:
                json.dump(self.progress_data, f, indent=2)
        except Exception as e:
            logger.error(f"Could not save progress: {e}")

    def update_progress_completed(self, prompt: Dict, execution_time: float):
        """Update progress after successful completion"""
        self.progress_data["last_completed"] = prompt['id']
        self.progress_data["completed_prompts"].append({
            "id": prompt['id'],
            "title": prompt['title'],
            "completed_at": datetime.now().isoformat(),
            "execution_time": execution_time
        })
        self.progress_data["total_time_seconds"] += execution_time
        self.save_progress()

    def update_progress_failed(self, prompt: Dict, error: str = None):
        """Update progress after failure"""
        self.progress_data["failed_prompts"].append({
            "id": prompt['id'],
            "title": prompt['title'],
            "failed_at": datetime.now().isoformat(),
            "error": error or "Unknown error"
        })
        self.save_progress()

    def should_skip_prompt(self, prompt: Dict) -> bool:
        """Check if prompt was already completed in previous run"""
        completed_ids = [p['id'] for p in self.progress_data.get('completed_prompts', [])]
        return prompt['id'] in completed_ids

    def execute_prompt(self, prompt: Dict) -> bool:
        """Execute a single prompt with progress tracking"""

        # Check if already completed
        if self.should_skip_prompt(prompt):
            print(f"⏭️  Skipping {prompt['id']} (already completed in previous run)")
            self.progress_data["skipped_prompts"].append(prompt['id'])
            self.save_progress()
            return True

        prompt_id = prompt['id']
        prompt_title = prompt['title']
        prompt_content = prompt['full_prompt']

        print(f"\n{'='*80}")
        print(f"📝 Executing: {prompt_id}")
        print(f"   Title: {prompt_title}")
        print(f"{'='*80}\n")

        # Track execution time
        execution_start = time.time()

        # Build command - Use interactive mode with auto-approval to execute file operations
        # --print mode only outputs text, doesn't execute Write/Edit/etc
        cmd = ['claude', self.project_path, '--dangerously-skip-permissions']

        logger.info(f"Sending to Claude Code...")
        logger.info(f"Command: {' '.join(cmd)}")

        try:
            # Start Claude Code process with prompt piped via stdin
            start_time = time.time()
            process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )

            # Send prompt content to stdin with proper flushing
            # Add newline to ensure prompt is complete
            process.stdin.write(prompt_content + '\n')
            process.stdin.flush()  # CRITICAL: Flush buffer before closing
            process.stdin.close()

            # Monitor the process with timeout
            success = self._monitor_completion(
                process,
                prompt_id,
                start_time
            )

            if success:
                execution_time = time.time() - execution_start
                print(f"\n✅ {prompt_id} completed successfully in {int(execution_time)}s")

                if self.git_commit:
                    self.create_git_commit(prompt)

                self.update_progress_completed(prompt, execution_time)
                self.update_progress(prompt, 'completed')  # For BUILD_PROGRESS.md
                return True
            else:
                print(f"\n❌ {prompt_id} failed")
                self.update_progress_failed(prompt, "Process failed or timed out")
                self.update_progress(prompt, 'failed')  # For BUILD_PROGRESS.md
                return False

        except Exception as e:
            logger.error(f"Error executing {prompt_id}: {str(e)}")
            self.update_progress_failed(prompt, str(e))
            return False

    def _monitor_completion(
        self,
        process: subprocess.Popen,
        prompt_id: str,
        start_time: float
    ) -> bool:
        """
        Monitor process completion with timeout
        Returns True if completed successfully, False otherwise
        """

        if self.monitor_method in ['process', 'both']:
            return self._monitor_process(process, prompt_id, start_time)
        elif self.monitor_method == 'files':
            return self._monitor_file_changes(process, prompt_id, start_time)
        else:
            return self._monitor_process(process, prompt_id, start_time)

    def _check_watchdog(
        self,
        last_output_time: float,
        process: subprocess.Popen,
        prompt_id: str
    ) -> bool:
        """
        Check if process has been stuck without output for too long
        Returns True if process should be terminated
        """
        time_since_output = time.time() - last_output_time

        if time_since_output > self.no_output_timeout:
            logger.warning(f"⚠️ No output from Claude Code for {int(time_since_output)}s")
            logger.warning(f"Terminating stuck process for {prompt_id}")

            # Send warning to console
            print(f"\n⚠️ Claude Code appears stuck (no output for {int(time_since_output)}s)")
            print("Terminating and moving to next prompt...")

            # Terminate the process
            process.terminate()
            time.sleep(2)

            # Force kill if still running
            if process.poll() is None:
                logger.warning("Process didn't terminate gracefully, forcing kill...")
                process.kill()

            return True

        return False

    def _monitor_process(
        self,
        process: subprocess.Popen,
        prompt_id: str,
        start_time: float
    ) -> bool:
        """Monitor process completion with watchdog for stuck detection"""

        print(f"⏳ Waiting for Claude Code to complete (timeout: {self.timeout}s)...\n")

        output_lines = []
        error_lines = []
        last_output_time = time.time()  # Track when we last saw output

        while True:
            # Check if process completed
            poll_status = process.poll()

            if poll_status is not None:
                # Process completed - get any remaining output
                stdout, stderr = process.communicate()

                if stdout:
                    output_lines.append(stdout)
                    print(stdout, end='')

                if stderr:
                    error_lines.append(stderr)

                elapsed = int(time.time() - start_time)

                if poll_status == 0:
                    print(f"\n✅ Process completed in {elapsed}s")
                    return True
                else:
                    print(f"\n❌ Process failed with exit code {poll_status} after {elapsed}s")
                    if stderr:
                        logger.error(f"Error output: {stderr[:500]}")
                    return False

            # Check timeout
            elapsed = time.time() - start_time
            if elapsed > self.timeout:
                logger.error(f"⏱️ {prompt_id} timed out after {self.timeout} seconds")
                process.terminate()
                time.sleep(2)
                if process.poll() is None:
                    process.kill()
                return False

            # CHECK WATCHDOG - Detect stuck processes
            if self._check_watchdog(last_output_time, process, prompt_id):
                return False  # Process was stuck and terminated

            # Read output in real-time (non-blocking)
            import select
            if hasattr(select, 'select'):
                # Unix-like systems
                try:
                    ready = select.select([process.stdout, process.stderr], [], [], 0.1)
                    if process.stdout in ready[0]:
                        line = process.stdout.readline()
                        if line:
                            print(line, end='')
                            output_lines.append(line)
                            last_output_time = time.time()  # Reset watchdog timer
                    if process.stderr in ready[0]:
                        line = process.stderr.readline()
                        if line:
                            error_lines.append(line)
                            last_output_time = time.time()  # Reset watchdog timer
                except:
                    pass

            # Show progress indicator with watchdog status
            elapsed_int = int(elapsed)
            minutes = elapsed_int // 60
            seconds = elapsed_int % 60
            since_output = int(time.time() - last_output_time)

            # Enhanced progress display showing watchdog status
            print(f"\r⏳ Waiting... {minutes:02d}:{seconds:02d} (Last output: {since_output}s ago)",
                  end='', flush=True)

            time.sleep(1)

    def _monitor_file_changes(
        self,
        process: subprocess.Popen,
        prompt_id: str,
        start_time: float
    ) -> bool:
        """
        Monitor project directory for file changes as indicator of completion
        This is a backup method if process monitoring doesn't work well
        """

        logger.info("Monitoring file changes for completion...")

        last_change_time = start_time
        stable_duration = 60  # Consider complete if no changes for 60 seconds

        # Watch the entire project directory for changes
        while time.time() - start_time < self.timeout:
            # Check if process is still running
            if process.poll() is not None:
                # Process finished
                return process.returncode == 0

            # Check for recent file modifications in entire project
            most_recent_change = start_time

            if os.path.exists(self.project_path):
                for root, dirs, files in os.walk(self.project_path):
                    # Skip node_modules and .git directories
                    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '.next', 'dist', 'build']]

                    for file in files:
                        # Monitor all relevant file types
                        if file.endswith(('.tsx', '.ts', '.css', '.jsx', '.js', '.json', '.md', '.env', '.mjs')):
                            file_path = os.path.join(root, file)
                            try:
                                mod_time = os.path.getmtime(file_path)
                                if mod_time > most_recent_change:
                                    most_recent_change = mod_time
                            except:
                                pass

            # If files changed, reset stability counter
            if most_recent_change > last_change_time:
                last_change_time = most_recent_change
                logger.info(f"Detected file change at {int(time.time() - start_time)}s")

            # Check if stable (no changes for stable_duration)
            time_since_last_change = time.time() - last_change_time

            if time_since_last_change > stable_duration:
                logger.info(f"No changes for {stable_duration}s - assuming complete")
                # Terminate process gracefully
                if process.poll() is None:
                    process.terminate()
                return True

            # Show progress
            elapsed = int(time.time() - start_time)
            since_change = int(time_since_last_change)
            print(f"\r⏳ Waiting... {elapsed}s (stable: {since_change}s/{stable_duration}s)",
                  end='', flush=True)

            time.sleep(2)

        # Timeout
        logger.error(f"Timeout after {self.timeout}s")
        if process.poll() is None:
            process.terminate()
        return False

    def create_git_commit(self, prompt: Dict):
        """Create git commit after successful prompt execution"""

        try:
            commit_message = f"""feat: {prompt['phase']} - Prompt {prompt['number']}

{prompt['title']}

🤖 Generated with Claude Code via Bridge Agent
"""

            logger.info("Creating git commit...")

            # Add all changes
            subprocess.run(
                ['git', 'add', '.'],
                cwd=self.project_path,
                check=True,
                capture_output=True
            )

            # Create commit
            subprocess.run(
                ['git', 'commit', '-m', commit_message],
                cwd=self.project_path,
                check=True,
                capture_output=True
            )

            print(f"✅ Git commit created: \"{prompt['phase']}, Prompt {prompt['number']}\"")

        except subprocess.CalledProcessError as e:
            logger.warning(f"⚠️  Git commit failed: {e}")
            # Don't fail the whole process if git commit fails
            pass

    def update_progress(self, prompt: Dict, status: str):
        """Update BUILD_PROGRESS.md with current progress"""

        try:
            if not self.progress_file.exists():
                return

            with open(self.progress_file, 'r') as f:
                content = f.read()

            # Update the status for this prompt
            # This is a simple implementation - could be enhanced
            timestamp = time.strftime('%Y-%m-%d %H:%M:%S')

            # Add to execution log section if it exists
            log_entry = f"\n- [{timestamp}] {status.upper()}: {prompt['id']} - {prompt['title']}"

            # Append to file (simple approach)
            with open(self.progress_file, 'a') as f:
                f.write(log_entry)

        except Exception as e:
            logger.warning(f"Could not update progress file: {e}")

    def run(self):
        """Run the batch processor"""

        print(f"\n{'='*80}")
        print(f"🚀 CGE Website Builder - Enhanced Batch Processor")
        print(f"{'='*80}")
        print(f"📂 Project: {self.project_path}")
        print(f"📄 Prompts: {self.prompts_file}")
        print(f"⏱️  Timeout: {self.timeout}s per prompt")
        print(f"🐕 Watchdog: {self.no_output_timeout}s (no output = stuck)")
        print(f"⏰ Delay: {self.delay}s between prompts")
        print(f"🔍 Monitor: {self.monitor_method}")
        print(f"{'='*80}\n")

        # Parse prompts
        prompts = self.parse_prompts()
        print(f"📋 Found {len(prompts)} prompts total")

        # Show resume info if applicable
        if self.progress_data.get('last_completed'):
            print(f"\n📎 Resuming from previous run")
            print(f"   Last completed: {self.progress_data['last_completed']}")
            print(f"   Previously completed: {len(self.progress_data['completed_prompts'])} prompts")
            print(f"   Failed prompts: {len(self.progress_data['failed_prompts'])}")
            if self.progress_data['failed_prompts']:
                print(f"   Failed IDs: {', '.join([p['id'] for p in self.progress_data['failed_prompts']])}")
            print()

        # Find starting point
        start_index = self.find_starting_point(prompts)
        prompts_to_process = prompts[start_index:]

        print(f"▶️  Starting from: {prompts_to_process[0]['id']}")
        print(f"📊 Will process: {len(prompts_to_process)} prompts\n")

        # Show what will be processed
        for i, p in enumerate(prompts_to_process[:5], 1):
            status = ""
            if self.should_skip_prompt(p):
                status = " (✅ already completed)"
            print(f"   {i}. {p['id']}: {p['title']}{status}")
        if len(prompts_to_process) > 5:
            print(f"   ... and {len(prompts_to_process) - 5} more\n")
        else:
            print()

        # Confirm
        if not self.auto_approve:
            response = input("Continue? (y/n): ")
            if response.lower() != 'y':
                print("Cancelled.")
                return

        # Add session info
        session_start = time.time()
        self.progress_data['session_history'].append({
            "started_at": datetime.now().isoformat(),
            "start_prompt": prompts_to_process[0]['id'] if prompts_to_process else None
        })
        self.save_progress()

        # Process each prompt
        completed = 0
        failed = 0
        skipped = 0
        start_time = time.time()

        for i, prompt in enumerate(prompts_to_process, 1):
            print(f"\n{'='*80}")
            print(f"📝 Processing {i}/{len(prompts_to_process)}: {prompt['id']}")
            print(f"   {prompt['title']}")
            print(f"{'='*80}\n")

            # Execute with proper waiting
            success = self.execute_prompt(prompt)

            if success:
                # Check if it was skipped (already completed)
                if self.progress_data["skipped_prompts"] and prompt['id'] in self.progress_data["skipped_prompts"]:
                    skipped += 1
                else:
                    completed += 1
            else:
                failed += 1

                # Ask if should continue on failure
                if not self.continue_on_error and not self.auto_approve:
                    response = input("\n⚠️  Continue to next prompt? (y/n): ")
                    if response.lower() != 'y':
                        print("Stopping due to failure.")
                        break
                elif not self.continue_on_error:
                    print("Stopping due to failure.")
                    break

            # Wait between prompts (except last one)
            if i < len(prompts_to_process):
                if self.delay > 0:
                    print(f"\n⏳ Waiting {self.delay} seconds before next prompt...")
                    for remaining in range(self.delay, 0, -1):
                        print(f"\r   {remaining}s remaining...", end='', flush=True)
                        time.sleep(1)
                    print("\n")

        # After processing, update session
        session_time = time.time() - session_start
        if self.progress_data['session_history']:
            self.progress_data['session_history'][-1].update({
                "ended_at": datetime.now().isoformat(),
                "duration_seconds": session_time,
                "prompts_completed": completed,
                "prompts_failed": failed,
                "prompts_skipped": skipped
            })
        self.save_progress()

        # Summary
        total_time = int(time.time() - start_time)
        minutes = total_time // 60
        seconds = total_time % 60

        print(f"\n{'='*80}")
        print(f"📊 Batch Processing Complete")
        print(f"{'='*80}")
        print(f"   ✅ Completed: {completed}")
        print(f"   ⏭️  Skipped: {skipped}")
        print(f"   ❌ Failed: {failed}")
        print(f"   📈 Total Processed: {completed + skipped + failed}/{len(prompts_to_process)}")
        print(f"   ⏱️  Session Time: {minutes}m {seconds}s")
        print(f"{'='*80}")

        # Show cumulative stats
        total_completed = len(self.progress_data['completed_prompts'])
        total_failed = len(self.progress_data['failed_prompts'])
        total_time_all = self.progress_data['total_time_seconds']

        print(f"\n📊 Cumulative Statistics:")
        print(f"   Total Completed: {total_completed}")
        print(f"   Total Failed: {total_failed}")
        print(f"   Total Time: {int(total_time_all // 60)}m {int(total_time_all % 60)}s")
        print(f"   Sessions: {len(self.progress_data['session_history'])}")
        print(f"   Progress File: {self.progress_file_path}")
        print(f"{'='*80}\n")


def test_completion_monitoring(project_path: str, timeout: int = 60):
    """Test that we can properly detect when Claude Code completes"""

    logger.info("Testing completion monitoring...")

    test_prompt = """Create a simple test component at src/components/test-monitor.tsx:

```typescript
export function TestMonitor() {
  return <div>Test Monitoring Component</div>;
}
```

This is just a test to verify the monitoring works correctly.
"""

    try:
        cmd = ['claude', project_path, '--dangerously-skip-permissions']

        logger.info(f"Running test: {' '.join(cmd)}")
        start = time.time()

        # Use interactive mode for actual file operations
        process = subprocess.run(
            cmd,
            input=test_prompt,
            timeout=timeout,
            capture_output=True,
            text=True
        )

        duration = time.time() - start
        success = process.returncode == 0

        logger.info(f"Test completed in {duration:.1f}s - Success: {success}")

        if process.stdout:
            logger.info(f"Output: {process.stdout[:200]}")

        # Cleanup test file if created
        test_component = Path(project_path) / 'src/components/test-monitor.tsx'
        if test_component.exists():
            test_component.unlink()
            logger.info("Cleaned up test component")

        return success

    except Exception as e:
        logger.error(f"Test failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Process ENHANCED_PROMPTS.md with Claude Code',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic usage
  %(prog)s --prompts ENHANCED_PROMPTS.md --project-path /path/to/project

  # Start from specific prompt with git commits
  %(prog)s --prompts ENHANCED_PROMPTS.md --project-path /path/to/project \\
           --start-from "Phase 2, Prompt 3" --git-commit

  # Auto-run with continue-on-error
  %(prog)s --prompts ENHANCED_PROMPTS.md --project-path /path/to/project \\
           --auto-approve --continue-on-error --delay 60
        """
    )

    parser.add_argument(
        '--prompts',
        required=True,
        help='Path to ENHANCED_PROMPTS.md'
    )

    parser.add_argument(
        '--project-path',
        required=True,
        help='Path to website project'
    )

    parser.add_argument(
        '--start-from',
        help='Start from specific prompt (e.g., "Phase 2, Prompt 3")'
    )

    parser.add_argument(
        '--auto-approve',
        action='store_true',
        help='Auto-approve all prompts (no confirmation)'
    )

    parser.add_argument(
        '--git-commit',
        action='store_true',
        help='Create git commits after each successful prompt'
    )

    parser.add_argument(
        '--delay',
        type=int,
        default=30,
        help='Delay in seconds between prompts (default: 30)'
    )

    parser.add_argument(
        '--timeout',
        type=int,
        default=600,
        help='Timeout in seconds for each prompt (default: 600 = 10 minutes)'
    )

    parser.add_argument(
        '--monitor-method',
        choices=['process', 'files', 'both'],
        default='process',
        help='How to monitor completion (default: process)'
    )

    parser.add_argument(
        '--continue-on-error',
        action='store_true',
        help='Continue processing even if a prompt fails'
    )

    parser.add_argument(
        '--no-output-timeout',
        type=int,
        default=300,
        help='Terminate if no output for N seconds (default: 300 = 5 minutes)'
    )

    parser.add_argument(
        '--test',
        action='store_true',
        help='Run a test to verify completion monitoring works'
    )

    parser.add_argument(
        '--reset-progress',
        action='store_true',
        help='Reset progress tracking and start fresh'
    )

    args = parser.parse_args()

    # Handle reset-progress
    if args.reset_progress:
        progress_file = Path(args.project_path).parent / ".claude_build_progress.json"
        if progress_file.exists():
            progress_file.unlink()
            print("✅ Progress reset - starting fresh")
        else:
            print("ℹ️  No progress file found - will start fresh anyway")
        # Don't exit - continue with the run

    # Run test mode
    if args.test:
        if not Path(args.project_path).exists():
            print(f"❌ Error: Project path not found: {args.project_path}")
            sys.exit(1)

        success = test_completion_monitoring(args.project_path, args.timeout)
        sys.exit(0 if success else 1)

    # Validate paths
    if not Path(args.prompts).exists():
        print(f"❌ Error: Prompts file not found: {args.prompts}")
        sys.exit(1)

    if not Path(args.project_path).exists():
        print(f"❌ Error: Project path not found: {args.project_path}")
        sys.exit(1)

    # Run processor
    processor = EnhancedPromptProcessor(
        prompts_file=args.prompts,
        project_path=args.project_path,
        start_from=args.start_from,
        auto_approve=args.auto_approve,
        git_commit=args.git_commit,
        delay=args.delay,
        timeout=args.timeout,
        monitor_method=args.monitor_method,
        continue_on_error=args.continue_on_error,
        no_output_timeout=args.no_output_timeout
    )

    try:
        processor.run()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user. Exiting...")
        sys.exit(1)


if __name__ == '__main__':
    main()
