"""Client management"""
from typing import Dict, Any

class ClientManager:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.clients = config.get('clients', {})

    async def get_client_status(self, client: str) -> Dict[str, Any]:
        if client not in self.clients:
            raise ValueError(f"Unknown client: {client}")

        client_config = self.clients[client]
        return {
            'name': client_config['name'],
            'status': client_config.get('status', 'active'),
            'priority': client_config.get('priority', 'medium'),
            'monthly_retainer': client_config.get('monthly_retainer', 0),
            'pending_tasks': 0,
            'time_this_month': 0.0
        }

    async def count_active_clients(self) -> int:
        return len([c for c in self.clients.values() if c.get('status') == 'active'])
