"""
Central Message Queue System
Routes requests to appropriate agents with error handling and retries
"""

import asyncio
import json
from typing import Dict, Any, Optional, Callable
from datetime import datetime
from celery import Celery, Task
from celery.result import AsyncResult
from tenacity import retry, stop_after_attempt, wait_exponential
import redis
import structlog

logger = structlog.get_logger()


class MessageQueue:
    """
    Central message queue for agent coordination

    Features:
    - Request routing to appropriate agents
    - Error handling and automatic retries
    - Response management
    - Progress tracking
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config

        # Initialize Celery
        redis_url = config.get('redis_url', 'redis://localhost:6379/0')
        self.celery = Celery('orchestrator', broker=redis_url, backend=redis_url)

        # Configure Celery
        self.celery.conf.update(
            task_serializer='json',
            accept_content=['json'],
            result_serializer='json',
            timezone='UTC',
            enable_utc=True,
            task_track_started=True,
            task_time_limit=3600,  # 1 hour max
            task_soft_time_limit=3000,  # 50 minutes warning
            worker_prefetch_multiplier=1,
            worker_max_tasks_per_child=50,
        )

        # Initialize Redis for pub/sub
        self.redis = redis.from_url(redis_url, decode_responses=True)

        # Register tasks
        self._register_tasks()

        # Message handlers
        self.handlers: Dict[str, Callable] = {}

        logger.info("Message queue initialized", redis_url=redis_url)

    def _register_tasks(self):
        """Register Celery tasks for each agent"""

        @self.celery.task(bind=True, name='orchestrator.code_review')
        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
        def code_review_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
            """Execute code review agent"""
            logger.info("Executing code review", task_id=self.request.id)

            try:
                # Update progress
                self.update_state(state='PROGRESS', meta={'progress': 0, 'status': 'Starting...'})

                # Import agent dynamically
                import subprocess
                from pathlib import Path

                agent_path = Path(__file__).parent.parent.parent / 'code-review-agent' / 'agent.py'
                project_path = task_data.get('project_path')

                self.update_state(state='PROGRESS', meta={'progress': 25, 'status': 'Running analysis...'})

                # Run agent
                result = subprocess.run(
                    ['python', str(agent_path), project_path, 'crm'],
                    capture_output=True,
                    text=True,
                    timeout=1800  # 30 minutes
                )

                self.update_state(state='PROGRESS', meta={'progress': 90, 'status': 'Finalizing...'})

                return {
                    'success': result.returncode == 0,
                    'output': result.stdout,
                    'error': result.stderr if result.returncode != 0 else None,
                    'exit_code': result.returncode
                }

            except Exception as e:
                logger.error("Code review failed", error=str(e))
                raise

        @self.celery.task(bind=True, name='orchestrator.monthly_value')
        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
        def monthly_value_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
            """Execute monthly value agent"""
            logger.info("Executing monthly value", task_id=self.request.id)

            try:
                self.update_state(state='PROGRESS', meta={'progress': 0, 'status': 'Starting analysis...'})

                import subprocess
                from pathlib import Path

                agent_path = Path(__file__).parent.parent.parent / 'monthly-value-agent' / 'agent.py'
                client_name = task_data.get('client')

                self.update_state(state='PROGRESS', meta={'progress': 20, 'status': 'Database analysis...'})

                result = subprocess.run(
                    ['python', str(agent_path), client_name],
                    capture_output=True,
                    text=True,
                    timeout=1800
                )

                self.update_state(state='PROGRESS', meta={'progress': 90, 'status': 'Generating report...'})

                return {
                    'success': result.returncode == 0,
                    'output': result.stdout,
                    'error': result.stderr if result.returncode != 0 else None,
                    'exit_code': result.returncode
                }

            except Exception as e:
                logger.error("Monthly value failed", error=str(e))
                raise

        @self.celery.task(bind=True, name='orchestrator.claude_general')
        def claude_general_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
            """Execute general Claude AI task"""
            logger.info("Executing Claude task", task_id=self.request.id)

            try:
                from anthropic import Anthropic
                import os

                self.update_state(state='PROGRESS', meta={'progress': 0, 'status': 'Preparing context...'})

                client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

                context = task_data.get('context', '')
                prompt = task_data.get('prompt', '')

                self.update_state(state='PROGRESS', meta={'progress': 30, 'status': 'Calling Claude...'})

                response = client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=4000,
                    messages=[
                        {"role": "user", "content": f"{context}\n\n{prompt}"}
                    ]
                )

                self.update_state(state='PROGRESS', meta={'progress': 90, 'status': 'Processing response...'})

                return {
                    'success': True,
                    'response': response.content[0].text,
                    'usage': {
                        'input_tokens': response.usage.input_tokens,
                        'output_tokens': response.usage.output_tokens
                    }
                }

            except Exception as e:
                logger.error("Claude task failed", error=str(e))
                raise

        # Store task references
        self.tasks = {
            'code_review': code_review_task,
            'monthly_value': monthly_value_task,
            'claude_general': claude_general_task
        }

    async def send_message(
        self,
        agent: str,
        task_data: Dict[str, Any],
        priority: int = 5
    ) -> str:
        """
        Send message to agent via queue

        Args:
            agent: Agent name (code_review, monthly_value, claude_general)
            task_data: Task data to send
            priority: Priority 0-9 (0 highest)

        Returns:
            Task ID
        """
        task_name = f'orchestrator.{agent}'

        if task_name not in [f'orchestrator.{k}' for k in self.tasks.keys()]:
            raise ValueError(f"Unknown agent: {agent}")

        # Send to Celery with priority
        result = self.celery.send_task(
            task_name,
            args=[task_data],
            priority=priority,
            queue='default'
        )

        logger.info("Message sent to queue",
                   agent=agent,
                   task_id=result.id,
                   priority=priority)

        # Publish event
        self._publish_event('task.queued', {
            'task_id': result.id,
            'agent': agent,
            'priority': priority,
            'timestamp': datetime.now().isoformat()
        })

        return result.id

    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get task status and result"""
        result = AsyncResult(task_id, app=self.celery)

        status = {
            'task_id': task_id,
            'state': result.state,
            'ready': result.ready(),
            'successful': result.successful() if result.ready() else None,
            'failed': result.failed() if result.ready() else None,
        }

        if result.state == 'PROGRESS':
            status['progress'] = result.info.get('progress', 0)
            status['status_message'] = result.info.get('status', '')
        elif result.ready():
            if result.successful():
                status['result'] = result.result
            else:
                status['error'] = str(result.info)

        return status

    async def wait_for_result(
        self,
        task_id: str,
        timeout: int = 3600
    ) -> Dict[str, Any]:
        """Wait for task to complete and return result"""
        result = AsyncResult(task_id, app=self.celery)

        try:
            output = result.get(timeout=timeout)
            return {
                'success': True,
                'result': output
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def _publish_event(self, event_type: str, data: Dict[str, Any]):
        """Publish event to Redis pub/sub"""
        try:
            message = {
                'type': event_type,
                'data': data,
                'timestamp': datetime.now().isoformat()
            }
            self.redis.publish('orchestrator:events', json.dumps(message))
        except Exception as e:
            logger.warning("Failed to publish event", error=str(e))

    def subscribe_to_events(self, callback: Callable):
        """Subscribe to orchestrator events"""
        pubsub = self.redis.pubsub()
        pubsub.subscribe('orchestrator:events')

        for message in pubsub.listen():
            if message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    callback(data)
                except Exception as e:
                    logger.error("Event callback failed", error=str(e))

    async def get_queue_stats(self) -> Dict[str, Any]:
        """Get queue statistics"""
        # Get active tasks
        inspect = self.celery.control.inspect()

        active = inspect.active() or {}
        scheduled = inspect.scheduled() or {}
        reserved = inspect.reserved() or {}

        total_active = sum(len(tasks) for tasks in active.values())
        total_scheduled = sum(len(tasks) for tasks in scheduled.values())
        total_reserved = sum(len(tasks) for tasks in reserved.values())

        return {
            'active_tasks': total_active,
            'scheduled_tasks': total_scheduled,
            'reserved_tasks': total_reserved,
            'total_pending': total_active + total_scheduled + total_reserved,
            'workers': len(active.keys()) if active else 0
        }
