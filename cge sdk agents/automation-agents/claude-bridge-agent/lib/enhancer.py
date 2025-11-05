"""
Prompt Enhancement Engine
Uses Claude API to enhance raw prompts with project context
"""

import sys
from pathlib import Path
from typing import Dict, Any, List
from anthropic import Anthropic

sys.path.append(str(Path(__file__).parent.parent.parent / "code-review-agent"))
from logger import get_logger

logger = get_logger(__name__)


class PromptEnhancer:
    """
    Enhances raw prompts with project context

    Features:
    - Analyzes project structure
    - Adds relevant code context
    - Clarifies ambiguous requests
    - Suggests best practices
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.client = Anthropic(api_key=config['anthropic']['api_key'])
        self.model = config['anthropic']['model']

    async def enhance(
        self,
        raw_prompt: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Enhance a raw prompt with project context

        Args:
            raw_prompt: Original user prompt
            context: Project context from ContextManager

        Returns:
            Enhanced prompt with improvements
        """
        logger.info("Enhancing prompt with Claude API")

        # Build enhancement prompt
        enhancement_prompt = self._build_enhancement_prompt(raw_prompt, context)

        # Call Claude API
        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[{
                'role': 'user',
                'content': enhancement_prompt
            }]
        )

        # Parse response
        enhanced_text = response.content[0].text

        # Extract structured data
        result = self._parse_enhancement_response(enhanced_text)

        logger.info(f"Prompt enhanced. Complexity: {result.get('complexity', 'unknown')}")

        return result

    def _build_enhancement_prompt(
        self,
        raw_prompt: str,
        context: Dict[str, Any]
    ) -> str:
        """Build the enhancement prompt for Claude"""

        # Format context files
        files_context = ""
        if context.get('files'):
            files_context = "\n\n## Available Context Files\n"
            for file_info in context['files'][:10]:  # Limit to 10 files
                files_context += f"- {file_info['path']}\n"
                if file_info.get('summary'):
                    files_context += f"  Summary: {file_info['summary']}\n"

        # Format project info
        project_info = ""
        if context.get('project'):
            proj = context['project']
            project_info = f"""
## Project Information
- Name: {proj.get('name', 'Unknown')}
- Type: {proj.get('type', 'Unknown')}
- Framework: {proj.get('framework', 'Unknown')}
- Language: {proj.get('primary_language', 'Unknown')}
"""

        prompt = f"""You are a prompt enhancement expert for Claude Code AI. Your job is to take a raw user prompt and enhance it with project context to make it more precise, actionable, and effective for Claude Code.

## Original User Prompt
{raw_prompt}
{project_info}
{files_context}

## Your Task
Enhance this prompt by:
1. Adding relevant project context
2. Clarifying any ambiguous requests
3. Suggesting specific files/locations to focus on
4. Adding best practices reminders
5. Breaking down complex tasks into clear steps

## Output Format
Provide your response in this EXACT format:

ENHANCED_PROMPT:
[Your enhanced, ready-to-use prompt for Claude Code]

IMPROVEMENTS:
- [List each improvement you made]
- [One improvement per line]

COMPLEXITY: [low/medium/high]

FOCUS_AREAS:
- [Key areas Claude Code should focus on]
- [One per line]

## Guidelines
- Make the enhanced prompt natural and conversational
- Include specific file paths when relevant
- Add context about the project's tech stack
- Suggest checking related files
- Keep it concise but comprehensive
"""

        return prompt

    def _parse_enhancement_response(self, response: str) -> Dict[str, Any]:
        """Parse Claude's enhancement response into structured format"""

        sections = {
            'prompt': '',
            'improvements': [],
            'complexity': 'medium',
            'focus_areas': []
        }

        current_section = None

        for line in response.split('\n'):
            line = line.strip()

            if line.startswith('ENHANCED_PROMPT:'):
                current_section = 'prompt'
                continue
            elif line.startswith('IMPROVEMENTS:'):
                current_section = 'improvements'
                continue
            elif line.startswith('COMPLEXITY:'):
                complexity = line.replace('COMPLEXITY:', '').strip().lower()
                sections['complexity'] = complexity if complexity in ['low', 'medium', 'high'] else 'medium'
                current_section = None
                continue
            elif line.startswith('FOCUS_AREAS:'):
                current_section = 'focus_areas'
                continue

            # Add content to current section
            if current_section == 'prompt' and line:
                sections['prompt'] += line + '\n'
            elif current_section == 'improvements' and line.startswith('-'):
                sections['improvements'].append(line[1:].strip())
            elif current_section == 'focus_areas' and line.startswith('-'):
                sections['focus_areas'].append(line[1:].strip())

        # Clean up prompt
        sections['prompt'] = sections['prompt'].strip()

        # Fallback if parsing failed
        if not sections['prompt']:
            sections['prompt'] = response

        return sections

    def estimate_complexity(self, prompt: str, context: Dict[str, Any]) -> str:
        """
        Estimate task complexity

        Returns:
            'low', 'medium', or 'high'
        """
        # Simple heuristic-based estimation
        indicators = {
            'high': ['refactor', 'redesign', 'migrate', 'rebuild', 'architecture'],
            'medium': ['add', 'implement', 'create', 'update', 'modify'],
            'low': ['fix', 'change', 'update', 'adjust', 'tweak']
        }

        prompt_lower = prompt.lower()

        # Check for high complexity indicators
        if any(indicator in prompt_lower for indicator in indicators['high']):
            return 'high'

        # Check for medium complexity indicators
        if any(indicator in prompt_lower for indicator in indicators['medium']):
            return 'medium'

        # Default to low
        return 'low'
