# Code Review Agent

Production-ready automated code review agent for Crowned Gladiator projects using Claude API.

## Features

### 🔍 Comprehensive Checks
- Console.log statements
- Error handling patterns
- Loading states
- Placeholder data
- Mobile responsiveness
- Security vulnerabilities
- Performance issues
- Accessibility compliance

### 🛡️ Production-Ready
- **Comprehensive Error Handling**: Graceful failure handling at every level
- **Structured Logging**: Colored console output + JSON file logs
- **Retry Logic**: Automatic retry with exponential backoff for API calls
- **Rate Limiting**: Controlled concurrency to avoid overload
- **Health Checks**: Pre-flight validation of dependencies and configuration
- **Sentry Integration**: Optional error tracking and monitoring

### 🤖 AI-Powered Analysis
- Deep code analysis using Claude
- Context-aware suggestions
- Critical path prioritization
- Intelligent issue categorization

### 🔧 Auto-Fix Capabilities
- Automatically fix simple issues
- Safe, non-breaking fixes
- Detailed change tracking

### 📊 Detailed Reports
- Markdown format
- Severity classification
- Fix checklists
- Demo readiness status
- Performance metrics

## Installation

```bash
cd automation-agents/code-review-agent

# Install dependencies
pip install -r requirements.txt

# Or using poetry
poetry install

# Set up environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run health check
python health_check.py
```

## Usage

### Health Check

Always run health check first to ensure everything is configured correctly:

```bash
python health_check.py
```

### Basic Usage

```bash
python agent.py /path/to/project crm
```

### Project Types

- `crm` - CRM applications (default)
- `portal` - Customer portals
- `website` - Marketing websites

### Examples

```bash
# Review Dirt Free CRM
python agent.py ../../ crm

# Review customer portal with debug logging
LOG_LEVEL=DEBUG python agent.py /path/to/portal portal

# Review with file logging
LOG_FILE=logs/review.log python agent.py /path/to/website website
```

## Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=your_api_key_here

# Optional
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FILE=logs/code-review.log  # Optional file logging
ENABLE_SENTRY=false  # Enable Sentry error tracking
SENTRY_DSN=  # Your Sentry DSN if enabled
ENVIRONMENT=development  # development, staging, production
```

### config.yaml

Edit `config.yaml` to customize:

- File patterns to check
- Checks to run
- Auto-fix settings
- Critical paths
- Project-specific rules

## Error Handling

The agent includes comprehensive error handling:

### Exit Codes

- `0` - Success, no critical issues
- `1` - Critical issues found
- `2` - Configuration error
- `3` - Analysis error
- `130` - Interrupted by user

### Logging Levels

```bash
# Debug (verbose)
LOG_LEVEL=DEBUG python agent.py . crm

# Info (default)
python agent.py . crm

# Warnings only
LOG_LEVEL=WARNING python agent.py . crm

# Errors only
LOG_LEVEL=ERROR python agent.py . crm
```

### File Logging

Enable file logging for production:

```bash
LOG_FILE=logs/code-review.log python agent.py . crm
```

Logs are written in JSON format for easy parsing.

## Running Before Demos

```bash
# Quick pre-demo check
python agent.py . crm

# Review report
cat code-review-report.md

# Fix critical issues before demo
```

## CI/CD Integration

The agent includes GitHub Actions workflow for automatic PR reviews.

### Setup

1. Add secrets to your repository:
   - `ANTHROPIC_API_KEY` - Your Claude API key
   - `SLACK_WEBHOOK_URL` - (Optional) For demo notifications
   - `SENTRY_DSN` - (Optional) For error tracking

2. The workflow runs automatically on:
   - Pull requests to `main` or `develop`
   - PRs labeled with `demo-ready` (strict mode)

### Features

- Automatic project type detection
- PR comment with review results
- Fails PR if critical issues found
- Slack notifications for demo-ready PRs
- Artifact upload for reports

## Output

The agent generates:

1. **Console Output**: Colored, structured logs
2. **code-review-report.md**: Detailed findings with code snippets
3. **Log Files**: JSON-formatted logs (if enabled)
4. **Exit Code**: For CI/CD integration

## Report Format

```markdown
# Code Review Report
**Status:** ✅ PASS / ⚠️ PASS WITH WARNINGS / ❌ FAIL

## Summary
- Files Checked: X
- Files Failed: X
- Critical Issues: X
- Warnings: X
- Auto-Fixed: X
- API Calls: X
- API Errors: X

## 🚨 Critical Issues
[Detailed list with code snippets and fixes]

## ⚠️ Warnings
[Detailed list with suggestions]

## Fix Checklist
[Checklist of all issues]
```

## Monitoring

### Sentry Integration

Enable Sentry for production monitoring:

```bash
ENABLE_SENTRY=true
SENTRY_DSN=https://your-sentry-dsn
ENVIRONMENT=production
python agent.py . crm
```

### Metrics Tracked

- Files checked/failed
- Issues found by severity
- Auto-fixes applied
- API call success/failure
- Review duration

## Troubleshooting

### Common Issues

**API Key Not Found**
```bash
# Ensure .env file exists and contains ANTHROPIC_API_KEY
cat .env | grep ANTHROPIC_API_KEY
```

**Import Errors**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Permission Errors**
```bash
# Check write permissions
python health_check.py
```

**Rate Limiting**
The agent automatically retries with exponential backoff. If you hit rate limits frequently, reduce concurrency in `agent.py`:

```python
semaphore = asyncio.Semaphore(3)  # Reduce from 5 to 3
```

## Development

### Running Tests

```bash
# Run health check
python health_check.py

# Test on sample project
python agent.py ../sample-project crm

# Debug mode
LOG_LEVEL=DEBUG python agent.py . crm
```

### Adding New Checks

1. Add check method to `CodeReviewAgent` class
2. Update `config.yaml` with new check type
3. Call check in `review_file` method
4. Test thoroughly

### Custom Logging

```python
from logger import get_logger

logger = get_logger(__name__)
logger.info("Custom message", context="value")
```

## Architecture

```
agent.py           # Main agent implementation
logger.py          # Structured logging setup
exceptions.py      # Custom exception classes
config.yaml        # Configuration
health_check.py    # Dependency validation
requirements.txt   # Python dependencies
```

## Performance

- Concurrent file review (max 5 files at once)
- Automatic retry with backoff
- Content truncation for large files
- Efficient file pattern matching
- Minimal memory footprint

## Security

- API keys loaded from environment
- No secrets in logs
- Safe file operations
- Input validation
- Exception sanitization

## License

Proprietary - Crowned Gladiator Enterprises
