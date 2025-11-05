# 🔌 Integrations Guide

Complete guide to integrating Claude Bridge Agent with your workflow.

## 📦 Available Integrations

### 1. Chrome Extension

**Send Claude.ai conversations directly to Bridge**

#### Installation

```bash
# Open Chrome
chrome://extensions/

# Enable Developer Mode
# Click "Load unpacked"
# Select: claude-bridge-agent/chrome-extension/
```

#### Usage

1. Have a conversation with Claude.ai
2. Click "🌉 Send to Bridge" button (bottom-right)
3. Extension sends to your local Bridge Agent
4. Review and execute in Bridge UI

**Settings**:
- Bridge API URL
- Default project
- Auto-open Bridge option

**Privacy**: All data stays local - nothing sent to external servers.

---

### 2. Auto-Approval Engine

**Intelligently auto-approve safe prompts**

#### How It Works

```python
from lib.auto_approval import AutoApprovalEngine

engine = AutoApprovalEngine(config)

can_approve, reason, warnings = engine.should_auto_approve(
    original="Add database field",
    enhanced="Add new field to users table...",
    analysis={'complexity': 'low', 'file_paths': ['schema.sql']}
)
```

#### Safety Checks

✅ **Auto-Approve** if:
- Matches safe patterns (add field, create type, update docs)
- Low complexity (<3 files)
- No dangerous operations

❌ **Require Review** if:
- Contains danger patterns (delete, payment, auth, security)
- High complexity (>10 files)
- Destructive operations detected

#### Risk Scoring

- **0-20**: Very low risk → Auto-approve
- **21-40**: Low risk → Auto-approve with warnings
- **41-60**: Medium risk → Suggest review
- **61-80**: High risk → Require review
- **81-100**: Very high risk → Block

#### Configuration

```yaml
# config.yaml
review:
  auto_approve_patterns:
    - "add.*field.*database"
    - "create.*type.*interface"
    - "update.*documentation"

  require_review_patterns:
    - "delete"
    - "payment"
    - "authentication"
    - "security"

  complexity_thresholds:
    low_max_files: 3
    medium_max_files: 10
```

---

### 3. Execution Monitoring

**Real-time monitoring with automatic rollback**

#### Features

- **File Change Detection**: Tracks modified files during execution
- **Error Detection**: Parses terminal output for errors
- **Git Checkpoints**: Creates checkpoint before execution
- **Auto Rollback**: Reverts changes on failure
- **Screenshot Capture**: Captures localhost screenshots

#### Usage

```python
from lib.execution_monitor import ExecutionMonitor

monitor = ExecutionMonitor(config)

# Start monitoring
await monitor.start_monitoring(
    project_path="/path/to/project",
    session_id="session_abc123",
    progress_callback=lambda msg: print(msg)
)

# During execution, monitor tracks:
# - File changes
# - Errors in output
# - Warnings

# Get summary
summary = monitor.get_execution_summary()
# {
#   'duration_seconds': 45.2,
#   'files_changed': ['src/app.tsx', 'types/user.ts'],
#   'errors_count': 0,
#   'warnings_count': 2,
#   'has_git_checkpoint': True
# }

# On failure, rollback
if not success:
    await monitor.rollback()
```

#### Safety Features

- **Git Checkpoint**: Automatic checkpoint before execution
- **Max Execution Time**: Configurable timeout
- **Resource Monitoring**: Track CPU/memory usage
- **Rollback Capability**: Revert to checkpoint on failure

---

### 4. Batch Processing

**Process multiple features from planning documents**

#### Usage

```python
from integrations.batch_processor import BatchProcessor

processor = BatchProcessor(bridge_agent, config)

# Process planning document
results = await processor.process_planning_document(
    document_path="planning.md",
    project_path="/path/to/project"
)

# Results:
# {
#   'total_features': 10,
#   'safe_for_execution': [...],  # Auto-approved features
#   'requires_review': [...],      # Needs manual review
#   'failed': [],
#   'processed': [...]
# }
```

#### Document Format

**Markdown with sections**:
```markdown
## Feature: User Authentication

Add email/password authentication with the following:
- Login page
- Signup page
- Password reset flow

## Feature: Dashboard Analytics

Create analytics dashboard showing:
- User activity charts
- Revenue metrics
- Growth trends
```

**Checkbox list**:
```markdown
- [ ] Add user authentication
- [ ] Create dashboard analytics
- [ ] Implement export feature
```

**Numbered list**:
```markdown
1. Add user authentication
2. Create dashboard analytics
3. Implement export feature
```

#### Priority Detection

Auto-detects priority based on keywords:

- **High (10)**: critical, urgent, security, blocker
- **Medium-High (7)**: important, needed, required
- **Medium (5)**: Default
- **Low (3)**: nice to have, optional, future

---

### 5. Post-Execution Actions

**Automated actions after successful execution**

#### Available Actions

1. **Code Review**: Run code review agent
2. **Summary Generation**: Create execution summary
3. **Git Commit**: Auto-commit with description
4. **Documentation**: Update CHANGELOG.md
5. **Notifications**: Slack/email alerts

#### Configuration

```yaml
# config.yaml
post_execution:
  run_code_review: true
  auto_commit: false        # Set true to auto-commit
  update_docs: true
  send_notification: false

notifications:
  webhook_url: null         # Slack webhook URL
```

