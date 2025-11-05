# 🎯 Multi-Client Orchestrator

**Your Virtual Project Manager for ALL Crowned Gladiator Clients**

The Multi-Client Orchestrator is a centralized system that manages tasks across all your clients, routes work to specialized agents, tracks time, and provides a dashboard for oversight.

## 🚀 Features

### ✅ Core Capabilities
- **Multi-Client Management**: Handle unlimited clients simultaneously
- **Intelligent Task Routing**: Auto-route tasks to appropriate specialized agents
- **Time Tracking**: Automatic time tracking for all tasks
- **Priority-Based Scheduling**: Tasks processed by priority and client tier
- **Context Switching**: Seamlessly switch between client contexts
- **Web Dashboard**: Real-time view of all tasks and progress
- **CLI Interface**: Command-line tools for task management

### 🤖 Agent Integration
- **Code Review Agent**: Auto-trigger before demos
- **Monthly Value Agent**: Schedule monthly reports
- **Claude AI**: Handle general tasks with AI
- **Custom Agents**: Easy to add your own specialized agents

### 📊 Task Management
- Create, track, and complete tasks
- Priority levels (critical, high, medium, low)
- Task types (bug_fix, feature, code_review, etc.)
- Automatic scheduling of recurring tasks
- Progress tracking and reporting

### ⏱️ Time & Billing
- Automatic time tracking per task
- Time reports by client
- Integration with Toggl (optional)
- Billing integration with Stripe (optional)

## 📦 Installation

```bash
cd "/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/multi-client-orchestrator"

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Initialize database
python -m lib.database init

# Start the orchestrator
python orchestrator.py start
```

## 🎯 Quick Start

### Add a Task

```bash
# Add a code review task for Dirt Free CRM
python orchestrator.py add-task dirt-free-crm code_review "Pre-demo review" high

# Add a bug fix task
python orchestrator.py add-task dirt-free-crm bug_fix "Fix invoice calculation" critical
```

### List Tasks

```bash
# List all tasks
python orchestrator.py list-tasks

# List tasks for specific client
python orchestrator.py list-tasks dirt-free-crm
```

### Check Statistics

```bash
python orchestrator.py stats
```

### Start as Service

```bash
# Run in foreground
python orchestrator.py start

# Or run in background with nohup
nohup python orchestrator.py start > logs/orchestrator.log 2>&1 &
```

## 📋 Configuration

### Adding Clients

Edit `config.yaml`:

```yaml
clients:
  new-client:
    name: "New Client Name"
    project_path: "path/to/project"
    status: active
    priority: high
    subscription_tier: premium
    monthly_retainer: 750
    contact_email: client@example.com
    github_repo: owner/repo
    tech_stack:
      - Next.js
      - TypeScript
    features:
      - feature1
      - feature2
    context:
      business_domain: "Description of business"
      primary_users: "Who uses the system"
      key_workflows:
        - "Main workflow 1"
        - "Main workflow 2"
```

### Scheduling Recurring Tasks

```yaml
recurring_tasks:
  - name: "Weekly Code Review"
    type: code_review
    schedule: "0 10 * * 5"  # Cron format
    agent: code_review
    for_all_clients: true
```

## 🔄 Task Flow

```
1. Task Created
   ↓
2. Added to Priority Queue
   ↓
3. Context Switched to Client
   ↓
4. Routed to Appropriate Agent
   ↓
5. Time Tracking Started
   ↓
6. Agent Processes Task
   ↓
7. Time Tracking Stopped
   ↓
8. Results Recorded
   ↓
9. Next Task (repeat)
```

## 🎨 Task Types

- `bug_fix` - Bug fixes
- `feature_development` - New features
- `code_review` - Pre-demo reviews
- `optimization` - Performance improvements
- `security_audit` - Security checks
- `documentation` - Documentation tasks
- `client_meeting` - Meeting prep/followup
- `monthly_report` - Monthly value reports

## 📊 Dashboard

Access the web dashboard at `http://localhost:5000`

Features:
- Real-time task status
- Client overview
- Time tracking
- Progress charts
- Task queue visualization

## 🔌 Integrations

### Toggl (Time Tracking)
```bash
TOGGL_API_KEY=your_key
TOGGL_WORKSPACE_ID=your_workspace
```

