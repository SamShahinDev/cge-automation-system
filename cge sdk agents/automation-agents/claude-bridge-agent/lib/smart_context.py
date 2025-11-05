"""
Smart Context Manager
Analyzes requests and intelligently loads relevant context
"""

import re
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from difflib import SequenceMatcher

sys.path.append(str(Path(__file__).parent.parent.parent / "code-review-agent"))
from logger import get_logger

logger = get_logger(__name__)


class SmartContextManager:
    """
    Intelligently analyzes prompts and loads relevant context

    Features:
    - Request type detection (CRUD, UI, API, auth, etc.)
    - Pattern matching and suggestion
    - Similar code detection
    - Recent commit analysis
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.patterns_dir = Path(__file__).parent.parent / config.get('patterns', {}).get('library_path', '.claude/patterns')

        # Load pattern library
        self.patterns = self._load_patterns()

    def _load_patterns(self) -> Dict[str, str]:
        """Load all pattern files"""
        patterns = {}

        if not self.patterns_dir.exists():
            logger.warning(f"Patterns directory not found: {self.patterns_dir}")
            return patterns

        for pattern_file in self.patterns_dir.glob('*.md'):
            pattern_name = pattern_file.stem
            with open(pattern_file, 'r') as f:
                patterns[pattern_name] = f.read()

        logger.info(f"Loaded {len(patterns)} patterns")
        return patterns

    def analyze_request(self, prompt: str, project_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a prompt and return structured context

        Args:
            prompt: User's raw prompt
            project_config: Project configuration

        Returns:
            Structured context with detected patterns, files, etc.
        """
        logger.info("Analyzing request")

        analysis = {
            'request_type': self._detect_request_type(prompt),
            'features_mentioned': self._extract_features(prompt),
            'entities_mentioned': self._extract_entities(prompt),
            'suggested_patterns': self.suggest_patterns(prompt),
            'file_paths': self._suggest_file_paths(prompt, project_config),
            'complexity': self._estimate_complexity(prompt),
            'requires_auth': self._requires_authentication(prompt),
            'requires_database': self._requires_database(prompt),
            'related_imports': self._suggest_imports(prompt, project_config),
        }

        logger.info(f"Request analysis: type={analysis['request_type']}, complexity={analysis['complexity']}")

        return analysis

    def _detect_request_type(self, prompt: str) -> str:
        """Detect the type of request"""

        prompt_lower = prompt.lower()

        # Priority order (most specific first)
        type_patterns = {
            'authentication': ['login', 'signup', 'auth', 'sign in', 'sign up', 'password', 'logout'],
            'crud': ['create', 'add', 'update', 'edit', 'delete', 'remove', 'list', 'show'],
            'form': ['form', 'input', 'validation', 'submit'],
            'api': ['api', 'endpoint', 'route', 'rest'],
            'ui': ['component', 'button', 'modal', 'dialog', 'page', 'layout'],
            'database': ['database', 'table', 'schema', 'migration', 'query'],
            'integration': ['integrate', 'webhook', 'third-party', 'twilio', 'stripe', 'resend'],
            'testing': ['test', 'spec', 'unit test', 'integration test'],
            'documentation': ['document', 'readme', 'docs'],
        }

        for request_type, keywords in type_patterns.items():
            if any(keyword in prompt_lower for keyword in keywords):
                return request_type

        return 'general'

    def _extract_features(self, prompt: str) -> List[str]:
        """Extract feature names mentioned in prompt"""

        # Common feature patterns
        patterns = [
            r'(?:for|to|in)\s+(?:the\s+)?(\w+(?:\s+\w+)?)\s+(?:feature|module|page)',
            r'(\w+)\s+(?:feature|module|component|page)',
            r'add\s+(\w+)',
            r'create\s+(?:a|an)?\s+(\w+)',
        ]

        features = set()

        for pattern in patterns:
            matches = re.findall(pattern, prompt, re.IGNORECASE)
            features.update(matches)

        # Convert to lowercase, remove common words
        common_words = {'the', 'a', 'an', 'new', 'existing', 'this', 'that'}
        features = {f.lower() for f in features if f.lower() not in common_words}

        return list(features)

    def _extract_entities(self, prompt: str) -> List[str]:
        """Extract entity/model names (usually capitalized or plural nouns)"""

        # Look for capitalized words (potential entities)
        entities = re.findall(r'\b[A-Z][a-z]+\b', prompt)

        # Look for common database entities
        db_entities = re.findall(r'\b(?:users?|customers?|products?|orders?|invoices?|clients?)\b', prompt, re.IGNORECASE)

        all_entities = list(set(entities + [e.capitalize() for e in db_entities]))

        return all_entities

    def suggest_patterns(self, prompt: str) -> List[Dict[str, Any]]:
        """
        Suggest relevant patterns based on prompt

        Returns:
            List of pattern suggestions with relevance scores
        """
        suggestions = []

        request_type = self._detect_request_type(prompt)

        # Map request types to patterns
        type_to_patterns = {
            'crud': ['crud-pattern'],
            'form': ['form-pattern', 'crud-pattern'],
            'api': ['api-pattern'],
            'authentication': ['auth-pattern'],
            'ui': ['crud-pattern', 'form-pattern'],
        }

        # Get primary patterns
        primary_patterns = type_to_patterns.get(request_type, [])

        for pattern_name in primary_patterns:
            if pattern_name in self.patterns:
                suggestions.append({
                    'name': pattern_name,
                    'relevance': 'high',
                    'content': self.patterns[pattern_name][:500] + '...',  # Preview
                    'path': str(self.patterns_dir / f'{pattern_name}.md')
                })

        # Add secondary patterns based on keywords
        prompt_lower = prompt.lower()

        if 'dashboard' in prompt_lower and 'dashboard-pattern' in self.patterns:
            suggestions.append({
                'name': 'dashboard-pattern',
                'relevance': 'medium',
                'path': str(self.patterns_dir / 'dashboard-pattern.md')
            })

        if 'table' in prompt_lower and 'data-table-pattern' in self.patterns:
            suggestions.append({
                'name': 'data-table-pattern',
                'relevance': 'medium',
                'path': str(self.patterns_dir / 'data-table-pattern.md')
            })

        return suggestions

    def _suggest_file_paths(self, prompt: str, project_config: Dict[str, Any]) -> List[str]:
        """Suggest file paths based on prompt and project patterns"""

        file_paths = []
        features = self._extract_features(prompt)
        request_type = self._detect_request_type(prompt)

        patterns = project_config.get('patterns', {})

        # Generate paths for each feature
        for feature in features[:3]:  # Limit to first 3 features
            if request_type in ['crud', 'form', 'ui']:
                # Component path
                component_pattern = patterns.get('component_path', 'components/{feature}/{ComponentName}.tsx')
                component_path = component_pattern.format(
                    feature=feature,
                    ComponentName=feature.capitalize()
                )
                file_paths.append(component_path)

                # Page path
                page_pattern = patterns.get('page_path', 'app/(dashboard)/{feature}/page.tsx')
                page_path = page_pattern.format(feature=feature)
                file_paths.append(page_path)

                # Server action path
                action_pattern = patterns.get('server_action_path', 'app/actions/{feature}.ts')
                action_path = action_pattern.format(feature=feature)
                file_paths.append(action_path)

            if request_type == 'api':
                # API route path
                api_pattern = patterns.get('api_path', 'app/api/{feature}/route.ts')
                api_path = api_pattern.format(feature=feature)
                file_paths.append(api_path)

            # Types
            type_pattern = patterns.get('type_path', 'types/{feature}.ts')
            type_path = type_pattern.format(feature=feature)
            file_paths.append(type_path)

        return file_paths

    def _estimate_complexity(self, prompt: str) -> str:
        """Estimate task complexity (low/medium/high)"""

        complexity_indicators = {
            'high': [
                'refactor', 'redesign', 'migrate', 'rebuild', 'rewrite',
                'architecture', 'integrate', 'payment', 'authentication',
                'multi-step', 'complex', 'advanced'
            ],
            'medium': [
                'add', 'create', 'implement', 'update', 'modify',
                'form', 'api', 'crud', 'dashboard'
            ],
            'low': [
                'fix', 'change', 'update', 'adjust', 'tweak',
                'typo', 'style', 'color', 'text'
            ]
        }

        prompt_lower = prompt.lower()

        # Count indicators
        high_count = sum(1 for word in complexity_indicators['high'] if word in prompt_lower)
        medium_count = sum(1 for word in complexity_indicators['medium'] if word in prompt_lower)
        low_count = sum(1 for word in complexity_indicators['low'] if word in prompt_lower)

        # Estimate based on word count
        word_count = len(prompt.split())

        if high_count > 0 or word_count > 100:
            return 'high'
        elif medium_count > 0 or word_count > 50:
            return 'medium'
        else:
            return 'low'

    def _requires_authentication(self, prompt: str) -> bool:
        """Check if request involves authentication"""
        auth_keywords = ['auth', 'login', 'signup', 'password', 'user', 'session', 'token']
        return any(keyword in prompt.lower() for keyword in auth_keywords)

    def _requires_database(self, prompt: str) -> bool:
        """Check if request involves database operations"""
        db_keywords = ['database', 'table', 'query', 'create', 'update', 'delete', 'fetch', 'store', 'save']
        return any(keyword in prompt.lower() for keyword in db_keywords)

    def _suggest_imports(self, prompt: str, project_config: Dict[str, Any]) -> List[str]:
        """Suggest relevant imports based on request"""

        imports = []

        # Common imports from config
        common_imports = project_config.get('common_imports', '')
        if common_imports:
            imports.extend(common_imports.strip().split('\n'))

        request_type = self._detect_request_type(prompt)

        # Add type-specific imports
        if request_type == 'form':
            imports.extend([
                "import { useFormState, useFormStatus } from 'react-dom'",
                "import { z } from 'zod'",
            ])

        if request_type == 'authentication':
            imports.append("import { createClient } from '@/lib/supabase/server'")

        if self._requires_database(prompt):
            imports.append("import { createClient } from '@/lib/supabase/server'")

        # Remove duplicates
        return list(dict.fromkeys(imports))

    def find_similar_code(self, prompt: str, project_path: Path, threshold: float = 0.7) -> List[Dict[str, Any]]:
        """
        Find similar existing code in the project

        Args:
            prompt: User's prompt
            project_path: Path to project
            threshold: Similarity threshold (0-1)

        Returns:
            List of similar files with scores
        """
        similar_files = []

        features = self._extract_features(prompt)
        request_type = self._detect_request_type(prompt)

        # Search for files related to features
        for feature in features:
            # Look for components
            component_pattern = f"**/{feature}*.tsx"
            for file_path in project_path.glob(component_pattern):
                similarity = self._calculate_similarity(prompt, file_path.stem)

                if similarity >= threshold:
                    similar_files.append({
                        'path': str(file_path.relative_to(project_path)),
                        'similarity': similarity,
                        'reason': f'Matches feature: {feature}'
                    })

        return sorted(similar_files, key=lambda x: x['similarity'], reverse=True)[:5]

    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two strings"""
        return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()
