# 🚀 Multi-Client Orchestrator - Quick Start

**Get your virtual project manager running in 5 minutes**

## Step 1: Install (2 min)

```bash
cd "/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/multi-client-orchestrator"

pip install -r requirements.txt
```

## Step 2: Configure (1 min)

```bash
cp .env.example .env

# Edit .env - minimum required:
# ANTHROPIC_API_KEY=your_key_here
# FLASK_SECRET_KEY=any_random_string
```

## Step 3: Start Orchestrator (1 min)

```bash
./run.sh

# Or manually:
python orchestrator.py start
```

## Step 4: Add Your First Task (30 sec)

Open a new terminal:

```bash
cd "/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/multi-client-orchestrator"

# Add a task
python orchestrator.py add-task dirt-free-crm code_review "Pre-demo review" high
```

## Step 5: Check Status (30 sec)

```bash
# View all tasks
python orchestrator.py list-tasks

# Check statistics
python orchestrator.py stats

# Client status
python orchestrator.py client-status dirt-free-crm
```

## ✅ You're Running!

The orchestrator is now:
- ✅ Running in the background
- ✅ Processing tasks by priority
- ✅ Routing to specialized agents
- ✅ Tracking time automatically
- ✅ Ready for web dashboard (coming soon)

## 🎯 Common Tasks

### Add Code Review Before Demo
```bash
python orchestrator.py add-task dirt-free-crm code_review \
  "Review Feature X before Friday demo" critical
```

### Schedule Monthly Report
```bash
python orchestrator.py add-task dirt-free-crm monthly_report \
  "Generate January value report" high
```

### Add Bug Fix
```bash
python orchestrator.py add-task dirt-free-crm bug_fix \
  "Fix invoice calculation error" critical
```

### List All Pending Tasks
```bash
python orchestrator.py list-tasks
```

## 📊 How It Works

1. **You add a task** → Goes into priority queue
2. **Orchestrator picks it up** → Based on priority
3. **Routes to agent** → Code review agent, monthly value agent, or Claude AI
4. **Tracks time** → Automatic
5. **Completes task** → Results saved
6. **Moves to next** → Continuous processing

## 🔧 Next Steps

1. **Add more clients** - Edit `config.yaml`
2. **Customize priorities** - Adjust `task_priorities` in config
3. **Setup recurring tasks** - Add to `recurring_tasks` in config
4. **Enable integrations** - Toggl, Slack, Stripe, etc.
5. **Access dashboard** - Coming soon at http://localhost:5000

## 💡 Tips

- **Use critical sparingly** - Only for truly urgent tasks
- **Be descriptive** - Good descriptions help routing
- **Check stats daily** - `python orchestrator.py stats`
- **Monitor logs** - `tail -f logs/orchestrator.log`

## 🐛 Troubleshooting

**Won't start?**
```bash
# Check logs
cat logs/orchestrator.log

# Verify .env
cat .env | grep ANTHROPIC_API_KEY
```

**No tasks processing?**
```bash
# List tasks
python orchestrator.py list-tasks

# Check if orchestrator is running
ps aux | grep orchestrator
```

**Agent not found?**
```bash
# Verify agent paths
ls -la ../code-review-agent/agent.py
ls -la ../monthly-value-agent/agent.py
```

## 📚 Full Documentation

See [README.md](README.md) for complete documentation.

---

**You're now running a virtual project manager! 🎉**
