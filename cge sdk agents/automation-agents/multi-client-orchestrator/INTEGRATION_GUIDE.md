# 🔌 Integration Layer Guide

**Complete guide to the Multi-Client Orchestrator integration system**

## 📍 Location

This integration layer is built **inside the Multi-Client Orchestrator**:

```
/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/multi-client-orchestrator/
```

## 🎯 Components

### 1. Message Queue System (`lib/message_queue.py`)

**Purpose**: Central message routing with error handling and retries

**Features**:
- ✅ Receives requests from various sources (CLI, API, webhooks)
- ✅ Routes to appropriate agents (code-review, monthly-value, custom)
- ✅ Manages agent responses
- ✅ Automatic error handling and retries (3 attempts with exponential backoff)
- ✅ Real-time progress tracking via WebSocket

**Technology**: Celery + Redis

**Usage**:
```python
from lib.message_queue import MessageQueue

queue = MessageQueue(config)

# Send task to queue
task_id = await queue.send_message(
    agent='code_review',
    task_data={'project_path': '/path/to/project'},
    priority=5
)

# Get task status
status = await queue.get_task_status(task_id)

# Wait for result
result = await queue.wait_for_result(task_id, timeout=3600)
```

---

### 2. Unified CLI Tool (`cli.py`)

**Purpose**: Single interface to invoke any agent

**Features**:
- ✅ Invoke any agent (code-review, monthly-value, orchestrator)
- ✅ Pass context between agents
- ✅ Show real-time progress with beautiful progress bars
- ✅ Generate combined reports from multiple agents
- ✅ Run workflows (pre-demo, monthly, full-audit)

**Technology**: Rich (for beautiful CLI output)

**Usage**:
```bash
# Invoke specific agent
python cli.py invoke code-review dirt-free-crm

# Run workflow
python cli.py workflow pre-demo dirt-free-crm

# Show status
python cli.py status
```

---

### 3. Web Dashboard (`lib/dashboard_server.py`)

**Purpose**: Real-time web interface

**Features**:
- ✅ All active agents visualization
- ✅ Current tasks list
- ✅ Performance metrics graphs
- ✅ Client project status
- ✅ Real-time updates via WebSocket
- ✅ Health monitoring

**Technology**: Flask + SocketIO + React (frontend)

**Access**: http://localhost:5000

**API Endpoints**:
```
GET  /api/dashboard      - Main dashboard data
GET  /api/tasks          - All tasks (filter by client/status)
GET  /api/clients        - All clients
GET  /api/agents         - Agent status
GET  /api/monitoring/health   - Health status
GET  /api/monitoring/metrics  - Performance metrics
GET  /api/monitoring/trends   - Performance trends
```

---

### 4. Monitoring System (`lib/monitoring.py`)

**Purpose**: Track agent performance and system health

**Features**:
- ✅ Agent performance metrics (calls, successes, failures)
- ✅ Error rates tracking
- ✅ Task completion times
- ✅ Resource usage (CPU, memory, disk)
- ✅ Performance trends over time
- ✅ Health status (healthy, warning, critical)

**Metrics Tracked**:
```python
{
    'agent_metrics': {
        'calls': 150,
        'successes': 145,
        'failures': 5,
        'error_rate': 3.33,
        'avg_duration_seconds': 45.2,
        'status': 'healthy'
    },
    'system_metrics': {
        'cpu': {'percent': 25.4, 'count': 8},
        'memory': {'percent': 60.2, 'total_gb': 16},
        'disk': {'percent': 45.8, 'free_gb': 150}
    }
}
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd "/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/multi-client-orchestrator"

pip install -r requirements.txt
```

### 2. Start Redis (Required for Message Queue)

```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Or with Docker
docker run -d -p 6379:6379 redis:alpine

# Verify Redis is running
redis-cli ping  # Should return: PONG
```

### 3. Start Celery Workers (for Message Queue)

```bash
# In terminal 1: Start Celery worker
celery -A lib.message_queue worker --loglevel=info

# In terminal 2: Start Celery beat (for scheduled tasks)
celery -A lib.message_queue beat --loglevel=info
```

### 4. Start Orchestrator

```bash
# In terminal 3: Start orchestrator
python orchestrator.py start
```

### 5. Use the System

```bash
# In terminal 4: Use CLI
python cli.py status
python cli.py invoke code-review dirt-free-crm

# Access web dashboard
open http://localhost:5000
```

---

