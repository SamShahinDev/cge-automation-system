"""Task scheduler"""
import asyncio
from typing import Dict, Any
from apscheduler.schedulers.asyncio import AsyncIOScheduler

class TaskScheduler:
    def __init__(self, config: Dict[str, Any], task_manager):
        self.config = config
        self.task_manager = task_manager
        self.scheduler = AsyncIOScheduler()

    async def start(self):
        self.scheduler.start()

    async def stop(self):
        self.scheduler.shutdown()
