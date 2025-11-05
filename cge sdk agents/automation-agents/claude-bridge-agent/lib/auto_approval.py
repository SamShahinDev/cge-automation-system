"""
Auto-Approval Engine
Intelligently determines if enhanced prompts can be auto-approved
"""

import re
import sys
from pathlib import Path
from typing import Dict, Any, Tuple, List

sys.path.append(str(Path(__file__).parent.parent.parent / "code-review-agent"))
from logger import get_logger

logger = get_logger(__name__)


class AutoApprovalEngine:
    """
    Determines if enhanced prompts can be auto-approved

    Safety checks:
    - Pattern matching against safe/danger lists
    - Complexity scoring
    - File count limits
    - Destructive operation detection
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        review_config = config.get('review', {})

        self.safe_patterns = review_config.get('auto_approve_patterns', [])
        self.danger_patterns = review_config.get('require_review_patterns', [])

        self.complexity_thresholds = review_config.get('complexity_thresholds', {
            'low_max_files': 3,
            'medium_max_files': 10,
            'high_min_files': 11
        })

        logger.info(f"Auto-approval engine initialized with {len(self.safe_patterns)} safe patterns")

    def should_auto_approve(
        self,
        original: str,
        enhanced: str,
        analysis: Dict[str, Any]
    ) -> Tuple[bool, str, List[str]]:
        """
        Determine if prompt can be auto-approved

        Args:
            original: Original prompt
            enhanced: Enhanced prompt
            analysis: Analysis from SmartContextManager

        Returns:
            (can_approve, reason, warnings)
        """
        warnings = []

        # Check 1: Danger patterns (highest priority)
        has_danger, danger_reason = self._check_danger_patterns(enhanced)
        if has_danger:
            return (False, danger_reason, warnings)

        # Check 2: Complexity
        complexity = analysis.get('complexity', 'medium')
        if complexity == 'high':
            warnings.append('High complexity task')

        # Check 3: File count
        file_paths = analysis.get('file_paths', [])
        if len(file_paths) > self.complexity_thresholds['high_min_files']:
            return (
                False,
                f'Too many files ({len(file_paths)}). Requires manual review.',
                warnings
            )

        # Check 4: Destructive operations
        is_destructive, destructive_reason = self._check_destructive_operations(enhanced)
        if is_destructive:
            return (False, destructive_reason, warnings)

        # Check 5: Safe patterns
        is_safe, safe_reason = self._check_safe_patterns(original)
        if is_safe:
            return (True, safe_reason, warnings)

        # Check 6: Low complexity auto-approve
        if complexity == 'low' and len(file_paths) <= self.complexity_thresholds['low_max_files']:
            warnings.append('Auto-approved due to low complexity')
            return (True, 'Low complexity task with few files', warnings)

        # Default: require review
        return (False, 'Default: manual review required', warnings)

    def _check_danger_patterns(self, text: str) -> Tuple[bool, str]:
        """Check for dangerous patterns"""

        text_lower = text.lower()

        for pattern in self.danger_patterns:
            if re.search(pattern, text_lower):
                return (True, f'Contains dangerous pattern: {pattern}')

        return (False, '')

    def _check_safe_patterns(self, text: str) -> Tuple[bool, str]:
        """Check for safe patterns"""

        text_lower = text.lower()

        for pattern in self.safe_patterns:
            if re.search(pattern, text_lower):
                return (True, f'Matches safe pattern: {pattern}')

        return (False, '')

    def _check_destructive_operations(self, text: str) -> Tuple[bool, str]:
        """Check for destructive operations"""

        destructive_keywords = [
            r'\bdelete\b',
            r'\bremove\b',
            r'\bdrop\s+table\b',
            r'\btruncate\b',
            r'\brm\s+-rf\b',
            r'\bforce\s+push\b',
            r'\b--force\b',
            r'\bdestroy\b',
        ]

        text_lower = text.lower()

        for keyword in destructive_keywords:
            if re.search(keyword, text_lower):
                return (True, f'Contains destructive operation: {keyword}')

        return (False, '')

    def estimate_risk_score(self, enhanced: str, analysis: Dict[str, Any]) -> int:
        """
        Estimate risk score (0-100)

        Returns:
            Risk score where:
            0-20: Very low risk
            21-40: Low risk
            41-60: Medium risk
            61-80: High risk
            81-100: Very high risk
        """

        score = 0

        # Complexity
        complexity = analysis.get('complexity', 'medium')
        if complexity == 'low':
            score += 10
        elif complexity == 'medium':
            score += 30
        else:  # high
            score += 50

        # File count
        file_count = len(analysis.get('file_paths', []))
        if file_count > 10:
            score += 20
        elif file_count > 5:
            score += 10

        # Danger patterns
        text_lower = enhanced.lower()
        danger_count = sum(
            1 for pattern in self.danger_patterns
            if re.search(pattern, text_lower)
        )
        score += danger_count * 15

        # Destructive operations
        if self._check_destructive_operations(enhanced)[0]:
            score += 25

        # Authentication/security related
        if analysis.get('requires_auth'):
            score += 10

        # Database changes
        if 'database' in analysis.get('request_type', ''):
            score += 15

        return min(score, 100)

    def get_approval_recommendation(
        self,
        original: str,
        enhanced: str,
        analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Get comprehensive approval recommendation

        Returns:
            {
                'can_auto_approve': bool,
                'confidence': float (0-1),
                'risk_score': int (0-100),
                'reason': str,
                'warnings': list,
                'recommendations': list
            }
        """

        can_approve, reason, warnings = self.should_auto_approve(original, enhanced, analysis)
        risk_score = self.estimate_risk_score(enhanced, analysis)

        # Calculate confidence
        if can_approve and risk_score < 20:
            confidence = 0.95
        elif can_approve and risk_score < 40:
            confidence = 0.80
        elif can_approve:
            confidence = 0.60
        else:
            confidence = 0.0

        # Generate recommendations
        recommendations = []

        if risk_score > 60:
            recommendations.append('Review enhanced prompt carefully before approving')

        if len(analysis.get('file_paths', [])) > 5:
            recommendations.append('Check that all file paths are correct')

        if analysis.get('complexity') == 'high':
            recommendations.append('Consider breaking into smaller tasks')

        if analysis.get('requires_auth'):
            recommendations.append('Verify authentication implementation follows security best practices')

        return {
            'can_auto_approve': can_approve,
            'confidence': confidence,
            'risk_score': risk_score,
            'reason': reason,
            'warnings': warnings,
            'recommendations': recommendations,
            'risk_level': self._get_risk_level(risk_score)
        }

    def _get_risk_level(self, score: int) -> str:
        """Convert risk score to level"""
        if score <= 20:
            return 'very_low'
        elif score <= 40:
            return 'low'
        elif score <= 60:
            return 'medium'
        elif score <= 80:
            return 'high'
        else:
            return 'very_high'
