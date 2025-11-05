"""
Test suite for Claude Code executor
"""

import pytest
import asyncio
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))

from lib.executor import ClaudeCodeExecutor


@pytest.fixture
def config():
    """Test configuration"""
    return {
        'claude_code': {
            'binary_path': 'claude-code',
            'timeout': 60
        }
    }


@pytest.fixture
def executor(config):
    """Executor instance"""
    return ClaudeCodeExecutor(config)


class TestQuestionDetection:
    """Test question detection in Claude Code output"""

    def test_question_mark_detection(self, executor):
        """Test detection of questions ending with ?"""

        assert executor._is_question("Should I proceed with this change?")
        assert executor._is_question("Do you want to continue?")
        assert not executor._is_question("This is a statement.")

    def test_yn_prompt_detection(self, executor):
        """Test detection of [Y/n] prompts"""

        assert executor._is_question("Continue? [Y/n]")
        assert executor._is_question("Overwrite file? [y/N]")
        assert not executor._is_question("File saved")

    def test_common_question_patterns(self, executor):
        """Test common question patterns"""

        questions = [
            "Do you want to create this file?",
            "Should I add tests?",
            "Would you like to continue?",
            "Confirm: delete this file?",
        ]

        for question in questions:
            assert executor._is_question(question), f"Failed to detect: {question}"

    def test_not_questions(self, executor):
        """Test that non-questions aren't detected"""

        non_questions = [
            "File created successfully",
            "Running tests...",
            "Completed in 5 seconds",
        ]

        for text in non_questions:
            assert not executor._is_question(text), f"False positive: {text}"


class TestCommandBuilding:
    """Test command building"""

    def test_basic_command(self, executor):
        """Test basic command construction"""

        cmd = executor._build_command(
            "Add user authentication",
            "/path/to/project"
        )

        assert cmd[0] == 'claude-code'
        assert 'chat' in cmd
        assert '--prompt' in cmd
        assert 'Add user authentication' in cmd
        assert '--project' in cmd
        assert '/path/to/project' in cmd


@pytest.mark.asyncio
class TestExecutionMonitoring:
    """Test execution monitoring"""

    async def test_output_parsing(self, executor):
        """Test parsing of execution output"""
        # Mock test - would need actual subprocess
        pass

    async def test_timeout_handling(self, executor):
        """Test timeout handling"""
        # Mock test - would test timeout behavior
        pass


class TestErrorHandling:
    """Test error handling in executor"""

    def test_timeout_error(self, executor):
        """Test timeout error handling"""
        # Would test actual timeout
        pass

    def test_process_failure(self, executor):
        """Test process failure handling"""
        # Would test process errors
        pass


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
