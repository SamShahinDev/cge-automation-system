"""
Test suite for auto-approval safety rules
"""

import pytest
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))

from lib.auto_approval import AutoApprovalEngine


@pytest.fixture
def config():
    """Test configuration"""
    return {
        'review': {
            'auto_approve_patterns': [
                r'add.*field.*database',
                r'create.*type.*interface',
                r'update.*documentation',
            ],
            'require_review_patterns': [
                r'delete',
                r'payment',
                r'authentication',
                r'security',
                r'password',
            ],
            'complexity_thresholds': {
                'low_max_files': 3,
                'medium_max_files': 10,
                'high_min_files': 11
            }
        }
    }


@pytest.fixture
def engine(config):
    """Auto-approval engine instance"""
    return AutoApprovalEngine(config)


class TestSafePatterns:
    """Test safe pattern matching"""

    def test_safe_pattern_approval(self, engine):
        """Test that safe patterns are approved"""

        safe_prompts = [
            "Add field to database",
            "Create type interface",
            "Update documentation",
        ]

        for prompt in safe_prompts:
            is_safe, reason = engine._check_safe_patterns(prompt)
            assert is_safe, f"Should approve: {prompt}"

    def test_non_safe_patterns(self, engine):
        """Test that non-safe patterns aren't auto-approved"""

        prompts = [
            "Implement payment processing",
            "Delete all users",
        ]

        for prompt in prompts:
            is_safe, _ = engine._check_safe_patterns(prompt)
            assert not is_safe


class TestDangerPatterns:
    """Test danger pattern detection"""

    def test_danger_pattern_detection(self, engine):
        """Test that dangerous patterns are detected"""

        dangerous_prompts = [
            "Delete all records",
            "Add payment processing",
            "Implement authentication",
            "Store password",
            "Security bypass",
        ]

        for prompt in dangerous_prompts:
            has_danger, reason = engine._check_danger_patterns(prompt)
            assert has_danger, f"Should detect danger in: {prompt}"

    def test_safe_prompts_no_danger(self, engine):
        """Test that safe prompts don't trigger danger detection"""

        safe_prompts = [
            "Add button",
            "Update styling",
            "Create component",
        ]

        for prompt in safe_prompts:
            has_danger, _ = engine._check_danger_patterns(prompt)
            assert not has_danger, f"False positive: {prompt}"


class TestDestructiveOperations:
    """Test destructive operation detection"""

    def test_destructive_detection(self, engine):
        """Test detection of destructive operations"""

        destructive_prompts = [
            "Delete user data",
            "Remove all files",
            "Drop table users",
            "Truncate database",
            "rm -rf directory",
            "Force push to main",
        ]

        for prompt in destructive_prompts:
            is_destructive, reason = engine._check_destructive_operations(prompt)
            assert is_destructive, f"Should detect destruction in: {prompt}"

    def test_non_destructive_operations(self, engine):
        """Test that non-destructive ops aren't flagged"""

        safe_prompts = [
            "Create new user",
            "Add table column",
            "Update user profile",
        ]

        for prompt in safe_prompts:
            is_destructive, _ = engine._check_destructive_operations(prompt)
            assert not is_destructive


class TestRiskScoring:
    """Test risk score calculation"""

    def test_low_risk_score(self, engine):
        """Test low risk scoring"""

        analysis = {
            'complexity': 'low',
            'file_paths': ['style.css'],
            'request_type': 'ui'
        }

        score = engine.estimate_risk_score("Update button color", analysis)
        assert score <= 30, f"Score too high for low risk: {score}"

    def test_high_risk_score(self, engine):
        """Test high risk scoring"""

        analysis = {
            'complexity': 'high',
            'file_paths': [f'file{i}.ts' for i in range(15)],
            'request_type': 'authentication',
            'requires_auth': True
        }

        score = engine.estimate_risk_score("Delete authentication system", analysis)
        assert score >= 60, f"Score too low for high risk: {score}"

    def test_risk_level_classification(self, engine):
        """Test risk level classification"""

        assert engine._get_risk_level(10) == 'very_low'
        assert engine._get_risk_level(30) == 'low'
        assert engine._get_risk_level(50) == 'medium'
        assert engine._get_risk_level(70) == 'high'
        assert engine._get_risk_level(90) == 'very_high'


class TestComplexityThresholds:
    """Test complexity-based approval"""

    def test_low_complexity_approval(self, engine):
        """Test that low complexity with few files is approved"""

        analysis = {
            'complexity': 'low',
            'file_paths': ['style.css', 'component.tsx'],
            'request_type': 'ui'
        }

        can_approve, reason, warnings = engine.should_auto_approve(
            "Update button style",
            "Update button style with new colors",
            analysis
        )

        assert can_approve

    def test_high_file_count_rejection(self, engine):
        """Test that high file count requires review"""

        analysis = {
            'complexity': 'medium',
            'file_paths': [f'file{i}.ts' for i in range(15)],
            'request_type': 'feature'
        }

        can_approve, reason, warnings = engine.should_auto_approve(
            "Add feature",
            "Add feature with many changes",
            analysis
        )

        assert not can_approve
        assert 'Too many files' in reason


class TestApprovalRecommendations:
    """Test approval recommendation generation"""

    def test_recommendation_structure(self, engine):
        """Test recommendation output structure"""

        analysis = {
            'complexity': 'medium',
            'file_paths': ['app.tsx', 'types.ts'],
            'request_type': 'feature'
        }

        recommendation = engine.get_approval_recommendation(
            "Add feature",
            "Add user profile feature",
            analysis
        )

        assert 'can_auto_approve' in recommendation
        assert 'confidence' in recommendation
        assert 'risk_score' in recommendation
        assert 'reason' in recommendation
        assert 'warnings' in recommendation
        assert 'recommendations' in recommendation
        assert 'risk_level' in recommendation

    def test_confidence_calculation(self, engine):
        """Test confidence calculation"""

        # Low risk should have high confidence
        low_risk_analysis = {
            'complexity': 'low',
            'file_paths': ['style.css'],
            'request_type': 'ui'
        }

        rec = engine.get_approval_recommendation(
            "Update color",
            "Update button color to blue",
            low_risk_analysis
        )

        if rec['can_auto_approve']:
            assert rec['confidence'] >= 0.6


class TestEdgeCases:
    """Test edge cases"""

    def test_empty_prompt(self, engine):
        """Test handling of empty prompt"""

        analysis = {
            'complexity': 'low',
            'file_paths': [],
            'request_type': 'general'
        }

        can_approve, reason, warnings = engine.should_auto_approve(
            "",
            "",
            analysis
        )

        assert not can_approve

    def test_ambiguous_prompt(self, engine):
        """Test handling of ambiguous prompts"""

        analysis = {
            'complexity': 'medium',
            'file_paths': ['app.tsx'],
            'request_type': 'general'
        }

        can_approve, reason, warnings = engine.should_auto_approve(
            "Make changes",
            "Make some changes to the app",
            analysis
        )

        # Ambiguous prompts should require review
        assert not can_approve


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
