"""
Pytest configuration and shared fixtures
"""

import pytest
import asyncio
from pathlib import Path


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_config():
    """Shared test configuration"""
    return {
        'anthropic': {
            'api_key': 'test-api-key',
            'model': 'claude-sonnet-4-20250514',
            'temperature': 0.3,
            'max_tokens': 4096
        },
        'claude_code': {
            'binary_path': 'claude-code',
            'timeout': 60
        },
        'review': {
            'auto_approve_patterns': [
                r'add.*field',
                r'update.*docs',
            ],
            'require_review_patterns': [
                r'delete',
                r'payment',
            ],
            'complexity_thresholds': {
                'low_max_files': 3,
                'medium_max_files': 10,
                'high_min_files': 11
            }
        },
        'patterns': {
            'library_path': '.claude/patterns'
        }
    }


@pytest.fixture
def temp_project(tmp_path):
    """Create temporary project for testing"""
    project_dir = tmp_path / "test_project"
    project_dir.mkdir()

    # Create basic structure
    (project_dir / "src").mkdir()
    (project_dir / "src" / "app.tsx").write_text("// Test file")

    return project_dir
