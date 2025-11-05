# 🔧 Configuration and Context System Guide

Complete guide to the Claude Bridge Agent's intelligent configuration and context system.

## 📁 File Structure

```
claude-bridge-agent/
├── config.yaml                    # Main configuration
├── .claude/patterns/              # Pattern library
│   ├── crud-pattern.md
│   ├── form-pattern.md
│   ├── api-pattern.md
│   └── auth-pattern.md
├── data/learning/                 # Learning system storage
│   ├── enhancement_history.jsonl
│   └── outcomes.jsonl
└── lib/
    ├── smart_context.py          # Smart context analysis
    ├── learning_system.py        # ML-like learning
    └── preflight.py              # Pre-flight checks
```

## 🎯 Configuration System

### Project Configuration

The `projects` section in `config.yaml` defines project-specific settings:

```yaml
projects:
  dirt-free-crm:
    path: /absolute/path/to/project
    github_url: https://github.com/user/repo

    # Context files to load
    context_files:
      - ARCHITECTURE.md
      - DATABASE_SCHEMA.md
      - docs/API.md

    # Tech stack (used for enhancement)
    tech_stack:
      frontend: [Next.js 15, TypeScript, Tailwind CSS]
      backend: [Supabase, PostgreSQL]
      integrations: [Twilio, Resend, Stripe]

    # File path patterns
    patterns:
      component_path: "components/{feature}/{ComponentName}.tsx"
      api_path: "app/api/{feature}/route.ts"
      page_path: "app/(dashboard)/{feature}/page.tsx"
      server_action_path: "app/actions/{feature}.ts"
      type_path: "types/{feature}.ts"

    # Common imports (injected into enhancements)
    common_imports: |
      import { createClient } from '@/lib/supabase/server'
      import { Button } from '@/components/ui/button'

    # Style guide (added to prompts)
    style_guide:
      - Use "use server" for Server Actions
      - Always add loading states with Suspense
      - Use TypeScript strict mode
```

### Enhancement Settings

```yaml
enhancement:
  system_prompt: |
    You are enhancing planning documents into detailed implementation prompts.

    Always include:
    1. Specific file paths
    2. Required imports
    3. Error handling
    4. Loading states
    5. TypeScript types
    6. Test files

  context_injection:
    max_context_files: 10
    max_file_size_kb: 100
    include_recent_commits: 5
```

### Review Settings

```yaml
review:
  # Auto-approve low-risk changes
  auto_approve_patterns:
    - "add.*field.*database"
    - "create.*type.*interface"
    - "update.*documentation"

  # Require manual review for high-risk
  require_review_patterns:
    - "delete"
    - "payment"
    - "authentication"
    - "security"

  complexity_thresholds:
    low_max_files: 3
    medium_max_files: 10
```

### Execution Settings

```yaml
execution:
  claude_code_timeout: 1800  # 30 minutes

  # Auto-answer common questions
  auto_answer_common_questions:
    "Should this be a server or client component?": "Server component for data fetching..."
    "Should I add tests?": "Yes, create a .test.ts file"

  pause_on_questions: true
```

## 🧠 Smart Context System

### Request Analysis

The `SmartContextManager` automatically analyzes prompts:

```python
from lib.smart_context import SmartContextManager

manager = SmartContextManager(config)
analysis = manager.analyze_request(
    "Add user authentication with email/password",
    project_config
)

# Returns:
{
    'request_type': 'authentication',
    'features_mentioned': ['user', 'authentication'],
    'entities_mentioned': ['User'],
    'suggested_patterns': [
        {
            'name': 'auth-pattern',
            'relevance': 'high',
            'path': '.claude/patterns/auth-pattern.md'
        }
    ],
    'file_paths': [
        'app/(auth)/login/page.tsx',
        'app/actions/auth.ts',
        'types/auth.ts'
    ],
    'complexity': 'high',
    'requires_auth': True,
    'requires_database': True,
}
```

### Request Types Detected

- **authentication** - Login, signup, password flows
- **crud** - Create, read, update, delete operations
- **form** - Form handling and validation
- **api** - API routes and endpoints
- **ui** - Components and pages
- **database** - Schema changes, migrations
- **integration** - Third-party integrations
- **testing** - Test files
- **documentation** - Docs updates

### Pattern Suggestions

Based on request type, relevant patterns are automatically suggested:

| Request Type | Suggested Patterns |
|-------------|-------------------|
| CRUD | crud-pattern |
| Form | form-pattern, crud-pattern |
| API | api-pattern |
| Authentication | auth-pattern |
| UI | crud-pattern, form-pattern |

## 📚 Pattern Library

### Creating Custom Patterns

Add new patterns to `.claude/patterns/`:

```markdown
# My Custom Pattern

Description of when to use this pattern.

## File Structure

\`\`\`
app/
└── {feature}/
    ├── page.tsx
    └── component.tsx
\`\`\`

## Implementation Template

\`\`\`typescript
// Your template code here
\`\`\`

## Checklist

- [ ] Item 1
- [ ] Item 2
```

Enable in `config.yaml`:

```yaml
patterns:
  enabled_patterns:
    - my-custom-pattern
```

