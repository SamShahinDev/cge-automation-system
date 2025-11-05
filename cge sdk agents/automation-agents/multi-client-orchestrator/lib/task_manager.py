"""Task management system"""

import asyncio
import uuid
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from collections import defaultdict


class TaskManager:
    """Manages tasks across all clients"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.task_queue: List[str] = []

        # Create data directory
        self.data_dir = Path(__file__).parent.parent / 'data'
        self.data_dir.mkdir(exist_ok=True)
        self.tasks_file = self.data_dir / 'tasks.json'

    async def create_task(
        self,
        client: str,
        task_type: str,
        description: str,
        priority: str = 'medium',
        metadata: Optional[Dict] = None
    ) -> str:
        """Create a new task"""
        task_id = str(uuid.uuid4())[:8]

        task = {
            'id': task_id,
            'client': client,
            'type': task_type,
            'description': description,
            'priority': priority,
            'status': 'pending',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'started_at': None,
            'completed_at': None,
            'duration_minutes': None,
            'result': None,
            'error': None,
            'metadata': metadata or {}
        }

        self.tasks[task_id] = task
        await self._add_to_queue(task_id)
        await self.save_state()

        return task_id

    async def _add_to_queue(self, task_id: str):
        """Add task to queue based on priority"""
        task = self.tasks[task_id]
        priority_levels = self.config.get('task_priorities', {})
        task_priority = priority_levels.get(task['priority'], 999)

        # Insert in priority order
        inserted = False
        for i, existing_id in enumerate(self.task_queue):
            existing_task = self.tasks[existing_id]
            existing_priority = priority_levels.get(existing_task['priority'], 999)

            if task_priority < existing_priority:
                self.task_queue.insert(i, task_id)
                inserted = True
                break

        if not inserted:
            self.task_queue.append(task_id)

    async def get_next_task(self) -> Optional[Dict[str, Any]]:
        """Get the next task to process"""
        if not self.task_queue:
            return None

        # Get highest priority pending task
        for task_id in self.task_queue:
            task = self.tasks.get(task_id)
            if task and task['status'] == 'pending':
                return task

        return None

    async def update_task_status(self, task_id: str, status: str):
        """Update task status"""
        if task_id in self.tasks:
            self.tasks[task_id]['status'] = status
            self.tasks[task_id]['updated_at'] = datetime.now().isoformat()

            if status == 'in_progress':
                self.tasks[task_id]['started_at'] = datetime.now().isoformat()

            await self.save_state()

    async def complete_task(
        self,
        task_id: str,
        result: Any,
        duration_minutes: float
    ):
        """Mark task as completed"""
        if task_id in self.tasks:
            self.tasks[task_id]['status'] = 'completed'
            self.tasks[task_id]['completed_at'] = datetime.now().isoformat()
            self.tasks[task_id]['duration_minutes'] = duration_minutes
            self.tasks[task_id]['result'] = result
            self.tasks[task_id]['updated_at'] = datetime.now().isoformat()

            # Remove from queue
            if task_id in self.task_queue:
                self.task_queue.remove(task_id)

            await self.save_state()

    async def fail_task(self, task_id: str, error: str):
        """Mark task as failed"""
        if task_id in self.tasks:
            self.tasks[task_id]['status'] = 'failed'
            self.tasks[task_id]['error'] = error
            self.tasks[task_id]['updated_at'] = datetime.now().isoformat()

            # Remove from queue
            if task_id in self.task_queue:
                self.task_queue.remove(task_id)

            await self.save_state()

    async def get_tasks(
        self,
        client: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get tasks with optional filters"""
        tasks = list(self.tasks.values())

        if client:
            tasks = [t for t in tasks if t['client'] == client]

        if status:
            tasks = [t for t in tasks if t['status'] == status]

        # Sort by created_at descending
        tasks.sort(key=lambda t: t['created_at'], reverse=True)

        return tasks

    async def count_total_tasks(self) -> int:
        """Count total tasks"""
        return len(self.tasks)

    async def count_pending_tasks(self) -> int:
        """Count pending tasks"""
        return len([t for t in self.tasks.values() if t['status'] == 'pending'])

    async def count_completed_tasks(self) -> int:
        """Count completed tasks"""
        return len([t for t in self.tasks.values() if t['status'] == 'completed'])

    async def count_failed_tasks(self) -> int:
        """Count failed tasks"""
        return len([t for t in self.tasks.values() if t['status'] == 'failed'])

    async def save_state(self):
        """Save tasks to disk"""
        state = {
            'tasks': self.tasks,
            'task_queue': self.task_queue,
            'last_saved': datetime.now().isoformat()
        }

        with open(self.tasks_file, 'w') as f:
            json.dump(state, f, indent=2)

    async def load_pending_tasks(self):
        """Load tasks from disk"""
        if self.tasks_file.exists():
            with open(self.tasks_file, 'r') as f:
                state = json.load(f)

            self.tasks = state.get('tasks', {})
            self.task_queue = state.get('task_queue', [])