### Stripe (Billing)
```bash
STRIPE_API_KEY=your_key
STRIPE_WEBHOOK_SECRET=your_secret
```

### Slack (Notifications)
```bash
SLACK_WEBHOOK_URL=your_webhook
SLACK_BOT_TOKEN=your_token
```

### GitHub
```bash
GITHUB_TOKEN=your_token
```

## 📈 Usage Patterns

### Daily Workflow

```bash
# Morning: Check pending tasks
python orchestrator.py list-tasks

# Add any new tasks
python orchestrator.py add-task client-name type "description" priority

# Start orchestrator
python orchestrator.py start

# Monitor dashboard
open http://localhost:5000

# Evening: Check stats
python orchestrator.py stats
```

### Pre-Demo Workflow

```bash
# Add pre-demo review task
python orchestrator.py add-task dirt-free-crm code_review "Pre-demo review for Feature X" critical

# Orchestrator will auto-route to code review agent
# Review results in dashboard
# Fix any issues
# Mark demo as ready
```

### Monthly Reporting

Automatic! Orchestrator runs monthly value agent on 1st of each month for all clients.

## 🛠️ Advanced Usage

### Custom Agent Integration

Add to `config.yaml`:

```yaml
agent_specializations:
  custom_agent:
    path: "path/to/your/agent.py"
    capabilities:
      - "What it does"
    triggers:
      - custom_task_type
      - manual
```

### Task Webhooks

Trigger tasks via webhook:

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "client": "dirt-free-crm",
    "type": "code_review",
    "description": "Review PR #123",
    "priority": "high"
  }'
```

## 📊 Reports

Generate reports:

```bash
# Time report for client
python orchestrator.py report time dirt-free-crm

# Task completion report
python orchestrator.py report tasks --month 2024-01

# Client health report
python orchestrator.py report health
```

## 🔐 Security

- API keys stored in `.env` (never committed)
- Database encrypted at rest
- Webhook signature validation
- CORS configuration
- Rate limiting

## 🐛 Troubleshooting

### Orchestrator Won't Start

```bash
# Check logs
tail -f logs/orchestrator.log

# Verify configuration
python orchestrator.py validate-config

# Test database connection
python -c "from lib.task_manager import TaskManager; print('OK')"
```

### Tasks Not Processing

```bash
# Check task queue
python orchestrator.py list-tasks

# Verify agents are accessible
ls -la ../code-review-agent/agent.py
ls -la ../monthly-value-agent/agent.py

# Check logs for errors
tail -f logs/orchestrator.log
```

## 📚 Architecture

```
orchestrator.py              # Main entry point
├── TaskManager             # Task queue & state
├── AgentRouter             # Route to agents
├── ContextManager          # Client context switching
├── TimeTracker             # Time tracking
├── TaskScheduler           # Cron scheduling
├── ClientManager           # Client management
└── DashboardServer         # Web dashboard
```

## 🚀 Scaling

The orchestrator is designed to scale:

- **10+ clients**: No problem
- **100+ tasks/day**: Handles with priority queue
- **Multiple developers**: Team collaboration ready
- **Custom agents**: Plugin architecture

## 💡 Best Practices

1. **Set Realistic Priorities**: Use critical sparingly
2. **Add Context**: Include details in task descriptions
3. **Monitor Dashboard**: Check progress regularly
4. **Review Reports**: Weekly/monthly reviews
5. **Update Configs**: Keep client info current

## 🎓 Examples

### Example: New Feature Request

```bash
# Client requests new feature
python orchestrator.py add-task dirt-free-crm feature_development \
  "Add customer loyalty program" high

# Orchestrator will:
# 1. Add to queue with high priority
# 2. Route to architect agent for planning
# 3. Track time
# 4. Generate implementation plan
# 5. Create GitHub issues
```

### Example: Bug Report

```bash
# Bug reported
python orchestrator.py add-task dirt-free-crm bug_fix \
  "Invoice totals incorrect for multi-service jobs" critical

# Orchestrator will:
# 1. Immediately prioritize (critical)
# 2. Switch to Dirt Free context
# 3. Run code review agent to find issue
# 4. Track time spent
# 5. Update task with fix details
```

## 📄 License

Proprietary - Crowned Gladiator Enterprises

---

**Your virtual project manager, powered by Claude AI** 🤖

*Built to scale your agency*