## 🎓 Learning System

### How It Works

The learning system tracks:

1. **Enhancements** - Original → Enhanced prompt pairs
2. **Outcomes** - Success/failure of executions
3. **Patterns Used** - Which patterns were applied
4. **Similarity** - Finds similar past tasks

### Tracked Data

**Enhancement History** (`data/learning/enhancement_history.jsonl`):

```json
{
  "session_id": "session_a1b2c3d4",
  "timestamp": "2025-10-01T10:30:00",
  "original_prompt": "Add user login",
  "enhanced_prompt": "Add user authentication with email/password login...",
  "request_type": "authentication",
  "complexity": "high",
  "patterns_used": ["auth-pattern"]
}
```

**Outcomes** (`data/learning/outcomes.jsonl`):

```json
{
  "session_id": "session_a1b2c3d4",
  "timestamp": "2025-10-01T10:45:00",
  "success": true,
  "execution_time": 120.5,
  "files_changed": ["app/(auth)/login/page.tsx", "app/actions/auth.ts"]
}
```

### Usage

```python
from lib.learning_system import LearningSystem

learning = LearningSystem(config)

# Find similar past prompts
similar = learning.find_similar_enhancements(
    "Add user signup form",
    request_type="authentication"
)

# Get success rate
stats = learning.get_success_rate("authentication")
# Returns: {'total': 10, 'successes': 9, 'rate': 90.0}

# Get popular patterns
patterns = learning.get_popular_patterns()
# Returns: [{'pattern': 'crud-pattern', 'count': 45}, ...]
```

## ✅ Pre-flight Checks

Before every enhancement/execution, the system runs checks:

### Checks Performed

1. **Project Path** - Verifies project directory exists
2. **Git Status** - Warns about uncommitted changes
3. **Claude Code** - Validates binary is accessible
4. **API Key** - Tests Anthropic API key works
5. **Context Files** - Checks documentation files exist
6. **Patterns** - Validates pattern library

### Example Output

```
✅ Project Path: Project path exists
⚠️  Git Status: 3 uncommitted changes detected
✅ Claude Code: Claude Code found: v1.2.3
✅ API Key: API key valid and working
⚠️  Context Files: 1/3 context files missing
✅ Pattern Library: 4 patterns available
```

### Configuration

Enable/disable checks in `config.yaml`:

```yaml
pre_flight_checks:
  verify_project_path: true
  check_git_status: true
  warn_uncommitted_changes: true
  validate_claude_code: true
  test_api_key: true
  check_context_files: true
  validate_patterns: true
```

## 🔄 File Path Generation

The system automatically generates file paths based on:

1. **Request Type** - CRUD, form, API, etc.
2. **Features Mentioned** - Extracted from prompt
3. **Project Patterns** - Defined in config

### Example

**Prompt**: "Add customer management with CRUD operations"

**Generated Paths**:
```
components/customer/CustomerList.tsx
components/customer/CustomerForm.tsx
app/(dashboard)/customer/page.tsx
app/actions/customer.ts
types/customer.ts
```

## 🎨 Common Imports Injection

Imports are automatically added based on request type:

| Request Type | Auto-Added Imports |
|-------------|-------------------|
| All | `import { createClient } from '@/lib/supabase/server'` |
| Form | `import { useFormState } from 'react-dom'`<br>`import { z } from 'zod'` |
| UI | `import { Button } from '@/components/ui/button'` |

## 📊 Analytics

View learning system stats:

```bash
# In Python REPL
from lib.learning_system import LearningSystem
import yaml

with open('config.yaml') as f:
    config = yaml.safe_load(f)

learning = LearningSystem(config)

# Overall stats
print(learning.get_success_rate())

# By request type
print(learning.get_success_rate('authentication'))
print(learning.get_success_rate('crud'))

# Popular patterns
print(learning.get_popular_patterns(limit=10))
```

## 🚀 Best Practices

### 1. Keep Context Files Updated

Ensure these exist in your project:
- `ARCHITECTURE.md` - System design
- `DATABASE_SCHEMA.md` - Database structure
- `docs/API.md` - API documentation

### 2. Define Clear Patterns

Create project-specific patterns for:
- Common features you build frequently
- Team coding standards
- Framework-specific conventions

### 3. Review Enhancement History

Periodically check `data/learning/enhancement_history.jsonl` to:
- See what prompts work well
- Identify patterns that need improvement
- Build a prompt library

### 4. Tune Similarity Threshold

Adjust `learning.similarity_threshold` in config (0-1):
- **0.5-0.6**: More suggestions, less precise
- **0.7-0.8**: Balanced (recommended)
- **0.9-1.0**: Very precise, fewer suggestions

## 🔧 Troubleshooting

### "No patterns found"

Create patterns directory:
```bash
mkdir -p .claude/patterns
```

### "Context files missing"

Add them to your project or update `config.yaml`:
```yaml
projects:
  your-project:
    context_files: []  # Disable warning
```

### "Learning system not working"

Check storage directory exists:
```bash
mkdir -p data/learning
```

Enable in config:
```yaml
learning:
  enabled: true
```

---

**Your bridge agent now has an intelligent context and configuration system!** 🎯
