"""
Test suite for prompt enhancement quality
"""

import pytest
import asyncio
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))

from lib.enhancer import PromptEnhancer
from lib.smart_context import SmartContextManager


@pytest.fixture
def config():
    """Test configuration"""
    return {
        'anthropic': {
            'api_key': 'test-key',
            'model': 'claude-sonnet-4-20250514',
            'temperature': 0.3,
            'max_tokens': 4096
        },
        'patterns': {
            'library_path': '.claude/patterns'
        }
    }


@pytest.fixture
def context_manager(config):
    """Context manager instance"""
    return SmartContextManager(config)


class TestEnhancement:
    """Test prompt enhancement quality"""

    def test_request_type_detection(self, context_manager):
        """Test request type detection accuracy"""

        test_cases = [
            ("Add user authentication", "authentication"),
            ("Create a form for user input", "form"),
            ("Build CRUD operations for products", "crud"),
            ("Add API endpoint for users", "api"),
            ("Update documentation", "documentation"),
        ]

        for prompt, expected_type in test_cases:
            detected = context_manager._detect_request_type(prompt)
            assert detected == expected_type, f"Failed for: {prompt}"

    def test_complexity_estimation(self, context_manager):
        """Test complexity estimation"""

        test_cases = [
            ("Fix typo in button text", "low"),
            ("Add user profile page", "medium"),
            ("Refactor entire authentication system", "high"),
        ]

        for prompt, expected_complexity in test_cases:
            complexity = context_manager._estimate_complexity(prompt)
            assert complexity == expected_complexity

    def test_feature_extraction(self, context_manager):
        """Test feature name extraction"""

        prompt = "Add user authentication feature with login and signup"
        features = context_manager._extract_features(prompt)

        assert len(features) > 0
        assert any('user' in f.lower() for f in features)

    def test_entity_extraction(self, context_manager):
        """Test entity extraction"""

        prompt = "Create User profile with Customer data and Order history"
        entities = context_manager._extract_entities(prompt)

        assert 'User' in entities
        assert 'Customer' in entities
        assert 'Order' in entities

    def test_pattern_suggestion(self, context_manager):
        """Test pattern suggestion relevance"""

        # CRUD prompt should suggest crud-pattern
        crud_prompt = "Build CRUD for products"
        suggestions = context_manager.suggest_patterns(crud_prompt)

        crud_suggested = any('crud' in s['name'].lower() for s in suggestions)
        assert crud_suggested, "CRUD pattern should be suggested"

        # Auth prompt should suggest auth-pattern
        auth_prompt = "Add user login"
        suggestions = context_manager.suggest_patterns(auth_prompt)

        auth_suggested = any('auth' in s['name'].lower() for s in suggestions)
        assert auth_suggested, "Auth pattern should be suggested"

    def test_import_suggestions(self, context_manager):
        """Test import suggestions"""

        project_config = {
            'common_imports': 'import { createClient } from "@/lib/supabase/server"'
        }

        # Form request should include form-related imports
        imports = context_manager._suggest_imports(
            "Create a form",
            project_config
        )

        assert len(imports) > 0
        assert any('useFormState' in imp for imp in imports)

    def test_file_path_generation(self, context_manager):
        """Test file path generation"""

        project_config = {
            'patterns': {
                'component_path': 'components/{feature}/{ComponentName}.tsx',
                'page_path': 'app/(dashboard)/{feature}/page.tsx',
            }
        }

        paths = context_manager._suggest_file_paths(
            "Add product management",
            project_config
        )

        assert len(paths) > 0
        assert any('product' in path.lower() for path in paths)

    def test_requires_auth_detection(self, context_manager):
        """Test authentication requirement detection"""

        assert context_manager._requires_authentication("Add user login")
        assert context_manager._requires_authentication("Implement signup")
        assert not context_manager._requires_authentication("Add button")

    def test_requires_database_detection(self, context_manager):
        """Test database requirement detection"""

        assert context_manager._requires_database("Create users table")
        assert context_manager._requires_database("Update product data")
        assert not context_manager._requires_database("Change button color")


class TestEnhancementQuality:
    """Test enhancement output quality"""

    def test_enhancement_structure(self):
        """Test that enhancement has required structure"""

        mock_response = """
        ENHANCED_PROMPT:
        Add user authentication with email/password login.

        IMPROVEMENTS:
        - Added specific file paths
        - Included error handling

        COMPLEXITY: medium

        FOCUS_AREAS:
        - Authentication logic
        - Form validation
        """

        from lib.enhancer import PromptEnhancer
        enhancer = PromptEnhancer({'anthropic': {'api_key': 'test', 'model': 'test'}})

        result = enhancer._parse_enhancement_response(mock_response)

        assert 'prompt' in result
        assert 'improvements' in result
        assert 'complexity' in result
        assert 'focus_areas' in result

        assert result['complexity'] in ['low', 'medium', 'high']
        assert len(result['improvements']) > 0

    def test_complexity_estimation_accuracy(self):
        """Test complexity estimation"""

        from lib.enhancer import PromptEnhancer
        enhancer = PromptEnhancer({'anthropic': {'api_key': 'test', 'model': 'test'}})

        test_cases = [
            ("Fix typo", "low"),
            ("Add new feature", "medium"),
            ("Refactor architecture", "high"),
        ]

        for prompt, expected in test_cases:
            result = enhancer.estimate_complexity(prompt, {})
            assert result == expected


@pytest.mark.asyncio
class TestAsyncEnhancement:
    """Test async enhancement operations"""

    async def test_context_loading(self):
        """Test context loading"""
        # Would test actual context loading
        # Skipped for now as it requires real project
        pass


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
