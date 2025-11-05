"""
Monitoring system for agent performance and health
Tracks metrics, errors, and resource usage
"""

import time
import psutil
from typing import Dict, Any, List
from datetime import datetime, timedelta
from collections import defaultdict, deque
import json
from pathlib import Path


class Monitor:
    """
    Performance monitoring system

    Tracks:
    - Agent performance metrics
    - Error rates
    - Task completion times
    - Resource usage (CPU, memory)
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.metrics = defaultdict(lambda: {
            'calls': 0,
            'successes': 0,
            'failures': 0,
            'total_duration': 0,
            'avg_duration': 0,
            'errors': deque(maxlen=100),
            'last_call': None
        })

        # Resource tracking
        self.resource_history = deque(maxlen=1000)
        self.start_time = datetime.now()

        # Data directory
        self.data_dir = Path(__file__).parent.parent / 'data'
        self.data_dir.mkdir(exist_ok=True)
        self.metrics_file = self.data_dir / 'metrics.json'

        # Load existing metrics
        self._load_metrics()

    def record_agent_call(
        self,
        agent: str,
        duration: float,
        success: bool,
        error: str = None
    ):
        """Record an agent invocation"""
        metrics = self.metrics[agent]

        metrics['calls'] += 1
        metrics['last_call'] = datetime.now().isoformat()

        if success:
            metrics['successes'] += 1
        else:
            metrics['failures'] += 1
            if error:
                metrics['errors'].append({
                    'timestamp': datetime.now().isoformat(),
                    'error': error
                })

        metrics['total_duration'] += duration
        metrics['avg_duration'] = metrics['total_duration'] / metrics['calls']

        # Auto-save periodically
        if metrics['calls'] % 10 == 0:
            self._save_metrics()

    def get_agent_metrics(self, agent: str) -> Dict[str, Any]:
        """Get metrics for specific agent"""
        metrics = self.metrics.get(agent, {})

        if not metrics or metrics.get('calls', 0) == 0:
            return {
                'agent': agent,
                'status': 'no_data',
                'calls': 0
            }

        error_rate = (metrics['failures'] / metrics['calls'] * 100) if metrics['calls'] > 0 else 0

        return {
            'agent': agent,
            'status': 'healthy' if error_rate < 10 else 'degraded' if error_rate < 30 else 'unhealthy',
            'calls': metrics['calls'],
            'successes': metrics['successes'],
            'failures': metrics['failures'],
            'error_rate': round(error_rate, 2),
            'avg_duration_seconds': round(metrics['avg_duration'], 2),
            'last_call': metrics['last_call'],
            'recent_errors': list(metrics['errors'])[-5:]  # Last 5 errors
        }

    def get_all_metrics(self) -> Dict[str, Any]:
        """Get metrics for all agents"""
        return {
            agent: self.get_agent_metrics(agent)
            for agent in self.metrics.keys()
        }

    def get_system_metrics(self) -> Dict[str, Any]:
        """Get system resource metrics"""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')

        # Get process-specific metrics
        process = psutil.Process()
        process_memory = process.memory_info()

        metrics = {
            'cpu': {
                'percent': cpu_percent,
                'count': psutil.cpu_count()
            },
            'memory': {
                'total_gb': round(memory.total / (1024**3), 2),
                'available_gb': round(memory.available / (1024**3), 2),
                'percent': memory.percent,
                'process_mb': round(process_memory.rss / (1024**2), 2)
            },
            'disk': {
                'total_gb': round(disk.total / (1024**3), 2),
                'used_gb': round(disk.used / (1024**3), 2),
                'free_gb': round(disk.free / (1024**3), 2),
                'percent': disk.percent
            },
            'uptime_seconds': (datetime.now() - self.start_time).total_seconds()
        }

        # Store in history
        self.resource_history.append({
            'timestamp': datetime.now().isoformat(),
            'cpu': cpu_percent,
            'memory': memory.percent,
            'disk': disk.percent
        })

        return metrics

    def get_health_status(self) -> Dict[str, Any]:
        """Get overall health status"""
        all_metrics = self.get_all_metrics()

        total_calls = sum(m.get('calls', 0) for m in all_metrics.values())
        total_failures = sum(m.get('failures', 0) for m in all_metrics.values())
        overall_error_rate = (total_failures / total_calls * 100) if total_calls > 0 else 0

        # Determine health
        if overall_error_rate < 5:
            health = 'healthy'
        elif overall_error_rate < 15:
            health = 'warning'
        else:
            health = 'critical'

        # Get system metrics
        system = self.get_system_metrics()

        # Check resource thresholds
        resource_health = 'healthy'
        if system['cpu']['percent'] > 80 or system['memory']['percent'] > 85:
            resource_health = 'warning'
        if system['cpu']['percent'] > 95 or system['memory']['percent'] > 95:
            resource_health = 'critical'

        return {
            'overall': health,
            'resource_health': resource_health,
            'error_rate': round(overall_error_rate, 2),
            'total_calls': total_calls,
            'total_failures': total_failures,
            'uptime_hours': round(system['uptime_seconds'] / 3600, 2),
            'system': system,
            'agents': {
                agent: metrics['status']
                for agent, metrics in all_metrics.items()
            }
        }

    def get_performance_trends(self, hours: int = 24) -> Dict[str, List]:
        """Get performance trends over time"""
        cutoff = datetime.now() - timedelta(hours=hours)

        # Filter history
        recent_history = [
            h for h in self.resource_history
            if datetime.fromisoformat(h['timestamp']) > cutoff
        ]

        return {
            'timestamps': [h['timestamp'] for h in recent_history],
            'cpu': [h['cpu'] for h in recent_history],
            'memory': [h['memory'] for h in recent_history],
            'disk': [h['disk'] for h in recent_history]
        }

    def _save_metrics(self):
        """Save metrics to disk"""
        try:
            data = {
                'metrics': {
                    agent: {
                        **metrics,
                        'errors': list(metrics['errors'])  # Convert deque to list
                    }
                    for agent, metrics in self.metrics.items()
                },
                'last_saved': datetime.now().isoformat()
            }

            with open(self.metrics_file, 'w') as f:
                json.dump(data, f, indent=2)

        except Exception as e:
            print(f"Failed to save metrics: {e}")

    def _load_metrics(self):
        """Load metrics from disk"""
        if self.metrics_file.exists():
            try:
                with open(self.metrics_file, 'r') as f:
                    data = json.load(f)

                for agent, metrics in data.get('metrics', {}).items():
                    self.metrics[agent] = {
                        **metrics,
                        'errors': deque(metrics.get('errors', []), maxlen=100)
                    }

            except Exception as e:
                print(f"Failed to load metrics: {e}")

    def reset_metrics(self, agent: str = None):
        """Reset metrics for specific agent or all"""
        if agent:
            if agent in self.metrics:
                del self.metrics[agent]
        else:
            self.metrics.clear()

        self._save_metrics()