## 🔄 Complete Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     REQUEST SOURCES                         │
│  • CLI Commands                                            │
│  • Web Dashboard                                           │
│  • API Webhooks                                            │
│  • Scheduled Tasks                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              MESSAGE QUEUE (Celery + Redis)                 │
│  • Receives all requests                                   │
│  • Queues by priority                                      │
│  • Tracks progress                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   AGENT ROUTER                              │
│  • Determines which agent to use                           │
│  • Loads client context                                    │
│  • Routes to appropriate agent                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│   Code    │  │  Monthly  │  │  Claude   │
│   Review  │  │   Value   │  │    AI     │
│   Agent   │  │   Agent   │  │  General  │
└─────┬─────┘  └─────┬─────┘  └─────┬─────┘
      │              │              │
      └──────────────┼──────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  MONITORING SYSTEM                          │
│  • Records metrics                                         │
│  • Tracks errors                                           │
│  • Monitors resources                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            RESULTS & NOTIFICATIONS                          │
│  • Web Dashboard (real-time)                               │
│  • CLI Output                                              │
│  • Slack/Email                                             │
│  • Database/Logs                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Real-World Examples

### Example 1: Pre-Demo Code Review via CLI

```bash
# User runs CLI command
python cli.py workflow pre-demo dirt-free-crm

# What happens:
# 1. CLI sends request to message queue
# 2. Queue assigns priority (high for pre-demo)
# 3. Agent router loads Dirt Free context
# 4. Routes to Code Review Agent
# 5. Agent runs comprehensive checks
# 6. Progress updates sent to CLI in real-time
# 7. Results displayed with beautiful formatting
# 8. Metrics recorded in monitoring system
```

### Example 2: Scheduled Monthly Report

```bash
# Configured in config.yaml:
recurring_tasks:
  - name: "Monthly Value Report"
    schedule: "0 9 1 * *"
    agent: monthly_value

# What happens on 1st of month at 9am:
# 1. Scheduler triggers task
# 2. Sends to message queue
# 3. Queue routes to Monthly Value Agent
# 4. Agent analyzes all data
# 5. Generates PDF report
# 6. Creates GitHub PR with optimizations
# 7. Sends notification
# 8. Updates dashboard
```

### Example 3: Monitoring Agent Health

```bash
# Via CLI
python cli.py status

# Via API
curl http://localhost:5000/api/monitoring/health

# Via Dashboard
# Navigate to http://localhost:5000 and see:
# - Agent status (healthy/warning/critical)
# - Error rates
# - CPU/Memory usage
# - Recent failures with details
```

---

## 🎨 Customization

### Adding Custom Agent

1. **Create your agent** (e.g., `deployment-agent.py`)

2. **Register in message queue** (`lib/message_queue.py`):
```python
@self.celery.task(bind=True, name='orchestrator.deployment')
def deployment_task(self, task_data: Dict[str, Any]):
    # Your agent logic
    pass
```

3. **Add to config.yaml**:
```yaml
agent_specializations:
  deployment:
    path: "path/to/deployment-agent.py"
    capabilities:
      - "Deploy to production"
      - "Rollback deployments"
    triggers:
      - manual
      - on_release
```

4. **Use it**:
```bash
python cli.py invoke deployment dirt-free-crm
```

---

## 📊 Monitoring Dashboard

### Real-Time Metrics

Access at `http://localhost:5000/api/monitoring/metrics`:

```json
{
  "agents": {
    "code_review": {
      "calls": 150,
      "successes": 145,
      "failures": 5,
      "error_rate": 3.33,
      "avg_duration_seconds": 45.2,
      "status": "healthy"
    },
    "monthly_value": {
      "calls": 30,
      "successes": 30,
      "failures": 0,
      "error_rate": 0,
      "avg_duration_seconds": 120.5,
      "status": "healthy"
    }
  },
  "system": {
    "cpu": {"percent": 25.4},
    "memory": {"percent": 60.2},
    "disk": {"percent": 45.8}
  }
}
```

---

## 🔧 Troubleshooting

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping

# Start Redis
brew services start redis

# Check logs
tail -f /usr/local/var/log/redis.log
```

### Celery Worker Not Processing

```bash
# Check Celery worker status
celery -A lib.message_queue inspect active

# Restart worker
celery -A lib.message_queue worker --loglevel=info
```

### Dashboard Not Loading

```bash
# Check if Flask is running
curl http://localhost:5000

# Check logs
tail -f logs/orchestrator.log
```

---

## 📚 API Reference

See full API documentation at: [API.md](API.md) (coming soon)

---

**Your complete integration layer is ready! 🚀**
