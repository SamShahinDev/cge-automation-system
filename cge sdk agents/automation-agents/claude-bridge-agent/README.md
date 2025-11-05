# Claude Bridge Agent

**Hybrid AI Planning to Implementation Bridge**

A sophisticated bridge between Claude.ai conversational planning and Claude Code automated implementation, featuring intelligent prompt enhancement, smart context injection, auto-approval safety rules, and real-time execution monitoring.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Claude Bridge Agent                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Chrome     │      │   Web UI     │      │   FastAPI    │  │
│  │  Extension   │─────▶│  (React-ish) │◀─────│   Server     │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                      │                      │          │
│         │                      │                      ▼          │
│         │                      │              ┌──────────────┐  │
│         │                      └─────────────▶│  WebSocket   │  │
│         │                                     │  Real-time   │  │
│         │                                     └──────────────┘  │
│         │                                             │          │
│         ▼                                             ▼          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               Prompt Enhancement Engine                  │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  • SmartContextManager (request type detection)         │   │
│  │  • Pattern Library (CRUD, forms, API, auth)             │   │
│  │  • LearningSystem (history-based improvement)           │   │
│  │  • Anthropic Claude API (prompt refinement)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Safety & Review Layer                    │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  • PreflightChecker (environment validation)            │   │
│  │  • AutoApprovalEngine (risk scoring 0-100)              │   │
│  │  • Pattern matching (safe/danger detection)             │   │
│  │  • Complexity thresholds (file count limits)            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Claude Code Execution Engine                │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  • ExecutionMonitor (file watching, error detection)    │   │
│  │  • Git checkpoints (rollback capability)                │   │
│  │  • Question interceptor (auto-answer Y/n prompts)       │   │
│  │  • Progress streaming (WebSocket updates)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Post-Execution Automation                      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  • Code review (via Code Review Agent)                  │   │
│  │  • Git commits (automated with summary)                 │   │
│  │  • CHANGELOG updates                                    │   │
│  │  • Documentation generation                             │   │
│  │  • Notifications (Slack, email)                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🧠 Intelligent Enhancement
- **Request Type Detection**: Automatically detects 9 types (CRUD, form, API, auth, UI, database, integration, testing, documentation)
- **Pattern Library**: Reusable templates for common features with project-specific customization
- **Smart Context**: Analyzes project structure, suggests file paths, imports, and related code
- **Learning System**: Tracks enhancement history and improves suggestions based on outcomes

### 🛡️ Multi-Layer Safety
- **Pre-flight Checks**: Validates git status, dependencies, environment variables, file permissions
- **Auto-Approval Engine**: Risk scoring (0-100) with safe/danger pattern matching
- **Complexity Thresholds**: File count limits prevent massive auto-approved changes
- **Git Checkpoints**: Automatic rollback capability for failed executions

### 🚀 Real-Time Execution
- **Live Monitoring**: File change detection, error parsing, progress streaming
- **Question Interceptor**: Automatically answers Claude Code Y/n prompts
- **WebSocket Updates**: Real-time progress in web UI and Chrome extension
- **Terminal Output**: ANSI color support, search, export, fullscreen mode

### 🔄 Automation & Integration
- **Chrome Extension**: One-click send from Claude.ai conversations
- **Batch Processing**: Extract multiple features from planning documents
- **Post-Execution**: Auto code review, git commits, CHANGELOG updates
- **Orchestrator Integration**: Works with Multi-Client Orchestrator for task routing

