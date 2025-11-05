"""Enhanced web dashboard with monitoring"""

import asyncio
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from typing import Dict, Any
import json


class DashboardServer:
    """
    Enhanced web dashboard

    Features:
    - Real-time task monitoring
    - Agent performance metrics
    - Client project status
    - Resource usage graphs
    - Error tracking
    """

    def __init__(self, config, task_manager, client_manager, time_tracker, monitor=None):
        self.config = config
        self.task_manager = task_manager
        self.client_manager = client_manager
        self.time_tracker = time_tracker
        self.monitor = monitor

        # Initialize Flask
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'dev-secret-key'  # TODO: Use env var
        CORS(self.app)
        self.socketio = SocketIO(self.app, cors_allowed_origins="*")

        self._setup_routes()
        self._setup_websockets()

    def _setup_routes(self):
        """Setup HTTP routes"""

        @self.app.route('/')
        def index():
            return jsonify({
                'name': 'CGE Multi-Client Orchestrator',
                'version': '1.0.0',
                'status': 'running'
            })

        @self.app.route('/api/dashboard')
        async def dashboard():
            """Main dashboard data"""
            stats = await self.task_manager.count_total_tasks()

            return jsonify({
                'total_tasks': await self.task_manager.count_total_tasks(),
                'pending_tasks': await self.task_manager.count_pending_tasks(),
                'completed_tasks': await self.task_manager.count_completed_tasks(),
                'failed_tasks': await self.task_manager.count_failed_tasks(),
                'active_clients': await self.client_manager.count_active_clients(),
                'health': self.monitor.get_health_status() if self.monitor else {'overall': 'unknown'}
            })

        @self.app.route('/api/tasks')
        async def tasks():
            """Get all tasks"""
            client = request.args.get('client')
            status = request.args.get('status')

            tasks = await self.task_manager.get_tasks(client=client, status=status)
            return jsonify({'tasks': tasks})

        @self.app.route('/api/clients')
        async def clients():
            """Get all clients"""
            clients = []
            for client_name in self.config['clients'].keys():
                status = await self.client_manager.get_client_status(client_name)
                clients.append(status)

            return jsonify({'clients': clients})

        @self.app.route('/api/agents')
        def agents():
            """Get agent status"""
            agent_specs = self.config.get('agent_specializations', {})

            agents = []
            for name, spec in agent_specs.items():
                metrics = self.monitor.get_agent_metrics(name) if self.monitor else {}

                agents.append({
                    'name': name,
                    'capabilities': spec.get('capabilities', []),
                    'metrics': metrics
                })

            return jsonify({'agents': agents})

        @self.app.route('/api/monitoring/health')
        def health():
            """Get health status"""
            if not self.monitor:
                return jsonify({'status': 'monitoring_disabled'})

            return jsonify(self.monitor.get_health_status())

        @self.app.route('/api/monitoring/metrics')
        def metrics():
            """Get performance metrics"""
            if not self.monitor:
                return jsonify({'status': 'monitoring_disabled'})

            return jsonify({
                'agents': self.monitor.get_all_metrics(),
                'system': self.monitor.get_system_metrics()
            })

        @self.app.route('/api/monitoring/trends')
        def trends():
            """Get performance trends"""
            if not self.monitor:
                return jsonify({'status': 'monitoring_disabled'})

            hours = int(request.args.get('hours', 24))
            return jsonify(self.monitor.get_performance_trends(hours=hours))

    def _setup_websockets(self):
        """Setup WebSocket handlers for real-time updates"""

        @self.socketio.on('connect')
        def handle_connect():
            emit('connected', {'status': 'Connected to orchestrator'})

        @self.socketio.on('subscribe_tasks')
        def handle_subscribe():
            # Client wants real-time task updates
            emit('subscribed', {'channel': 'tasks'})

        @self.socketio.on('request_update')
        async def handle_update():
            """Send real-time update"""
            data = {
                'pending_tasks': await self.task_manager.count_pending_tasks(),
                'timestamp': str(asyncio.get_event_loop().time())
            }
            emit('task_update', data)

    async def start(self):
        """Start dashboard server"""
        port = self.config.get('dashboard', {}).get('port', 5000)

        # Run in separate thread (Flask requirement)
        import threading

        def run_app():
            self.socketio.run(self.app, host='0.0.0.0', port=port, debug=False)

        thread = threading.Thread(target=run_app, daemon=True)
        thread.start()

    async def stop(self):
        """Stop dashboard server"""
        # Flask will stop when main process stops
        pass

    def broadcast_event(self, event_type: str, data: Dict[str, Any]):
        """Broadcast event to all connected clients"""
        self.socketio.emit(event_type, data)
