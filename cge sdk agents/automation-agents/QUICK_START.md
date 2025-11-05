# 🚀 Quick Start Guide

**Get both agents running in 10 minutes**

## Step 1: Install Dependencies (3 min)

```bash
# Navigate to project
cd /path/to/dirt-free-crm/automation-agents

# Install Code Review Agent
cd code-review-agent
pip install -r requirements.txt

# Install Monthly Value Agent
cd ../monthly-value-agent
pip install -r requirements.txt
```

## Step 2: Configure Environment (2 min)

```bash
# Code Review Agent
cd ../code-review-agent
cp .env.example .env
# Edit: Add ANTHROPIC_API_KEY

# Monthly Value Agent
cd ../monthly-value-agent
cp .env.example .env
# Edit: Add all required credentials
```

## Step 3: Health Check (1 min)

```bash
cd ../code-review-agent
python health_check.py

# Should see:
# ✅ Python Version: Python 3.11 ✓
# ✅ Dependencies: All dependencies installed ✓
# ✅ API Key: API key configured ✓
# ✅ Configuration: Configuration file valid ✓
# ✅ Write Permissions: Write permissions OK ✓
```

## Step 4: Test Code Review Agent (2 min)

```bash
python agent.py ../../ crm

# Output:
# 🏥 Code Review Agent initialized
# 📁 Found 127 files to review
# ✅ Review complete!
# 📄 Report: code-review-report.md
```

## Step 5: Test Monthly Value Agent (2 min)

```bash
cd ../monthly-value-agent
python agent.py dirt-free-crm

# Output:
# 📊 MONTHLY VALUE REPORT
# 💰 ROI: 755%
# ⏱️  Time Saved: 12.5 hours
# 📄 Report: reports/monthly-value-report-2024-01.pdf
```

## ✅ You're Done!

### Next Steps:

**1. Schedule Monthly Analysis**
```bash
# Add to crontab (runs 1st of each month at 9am)
0 9 1 * * cd /path/to/monthly-value-agent && ./run_analysis.sh dirt-free-crm
```

**2. Setup GitHub Actions**
```bash
# Copy workflows to your repo
cp code-review-agent/.github/workflows/code-review.yml ../../.github/workflows/
```

**3. Run Before Next Demo**
```bash
cd code-review-agent
python agent.py ../../ crm
# Fix any issues
# Demo confidently!
```

## 📚 Full Documentation

- [Main README](README.md)
- [Code Review Agent](code-review-agent/README.md)
- [Monthly Value Agent](monthly-value-agent/README.md)
- [Agents Summary](AGENTS_SUMMARY.md)

## 💡 Common Issues

**"Module not found"**
```bash
pip install -r requirements.txt --force-reinstall
```

**"API Key not found"**
```bash
# Check .env file exists and has:
ANTHROPIC_API_KEY=sk-ant-...
```

**"Permission denied"**
```bash
chmod +x run_analysis.sh
```

## 🎯 What You Get

### Code Review Agent
- ✅ Pre-demo quality checks
- ✅ Automated issue detection
- ✅ Auto-fix capabilities
- ✅ Professional reports

### Monthly Value Agent
- ✅ Beautiful PDF reports
- ✅ ROI calculations
- ✅ Automated optimizations
- ✅ GitHub PR creation
- ✅ Client-ready deliverables

## 🚀 Start Delivering Value Today!
