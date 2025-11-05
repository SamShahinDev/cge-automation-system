# Crowned Gladiator Automation Agents

Complete suite of AI-powered automation agents for client management and value delivery.

## 📁 Agent Directory

### 1. Code Review Agent
**Location**: `code-review-agent/`

**Purpose**: Pre-demo quality assurance and code review

**Features**:
- Console.log detection
- Error handling validation
- Loading state verification
- Mobile responsiveness checks
- AI-powered deep analysis
- Auto-fix capabilities
- GitHub Actions integration

**Usage**:
```bash
cd code-review-agent
python agent.py /path/to/project crm
```

**Best For**:
- Pre-demo checks
- Pull request reviews
- Code quality enforcement
- Client deliverable validation

---

### 2. Monthly Value-Add Agent
**Location**: `monthly-value-agent/`

**Purpose**: Demonstrate ongoing value to justify subscription fees

**Features**:
- Database performance analysis
- Security audits
- Dependency management
- Usage pattern tracking
- AI-powered recommendations
- ROI calculations
- Beautiful PDF reports
- Automated GitHub PRs

**Usage**:
```bash
cd monthly-value-agent
./run_analysis.sh dirt-free-crm
```

**Best For**:
- Monthly client reports
- ROI demonstration
- Proactive optimization
- Client retention
- Value justification

---

## 🎯 Complete Workflow

### Pre-Demo Checklist
```bash
# 1. Run code review
cd code-review-agent
python agent.py ../dirt-free-crm crm

# 2. Fix any critical issues
# Review code-review-report.md

# 3. Commit changes
git add .
git commit -m "Pre-demo fixes"

# 4. Run final check
python agent.py ../dirt-free-crm crm

# 5. Demo ready!
```

### Monthly Value Delivery
```bash
# 1. Run monthly analysis (1st of each month)
cd monthly-value-agent
./run_analysis.sh dirt-free-crm

# 2. Review generated report
open reports/monthly-value-report-2024-01.pdf

# 3. Review and merge optimization PR
# Check GitHub for automated PR

# 4. Send report to client
# Report is ready to share

# 5. Schedule follow-up call
# Discuss recommendations
```

## 🚀 Quick Start Guide

### Initial Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd dirt-free-crm

# 2. Setup Code Review Agent
cd automation-agents/code-review-agent
pip install -r requirements.txt
cp .env.example .env
# Edit .env with ANTHROPIC_API_KEY
python health_check.py

# 3. Setup Monthly Value Agent
cd ../monthly-value-agent
pip install -r requirements.txt
cp .env.example .env
# Edit .env with all credentials

# 4. Test both agents
cd ../code-review-agent
python agent.py ../../ crm

cd ../monthly-value-agent
python agent.py dirt-free-crm
```

### Environment Variables

Both agents require:
```bash
# Required for both
ANTHROPIC_API_KEY=your_api_key

# Code Review Agent
LOG_LEVEL=INFO
LOG_FILE=logs/code-review.log

# Monthly Value Agent (additional)
CLIENT_SUPABASE_URL=https://xxx.supabase.co
CLIENT_SUPABASE_KEY=your_service_role_key
CLIENT_GITHUB_REPO=owner/repo
GITHUB_TOKEN=your_github_token
```

## 📊 Claude Code Agents

In addition to the automation agents, you have specialized Claude Code agents:

### Design & Architecture
- `project-architect.md` - System design and architecture
- `dirtfree-developer.md` - Dirt Free CRM specialist
- `database-architect.md` - Database design and optimization
- `ui-ux-designer.md` - Interface and experience design

### Technical Specialists
- `analytics-specialist.md` - Analytics and reporting
- `integration-specialist.md` - Third-party integrations
- `testing-qa.md` - Testing and quality assurance
- `devops-engineer.md` - Deployment and infrastructure

**Location**: `.claude/agents/`

**Usage**: These are invoked automatically by Claude Code when needed.

## 🔄 Automation Schedule

### Daily
- [ ] Run code review on any PRs (via GitHub Actions)

### Weekly
- [ ] Review security audit results
- [ ] Check dependency updates

### Monthly (1st of month)
- [ ] Run monthly value analysis
- [ ] Generate and send client report
- [ ] Review and merge optimization PR
- [ ] Schedule client call to discuss findings

### Pre-Demo
- [ ] Run code review agent
- [ ] Fix all critical issues
- [ ] Test on mobile devices
- [ ] Verify no console.logs
- [ ] Check loading states
- [ ] Validate error handling

## 💰 ROI Tracking

The Monthly Value Agent tracks:

| Metric | Calculation |
|--------|-------------|
| **Performance Value** | Missing Indexes × $100 |
| **Security Value** | Issues Fixed × $200 |
| **Feature Value** | New Features × $500 |
| **Time Value** | Hours Saved × $150/hr |
| **Total ROI** | (Total Value - Fee) / Fee × 100 |

## 🎨 Customization

### Adding New Clients

Edit `monthly-value-agent/config.yaml`:

```yaml
clients:
  new-client:
    name: "New Client Name"
    supabase_url: "${NEW_CLIENT_SUPABASE_URL}"
    supabase_key: "${NEW_CLIENT_SUPABASE_KEY}"
    github_repo: "owner/repo"
    subscription_tier: "premium"
    monthly_fee: 500
    launch_date: "2024-01-15"
    features:
      - feature1
      - feature2
```

### Adding Custom Checks

Code Review Agent:

```python
# In agent.py
def check_custom_rule(self, file_path: Path, content: str):
    # Your custom check
    return issues

# Register in review_file method
if 'custom_rule' in checks:
    file_issues.extend(self.check_custom_rule(file_path, content))
```

## 📈 Metrics Dashboard

Track agent performance:

### Code Review Agent
- Files checked per run
- Issues found by severity
- Auto-fixes applied
- Time saved

### Monthly Value Agent
- Total value delivered
- ROI percentage
- Client growth
- Feature adoption

## 🛠️ Troubleshooting

### Common Issues

**Code Review Agent**:
```bash
# Health check fails
python health_check.py

# API errors
export LOG_LEVEL=DEBUG
python agent.py . crm
```

**Monthly Value Agent**:
```bash
# Database connection fails
python -c "from supabase import create_client; client = create_client('URL', 'KEY'); print('OK')"

# PDF generation fails
# Install system dependencies (see README)
```

## 📚 Documentation

Each agent has detailed documentation:
- `code-review-agent/README.md` - Complete code review guide
- `monthly-value-agent/README.md` - Value analysis guide

## 🔐 Security

Both agents:
- ✅ Store credentials in `.env` (never committed)
- ✅ Use service accounts with minimal permissions
- ✅ Log sanitization (no secrets in logs)
- ✅ Optional Sentry integration for monitoring

## 🎯 Best Practices

1. **Run Consistently**: Stick to the schedule
2. **Review Before Sharing**: Always review reports before sending to clients
3. **Act on Findings**: Implement high-impact recommendations
4. **Track Trends**: Compare month-over-month improvements
5. **Client Communication**: Use reports as conversation starters

## 📞 Support

For issues or questions:
- Check agent README files
- Review logs in `logs/` directory
- Enable debug logging: `LOG_LEVEL=DEBUG`
- Contact: support@crownedgladiator.com

## 🚀 Future Enhancements

Planned features:
- [ ] Multi-client batch processing
- [ ] Slack bot integration
- [ ] Real-time performance monitoring
- [ ] Automated A/B testing
- [ ] Client dashboard
- [ ] Mobile app integration

## 📄 License

Proprietary - Crowned Gladiator Enterprises

---

**Last Updated**: 2024
**Version**: 1.0.0
