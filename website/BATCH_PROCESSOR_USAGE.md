# Enhanced Batch Processor - Usage Guide

## Overview
The Enhanced Batch Processor properly waits for Claude Code to complete each prompt before moving to the next one, ensuring reliable sequential execution.

---

## Quick Start

### Simple Usage (Recommended)
```bash
cd "/Users/royaltyvixion/Documents/cge software/website"
./build-website.sh
```

This will:
- Start from Phase 2, Prompt 3 (configurable)
- Wait for each prompt to fully complete
- Create git commits after success
- Wait 30 seconds between prompts
- Continue even if a prompt fails

---

## Advanced Usage

### Start from Different Prompt
```bash
./build-website.sh "Phase 2, Prompt 5"
```

### Manual Invocation with All Options
```bash
cd "/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/claude-bridge-agent"

python3 integrations/enhanced_batch_cli.py \
    --prompts "/Users/royaltyvixion/Documents/cge software/website/ENHANCED_PROMPTS.md" \
    --project-path "/Users/royaltyvixion/Documents/cge software/website/custom-software-site" \
    --start-from "Phase 2, Prompt 3" \
    --git-commit \
    --delay 30 \
    --timeout 600 \
    --monitor-method process \
    --continue-on-error
```

---

## Configuration Options

### Required Arguments
- `--prompts` - Path to ENHANCED_PROMPTS.md file
- `--project-path` - Path to the website project directory

### Optional Arguments

#### `--start-from "Phase X, Prompt Y"`
Start processing from a specific prompt instead of the beginning.

**Examples:**
```bash
--start-from "Phase 2, Prompt 3"
--start-from "Prompt 5"
```

#### `--git-commit`
Automatically create git commits after each successful prompt.

**Commit message format:**
```
feat: Phase 2 - Prompt 3

Pricing Model Section with Icon Integration

🤖 Generated with Claude Code via Bridge Agent
```

#### `--delay <seconds>`
Wait time between prompts (default: 30 seconds).

This gives you time to review the results before the next prompt starts.

**Examples:**
```bash
--delay 60     # Wait 1 minute
--delay 0      # No delay (not recommended)
```

#### `--timeout <seconds>`
Maximum time to wait for each prompt to complete (default: 600 = 10 minutes).

If a prompt takes longer than this, it will be terminated.

**Examples:**
```bash
--timeout 900     # 15 minutes for complex prompts
--timeout 300     # 5 minutes for simple prompts
```

#### `--monitor-method <method>`
How to detect when Claude Code has finished.

**Options:**
- `process` (default) - Monitor the Claude Code process directly
- `files` - Watch for file changes and stability
- `both` - Use both methods (most reliable)

**Examples:**
```bash
--monitor-method process   # Fastest, most reliable
--monitor-method files     # Backup if process monitoring fails
```

#### `--continue-on-error`
Continue processing remaining prompts even if one fails.

Without this flag, processing stops on the first failure.

#### `--auto-approve`
Skip the confirmation prompt at the start.

**⚠️ Warning:** Only use this when you're confident in your prompts!

#### `--test`
Run a test to verify completion monitoring works correctly.

```bash
python3 integrations/enhanced_batch_cli.py \
    --project-path "/path/to/project" \
    --test
```

---

## How Completion Monitoring Works

### Process Monitoring (Default)
1. Starts Claude Code as a subprocess
2. Monitors the process status continuously
3. Reads output in real-time
4. Detects when process exits (success or failure)
5. Reports completion with exit code

**Advantages:**
- Fast and accurate
- Shows real-time progress
- Detects failures immediately

### File Monitoring (Backup)
1. Starts Claude Code as a subprocess
2. Watches the `src/components` directory for changes
3. Considers complete when no changes for 15 seconds
4. Terminates the process gracefully

**Advantages:**
- Works even if process monitoring fails
- Useful for debugging

---

## Example Output

