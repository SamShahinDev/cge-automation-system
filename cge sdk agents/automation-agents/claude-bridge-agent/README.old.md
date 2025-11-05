# 🌉 Claude Bridge Agent

**Hybrid AI Planning to Implementation Bridge**

Connects Claude.ai planning prompts with Claude Code implementation through human review.

## 🎯 What It Does

This agent creates a **semi-automated workflow**:

1. **📝 You write** a planning prompt in natural language
2. **✨ AI enhances** it with project context and best practices
3. **🔍 You review** the enhanced prompt side-by-side
4. **✅ You approve** (or reject/edit)
5. **⚡ Claude Code executes** the approved prompt automatically

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd "/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/claude-bridge-agent"

pip install -r requirements.txt
```

### 2. Set Environment Variable

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

### 3. Start the Server

```bash
python main.py
```

### 4. Open Browser

Navigate to: **http://localhost:8080**

## 📖 How to Use

### Example Workflow

1. **Enter Project Path**: `/Users/you/projects/my-app`

2. **Write Your Prompt**:
   ```
   Add user authentication to the dashboard with email/password login
   ```

3. **Click "Enhance with AI Context"**
   - Agent loads project context
   - Claude analyzes your codebase
   - Generates enhanced prompt with specific file references

4. **Review Enhanced Prompt**:
   ```
   Add user authentication to the Next.js dashboard with email/password login.

   Focus on:
   - Create auth context in src/contexts/AuthContext.tsx
   - Add login form component in src/components/auth/LoginForm.tsx
   - Update dashboard layout in src/app/(dashboard)/layout.tsx
   - Integrate with Supabase auth (already configured in src/lib/supabase.ts)

   Follow existing patterns:
   - Use TypeScript with strict types
   - Follow component structure in src/components/
   - Use Tailwind CSS for styling (already configured)
   ```

5. **Approve or Edit**:
   - ✅ **Approve**: Executes in Claude Code automatically
   - ❌ **Reject**: Cancel and start over
   - ✏️ **Edit**: Modify and re-enhance

6. **Watch Execution**:
   - Real-time console output
   - Progress tracking
   - Question detection (pauses for your input)

## 🎨 Features

### Prompt Enhancement
- **Smart Context Loading**: Automatically finds relevant files
- **Project Analysis**: Detects framework, language, structure
- **Best Practices**: Adds reminders for code style, testing, etc.
- **Complexity Estimation**: Low/Medium/High task complexity

### Human Review Interface
- **Split-Screen Comparison**: See original vs enhanced side-by-side
- **Improvement List**: Clear list of what was added
- **Metadata Display**: Complexity, context files, session ID
- **Edit Capability**: Refine the enhanced prompt

### Claude Code Execution
- **Subprocess Management**: Runs Claude Code in background
- **Real-Time Monitoring**: Live console output
- **Question Detection**: Pauses when Claude Code asks questions
- **Error Handling**: Captures and displays errors
- **Timeout Protection**: Prevents infinite runs

### Web Interface
- **Modern Dark Theme**: Easy on the eyes
- **Real-Time Updates**: WebSocket for live progress
- **Session History**: Review past executions
- **Toast Notifications**: Non-intrusive feedback
- **Keyboard Shortcuts**: Ctrl+Enter to enhance

## 🔧 Configuration

Edit `config.yaml`:

```yaml
server:
  host: 0.0.0.0
  port: 8080

anthropic:
  model: claude-sonnet-4-20250514
  max_tokens: 4096

claude_code:
  binary_path: claude-code
  timeout: 3600  # 1 hour

context:
  max_files: 10
  max_file_size_kb: 100
```

## 📡 API Endpoints

- `POST /api/enhance` - Enhance a prompt
- `POST /api/execute/{session_id}` - Execute approved prompt
- `GET /api/session/{session_id}` - Get session details
- `GET /api/sessions` - List all sessions
- `WS /ws` - WebSocket for real-time updates
- `GET /health` - Health check

## 🎯 Use Cases

### Pre-Demo Code Review
```
Review the authentication flow for security issues before tomorrow's demo
```

### Feature Implementation
```
Implement dark mode toggle that persists user preference
```

### Refactoring
```
Refactor the user service to use dependency injection pattern
```

### Bug Fixes
```
Fix the memory leak in the dashboard data fetching logic
```

## 🔐 Security Notes

- **Never commits without review**: Human always approves before execution
- **Project isolation**: Each session runs in specified project directory
- **Timeout protection**: Prevents runaway processes
- **API key security**: Uses environment variables

## 🛠️ Development

### Project Structure

```
claude-bridge-agent/
├── main.py                 # FastAPI server + orchestrator
├── lib/
│   ├── enhancer.py        # Prompt enhancement engine
│   ├── executor.py        # Claude Code execution manager
│   └── context_manager.py # Project context loader
├── static/
│   ├── css/style.css      # Modern UI styles
│   └── js/app.js          # Frontend logic + WebSocket
├── templates/
│   └── index.html         # Main web interface
├── config.yaml            # Configuration
└── requirements.txt       # Dependencies
```

### Adding Custom Context Rules

Edit `lib/context_manager.py`:

```python
# Add custom file patterns
priority_patterns = [
    'YOUR_PATTERN.md',
    'src/custom/**/*.ts',
]
```

## 📊 Monitoring

Access real-time session data:

```bash
curl http://localhost:8080/api/sessions
```

Response:
```json
{
  "sessions": [
    {
      "session_id": "session_a1b2c3d4",
      "status": "completed",
      "created_at": "2025-10-01T10:30:00",
      "project_path": "/path/to/project"
    }
  ]
}
```

## 🐛 Troubleshooting

### "Claude Code not found"

Make sure `claude-code` is in your PATH:

```bash
which claude-code
```

Or set full path in config:

```yaml
claude_code:
  binary_path: /full/path/to/claude-code
```

### "WebSocket connection failed"

Check firewall settings for port 8080.

### "Enhancement timeout"

Increase timeout in `config.yaml`:

```yaml
anthropic:
  timeout: 60  # seconds
```

## 🎓 Tips

1. **Be Specific**: More context in your prompt = better enhancement
2. **Use Project Hints**: Mention specific files/folders you want to target
3. **Review Carefully**: The enhanced prompt is your final instruction to Claude Code
4. **Save Good Prompts**: Copy enhanced prompts for future reference

## 🔗 Integration

### With Multi-Client Orchestrator

```python
from lib.message_queue import MessageQueue

# Send to bridge agent
task_id = await queue.send_message(
    agent='claude_bridge',
    task_data={
        'prompt': 'Add user authentication',
        'project_path': '/path/to/project'
    }
)
```

## 📝 License

Part of CGE SDK Agents suite.

---

**Built for engineers who want AI assistance with human oversight** 🚀