### 📊 Operational Excellence
- **Health Monitoring**: Detailed health check with system resources and performance metrics
- **Analytics**: Success rate, executions per hour, project usage tracking
- **Error Tracking**: Last 100 errors with context for troubleshooting
- **Metrics API**: Prometheus-compatible metrics for monitoring dashboards

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Redis** (for message queue)
- **Claude Code CLI** ([installation](https://docs.anthropic.com/claude/docs/claude-code))
- **Anthropic API Key** ([get one](https://console.anthropic.com))

### Installation

```bash
# Clone the repository
cd /path/to/cge-sdk-agents/automation-agents/claude-bridge-agent

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Configure projects in config.yaml
nano config.yaml

# Start the bridge
./run.sh
```

The bridge will be available at **http://localhost:5500**

### Docker Installation

```bash
# Set environment variables
export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f bridge

# Stop services
docker-compose down
```

---

## 📖 Usage

### 1. Web Interface

Navigate to **http://localhost:5500** for the full web UI.

**Features:**
- **Split-panel layout**: Original prompt on left, enhanced on right
- **Command palette** (Cmd+K): Quick access to patterns and history
- **Terminal view**: Real-time execution output with ANSI colors
- **Pattern library sidebar**: Browse and apply templates
- **History panel**: Recent sessions with status

**Keyboard Shortcuts:**
- `Cmd+Enter` / `Ctrl+Enter`: Enhance prompt
- `Cmd+E` / `Ctrl+E`: Execute approved prompt
- `Cmd+K` / `Ctrl+K`: Open command palette
- `Cmd+S` / `Ctrl+S`: Save to history
- `Escape`: Close modals

### 2. Chrome Extension

**Installation:**
1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `chrome-extension/` directory
5. Pin the extension

**Usage:**
1. Visit **claude.ai** and start a conversation
2. Click the **"Send to Bridge"** button that appears
3. Select your project from the dropdown
4. The prompt is sent to the bridge for enhancement

### 3. API Usage

#### Enhance Prompt

```bash
curl -X POST http://localhost:5500/api/enhance \
  -H "Content-Type: application/json" \
  -d '{
    "raw_prompt": "Add user authentication with email/password",
    "project_path": "/path/to/project",
    "context_hints": {
      "feature": "auth"
    }
  }'
```

**Response:**
```json
{
  "session_id": "session_abc123",
  "raw_prompt": "Add user authentication with email/password",
  "enhanced_prompt": "...",
  "context_files": ["app/auth/page.tsx", "lib/auth.ts"],
  "improvements": ["Added error handling", "Included type definitions"],
  "estimated_complexity": "medium"
}
```

#### Execute Prompt

```bash
curl -X POST http://localhost:5500/api/execute/session_abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "enhanced_prompt": "...",
    "project_path": "/path/to/project",
    "approved": true
  }'
```

#### Get Session Status

```bash
curl http://localhost:5500/api/session/session_abc123
```

#### Health Check

```bash
curl http://localhost:5500/health
```

**Response:**
```json
{
  "status": "healthy",
  "uptime_seconds": 3600.5,
  "sessions": {
    "active": 3,
    "total_enhancements": 47,
    "total_executions": 42,
    "total_failures": 2
  },
  "performance": {
    "avg_enhancement_time_seconds": 2.3,
    "avg_execution_time_seconds": 45.7
  },
  "system": {
    "memory_mb": 145.2,
    "cpu_percent": 12.5
  }
}
```

### 4. Batch Processing

Process planning documents with multiple features:

```python
from integrations.batch_processor import BatchProcessor

processor = BatchProcessor(config)

# Extract features from markdown file
features = processor.extract_features("""
## Feature 1: User Authentication
Add email/password login with Supabase

## Feature 2: User Profile
Create profile page with edit capability

## Feature 3: Dashboard
Build analytics dashboard
""")

# Process all features
results = await processor.process_batch(features, project_path)
```

---

## ⚙️ Configuration

See **config.yaml** for full configuration options. Key sections:

- **projects**: Project-specific settings, paths, and patterns
- **enhancement**: Claude API settings for prompt enhancement
- **review**: Auto-approval patterns and complexity thresholds
- **execution**: Claude Code execution settings
- **patterns**: Pattern library configuration
- **learning**: History tracking and learning system
- **pre_flight_checks**: Validation checks before execution

---

## 🔧 Troubleshooting

### Common Issues

**Bridge won't start:**
- Check Redis is running: `redis-cli ping`
- Verify API key in `.env`
- Ensure config.yaml exists

**Enhancements failing:**
- Check Anthropic API key validity
- Review API rate limits
- Check network connectivity

**Executions failing:**
- Verify Claude Code CLI is installed
- Check git repository is initialized
- Review execution timeout settings

**Chrome extension not working:**
- Reload extension in chrome://extensions
- Check bridge URL in content.js
- Review browser console for errors

See full troubleshooting guide in documentation.

---

## 🧪 Testing

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=lib --cov-report=html

# Run specific test file
pytest tests/test_safety.py -v
```

---

## 📊 Monitoring

**Health Check:**
```bash
curl http://localhost:5500/health
```

**Metrics:**
```bash
curl http://localhost:5500/api/metrics
```

**Analytics:**
```bash
curl http://localhost:5500/api/analytics
```

**Error Tracking:**
```bash
curl http://localhost:5500/api/errors?limit=20
```

---

## 🛠️ Development

### Project Structure

```
claude-bridge-agent/
├── main.py                     # FastAPI server
├── config.yaml                 # Configuration
├── lib/                        # Core libraries
│   ├── enhancer.py
│   ├── executor.py
│   ├── smart_context.py
│   ├── auto_approval.py
│   └── execution_monitor.py
├── integrations/               # Integrations
│   ├── batch_processor.py
│   └── post_execution.py
├── templates/                  # Web UI
├── static/                     # CSS/JS
├── chrome-extension/           # Browser extension
├── .claude/patterns/           # Pattern library
└── tests/                      # Test suite
```

### Adding Patterns

Create markdown file in `.claude/patterns/`:

```markdown
# Pattern Name

Description of when to use this pattern

## File Structure
- List of files to create

## Implementation
[Code template]
```

---

## 📝 License

MIT License

---

## 🙏 Acknowledgments

- **Anthropic** for Claude API and Claude Code CLI
- **FastAPI** for async web framework
- **CGE Software** for project sponsorship

---

**Built with ❤️ by CGE Software**