#### Usage

```python
from integrations.post_execution import PostExecutionHandler

handler = PostExecutionHandler(config)

results = await handler.execute_all(
    project_path="/path/to/project",
    session_id="session_abc123",
    execution_result={
        'files_changed': ['src/app.tsx'],
        'duration_seconds': 45.2,
        'success': True
    }
)

# Results:
# {
#   'code_review': {'success': True, 'output': '...'},
#   'summary': {'summary_file': '.bridge/summary_20250101_123456.json'},
#   'git_commit': {'success': True, 'commit_message': '...'},
#   'documentation': {'changelog': 'CHANGELOG.md'},
#   'notification': {'success': True}
# }
```

#### Generated Commit Message

```
feat: Implemented via Bridge Agent (abc12345)

Changes:
- src/app.tsx
- types/user.ts
- components/LoginForm.tsx

🌉 Generated via Claude Bridge Agent
Session: session_abc123
```

---

### 6. File Drop Zone

**Drop planning documents to process**

Coming soon - web UI will support drag & drop for `.md` files.

---

### 7. VS Code Extension

**Coming Soon**

Command palette integration:
- `Claude Bridge: Send to Bridge`
- `Claude Bridge: Batch Process`

---

### 8. Alfred/Raycast Workflow

**Coming Soon**

Quick actions:
- Send clipboard to Bridge
- Process current file
- Open Bridge UI

---

## 🔄 Multi-Client Orchestrator Integration

The Bridge Agent can integrate with the existing orchestrator:

### Add as Agent Type

```yaml
# orchestrator config.yaml
agent_specializations:
  claude_bridge:
    path: "automation-agents/claude-bridge-agent/main.py"
    capabilities:
      - "Enhance planning prompts"
      - "Auto-approve safe changes"
      - "Batch process features"
    triggers:
      - manual
      - planning_task
```

### Route Planning Tasks

```python
# In orchestrator
if task_type == 'planning':
    route_to_bridge_agent(task)
```

### Track Metrics

- Enhancement quality score
- Auto-approval rate
- Execution success rate
- Time saved vs manual

---

## 📊 Monitoring & Analytics

### Metrics Tracked

```python
# Enhancement metrics
{
  'total_enhancements': 150,
  'auto_approved': 90,
  'manual_reviewed': 60,
  'approval_rate': 60%
}

# Execution metrics
{
  'total_executions': 90,
  'successful': 85,
  'failed': 5,
  'success_rate': 94.4%
}

# Performance
{
  'avg_enhancement_time': 8.2,  # seconds
  'avg_execution_time': 45.3,   # seconds
  'time_saved_vs_manual': '2.5 hours/week'
}
```

### View Metrics

```bash
# Via API
curl http://localhost:8080/api/metrics

# Via CLI
python -m integrations.analytics
```

---

## 🔐 Security Best Practices

### Safe Patterns

✅ Safe to auto-approve:
- Adding database fields
- Creating types/interfaces
- Updating documentation
- Adding comments
- Formatting code

### Danger Patterns

❌ Always require review:
- Delete operations
- Payment/billing code
- Authentication changes
- Security-related code
- Schema migrations
- API key handling

### Execution Safety

- **Git Checkpoints**: Always created before execution
- **Rollback**: Automatic on failure
- **Timeout**: Max 30 minutes (configurable)
- **Resource Limits**: Monitor CPU/memory
- **Isolated Execution**: Each session isolated

---

## 🚀 Quick Start Examples

### Example 1: Simple Workflow

```bash
# 1. Start Bridge
python main.py

# 2. Use Chrome extension on Claude.ai
# Click "Send to Bridge"

# 3. Review in Bridge UI
# http://localhost:8080

# 4. Approve & Execute
# Press Cmd+Enter
```

### Example 2: Batch Processing

```bash
# Create planning.md
cat > planning.md << 'EOF'
## Add User Profile
Create user profile page with avatar upload

## Dashboard Analytics
Add analytics charts to dashboard
EOF

# Process batch
python -c "
from integrations.batch_processor import BatchProcessor
import asyncio

async def main():
    processor = BatchProcessor(bridge, config)
    results = await processor.process_planning_document(
        'planning.md',
        '/path/to/project'
    )
    print(f'Processed {results[\"total_features\"]} features')

asyncio.run(main())
"
```

### Example 3: Auto-Approval

```python
# Configure safe patterns
# config.yaml
review:
  auto_approve_patterns:
    - "add.*field"
    - "create.*component"

# Submit prompt
# If matches pattern → Auto-executes
# If not → Requires review
```

---

## 🔧 Troubleshooting

### Extension not working

1. Check Bridge is running: `curl http://localhost:8080/health`
2. Verify extension settings
3. Refresh Claude.ai page

### Auto-approval too aggressive

Adjust patterns in `config.yaml`:
```yaml
review:
  auto_approve_patterns: []  # Disable auto-approve
```

### Batch processing errors

Ensure planning document has clear structure:
- Use `##` headers for features
- Or use `- [ ]` checkboxes
- Or use numbered lists

---

**Your Bridge Agent now has comprehensive integrations!** 🎉
