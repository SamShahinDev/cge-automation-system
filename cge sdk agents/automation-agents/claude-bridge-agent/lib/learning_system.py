"""
Learning System
Tracks enhancements and outcomes to improve future suggestions
"""

import json
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
from difflib import SequenceMatcher

sys.path.append(str(Path(__file__).parent.parent.parent / "code-review-agent"))
from logger import get_logger

logger = get_logger(__name__)


class LearningSystem:
    """
    Tracks and learns from enhancement history

    Features:
    - Store prompt enhancement pairs
    - Track outcomes (success/failure)
    - Find similar past enhancements
    - Suggest based on similarity
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        learning_config = config.get('learning', {})

        self.enabled = learning_config.get('enabled', True)
        self.storage_path = Path(__file__).parent.parent / learning_config.get('storage_path', 'data/learning')
        self.similarity_threshold = learning_config.get('similarity_threshold', 0.75)
        self.max_history = learning_config.get('max_history', 1000)

        # Create storage directory
        self.storage_path.mkdir(parents=True, exist_ok=True)

        self.history_file = self.storage_path / 'enhancement_history.jsonl'
        self.outcomes_file = self.storage_path / 'outcomes.jsonl'

        logger.info(f"Learning system initialized (enabled={self.enabled})")

    def record_enhancement(
        self,
        session_id: str,
        original_prompt: str,
        enhanced_prompt: str,
        context: Dict[str, Any],
        analysis: Dict[str, Any]
    ):
        """Record an enhancement"""

        if not self.enabled:
            return

        record = {
            'session_id': session_id,
            'timestamp': datetime.now().isoformat(),
            'original_prompt': original_prompt,
            'enhanced_prompt': enhanced_prompt,
            'request_type': analysis.get('request_type'),
            'complexity': analysis.get('complexity'),
            'features': analysis.get('features_mentioned', []),
            'patterns_used': [p['name'] for p in analysis.get('suggested_patterns', [])],
            'context_files_count': len(context.get('files', [])),
        }

        # Append to history file
        with open(self.history_file, 'a') as f:
            f.write(json.dumps(record) + '\n')

        logger.info(f"Recorded enhancement for session {session_id}")

        # Cleanup old records if needed
        self._cleanup_old_records()

    def record_outcome(
        self,
        session_id: str,
        success: bool,
        execution_time: Optional[float] = None,
        error: Optional[str] = None,
        files_changed: Optional[List[str]] = None
    ):
        """Record the outcome of an execution"""

        if not self.enabled:
            return

        record = {
            'session_id': session_id,
            'timestamp': datetime.now().isoformat(),
            'success': success,
            'execution_time': execution_time,
            'error': error,
            'files_changed': files_changed or [],
        }

        with open(self.outcomes_file, 'a') as f:
            f.write(json.dumps(record) + '\n')

        logger.info(f"Recorded outcome for session {session_id}: {'success' if success else 'failure'}")

    def find_similar_enhancements(
        self,
        prompt: str,
        request_type: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find similar past enhancements

        Args:
            prompt: Current prompt to compare
            request_type: Optional filter by request type
            limit: Max results to return

        Returns:
            List of similar enhancements with similarity scores
        """

        if not self.enabled or not self.history_file.exists():
            return []

        similar = []

        # Read history
        with open(self.history_file, 'r') as f:
            for line in f:
                record = json.loads(line.strip())

                # Filter by request type if provided
                if request_type and record.get('request_type') != request_type:
                    continue

                # Calculate similarity
                similarity = self._calculate_similarity(
                    prompt,
                    record['original_prompt']
                )

                if similarity >= self.similarity_threshold:
                    # Get outcome for this session
                    outcome = self._get_outcome(record['session_id'])

                    similar.append({
                        'session_id': record['session_id'],
                        'similarity': similarity,
                        'original_prompt': record['original_prompt'],
                        'enhanced_prompt': record['enhanced_prompt'],
                        'patterns_used': record.get('patterns_used', []),
                        'complexity': record.get('complexity'),
                        'outcome': outcome,
                        'timestamp': record['timestamp'],
                    })

        # Sort by similarity
        similar.sort(key=lambda x: x['similarity'], reverse=True)

        return similar[:limit]

    def get_success_rate(self, request_type: Optional[str] = None) -> Dict[str, Any]:
        """Get success rate statistics"""

        if not self.enabled or not self.outcomes_file.exists():
            return {'total': 0, 'successes': 0, 'failures': 0, 'rate': 0}

        total = 0
        successes = 0

        with open(self.outcomes_file, 'r') as f:
            for line in f:
                outcome = json.loads(line.strip())

                # Filter by request type if needed
                if request_type:
                    # Get corresponding enhancement
                    enhancement = self._get_enhancement(outcome['session_id'])
                    if enhancement and enhancement.get('request_type') != request_type:
                        continue

                total += 1
                if outcome['success']:
                    successes += 1

        return {
            'total': total,
            'successes': successes,
            'failures': total - successes,
            'rate': (successes / total * 100) if total > 0 else 0
        }

    def get_popular_patterns(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get most frequently used patterns"""

        if not self.enabled or not self.history_file.exists():
            return []

        pattern_counts = {}

        with open(self.history_file, 'r') as f:
            for line in f:
                record = json.loads(line.strip())
                for pattern in record.get('patterns_used', []):
                    pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1

        # Sort by count
        sorted_patterns = sorted(
            pattern_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )

        return [
            {'pattern': pattern, 'count': count}
            for pattern, count in sorted_patterns[:limit]
        ]

    def suggest_from_history(self, prompt: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate suggestions based on learning history

        Returns:
            Suggestions including similar past prompts and their outcomes
        """

        if not self.enabled:
            return {}

        request_type = analysis.get('request_type')

        # Find similar past enhancements
        similar = self.find_similar_enhancements(prompt, request_type, limit=3)

        # Get success rate for this request type
        success_rate = self.get_success_rate(request_type)

        # Get popular patterns
        popular_patterns = self.get_popular_patterns(limit=3)

        suggestions = {
            'similar_past_prompts': similar,
            'success_rate': success_rate,
            'popular_patterns': popular_patterns,
            'recommendations': []
        }

        # Generate recommendations
        if similar:
            best_match = similar[0]
            if best_match['outcome'] and best_match['outcome']['success']:
                suggestions['recommendations'].append(
                    f"Similar task succeeded using patterns: {', '.join(best_match['patterns_used'])}"
                )

        if success_rate['rate'] < 50 and success_rate['total'] > 5:
            suggestions['recommendations'].append(
                f"Low success rate ({success_rate['rate']:.1f}%) for {request_type} tasks. Consider reviewing the enhanced prompt carefully."
            )

        return suggestions

    def _get_enhancement(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get enhancement record by session ID"""

        if not self.history_file.exists():
            return None

        with open(self.history_file, 'r') as f:
            for line in f:
                record = json.loads(line.strip())
                if record['session_id'] == session_id:
                    return record

        return None

    def _get_outcome(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get outcome record by session ID"""

        if not self.outcomes_file.exists():
            return None

        with open(self.outcomes_file, 'r') as f:
            for line in f:
                record = json.loads(line.strip())
                if record['session_id'] == session_id:
                    return record

        return None

    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two strings (0-1)"""
        return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()

    def _cleanup_old_records(self):
        """Remove old records if exceeding max_history"""

        if not self.history_file.exists():
            return

        # Count records
        with open(self.history_file, 'r') as f:
            records = f.readlines()

        if len(records) > self.max_history:
            # Keep only the most recent max_history records
            with open(self.history_file, 'w') as f:
                f.writelines(records[-self.max_history:])

            logger.info(f"Cleaned up old records, kept {self.max_history} most recent")