```bash
================================================================================
🚀 CGE Website Builder - Enhanced Batch Processor
================================================================================
📂 Project: /Users/royaltyvixion/Documents/cge software/website/custom-software-site
📄 Prompts: /Users/royaltyvixion/Documents/cge software/website/ENHANCED_PROMPTS.md
⏱️  Timeout: 600s per prompt
⏰ Delay: 30s between prompts
🔍 Monitor: process
================================================================================

📋 Found 16 prompts total
▶️  Starting from: Phase 2, Prompt 3
📊 Will process: 7 prompts

   1. Phase 2, Prompt 3: Pricing Model Section with Icon Integration
   2. Phase 2, Prompt 4: Investment Tiers with Featured Card Pattern
   3. Phase 2, Prompt 5: Responsive Comparison Table
   4. Phase 2, Prompt 6: FAQ Section with Accordion
   5. Phase 2, Prompt 7: CTA Section with Strong Visual Impact
   ... and 2 more

Continue? (y/n): y

================================================================================
📝 Processing 1/7: Phase 2, Prompt 3
   Pricing Model Section with Icon Integration
================================================================================

11:23:45 - INFO - Sending to Claude Code...
11:23:45 - INFO - Command: claude /path/to/project -f .claude_prompt_3.txt
⏳ Waiting for Claude Code to complete (timeout: 600s)...

[Claude Code output appears here in real-time...]

✅ Process completed in 127s

✅ Phase 2, Prompt 3 completed successfully
11:25:52 - INFO - Creating git commit...
✅ Git commit created: "Phase 2, Prompt 3"

⏳ Waiting 30 seconds before next prompt...
   30s remaining...
   [countdown continues]

================================================================================
📝 Processing 2/7: Phase 2, Prompt 4
   Investment Tiers with Featured Card Pattern
================================================================================

[Process repeats...]

================================================================================
📊 Batch Processing Complete
================================================================================
   ✅ Completed: 7
   ❌ Failed: 0
   📈 Total Processed: 7/7
   ⏱️  Total Time: 15m 42s
================================================================================
```

---

## Troubleshooting

### Problem: Script can't find Claude Code
**Solution:** Make sure Claude Code is installed and in your PATH:
```bash
which claude
# Should output: /usr/local/bin/claude or similar
```

### Problem: Timeout too short
**Solution:** Increase timeout for complex prompts:
```bash
--timeout 900  # 15 minutes
```

### Problem: Process monitoring not working
**Solution:** Try file monitoring method:
```bash
--monitor-method files
```

### Problem: Prompts executing too fast
**Solution:** Increase delay between prompts:
```bash
--delay 60  # 1 minute
```

### Problem: Git commits failing
**Solution:** Check git is initialized and you have changes:
```bash
cd /path/to/project
git status
```

### Problem: Want to stop mid-process
**Solution:** Press `Ctrl+C` to safely interrupt:
```
^C
⚠️  Interrupted by user. Exiting...
```

---

## Progress Tracking

Progress is automatically logged to `BUILD_PROGRESS.md`:

```markdown
- [2025-10-01 11:25:52] COMPLETED: Phase 2, Prompt 3 - Pricing Model Section
- [2025-10-01 11:28:15] COMPLETED: Phase 2, Prompt 4 - Investment Tiers
- [2025-10-01 11:30:42] FAILED: Phase 2, Prompt 5 - Comparison Table
```

---

## Testing the Setup

Run the built-in test:
```bash
cd "/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/claude-bridge-agent"

python3 integrations/enhanced_batch_cli.py \
    --project-path "/Users/royaltyvixion/Documents/cge software/website/custom-software-site" \
    --prompts "/Users/royaltyvixion/Documents/cge software/website/ENHANCED_PROMPTS.md" \
    --test
```

This creates a simple test component, monitors completion, and cleans up.

---

## Best Practices

1. **Always review the prompt list** before confirming execution
2. **Start with a single prompt** to verify everything works
3. **Use git commits** to track progress and enable easy rollback
4. **Monitor the first prompt** to ensure timing is correct
5. **Keep delay at 30s minimum** to review each result
6. **Use continue-on-error** for long batch runs
7. **Check BUILD_PROGRESS.md** to track overall progress

---

## Time Estimates

Based on average prompt completion times:

**Phase 2 (7 prompts remaining):**
- Average: 3-5 minutes per prompt
- Total: ~25-35 minutes
- With delays: ~30-40 minutes

**Full website (all phases):**
- Estimated: 4-6 hours
- With reviews: 6-8 hours

---

## Support

For issues or questions:
1. Check this guide first
2. Review BUILD_PROGRESS.md for errors
3. Try running with `--test` flag
4. Check Claude Code is working: `claude --version`
