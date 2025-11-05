# 🏢 Crowned Gladiator Enterprises - SDK Agents

**Your Agency's Automation Toolkit**

This is the **home base** for all Crowned Gladiator Enterprises automation agents. These tools work across ALL your client projects.

---

## 📦 What's Inside

### 🤖 Automation Agents

#### 1. **Multi-Client Orchestrator** 🎯 NEW!
**Location**: `automation-agents/multi-client-orchestrator/`

**Purpose**: Your virtual project manager for ALL clients

**Usage**:
```bash
cd automation-agents/multi-client-orchestrator
python orchestrator.py start
```

**Features**:
- Manages unlimited clients simultaneously
- Intelligent task routing to specialized agents
- Automatic time tracking
- Priority-based scheduling
- Web dashboard at http://localhost:5000
- CLI for task management

**Use Cases**:
- Central command center for all clients
- Automated task distribution
- Progress tracking across projects
- Time and billing management

---

#### 2. **Code Review Agent**
**Location**: `automation-agents/code-review-agent/`

**Purpose**: Pre-demo quality assurance for ANY client project

**Usage**:
```bash
cd automation-agents/code-review-agent
python agent.py /path/to/any/client/project crm
```

**Use Cases**:
- Before Dirt Free CRM demos
- Before ANY client demo
- On pull requests (via GitHub Actions)
- Quality checks for deliverables

---

#### 3. **Monthly Value-Add Agent**
**Location**: `automation-agents/monthly-value-agent/`

**Purpose**: Demonstrate ROI to justify subscription fees

**Usage**:
```bash
cd automation-agents/monthly-value-agent
./run_analysis.sh client-name
```

**Use Cases**:
- Monthly reports for Dirt Free CRM
- Monthly reports for ANY client (add to config.yaml)
- Client retention tool
- Value demonstration

---

## 🎯 How to Use Across Clients

### Current Clients
- Dirt Free CRM (configured)

### Adding New Clients

**Monthly Value Agent** - Edit `automation-agents/monthly-value-agent/config.yaml`:
```yaml
clients:
  dirt-free-crm:
    name: "Dirt Free Carpet Cleaning CRM"
    monthly_fee: 500
    # ... existing config

  new-client-name:
    name: "New Client Name"
    supabase_url: "${NEW_CLIENT_SUPABASE_URL}"
    supabase_key: "${NEW_CLIENT_SUPABASE_KEY}"
    github_repo: "owner/repo"
    monthly_fee: 750
    launch_date: "2024-01-15"
    features:
      - feature1
      - feature2
```

**Code Review Agent** - Works with any project:
```bash
# Just point it to any project
python agent.py /path/to/new/client/project crm
```

---

## 🚀 Quick Start

### First Time Setup

```bash
cd automation-agents/code-review-agent
pip install -r requirements.txt
cp .env.example .env
# Edit .env: Add ANTHROPIC_API_KEY

cd ../monthly-value-agent
pip install -r requirements.txt
cp .env.example .env
# Edit .env: Add all credentials

# Health check
cd ../code-review-agent
python health_check.py
```

### Regular Usage

**Before Every Demo**:
```bash
cd ~/Documents/cge\ software/cge\ sdk\ agents/automation-agents/code-review-agent
python agent.py ~/Documents/dirt-free-crm crm
# Fix any issues
# Demo ready!
```

**1st of Every Month**:
```bash
cd ~/Documents/cge\ software/cge\ sdk\ agents/automation-agents/monthly-value-agent
./run_analysis.sh dirt-free-crm
# Review PDF report
# Share with client
```

---

## 📁 Directory Structure

```
cge sdk agents/
├── README.md (this file)
│
└── automation-agents/
    ├── README.md              # Detailed documentation
    ├── QUICK_START.md         # 10-minute setup
    ├── AGENTS_SUMMARY.md      # Complete guide
    ├── STRUCTURE.md           # Architecture details
    │
    ├── code-review-agent/     # Pre-demo quality checks
    │   ├── agent.py
    │   ├── logger.py
    │   ├── exceptions.py
    │   ├── health_check.py
    │   └── README.md
    │
    └── monthly-value-agent/   # ROI demonstration
        ├── agent.py
        ├── run_analysis.sh
        ├── lib/               # Analysis modules
        ├── templates/         # Report templates
        └── README.md
```

---

## 🎯 Client Projects

Your client projects should reference these agents:

### Dirt Free CRM
**Location**: `~/Documents/dirt free carpet/dirt-free-crm/`

**Has**: Claude Code agents (`.claude/agents/`) - Dirt Free specific
**Uses**: These SDK agents from CGE home base

**Setup**:
```bash
# In Dirt Free CRM, create a symlink or alias
cd ~/Documents/dirt-free-crm

# Create a script to run code review
cat > run-code-review.sh << 'EOF'
#!/bin/bash
cd "$HOME/Documents/cge software/cge sdk agents/automation-agents/code-review-agent"
python agent.py "$HOME/Documents/dirt free carpet/dirt-free-crm" crm
EOF

chmod +x run-code-review.sh
```

---

## 💡 Workflow

### Daily Development
- Work in client project (e.g., Dirt Free CRM)
- Use Claude Code agents for development

### Pre-Demo
- Run Code Review Agent from CGE home base
- Fix any issues
- Demo confidently

### Monthly (1st of month)
- Run Monthly Value Agent from CGE home base
- Generate PDF report
- Review optimization PR
- Send report to client
- Schedule follow-up call

---

## 📚 Documentation

- [Main README](automation-agents/README.md) - Complete overview
- [Quick Start](automation-agents/QUICK_START.md) - 10-minute setup
- [Agents Summary](automation-agents/AGENTS_SUMMARY.md) - Detailed guide
- [Structure](automation-agents/STRUCTURE.md) - Architecture

---

## 🔐 Security

All credentials stored in `.env` files (never committed):
- `ANTHROPIC_API_KEY` - Claude API access
- `CLIENT_SUPABASE_URL` - Database connection
- `CLIENT_SUPABASE_KEY` - Service role key
- `GITHUB_TOKEN` - PR creation

---

## 🎓 Best Practices

1. **Keep agents here** - Don't copy to client projects
2. **Run from CGE home** - Centralized updates and maintenance
3. **Add all clients** - Configure in `monthly-value-agent/config.yaml`
4. **Schedule monthly** - Set up cron jobs for automation
5. **Review before sharing** - Always check reports before sending

---

## 🚀 Scaling

As you add more clients:

1. **Add to config** - `monthly-value-agent/config.yaml`
2. **Run analysis** - `./run_analysis.sh new-client`
3. **Share reports** - Professional PDFs demonstrating value
4. **Justify fees** - Clear ROI calculations

---

## 📞 Support

For issues or questions:
- Check individual agent READMEs
- Review logs in `logs/` directories
- Enable debug: `LOG_LEVEL=DEBUG`

---

**Built by Crowned Gladiator Enterprises**
**Powered by Claude AI**

*Last Updated: 2024*
