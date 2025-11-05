#!/usr/bin/env python3
"""
Multi-Client Orchestrator for Crowned Gladiator Enterprises
Your Virtual Project Manager
"""

import os
import sys
import asyncio
import signal
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import yaml
import json
from dotenv import load_dotenv
from anthropic import Anthropic

# Add parent directory to path for shared modules
sys.path.append(str(Path(__file__).parent.parent / "code-review-agent"))
from logger import setup_logging, get_logger
from exceptions import ConfigurationError

# Load environment
load_dotenv()

# Setup logging
logger = setup_logging(
    log_level=os.getenv("LOG_LEVEL", "INFO"),
    log_file=os.getenv("LOG_FILE"),
    enable_sentry=os.getenv("ENABLE_SENTRY", "false").lower() == "true"
)

from lib.task_manager import TaskManager
from lib.agent_router import AgentRouter
from lib.context_manager import ContextManager
from lib.time_tracker import TimeTracker
from lib.dashboard_server import DashboardServer
from lib.scheduler import TaskScheduler
from lib.client_manager import ClientManager


class MultiClientOrchestrator:
    """
    Multi-Client Project Management Orchestrator

    Your virtual project manager that:
    - Manages multiple client projects simultaneously
    - Routes tasks to appropriate specialized agents
    - Tracks time and progress
    - Handles context switching between clients
    """

    def __init__(self):
        """Initialize the orchestrator"""
        logger.info("Initializing Multi-Client Orchestrator")

        # Load configuration
        self.config = self._load_config()

        # Initialize Anthropic
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ConfigurationError("ANTHROPIC_API_KEY required")

        self.client = Anthropic(api_key=api_key)

        # Initialize managers
        self.task_manager = TaskManager(self.config)
        self.agent_router = AgentRouter(self.config, self.client)
        self.context_manager = ContextManager(self.config)
        self.time_tracker = TimeTracker(self.config)
        self.scheduler = TaskScheduler(self.config, self.task_manager)
        self.client_manager = ClientManager(self.config)

        # Initialize dashboard
        self.dashboard = DashboardServer(
            self.config,
            self.task_manager,
            self.client_manager,
            self.time_tracker
        )

        # State
        self.current_client = None
        self.current_task = None
        self.running = False

        logger.info("Multi-Client Orchestrator initialized successfully")

    def _load_config(self) -> Dict[str, Any]:
        """Load and validate configuration"""
        config_path = Path(__file__).parent / "config.yaml"

        if not config_path.exists():
            raise ConfigurationError(f"Configuration file not found: {config_path}")

        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)

        # Validate required fields
        required_fields = ['orchestrator', 'clients', 'agent_specializations']
        for field in required_fields:
            if field not in config:
                raise ConfigurationError(f"Missing required config field: {field}")

        return config

    async def start(self):
        """Start the orchestrator"""
        logger.info("Starting Multi-Client Orchestrator")

        self.running = True

        # Start background services
        asyncio.create_task(self.scheduler.start())
        asyncio.create_task(self.dashboard.start())
        asyncio.create_task(self._auto_save_loop())

        # Load pending tasks
        await self.task_manager.load_pending_tasks()

        logger.info("Orchestrator started successfully")

        # Main event loop
        await self._main_loop()

    async def stop(self):
        """Stop the orchestrator gracefully"""
        logger.info("Stopping Multi-Client Orchestrator")

        self.running = False

        # Stop background services
        await self.scheduler.stop()
        await self.dashboard.stop()

        # Save state
        await self.task_manager.save_state()

        logger.info("Orchestrator stopped")

    async def _main_loop(self):
        """Main processing loop"""
        logger.info("Entering main processing loop")

        while self.running:
            try:
                # Get next task
                task = await self.task_manager.get_next_task()

                if task:
                    await self._process_task(task)
                else:
                    # No tasks, wait a bit
                    await asyncio.sleep(5)

            except Exception as e:
                logger.error("Error in main loop",
                           error=str(e),
                           exc_info=True)
                await asyncio.sleep(10)

    async def _process_task(self, task: Dict[str, Any]):
        """
        Process a single task

        Args:
            task: Task dictionary
        """
        task_id = task['id']
        client_name = task['client']
        task_type = task['type']

        logger.info("Processing task",
                   task_id=task_id,
                   client=client_name,
                   type=task_type)

        try:
            # Switch context to client
            await self.context_manager.switch_to_client(client_name)
            self.current_client = client_name
            self.current_task = task

            # Start time tracking
            time_entry = await self.time_tracker.start_tracking(task)

            # Update task status
            await self.task_manager.update_task_status(task_id, 'in_progress')

            # Route to appropriate agent
            result = await self.agent_router.route_task(task)

            # Stop time tracking
            duration = await self.time_tracker.stop_tracking(time_entry)

            # Update task with result
            await self.task_manager.complete_task(task_id, result, duration)

            logger.info("Task completed successfully",
                       task_id=task_id,
                       duration_minutes=duration)

        except Exception as e:
            logger.error("Task processing failed",
                        task_id=task_id,
                        error=str(e),
                        exc_info=True)

            await self.task_manager.fail_task(task_id, str(e))

        finally:
            self.current_client = None
            self.current_task = None

    async def _auto_save_loop(self):
        """Auto-save state periodically"""
        interval = self.config['orchestrator'].get('auto_save_interval_seconds', 30)

        while self.running:
            await asyncio.sleep(interval)

            try:
                await self.task_manager.save_state()
                logger.debug("Auto-saved state")
            except Exception as e:
                logger.error("Auto-save failed", error=str(e))

    # Public API methods

    async def add_task(
        self,
        client: str,
        task_type: str,
        description: str,
        priority: str = 'medium',
        metadata: Optional[Dict] = None
    ) -> str:
        """
        Add a new task

        Args:
            client: Client name
            task_type: Type of task
            description: Task description
            priority: Priority level
            metadata: Additional metadata

        Returns:
            Task ID
        """
        return await self.task_manager.create_task(
            client=client,
            task_type=task_type,
            description=description,
            priority=priority,
            metadata=metadata or {}
        )

    async def get_client_status(self, client: str) -> Dict[str, Any]:
        """Get status for a specific client"""
        return await self.client_manager.get_client_status(client)

    async def get_all_tasks(self, client: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all tasks, optionally filtered by client"""
        return await self.task_manager.get_tasks(client=client)

    async def get_statistics(self) -> Dict[str, Any]:
        """Get orchestrator statistics"""
        return {
            'total_clients': len(self.config['clients']),
            'active_clients': await self.client_manager.count_active_clients(),
            'total_tasks': await self.task_manager.count_total_tasks(),
            'pending_tasks': await self.task_manager.count_pending_tasks(),
            'completed_tasks': await self.task_manager.count_completed_tasks(),
            'failed_tasks': await self.task_manager.count_failed_tasks(),
            'total_time_tracked': await self.time_tracker.get_total_time(),
            'current_task': self.current_task,
            'current_client': self.current_client,
        }


# CLI Interface

async def run_orchestrator():
    """Run the orchestrator as a service"""
    orchestrator = MultiClientOrchestrator()

    # Setup signal handlers
    def signal_handler(sig, frame):
        logger.info("Received shutdown signal")
        asyncio.create_task(orchestrator.stop())

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        await orchestrator.start()
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
        await orchestrator.stop()


async def run_cli_command(command: str, args: List[str]):
    """Run a CLI command"""
    orchestrator = MultiClientOrchestrator()

    if command == "add-task":
        # Add a new task
        if len(args) < 3:
            print("Usage: add-task <client> <type> <description> [priority]")
            return

        client = args[0]
        task_type = args[1]
        description = args[2]
        priority = args[3] if len(args) > 3 else 'medium'

        task_id = await orchestrator.add_task(
            client=client,
            task_type=task_type,
            description=description,
            priority=priority
        )

        print(f"✅ Task created: {task_id}")

    elif command == "list-tasks":
        # List all tasks
        client = args[0] if args else None
        tasks = await orchestrator.get_all_tasks(client=client)

        print(f"\n📋 Tasks ({len(tasks)}):\n")
        for task in tasks:
            print(f"  [{task['status']}] {task['id']}: {task['description']}")
            print(f"    Client: {task['client']} | Type: {task['type']} | Priority: {task['priority']}")
            print()

    elif command == "stats":
        # Show statistics
        stats = await orchestrator.get_statistics()

        print("\n📊 Orchestrator Statistics:\n")
        print(f"  Total Clients: {stats['total_clients']}")
        print(f"  Active Clients: {stats['active_clients']}")
        print(f"  Total Tasks: {stats['total_tasks']}")
        print(f"  Pending: {stats['pending_tasks']}")
        print(f"  Completed: {stats['completed_tasks']}")
        print(f"  Failed: {stats['failed_tasks']}")
        print(f"  Total Time Tracked: {stats['total_time_tracked']} hours")

        if stats['current_task']:
            print(f"\n  Currently Working On:")
            print(f"    Client: {stats['current_client']}")
            print(f"    Task: {stats['current_task']['description']}")

    elif command == "client-status":
        # Show client status
        if not args:
            print("Usage: client-status <client>")
            return

        client = args[0]
        status = await orchestrator.get_client_status(client)

        print(f"\n📊 Client Status: {status['name']}\n")
        print(f"  Status: {status['status']}")
        print(f"  Priority: {status['priority']}")
        print(f"  Subscription: ${status['monthly_retainer']}/month")
        print(f"  Pending Tasks: {status['pending_tasks']}")
        print(f"  Time This Month: {status['time_this_month']} hours")

    else:
        print(f"Unknown command: {command}")
        print("\nAvailable commands:")
        print("  start           - Start the orchestrator service")
        print("  add-task        - Add a new task")
        print("  list-tasks      - List all tasks")
        print("  stats           - Show statistics")
        print("  client-status   - Show client status")


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python orchestrator.py <command> [args]")
        print("\nCommands:")
        print("  start              - Start the orchestrator service")
        print("  add-task           - Add a new task")
        print("  list-tasks         - List all tasks")
        print("  stats              - Show statistics")
        print("  client-status      - Show client status")
        sys.exit(1)

    command = sys.argv[1]
    args = sys.argv[2:]

    if command == "start":
        # Run as service
        asyncio.run(run_orchestrator())
    else:
        # Run CLI command
        asyncio.run(run_cli_command(command, args))


if __name__ == "__main__":
    main()
