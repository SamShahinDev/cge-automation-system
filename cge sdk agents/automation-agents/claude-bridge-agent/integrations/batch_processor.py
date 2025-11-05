"""
Batch Processing
Process multiple features from planning documents
"""

import re
import sys
import asyncio
from pathlib import Path
from typing import Dict, Any, List
from dataclasses import dataclass

sys.path.append(str(Path(__file__).parent.parent.parent / "code-review-agent"))
from logger import get_logger

logger = get_logger(__name__)


@dataclass
class Feature:
    """Represents a feature to implement"""
    title: str
    description: str
    priority: int = 5
    estimated_complexity: str = 'medium'
    dependencies: List[str] = None

    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []


class BatchProcessor:
    """
    Processes multiple features from planning documents

    Features:
    - Extract features from markdown/text
    - Prioritize features
    - Detect dependencies
    - Queue for execution or review
    """

    def __init__(self, bridge_agent, config: Dict[str, Any]):
        self.bridge = bridge_agent
        self.config = config

    async def process_planning_document(
        self,
        document_path: str,
        project_path: str
    ) -> Dict[str, Any]:
        """
        Process a planning document and extract features

        Args:
            document_path: Path to planning document (markdown/text)
            project_path: Path to project

        Returns:
            Processing results
        """
        logger.info(f"Processing planning document: {document_path}")

        # Read document
        with open(document_path, 'r') as f:
            content = f.read()

        # Extract features
        features = self.extract_features(content)
        logger.info(f"Extracted {len(features)} features")

        # Process each feature
        results = {
            'total_features': len(features),
            'safe_for_execution': [],
            'requires_review': [],
            'failed': [],
            'processed': []
        }

        for i, feature in enumerate(features):
            logger.info(f"Processing feature {i+1}/{len(features)}: {feature.title}")

            try:
                result = await self._process_feature(feature, project_path)
                results['processed'].append(result)

                if result['safe']:
                    results['safe_for_execution'].append(result)
                else:
                    results['requires_review'].append(result)

            except Exception as e:
                logger.error(f"Failed to process feature {feature.title}: {e}")
                results['failed'].append({
                    'feature': feature.title,
                    'error': str(e)
                })

        return results

    def extract_features(self, content: str) -> List[Feature]:
        """
        Extract features from markdown/text content

        Looks for patterns like:
        - ## Enhanced Prompt N: Title
        - Content until ---END PROMPT---
        - ## Feature Name
        - ### Feature Name
        - - [ ] Feature Name
        - 1. Feature Name
        """

        features = []

        # Pattern 1: Enhanced Prompt format (for ENHANCED_PROMPTS.md)
        # Matches: ## Enhanced Prompt 3: Title
        enhanced_prompt_pattern = r'^##\s+Enhanced Prompt\s+(\d+):\s+(.+)$'
        matches = list(re.finditer(enhanced_prompt_pattern, content, re.MULTILINE))

        for i, match in enumerate(matches):
            prompt_num = match.group(1)
            title = match.group(2).strip()

            # Get content until ---END PROMPT--- or next prompt
            start_pos = match.end()
            end_marker = content.find('---END PROMPT---', start_pos)

            if end_marker != -1:
                description = content[start_pos:end_marker].strip()
            else:
                # Find next enhanced prompt or end of content
                if i + 1 < len(matches):
                    description = content[start_pos:matches[i + 1].start()].strip()
                else:
                    description = content[start_pos:].strip()

            # Parse phase from title or surrounding content
            phase_match = re.search(r'Phase (\d+)', content[:match.start()][::-1])
            phase = phase_match.group(1) if phase_match else "Unknown"

            features.append(Feature(
                title=f"Prompt {prompt_num}: {title}",
                description=description,
                priority=int(prompt_num),  # Sequential priority
                estimated_complexity='medium'
            ))

        # Pattern 2: Markdown headers (fallback)
        if not features:
            header_pattern = r'^#{2,3}\s+(.+)$'
            matches = re.finditer(header_pattern, content, re.MULTILINE)

            for match in matches:
                title = match.group(1).strip()

                # Get description (next paragraph)
                start_pos = match.end()
                next_section = content.find('\n##', start_pos)
                description_text = content[start_pos:next_section if next_section != -1 else None]

                # Extract first paragraph as description
                description = description_text.split('\n\n')[0].strip()

                # Estimate priority from keywords
                priority = self._estimate_priority(title, description)

                # Estimate complexity
                complexity = self._estimate_complexity(title, description)

                features.append(Feature(
                    title=title,
                    description=description,
                    priority=priority,
                    estimated_complexity=complexity
                ))

        # Pattern 3: Checkbox items
        checkbox_pattern = r'^\s*-\s+\[\s*\]\s+(.+)$'
        matches = re.finditer(checkbox_pattern, content, re.MULTILINE)

        for match in matches:
            title = match.group(1).strip()

            # Get description from indented text below
            start_pos = match.end()
            next_item = re.search(r'^\s*-\s+\[', content[start_pos:], re.MULTILINE)
            description_text = content[start_pos:start_pos + next_item.start() if next_item else None]

            description = description_text.strip()

            features.append(Feature(
                title=title,
                description=description,
                priority=self._estimate_priority(title, description),
                estimated_complexity=self._estimate_complexity(title, description)
            ))

        # Pattern 4: Numbered lists
        numbered_pattern = r'^\d+\.\s+(.+)$'
        matches = re.finditer(numbered_pattern, content, re.MULTILINE)

        for match in matches:
            title = match.group(1).strip()
            features.append(Feature(
                title=title,
                description='',
                priority=5,
                estimated_complexity='medium'
            ))

        # Sort by priority (higher first for enhanced prompts, they're sequential)
        features.sort(key=lambda f: f.priority, reverse=False)

        return features

    def _estimate_priority(self, title: str, description: str) -> int:
        """
        Estimate priority (1-10, higher is more important)

        Based on keywords
        """

        combined = (title + ' ' + description).lower()

        # High priority keywords
        high_priority = ['critical', 'urgent', 'asap', 'blocker', 'security', 'bug', 'fix']
        if any(kw in combined for kw in high_priority):
            return 10

        # Medium-high priority
        med_high = ['important', 'needed', 'required', 'must']
        if any(kw in combined for kw in med_high):
            return 7

        # Low priority
        low_priority = ['nice to have', 'optional', 'future', 'maybe']
        if any(kw in combined for kw in low_priority):
            return 3

        # Default
        return 5

    def _estimate_complexity(self, title: str, description: str) -> str:
        """Estimate complexity (low/medium/high)"""

        combined = (title + ' ' + description).lower()

        # High complexity indicators
        high_indicators = ['refactor', 'redesign', 'migrate', 'architecture', 'integrate']
        if any(ind in combined for ind in high_indicators):
            return 'high'

        # Low complexity indicators
        low_indicators = ['fix typo', 'update text', 'change color', 'add comment']
        if any(ind in combined for ind in low_indicators):
            return 'low'

        return 'medium'

    async def _process_feature(
        self,
        feature: Feature,
        project_path: str
    ) -> Dict[str, Any]:
        """
        Process a single feature

        Returns:
            Processing result with safe/review status
        """

        # Create prompt from feature
        prompt = self._feature_to_prompt(feature)

        # Enhance prompt
        enhancement_result = await self.bridge.enhance_prompt(
            raw_prompt=prompt,
            project_path=project_path
        )

        # Check if safe for auto-execution
        from lib.auto_approval import AutoApprovalEngine
        approval_engine = AutoApprovalEngine(self.config)

        # Get analysis (would come from SmartContextManager in real implementation)
        analysis = {
            'complexity': feature.estimated_complexity,
            'file_paths': [],
            'request_type': 'feature'
        }

        approval_result = approval_engine.get_approval_recommendation(
            original=prompt,
            enhanced=enhancement_result['enhanced_prompt'],
            analysis=analysis
        )

        return {
            'feature': feature.title,
            'description': feature.description,
            'priority': feature.priority,
            'complexity': feature.estimated_complexity,
            'session_id': enhancement_result.get('session_id'),
            'enhanced_prompt': enhancement_result['enhanced_prompt'],
            'safe': approval_result['can_auto_approve'],
            'risk_score': approval_result['risk_score'],
            'reason': approval_result['reason'],
            'warnings': approval_result['warnings']
        }

    def _feature_to_prompt(self, feature: Feature) -> str:
        """Convert feature to prompt"""

        if feature.description:
            return f"{feature.title}\n\n{feature.description}"
        else:
            return feature.title

    async def queue_for_execution(self, feature_result: Dict[str, Any]):
        """Queue feature for automatic execution"""
        logger.info(f"Queuing for execution: {feature_result['feature']}")
        # Would integrate with execution queue
        pass

    async def queue_for_review(self, feature_result: Dict[str, Any]):
        """Queue feature for manual review"""
        logger.info(f"Queuing for review: {feature_result['feature']}")
        # Would show in review UI
        pass
