"""Time tracking module"""
from typing import Dict, Any
from datetime import datetime

class TimeTracker:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.active_entries = {}

    async def start_tracking(self, task: Dict[str, Any]) -> str:
        entry_id = task['id']
        self.active_entries[entry_id] = {
            'task_id': task['id'],
            'client': task['client'],
            'start_time': datetime.now()
        }
        return entry_id

    async def stop_tracking(self, entry_id: str) -> float:
        if entry_id not in self.active_entries:
            return 0

        entry = self.active_entries.pop(entry_id)
        duration = (datetime.now() - entry['start_time']).total_seconds() / 60
        return round(duration, 2)

    async def get_total_time(self) -> float:
        return 0.0
