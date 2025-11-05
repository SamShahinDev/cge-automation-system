# Watchdog Feature - Stuck Process Detection

## Overview
The Watchdog feature automatically detects when Claude Code gets stuck without producing output for too long and terminates the process to prevent the entire build from hanging.

---

## How It Works

### The Problem
Claude Code might occasionally:
- Wait for user input (even though it shouldn't)
- Get stuck on a network request
- Encounter an internal deadlock
- Freeze without exiting

Previously, the batch processor would wait indefinitely (up to the 10-minute timeout), wasting time.

### The Solution
The Watchdog monitors **output activity** rather than just process completion:

```
Start Process
     ↓
Monitor output stream
     ↓
Output received? → Reset watchdog timer
     ↓
No output for 5 minutes? → TERMINATE (stuck)
```

---

## Configuration

### Default Settings
```python
--no-output-timeout 300  # 5 minutes without output = stuck
```

### Custom Settings

#### Quick Test (1 minute)
```bash
./build-website.sh --no-output-timeout 60
```

#### Lenient (10 minutes)
```bash
python3 integrations/enhanced_batch_cli.py \
    --prompts ENHANCED_PROMPTS.md \
    --project-path /path/to/project \
    --no-output-timeout 600
```

#### Aggressive (2 minutes)
```bash
--no-output-timeout 120
```

---

## Visual Indicators

### Normal Operation
```
⏳ Waiting... 01:23 (Last output: 12s ago)
```

Shows:
- **01:23** - Total elapsed time
- **12s ago** - Time since last output (resets when output received)

### Approaching Watchdog Timeout
```
⏳ Waiting... 05:42 (Last output: 287s ago)
```

If "Last output" approaches your `--no-output-timeout`, the process is likely stuck.

### Watchdog Triggered
```
⏳ Waiting... 06:15 (Last output: 301s ago)

⚠️ Claude Code appears stuck (no output for 301s)
Terminating and moving to next prompt...

❌ Phase 2, Prompt 3 failed
```

The process is automatically terminated and the next prompt begins.

---

## Implementation Details

### 1. Watchdog Check Method

```python
def _check_watchdog(self, last_output_time: float, process: subprocess.Popen, prompt_id: str) -> bool:
    """
    Check if process has been stuck without output for too long
    Returns True if process should be terminated
    """
    time_since_output = time.time() - last_output_time

    if time_since_output > self.no_output_timeout:
        logger.warning(f"⚠️ No output from Claude Code for {int(time_since_output)}s")
        logger.warning(f"Terminating stuck process for {prompt_id}")

        # Terminate the process
        process.terminate()
        time.sleep(2)

        # Force kill if still running
        if process.poll() is None:
            process.kill()

        return True

    return False
```

### 2. Output Monitoring

```python
# Read output in real-time
if process.stdout in ready[0]:
    line = process.stdout.readline()
    if line:
        print(line, end='')
        output_lines.append(line)
        last_output_time = time.time()  # ← Reset watchdog timer

if process.stderr in ready[0]:
    line = process.stderr.readline()
    if line:
        error_lines.append(line)
        last_output_time = time.time()  # ← Reset watchdog timer
```

Every time ANY output is received (stdout or stderr), the watchdog timer resets.

### 3. Progress Display

```python
# Show progress with watchdog info
since_output = int(time.time() - last_output_time)

print(f"\r⏳ Waiting... {minutes:02d}:{seconds:02d} (Last output: {since_output}s ago)",
      end='', flush=True)
```

---

## What Counts as "Output"

The watchdog resets when it receives:
- ✅ **stdout** - Normal Claude Code output
- ✅ **stderr** - Error messages or warnings
- ❌ **Process still running** - Doesn't count (must have output)

This means:
- Active Claude Code work → Constant output → Watchdog stays happy
- Stuck Claude Code → No output → Watchdog triggers after 5 minutes

---

## Comparison: Timeout vs Watchdog

### Overall Timeout (`--timeout`)
- **Default:** 600 seconds (10 minutes)
- **Triggers:** Process runs too long (regardless of activity)
- **Use case:** Prevent infinite execution
- **Example:** Complex prompt takes 12 minutes

```
❌ Process timed out after 600 seconds
```

### Watchdog (`--no-output-timeout`)
- **Default:** 300 seconds (5 minutes)
- **Triggers:** Process produces no output for too long
- **Use case:** Detect stuck/frozen processes
- **Example:** Claude Code waiting for user input

```
⚠️ Claude Code appears stuck (no output for 301s)
```

### Together They Work Like:

```
                Overall Timeout (10 min)
|--------------------------------------------------|
                                        ↑
                                   Still working
                                   (keeps outputting)

              Watchdog (5 min no output)
|--------------------------------|
         ↑                        ↑
    Last output              No output = STUCK!
```

---

## Real-World Scenarios

### Scenario 1: Normal Execution
```
00:00 - Start prompt
00:05 - "Reading files..."           ← Output received
00:12 - "Creating component..."      ← Output received
00:45 - "Installing dependencies..." ← Output received
02:30 - "Tests passing..."           ← Output received
03:15 - Process completes ✅
```

**Watchdog:** Never triggers (output every ~30-60s)
**Timeout:** Never triggers (< 10 minutes)

### Scenario 2: Stuck Process
```
00:00 - Start prompt
00:05 - "Reading files..."           ← Output received
00:12 - "Creating component..."      ← Output received
00:45 - [STUCK - waiting for input]
...
05:45 - Watchdog triggers ⚠️
        "No output for 300s"
        Process terminated
```

**Watchdog:** Triggers at 5:45 ✅
**Timeout:** Would trigger at 10:00 (but watchdog got it first)

**Time Saved:** 4 minutes 15 seconds

### Scenario 3: Slow but Working
```
00:00 - Start prompt
00:05 - "Reading files..."           ← Output received
02:00 - "Large file processing..."   ← Output received
04:30 - "Still processing..."        ← Output received
07:00 - "Almost done..."             ← Output received
08:30 - Process completes ✅
```

**Watchdog:** Never triggers (output every 2-2.5 minutes)
**Timeout:** Never triggers (< 10 minutes)

### Scenario 4: Truly Long Task
```
00:00 - Start prompt
00:05 - "Complex migration..."       ← Output received
02:00 - "Processing records..."      ← Output received
04:00 - "Still processing..."        ← Output received
06:00 - "Almost done..."             ← Output received
08:00 - "Finalizing..."              ← Output received
10:30 - Process completes ❌ (timeout)
```

**Watchdog:** Never triggers (constant output)
**Timeout:** Triggers at 10:00

**Solution:** Increase timeout for this specific prompt:
```bash
--timeout 1200  # 20 minutes
```

---

## Best Practices

### 1. Use Default Settings for Most Cases
```bash
--timeout 600              # 10 min overall
--no-output-timeout 300    # 5 min no output
```

These work well for 95% of prompts.

### 2. Increase Timeout for Known Long Tasks
```bash
# For complex migrations or large file processing
--timeout 1200             # 20 min overall
--no-output-timeout 600    # 10 min no output
```

### 3. Decrease for Testing
```bash
# Quick testing to verify watchdog works
--timeout 120              # 2 min overall
--no-output-timeout 60     # 1 min no output
```

### 4. Monitor the "Last output" Timer
Watch your terminal output:
```
⏳ Waiting... 03:22 (Last output: 45s ago)   ← Healthy
⏳ Waiting... 04:15 (Last output: 198s ago)  ← Getting close
⏳ Waiting... 05:02 (Last output: 285s ago)  ← About to trigger
```

If you see "Last output" approaching 300s, the process might be stuck.

---

## Troubleshooting

### Problem: Watchdog triggers too often

**Symptoms:**
```
⚠️ Claude Code appears stuck (no output for 301s)
```

**Causes:**
- Prompts are legitimately slow
- Claude Code is "thinking" without output

**Solutions:**
```bash
# Increase watchdog timeout
--no-output-timeout 600  # 10 minutes

# Or increase overall timeout
--timeout 1200  # 20 minutes
```

### Problem: Process still hangs

**Symptoms:**
- Watchdog doesn't trigger
- Process runs forever
- Output continues but never completes

**Causes:**
- Process is actually working (not stuck)
- Overall timeout is too high

**Solutions:**
```bash
# Decrease overall timeout
--timeout 300  # 5 minutes

# Or manually interrupt
Ctrl+C
```

### Problem: Watchdog triggers on first prompt

**Symptoms:**
```
⏳ Waiting... 05:00 (Last output: 300s ago)
⚠️ Claude Code appears stuck
```

**Causes:**
- Claude Code initialization is slow
- First prompt takes longer to start

**Solutions:**
```bash
# Run just the first prompt separately with higher timeout
--start-from "Phase 2, Prompt 3" \
--no-output-timeout 600

# Then run the rest normally
--start-from "Phase 2, Prompt 4" \
--no-output-timeout 300
```

---

## Testing the Watchdog

### Manual Test
```bash
cd "/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/claude-bridge-agent"

# Test with 60 second watchdog
python3 integrations/enhanced_batch_cli.py \
    --prompts "/Users/royaltyvixion/Documents/cge software/website/ENHANCED_PROMPTS.md" \
    --project-path "/Users/royaltyvixion/Documents/cge software/website/custom-software-site" \
    --start-from "Phase 2, Prompt 3" \
    --no-output-timeout 60 \
    --timeout 120

# Watch the output - if Claude Code produces no output for 60s, watchdog triggers
```

### Expected Behavior

**Normal:**
```
⏳ Waiting... 00:15 (Last output: 2s ago)
⏳ Waiting... 00:16 (Last output: 3s ago)
⏳ Waiting... 00:17 (Last output: 0s ago)  ← Reset by new output
⏳ Waiting... 00:18 (Last output: 1s ago)
```

**Stuck (watchdog triggers):**
```
⏳ Waiting... 00:55 (Last output: 55s ago)
⏳ Waiting... 00:58 (Last output: 58s ago)
⏳ Waiting... 01:00 (Last output: 60s ago)

⚠️ Claude Code appears stuck (no output for 60s)
Terminating and moving to next prompt...
```

---

## Command Reference

### Full Command with Watchdog
```bash
python3 integrations/enhanced_batch_cli.py \
    --prompts ENHANCED_PROMPTS.md \
    --project-path /path/to/project \
    --start-from "Phase 2, Prompt 3" \
    --git-commit \
    --delay 30 \
    --timeout 600 \
    --monitor-method process \
    --continue-on-error \
    --no-output-timeout 300
```

### Watchdog-Specific Options
```bash
--no-output-timeout 300   # Default: 5 minutes
--no-output-timeout 600   # Lenient: 10 minutes
--no-output-timeout 120   # Aggressive: 2 minutes
--no-output-timeout 60    # Testing: 1 minute
```

---

## Summary

The Watchdog feature:
- ✅ **Detects stuck processes** automatically
- ✅ **Shows time since last output** in real-time
- ✅ **Terminates gracefully** (SIGTERM → SIGKILL)
- ✅ **Continues to next prompt** (doesn't hang entire build)
- ✅ **Configurable timeout** (default: 5 minutes)
- ✅ **Works alongside overall timeout** (10 minutes)

This ensures your automated builds never hang indefinitely on a stuck prompt!

---

## File Changes

**Updated:**
- `enhanced_batch_cli.py` - Added watchdog monitoring
- `build-website.sh` - Added `--no-output-timeout 300`

**New Methods:**
- `_check_watchdog()` - Detect stuck processes
- Enhanced `_monitor_process()` - Track last output time
- Updated progress display - Show "Last output: Xs ago"
