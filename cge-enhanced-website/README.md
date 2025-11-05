# CGE Enhanced Website - Automated Build System

An enhanced version of the CGE website built using the Website Builder Bot - automated sequential building with Claude Code.

## 🚀 Quick Start

### 1. Add Your Build Prompts

Open and edit the prompts file:
```bash
code ENHANCED_PROMPTS.md
```

Paste your prompts following the format shown in the file.

### 2. Start Building

Run the automated builder:
```bash
./build-enhanced-website.sh
```

### 3. Watch It Build

The bot will:
- Feed each prompt to Claude Code sequentially
- Wait for 60s stability after file changes
- Create git commits after each success
- Track progress across sessions
- Auto-recover from stuck processes

## 📁 Project Structure

```
cge-enhanced-website/
├── ENHANCED_PROMPTS.md           # Your build prompts go here
├── BUILD_PROGRESS.md             # Track build progress
├── build-enhanced-website.sh     # Main build script
├── README.md                     # This file
├── .claude_build_progress.json   # Automated progress tracking
└── project/                      # Your Next.js/React app will be built here
```

## 🎯 Features

- ✅ **Sequential Automation** - Processes prompts one at a time
- ✅ **Smart Completion Detection** - File-based monitoring with stability window
- ✅ **Progress Persistence** - Resumes from last completed prompt
- ✅ **Git Integration** - Auto-commits after each successful prompt
- ✅ **Watchdog Protection** - Detects and terminates stuck processes
- ✅ **Error Recovery** - Continues on errors or stops based on config

## 🛠️ Configuration

The builder is pre-configured with optimal settings:

| Setting | Value | Description |
|---------|-------|-------------|
| Auto-approve | ✅ Enabled | No manual confirmations |
| Git commits | ✅ Enabled | Auto-commit after each prompt |
| Delay | 30s | Wait between prompts |
| Timeout | 600s | Max time per prompt (10 min) |
| Watchdog | 300s | Terminate if no output (5 min) |
| Monitor | Files | 60s file stability window |
| Continue on error | ✅ Enabled | Keep going if prompt fails |

## 📝 Prompt Format

Each prompt in `ENHANCED_PROMPTS.md` should follow this structure:

```markdown
## Enhanced Prompt 1: Descriptive Title

Your detailed implementation instructions here...
Include:
- What to build
- File structure
- Code examples
- Testing requirements
- Success criteria

---END PROMPT---
```

## 🔄 Advanced Usage

### Resume from Specific Prompt
```bash
./build-enhanced-website.sh "Phase 2, Prompt 5"
```

### Reset Progress (Start Fresh)
```bash
rm .claude_build_progress.json
./build-enhanced-website.sh
```

### View Progress
```bash
cat BUILD_PROGRESS.md
cat .claude_build_progress.json
```

### Manual Run (with custom settings)
```bash
cd "/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/claude-bridge-agent"

python3 integrations/enhanced_batch_cli.py \
    --prompts "/Users/royaltyvixion/Documents/cge software/cge-enhanced-website/ENHANCED_PROMPTS.md" \
    --project-path "/Users/royaltyvixion/Documents/cge software/cge-enhanced-website/project" \
    --start-from "Phase 1, Prompt 1" \
    --auto-approve \
    --git-commit \
    --delay 30 \
    --timeout 600 \
    --no-output-timeout 300 \
    --monitor-method files \
    --continue-on-error
```

## 🐕 Watchdog Feature

The system automatically detects stuck processes:

- Monitors time since last output from Claude Code
- Shows: `⏳ Waiting... 02:15 (Last output: 45s ago)`
- Terminates if no output for 5 minutes
- Moves to next prompt instead of hanging indefinitely

## 📊 Progress Tracking

Two files track your progress:

1. **BUILD_PROGRESS.md** - Human-readable status
2. **.claude_build_progress.json** - Machine-readable with full history

Both are automatically updated as the build progresses.

## 🎨 What You'll Build

This system is perfect for building:
- Complete Next.js/React websites
- Multi-page applications
- Design systems
- Complex components
- Full-stack features

Just describe what you want in the prompts, and the bot handles the rest!

## 🆘 Troubleshooting

### Builder won't start
- Check Claude Code is installed: `claude --version`
- Verify bridge agent exists at the configured path
- Check Python dependencies: `pip3 install anthropic`

### Prompts not being processed
- Verify prompt format includes `---END PROMPT---` markers
- Check ENHANCED_PROMPTS.md for syntax errors
- Ensure prompts follow the phase/prompt numbering

### Process appears stuck
- Watchdog will auto-terminate after 5 minutes of no output
- You can manually check: `ps aux | grep claude`
- Kill if needed: `killall claude`

### Git commits failing
- Initialize git in project folder: `cd project && git init`
- Check git is configured: `git config --list`

## 📚 Documentation

For complete documentation, see:
- [WEBSITE_BUILDER_BOT_DOCUMENTATION.md](../website/WEBSITE_BUILDER_BOT_DOCUMENTATION.md)
- [Bridge Agent README](../cge%20sdk%20agents/automation-agents/claude-bridge-agent/README.md)

## 🎯 Ready to Build!

1. ✏️ Edit `ENHANCED_PROMPTS.md` with your prompts
2. 🚀 Run `./build-enhanced-website.sh`
3. ☕ Grab coffee and watch it build!

---

**Created:** 2025-10-12
**Status:** Ready for prompts
