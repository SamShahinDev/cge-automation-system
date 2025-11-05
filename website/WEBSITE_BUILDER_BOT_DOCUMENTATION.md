# Website Builder Bot - Complete Comprehensive Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [How It Works](#how-it-works)
4. [Core Components](#core-components)
5. [Monitoring & Completion Detection](#monitoring--completion-detection)
6. [Progress Tracking](#progress-tracking)
7. [Configuration & Usage](#configuration--usage)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Features](#advanced-features)

---

## Overview

The **Website Builder Bot** is an automated system that uses Claude Code (Anthropic's CLI tool) to sequentially build a complete website from a structured prompt file. It processes detailed prompts one at a time, monitors completion, creates git commits, and tracks progress across sessions.

### Key Features

- ✅ **Sequential Automation**: Processes 16+ detailed prompts automatically
- ✅ **Smart Completion Detection**: File-based monitoring with 60-second stability window
- ✅ **Progress Persistence**: Resumes from last completed prompt if interrupted
- ✅ **Git Integration**: Auto-commits after each successful prompt
- ✅ **Watchdog Protection**: Detects and terminates stuck processes
- ✅ **Error Recovery**: Continues on errors or can stop based on configuration

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERACTION                        │
│              (Runs: ./build-website.sh)                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  build-website.sh                           │
│  • Validates paths                                          │
│  • Checks dependencies                                      │
│  • Configures environment                                   │
│  • Launches enhanced_batch_cli.py                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│            enhanced_batch_cli.py                            │
│  • Parses ENHANCED_PROMPTS.md                               │
│  • Loads progress from .claude_build_progress.json          │
│  • Processes prompts sequentially                           │
│  • Monitors Claude Code execution                           │
│  • Saves progress after each prompt                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code                              │
│  • Receives prompt via stdin                                │
│  • Analyzes and executes task                               │
│  • Creates/modifies files                                   │
│  • Outputs to stdout/stderr                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              File System Monitoring                         │
│  • Watches src/components directory                         │
│  • Detects file modifications                               │
│  • Tracks last change timestamp                             │
│  • Declares complete after 60s stability                    │
└─────────────────────────────────────────────────────────────┘
```

---

## How It Works

### Step-by-Step Execution Flow

**1. Initialization**
```bash
./build-website.sh "Phase 2, Prompt 3"
```
- Validates all file paths exist
- Checks Claude Code is installed
- Verifies Python dependencies (anthropic package)
- Activates virtual environment if available
- Optionally starts Redis (if needed)

**2. Prompt Parsing**
```python
# enhanced_batch_cli.py parses ENHANCED_PROMPTS.md
prompts = processor.parse_prompts()
# Extracts:
# - Phase information
# - Prompt number and title
# - Full content between ## Enhanced Prompt N and ---END PROMPT---
```

**3. Progress Loading**
```json
{
  "started_at": "2025-10-02T22:59:23.396613",
  "last_completed": "Unknown Phase, Prompt 3",
  "completed_prompts": [...],
  "failed_prompts": [],
  "skipped_prompts": []
}
```
- Checks if prompt was already completed
- Skips completed prompts automatically
- Resumes from last failure or next uncompleted prompt

**4. Prompt Execution**
```python
# For each prompt:
process = subprocess.Popen(['claude', project_path, '--dangerously-skip-permissions'])
process.stdin.write(prompt_content)
process.stdin.close()
```
- Starts Claude Code as subprocess
- Sends prompt via stdin
- Monitors completion using file-based detection

**5. Completion Monitoring**

The system uses **file-based monitoring** (critical for accuracy):

```python
# Monitor src/components directory
last_change_time = start_time
stable_duration = 60  # 60 seconds

while True:
    # Check all .tsx, .ts, .jsx, .js files
    for file in components_dir:
        mod_time = os.path.getmtime(file)
        if mod_time > last_change_time:
            last_change_time = mod_time  # Reset timer

    # Check if stable (no changes for 60s)
    if time.time() - last_change_time > 60:
        # COMPLETE!
        process.terminate()
        return True
```

**Why 60 seconds?**
- Claude Code displays prompt immediately (stdout)
- Then goes silent while analyzing and working (5-120 seconds)
- File changes occur during work
- After finishing, no more file changes
- 60s ensures work is truly done, not just paused

**6. Git Commit**
```python
if success and git_commit:
    git add .
    git commit -m """feat: Phase 2 - Prompt 3

    Pricing Model Section with Icon Integration

    🤖 Generated with Claude Code via Bridge Agent
    """
```

**7. Progress Save**
```python
progress_data["completed_prompts"].append({
    "id": "Phase 2, Prompt 3",
    "title": "Pricing Model Section with Icon Integration",
    "completed_at": "2025-10-02T23:09:59.789764",
    "execution_time": 206.62
})
save_progress()
```

**8. Delay & Next Prompt**
```python
# Wait 30 seconds before next prompt
time.sleep(30)
# Process next prompt...
```

---

## Core Components

### 1. `build-website.sh`

**Purpose**: Entry point orchestration script

**Location**: `/Users/royaltyvixion/Documents/cge software/website/build-website.sh`

**Key Functions**:
- Path validation
- Dependency checking
- Environment setup
- Python script launcher

**Usage**:
```bash
# Start from beginning
./build-website.sh

# Start from specific prompt
./build-website.sh "Phase 2, Prompt 5"

# Start from prompt number
./build-website.sh "Prompt 8"
```

**Configuration Variables**:
```bash
BRIDGE_DIR="/path/to/claude-bridge-agent"
PROMPTS_FILE="/path/to/ENHANCED_PROMPTS.md"
PROJECT_PATH="/path/to/custom-software-site"
START_FROM="${1:-Phase 2, Prompt 3}"
```

### 2. `enhanced_batch_cli.py`

**Purpose**: Core automation engine

**Location**: `/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/claude-bridge-agent/integrations/enhanced_batch_cli.py`

**Class Structure**:
```python
class EnhancedPromptProcessor:
    def __init__(
        prompts_file: str,        # ENHANCED_PROMPTS.md path
        project_path: str,        # Website project path
        start_from: str,          # Starting prompt ID
        auto_approve: bool,       # Skip confirmations
        git_commit: bool,         # Auto-commit after success
        delay: int,               # Seconds between prompts (30)
        timeout: int,             # Max time per prompt (600s)
        monitor_method: str,      # 'files' or 'process'
        continue_on_error: bool,  # Keep going on failures
        no_output_timeout: int    # Watchdog timeout (300s)
    )
```

**Key Methods**:

```python
def parse_prompts() -> List[Dict]:
    """Extract all prompts from ENHANCED_PROMPTS.md"""
    # Parses ## Enhanced Prompt N: Title
    # Extracts content until ---END PROMPT---
    # Returns structured prompt data

def execute_prompt(prompt: Dict) -> bool:
    """Execute single prompt with Claude Code"""
    # 1. Check if already completed (skip if yes)
    # 2. Start Claude Code subprocess
    # 3. Send prompt via stdin
    # 4. Monitor completion
    # 5. Create git commit
    # 6. Save progress
    # 7. Return success/failure

def _monitor_file_changes(process, prompt_id, start_time) -> bool:
    """Monitor src/components for file changes"""
    # Watches file modification times
    # Tracks stability (60s without changes)
    # Terminates process when stable
    # Returns True if successful

def _check_watchdog(last_output_time, process, prompt_id) -> bool:
    """Detect stuck processes (no output for 300s)"""
    # If 5 minutes without any output -> STUCK
    # Terminate process
    # Return True (process was stuck)

def load_progress() -> dict:
    """Load .claude_build_progress.json"""
    # Resume from previous session
    # Track completed/failed/skipped prompts

def save_progress():
    """Save current state to .claude_build_progress.json"""
    # Persist after each prompt
    # Enables resume on crash/interrupt
```

### 3. `ENHANCED_PROMPTS.md`

**Purpose**: Structured prompt library

**Location**: `/Users/royaltyvixion/Documents/cge software/website/ENHANCED_PROMPTS.md`

**Structure**:
```markdown
# Phase 2: Pricing Page

## Enhanced Prompt 3: Pricing Model Section with Icon Integration

Create the pricing model explanation section at `src/components/pricing/pricing-model.tsx`.

### Component Requirements:

**1. Create the base component structure:**
[Detailed implementation instructions...]

---END PROMPT---

## Enhanced Prompt 4: Investment Tiers with Featured Card Pattern

[Next prompt content...]

---END PROMPT---
```

**Parsing Rules**:
- Prompts start with `## Enhanced Prompt N: Title`
- Content extends until `---END PROMPT---`
- Phase detected from preceding `# Phase N:` heading
- Supports both numbered and named phases

### 4. `.claude_build_progress.json`

**Purpose**: Session state persistence

**Location**: `/Users/royaltyvixion/Documents/cge software/website/.claude_build_progress.json`

**Schema**:
```json
{
  "started_at": "ISO timestamp",
  "last_completed": "Phase X, Prompt Y",
  "completed_prompts": [
    {
      "id": "Phase 2, Prompt 3",
      "title": "Pricing Model Section with Icon Integration",
      "completed_at": "ISO timestamp",
      "execution_time": 206.62
    }
  ],
  "failed_prompts": [
    {
      "id": "Phase 3, Prompt 1",
      "title": "Process Page Setup",
      "failed_at": "ISO timestamp",
      "error": "Process timed out"
    }
  ],
  "skipped_prompts": ["Phase 2, Prompt 1", "Phase 2, Prompt 2"],
  "total_time_seconds": 509.52,
  "session_history": [
    {
      "started_at": "ISO timestamp",
      "start_prompt": "Phase 2, Prompt 3",
      "ended_at": "ISO timestamp",
      "duration_seconds": 961.77,
      "prompts_completed": 10,
      "prompts_failed": 0,
      "prompts_skipped": 6
    }
  ]
}
```

**Benefits**:
- Resume after crashes/interruptions
- Track execution time per prompt
- Skip already-completed work
- Maintain session history
- Debug performance issues

---

## Monitoring & Completion Detection

### The Critical Problem We Solved

**Initial Approach (Process Monitoring)** ❌
```python
# WRONG - caused premature completion detection
while True:
    line = process.stdout.readline()
    if line:
        last_output_time = time.time()

    # If no output for 30s -> declare complete
    if time.time() - last_output_time > 30:
        return True  # WRONG! Claude is still working!
```

**Problem**:
1. Claude Code displays prompt immediately → stdout output
2. Claude goes silent while analyzing (5-60 seconds) → no stdout
3. Watchdog sees silence → declares complete ❌
4. But Claude is still working!
5. Next prompt starts prematurely
6. Files incomplete, build broken

**Timeline of Failure**:
```
0s:   Prompt displayed → stdout output
5s:   Last stdout line → watchdog starts counting
10s:  (silence - Claude analyzing)
15s:  (silence - Claude working)
20s:  (silence - Claude writing files)
25s:  (silence - Claude testing)
30s:  Watchdog timeout → DECLARED COMPLETE ❌
35s:  Claude actually finishes → too late
40s:  Next prompt already started → chaos
```

### The Solution: File-Based Monitoring ✅

```python
def _monitor_file_changes(process, prompt_id, start_time):
    """Monitor actual file system changes"""

    last_change_time = start_time
    stable_duration = 60  # 60 seconds without changes

    components_dir = os.path.join(project_path, 'src', 'components')

    while time.time() - start_time < timeout:
        # Check process status
        if process.poll() is not None:
            return process.returncode == 0

        # Find most recent file modification
        most_recent_change = start_time
        for root, dirs, files in os.walk(components_dir):
            for file in files:
                if file.endswith(('.tsx', '.ts', '.css', '.jsx', '.js')):
                    mod_time = os.path.getmtime(file_path)
                    if mod_time > most_recent_change:
                        most_recent_change = mod_time

        # If files changed, reset stability counter
        if most_recent_change > last_change_time:
            last_change_time = most_recent_change
            logger.info(f"Detected file change at {int(time.time() - start_time)}s")

        # Check if stable (no changes for 60 seconds)
        time_since_last_change = time.time() - last_change_time
        if time_since_last_change > stable_duration:
            logger.info(f"No changes for {stable_duration}s - assuming complete")
            if process.poll() is None:
                process.terminate()
            return True

        # Progress display
        print(f"\r⏳ Waiting... {elapsed}s (stable: {since_change}s/{stable_duration}s)")
        time.sleep(2)
```

**Timeline of Success**:
```
0s:   Prompt sent to Claude
5s:   Claude starts analyzing (no file changes yet)
15s:  Claude creates first file → last_change_time = 15s
30s:  Claude modifies file → last_change_time = 30s
45s:  Claude creates another file → last_change_time = 45s
60s:  Claude finishes (no more changes)
70s:  (stable for 10s)
80s:  (stable for 20s)
90s:  (stable for 30s)
100s: (stable for 40s)
105s: (stable for 60s) → DECLARED COMPLETE ✅
```

### Watchdog: Stuck Process Detection

**Purpose**: Detect when Claude Code hangs/freezes

```python
def _check_watchdog(last_output_time, process, prompt_id):
    """Terminate processes stuck for 5+ minutes"""

    time_since_output = time.time() - last_output_time

    if time_since_output > 300:  # 5 minutes
        logger.warning(f"⚠️ No output for {int(time_since_output)}s")
        logger.warning(f"Terminating stuck process for {prompt_id}")

        process.terminate()
        time.sleep(2)

        if process.poll() is None:
            process.kill()  # Force kill if needed

        return True  # Process was stuck

    return False
```

**Watchdog Triggers**:
- No stdout/stderr for 300 seconds (5 minutes)
- No file changes for 300 seconds (backup check)
- Process appears frozen/hung

**Watchdog Actions**:
1. Log warning to console
2. Send SIGTERM to Claude Code process
3. Wait 2 seconds for graceful shutdown
4. Send SIGKILL if still running
5. Mark prompt as failed
6. Continue to next prompt (if continue_on_error=True)

---

## Progress Tracking

### Session Lifecycle

**1. Fresh Start**
```bash
# No .claude_build_progress.json exists
./build-website.sh
```
Creates new progress file:
```json
{
  "started_at": "2025-10-02T22:59:23.396613",
  "last_completed": null,
  "completed_prompts": [],
  "failed_prompts": [],
  "skipped_prompts": [],
  "total_time_seconds": 0,
  "session_history": []
}
```

**2. During Execution**

After each prompt completes:
```python
# Update progress
progress_data["completed_prompts"].append({
    "id": prompt_id,
    "title": prompt_title,
    "completed_at": datetime.now().isoformat(),
    "execution_time": elapsed_time
})
progress_data["last_completed"] = prompt_id
progress_data["total_time_seconds"] += elapsed_time
save_progress()
```

**3. Interruption (Ctrl+C or Crash)**
```
^C Keyboard Interrupt
⚠️ Interrupted by user. Exiting...
```
Progress file already saved → resume possible!

**4. Resume**
```bash
# Run again - automatically resumes
./build-website.sh
```

Output:
```
📎 Resuming from previous run
   Last completed: Phase 2, Prompt 5
   Previously completed: 3 prompts
   Failed prompts: 0

▶️  Starting from: Phase 2, Prompt 6
```

Skips prompts 1-5 automatically:
```
⏭️  Skipping Phase 2, Prompt 3 (already completed in previous run)
⏭️  Skipping Phase 2, Prompt 4 (already completed in previous run)
⏭️  Skipping Phase 2, Prompt 5 (already completed in previous run)

📝 Executing: Phase 2, Prompt 6
```

**5. Reset Progress**
```bash
# Start completely fresh
python3 enhanced_batch_cli.py \
    --prompts ENHANCED_PROMPTS.md \
    --project-path ./custom-software-site \
    --reset-progress
```

---

## Configuration & Usage

### Basic Usage

```bash
# Start from default (Phase 2, Prompt 3)
cd "/Users/royaltyvixion/Documents/cge software/website"
./build-website.sh

# Start from specific prompt
./build-website.sh "Phase 3, Prompt 1"

# Start from prompt number only
./build-website.sh "Prompt 8"
```

### Advanced Configuration

**Command Line Options**:

```bash
python3 integrations/enhanced_batch_cli.py \
    --prompts "/path/to/ENHANCED_PROMPTS.md" \
    --project-path "/path/to/custom-software-site" \
    --start-from "Phase 2, Prompt 3" \
    --auto-approve \
    --git-commit \
    --delay 30 \
    --timeout 600 \
    --monitor-method files \
    --continue-on-error \
    --no-output-timeout 300
```

**Parameter Reference**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--prompts` | string | required | Path to ENHANCED_PROMPTS.md |
| `--project-path` | string | required | Path to website project |
| `--start-from` | string | "Prompt 1" | Starting prompt ID |
| `--auto-approve` | flag | false | Skip confirmation prompts |
| `--git-commit` | flag | false | Create git commits after each prompt |
| `--delay` | int | 30 | Seconds to wait between prompts |
| `--timeout` | int | 600 | Max seconds per prompt (10 min) |
| `--monitor-method` | string | 'process' | 'files' or 'process' |
| `--continue-on-error` | flag | false | Continue even if prompts fail |
| `--no-output-timeout` | int | 300 | Watchdog timeout in seconds (5 min) |
| `--reset-progress` | flag | false | Delete progress file and start fresh |

### Environment Variables

Set these in `build-website.sh`:

```bash
# Required paths
BRIDGE_DIR="/path/to/claude-bridge-agent"
PROMPTS_FILE="/path/to/ENHANCED_PROMPTS.md"
PROJECT_PATH="/path/to/custom-software-site"

# Optional overrides
PYTHON_BIN="python3"  # Python executable
CLAUDE_BIN="claude"   # Claude Code executable
```

### Git Integration

**Enable auto-commits**:
```bash
./build-website.sh --git-commit
```

**Commit Message Format**:
```
feat: Phase 2 - Prompt 3

Pricing Model Section with Icon Integration

🤖 Generated with Claude Code via Bridge Agent
```

**Commit Behavior**:
- Creates commit after each successful prompt
- Uses `git add .` to stage all changes
- Skips commit if no changes detected
- Continues on commit failure (doesn't break build)
- Warns if commit fails but doesn't stop

---

## Troubleshooting

### Common Issues

#### 1. "Prompt completes too early"

**Symptoms**:
- Next prompt starts before files are created
- Incomplete components
- Build errors

**Cause**: Using process monitoring instead of file monitoring

**Solution**:
```bash
# Ensure monitor-method is 'files'
--monitor-method files
```

In `build-website.sh` line 111:
```bash
--monitor-method files \
```

#### 2. "Process appears stuck"

**Symptoms**:
- No progress for 5+ minutes
- Watchdog terminates process
- Prompt marked as failed

**Cause**: Claude Code hung, network issue, or extremely complex task

**Solution**:
1. Check timeout is sufficient:
```bash
--timeout 900  # Increase to 15 minutes
```

2. Check watchdog timeout:
```bash
--no-output-timeout 600  # Increase to 10 minutes
```

3. Check network connectivity
4. Verify Claude Code API key is valid

#### 3. "Progress file corrupted"

**Symptoms**:
- JSON parse errors
- Can't resume from previous run

**Solution**:
```bash
# Reset and start fresh
python3 enhanced_batch_cli.py \
    --prompts ENHANCED_PROMPTS.md \
    --project-path ./custom-software-site \
    --reset-progress
```

#### 4. "Git commits failing"

**Symptoms**:
- Warning: Git commit failed
- Files created but not committed

**Cause**: Git not configured, merge conflicts, or no changes to commit

**Solution**:
```bash
# Check git config
cd custom-software-site
git config user.name
git config user.email

# Set if missing
git config user.name "Your Name"
git config user.email "your@email.com"

# Check for conflicts
git status
```

#### 5. "Claude Code not found"

**Symptoms**:
```
❌ Error: Claude Code not found
   Please install Claude Code first
```

**Solution**:
```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Or via brew (macOS)
brew install claude-code

# Verify installation
claude --version
```

#### 6. "Python dependency errors"

**Symptoms**:
```
ModuleNotFoundError: No module named 'anthropic'
```

**Solution**:
```bash
# Install dependencies
cd /path/to/claude-bridge-agent
pip3 install anthropic

# Or use virtual environment
python3 -m venv venv
source venv/bin/activate
pip install anthropic
```

---

## Advanced Features

### Custom Prompt Files

Create your own prompt file:

```markdown
# My Custom Build

## Enhanced Prompt 1: Setup Database

Create the database schema at `src/db/schema.ts`.

[Implementation details...]

---END PROMPT---

## Enhanced Prompt 2: Create API Routes

Build API routes at `src/app/api/`.

[Implementation details...]

---END PROMPT---
```

Run with:
```bash
python3 enhanced_batch_cli.py \
    --prompts MY_CUSTOM_PROMPTS.md \
    --project-path ./my-project
```

### Testing Completion Monitoring

```bash
# Run test mode
python3 enhanced_batch_cli.py \
    --project-path ./custom-software-site \
    --test
```

Creates test component to verify monitoring works:
```typescript
// src/components/test-monitor.tsx
export function TestMonitor() {
  return <div>Test Monitoring Component</div>;
}
```

Then verifies:
- Process completes successfully
- File is created
- Monitoring detects completion
- Cleanup (deletes test file)

### Parallel Execution (Advanced)

**NOT RECOMMENDED** - prompts have dependencies

But if you have independent prompts:

```bash
# Terminal 1
./build-website.sh "Phase 2, Prompt 3"

# Terminal 2 (different phase)
./build-website.sh "Phase 4, Prompt 1"
```

Use separate progress files:
```python
# Modify enhanced_batch_cli.py
self.progress_file_path = Path(project_path).parent / f".claude_build_progress_{phase}.json"
```

### Custom Monitoring Logic

Extend monitoring for specific file types:

```python
def _monitor_file_changes(self, process, prompt_id, start_time):
    # Add custom file types
    file_extensions = ('.tsx', '.ts', '.css', '.jsx', '.js', '.json', '.md')

    # Add custom directories
    watch_dirs = [
        os.path.join(self.project_path, 'src', 'components'),
        os.path.join(self.project_path, 'src', 'app'),
        os.path.join(self.project_path, 'src', 'lib'),
    ]

    # Custom stability duration per prompt type
    if 'complex' in prompt_id.lower():
        stable_duration = 90  # 90s for complex prompts
    else:
        stable_duration = 60  # 60s for normal prompts
```

### Integration with CI/CD

**GitHub Actions Example**:

```yaml
name: Automated Website Build

on:
  workflow_dispatch:
    inputs:
      start_from:
        description: 'Starting prompt'
        required: false
        default: 'Prompt 1'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Install Python dependencies
        run: pip install anthropic

      - name: Run automated build
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          cd /path/to/website
          ./build-website.sh "${{ github.event.inputs.start_from }}"

      - name: Commit changes
        run: |
          git config user.name "GitHub Actions Bot"
          git config user.email "actions@github.com"
          git push
```

---

## Summary

The Website Builder Bot is a sophisticated automation system that:

1. **Parses** structured prompts from ENHANCED_PROMPTS.md
2. **Executes** each prompt sequentially via Claude Code
3. **Monitors** completion using file-based detection (60s stability)
4. **Tracks** progress persistently in JSON
5. **Commits** changes to git after each success
6. **Resumes** automatically after interruptions
7. **Protects** against stuck processes with watchdog

**Key Metrics from Last Run**:
- 16 total prompts
- 10 completed in session
- 6 skipped (already done)
- 0 failed
- 16 minutes total session time
- Average: 96 seconds per prompt

**Success Rate**: 100% (when properly configured with file monitoring)

This system enables fully automated website construction with minimal human intervention while maintaining quality and handling errors gracefully.
