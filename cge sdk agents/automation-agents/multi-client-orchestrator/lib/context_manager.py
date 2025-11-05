"""Context management for client switching"""

import os
from typing import Dict, Any
from pathlib import Path


class ContextManager:
    """Manages context switching between clients"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.current_client = None
        self.client_contexts = {}

    async def switch_to_client(self, client_name: str):
        """Switch context to specific client"""
        if client_name not in self.config['clients']:
            raise ValueError(f"Unknown client: {client_name}")

        client_config = self.config['clients'][client_name]

        # Load client context
        self.current_client = client_name
        self.client_contexts[client_name] = {
            'name': client_config['name'],
            'project_path': client_config['project_path'],
            'tech_stack': client_config.get('tech_stack', []),
            'features': client_config.get('features', []),
            'context': client_config.get('context', {}),
            'github_repo': client_config.get('github_repo'),
        }

    def get_current_context(self) -> Dict[str, Any]:
        """Get current client context"""
        if not self.current_client:
            return {}

        return self.client_contexts.get(self.current_client, {})
