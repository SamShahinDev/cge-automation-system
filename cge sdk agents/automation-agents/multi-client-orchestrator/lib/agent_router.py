"""Agent routing and task delegation"""

import asyncio
import subprocess
from typing import Dict, Any
from pathlib import Path
from anthropic import Anthropic


class AgentRouter:
    """Routes tasks to appropriate specialized agents"""

    def __init__(self, config: Dict[str, Any], claude_client: Anthropic):
        self.config = config
        self.client = claude_client
        self.agents = config.get('agent_specializations', {})

    async def route_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Route task to appropriate agent

        Args:
            task: Task to route

        Returns:
            Result from agent
        """
        task_type = task['type']
        client = task['client']

        # Determine which agent to use
        agent_name = self._determine_agent(task_type)

        if not agent_name:
            # Use Claude for general tasks
            return await self._use_claude_agent(task)

        # Route to specialized agent
        if agent_name == 'code_review':
            return await self._run_code_review_agent(task)
        elif agent_name == 'monthly_value':
            return await self._run_monthly_value_agent(task)
        else:
            return await self._use_claude_agent(task, agent_name)

    def _determine_agent(self, task_type: str) -> str:
        """Determine which agent should handle this task"""
        task_to_agent = {
            'code_review': 'code_review',
            'monthly_report': 'monthly_value',
            'bug_fix': 'code_review',
            'security_audit': 'code_review',
            'optimization': 'code_review',
            'feature_development': 'architect',
        }

        return task_to_agent.get(task_type)

    async def _run_code_review_agent(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Run code review agent"""
        client_name = task['client']
        client_config = self.config['clients'][client_name]
        project_path = self._get_project_path(client_name)

        agent_path = Path(__file__).parent.parent.parent / 'code-review-agent' / 'agent.py'

        # Run agent
        process = await asyncio.create_subprocess_exec(
            'python',
            str(agent_path),
            str(project_path),
            'crm',
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        return {
            'success': process.returncode == 0,
            'output': stdout.decode(),
            'error': stderr.decode() if stderr else None,
            'exit_code': process.returncode
        }

    async def _run_monthly_value_agent(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Run monthly value agent"""
        client_name = task['client']

        agent_path = Path(__file__).parent.parent.parent / 'monthly-value-agent' / 'agent.py'

        # Run agent
        process = await asyncio.create_subprocess_exec(
            'python',
            str(agent_path),
            client_name,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        return {
            'success': process.returncode == 0,
            'output': stdout.decode(),
            'error': stderr.decode() if stderr else None,
            'exit_code': process.returncode
        }

    async def _use_claude_agent(
        self,
        task: Dict[str, Any],
        agent_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Use Claude for general task processing"""
        client_name = task['client']
        client_config = self.config['clients'][client_name]

        # Build context
        context = f"""You are working on {client_config['name']}.

Business Context: {client_config.get('context', {}).get('business_domain', '')}

Tech Stack: {', '.join(client_config.get('tech_stack', []))}

Task Type: {task['type']}
Task Description: {task['description']}

Please provide a detailed plan for completing this task.
"""

        # Call Claude
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[
                {"role": "user", "content": context}
            ]
        )

        return {
            'success': True,
            'plan': response.content[0].text,
            'agent': agent_name or 'claude-general'
        }

    def _get_project_path(self, client_name: str) -> Path:
        """Get project path for client"""
        client_config = self.config['clients'][client_name]
        projects_root = Path(os.getenv('PROJECTS_ROOT', '~/Documents')).expanduser()
        return projects_root / client_config['project_path']
