#!/usr/bin/env python3
"""
Claude Bridge Agent - Hybrid AI Planning to Implementation Bridge
Connects Claude.ai planning with Claude Code execution via human review
"""

import os
import sys
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime
import yaml
import json
import time
import psutil
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add parent to path for shared utilities
sys.path.append(str(Path(__file__).parent.parent / "code-review-agent"))
from logger import setup_logging, get_logger

from lib.enhancer import PromptEnhancer
from lib.executor import ClaudeCodeExecutor
from lib.context_manager import ContextManager

logger = get_logger(__name__)


class PromptRequest(BaseModel):
    """Request model for prompt enhancement"""
    raw_prompt: str
    project_path: str
    context_hints: Optional[Dict[str, Any]] = None


class ExecutionRequest(BaseModel):
    """Request model for Claude Code execution"""
    enhanced_prompt: str
    project_path: str
    approved: bool = True


class BridgeAgent:
    """
    Main bridge agent orchestrator

    Features:
    - Enhances Claude.ai prompts with project context
    - Provides web UI for human review
    - Executes approved prompts in Claude Code
    - Tracks execution history
    """

    def __init__(self, config_path: str = "config.yaml"):
        self.config = self._load_config(config_path)

        # Initialize components
        self.enhancer = PromptEnhancer(self.config)
        self.executor = ClaudeCodeExecutor(self.config)
        self.context_manager = ContextManager(self.config)

        # Track active sessions
        self.sessions: Dict[str, Dict[str, Any]] = {}

        # WebSocket connections
        self.active_connections: list[WebSocket] = []

        # Metrics tracking
        self.metrics = {
            'total_enhancements': 0,
            'total_executions': 0,
            'total_failures': 0,
            'start_time': time.time(),
            'execution_times': [],
            'enhancement_times': []
        }

        # Error tracking
        self.recent_errors: list[Dict[str, Any]] = []
        self.max_error_history = 100

        logger.info("Bridge Agent initialized")

    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration"""
        config_file = Path(__file__).parent / config_path

        if not config_file.exists():
            logger.warning(f"Config file not found: {config_path}, using defaults")
            return self._get_default_config()

        with open(config_file, 'r') as f:
            return yaml.safe_load(f)

    def _get_default_config(self) -> Dict[str, Any]:
        """Default configuration"""
        return {
            'server': {
                'host': '0.0.0.0',
                'port': 8080
            },
            'anthropic': {
                'api_key': os.getenv('ANTHROPIC_API_KEY'),
                'model': 'claude-sonnet-4-20250514'
            },
            'claude_code': {
                'binary_path': 'claude-code',
                'timeout': 3600
            },
            'context': {
                'max_files': 10,
                'max_file_size_kb': 100
            }
        }

    async def enhance_prompt(
        self,
        raw_prompt: str,
        project_path: str,
        context_hints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Enhance a raw prompt with project context

        Args:
            raw_prompt: Original prompt from user
            project_path: Path to project directory
            context_hints: Optional hints for context loading

        Returns:
            Enhanced prompt with context and metadata
        """
        start_time = time.time()

        try:
            logger.info(f"Enhancing prompt for project: {project_path}")

            # Load project context
            context = await self.context_manager.load_context(
                project_path,
                hints=context_hints
            )

            # Enhance prompt
            enhanced = await self.enhancer.enhance(
                raw_prompt=raw_prompt,
                context=context
            )

            # Create session
            session_id = self._generate_session_id()
            self.sessions[session_id] = {
                'raw_prompt': raw_prompt,
                'enhanced_prompt': enhanced['prompt'],
                'context': context,
                'project_path': project_path,
                'status': 'pending_review',
                'created_at': datetime.now().isoformat()
            }

            # Track metrics
            elapsed = time.time() - start_time
            self.metrics['total_enhancements'] += 1
            self.metrics['enhancement_times'].append(elapsed)
            if len(self.metrics['enhancement_times']) > 100:
                self.metrics['enhancement_times'].pop(0)

            return {
                'session_id': session_id,
                'raw_prompt': raw_prompt,
                'enhanced_prompt': enhanced['prompt'],
                'context_files': [f['path'] for f in context.get('files', [])],
                'improvements': enhanced.get('improvements', []),
                'estimated_complexity': enhanced.get('complexity', 'medium')
            }

        except Exception as e:
            self._track_error('enhancement', str(e), {
                'raw_prompt': raw_prompt[:100],
                'project_path': project_path
            })
            raise

    def _track_error(self, error_type: str, message: str, context: Dict[str, Any]):
        """Track an error for monitoring"""
        error_record = {
            'type': error_type,
            'message': message,
            'context': context,
            'timestamp': datetime.now().isoformat()
        }

        self.recent_errors.append(error_record)
        if len(self.recent_errors) > self.max_error_history:
            self.recent_errors.pop(0)

        self.metrics['total_failures'] += 1
        logger.error(f"[{error_type}] {message}")

    async def execute_prompt(
        self,
        session_id: str,
        approved: bool = True
    ) -> Dict[str, Any]:
        """
        Execute an approved prompt in Claude Code

        Args:
            session_id: Session ID from enhancement step
            approved: Whether human approved execution

        Returns:
            Execution result
        """
        if session_id not in self.sessions:
            raise ValueError(f"Unknown session: {session_id}")

        session = self.sessions[session_id]

        if not approved:
            session['status'] = 'rejected'
            logger.info(f"Session {session_id} rejected by user")
            return {
                'session_id': session_id,
                'status': 'rejected',
                'message': 'Execution rejected by user'
            }

        # Update status
        session['status'] = 'executing'
        await self._broadcast_status_update(session_id, 'executing')

        start_time = time.time()

        try:
            # Execute in Claude Code
            result = await self.executor.execute(
                prompt=session['enhanced_prompt'],
                project_path=session['project_path'],
                session_id=session_id,
                progress_callback=lambda msg: self._on_progress(session_id, msg)
            )

            session['status'] = 'completed'
            session['result'] = result
            session['completed_at'] = datetime.now().isoformat()

            await self._broadcast_status_update(session_id, 'completed')

            # Track metrics
            elapsed = time.time() - start_time
            self.metrics['total_executions'] += 1
            self.metrics['execution_times'].append(elapsed)
            if len(self.metrics['execution_times']) > 100:
                self.metrics['execution_times'].pop(0)

            logger.info(f"Session {session_id} completed successfully")

            return {
                'session_id': session_id,
                'status': 'completed',
                'result': result
            }

        except Exception as e:
            session['status'] = 'failed'
            session['error'] = str(e)

            await self._broadcast_status_update(session_id, 'failed')

            self._track_error('execution', str(e), {
                'session_id': session_id,
                'project_path': session['project_path']
            })

            logger.error(f"Session {session_id} failed: {e}")

            return {
                'session_id': session_id,
                'status': 'failed',
                'error': str(e)
            }

    def _generate_session_id(self) -> str:
        """Generate unique session ID"""
        import uuid
        return f"session_{uuid.uuid4().hex[:8]}"

    async def _on_progress(self, session_id: str, message: str):
        """Handle progress updates"""
        logger.debug(f"[{session_id}] {message}")
        await self._broadcast_progress(session_id, message)

    async def _broadcast_status_update(self, session_id: str, status: str):
        """Broadcast status update to all WebSocket clients"""
        message = {
            'type': 'status_update',
            'session_id': session_id,
            'status': status,
            'timestamp': datetime.now().isoformat()
        }
        await self._broadcast(message)

    async def _broadcast_progress(self, session_id: str, message: str):
        """Broadcast progress message"""
        data = {
            'type': 'progress',
            'session_id': session_id,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        await self._broadcast(data)

    async def _broadcast(self, message: Dict[str, Any]):
        """Broadcast to all WebSocket connections"""
        disconnected = []

        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)

        # Remove disconnected clients
        for conn in disconnected:
            self.active_connections.remove(conn)

    async def connect_websocket(self, websocket: WebSocket):
        """Handle new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect_websocket(self, websocket: WebSocket):
        """Handle WebSocket disconnect"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")


# Create FastAPI app
app = FastAPI(
    title="Claude Bridge Agent",
    description="Hybrid AI Planning to Implementation Bridge",
    version="1.0.0"
)

# Mount static files
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Initialize bridge agent
bridge = BridgeAgent()


@app.get("/", response_class=HTMLResponse)
async def index():
    """Serve main UI"""
    template_path = Path(__file__).parent / "templates" / "index.html"

    if template_path.exists():
        with open(template_path, 'r') as f:
            return f.read()

    return """
    <html>
        <head><title>Claude Bridge Agent</title></head>
        <body>
            <h1>Claude Bridge Agent</h1>
            <p>API is running. Please create templates/index.html for UI.</p>
        </body>
    </html>
    """


@app.post("/api/enhance")
async def enhance_prompt(request: PromptRequest):
    """Enhance a raw prompt with project context"""
    try:
        result = await bridge.enhance_prompt(
            raw_prompt=request.raw_prompt,
            project_path=request.project_path,
            context_hints=request.context_hints
        )
        return result
    except Exception as e:
        logger.error(f"Enhancement failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/execute/{session_id}")
async def execute_prompt(session_id: str, request: ExecutionRequest):
    """Execute an approved prompt"""
    try:
        result = await bridge.execute_prompt(
            session_id=session_id,
            approved=request.approved
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/session/{session_id}")
async def get_session(session_id: str):
    """Get session details"""
    if session_id not in bridge.sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    return bridge.sessions[session_id]


@app.get("/api/sessions")
async def list_sessions():
    """List all sessions"""
    return {
        'sessions': [
            {
                'session_id': sid,
                'status': session['status'],
                'created_at': session['created_at'],
                'project_path': session['project_path']
            }
            for sid, session in bridge.sessions.items()
        ]
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await bridge.connect_websocket(websocket)

    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()

            # Handle ping
            if data == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        bridge.disconnect_websocket(websocket)


@app.get("/health")
async def health_check():
    """Enhanced health check endpoint with detailed status"""
    uptime = time.time() - bridge.metrics['start_time']

    # Calculate average execution times
    avg_enhancement_time = (
        sum(bridge.metrics['enhancement_times']) / len(bridge.metrics['enhancement_times'])
        if bridge.metrics['enhancement_times'] else 0
    )
    avg_execution_time = (
        sum(bridge.metrics['execution_times']) / len(bridge.metrics['execution_times'])
        if bridge.metrics['execution_times'] else 0
    )

    # System resources
    process = psutil.Process()
    memory_info = process.memory_info()

    return {
        'status': 'healthy',
        'uptime_seconds': round(uptime, 2),
        'sessions': {
            'active': len(bridge.sessions),
            'total_enhancements': bridge.metrics['total_enhancements'],
            'total_executions': bridge.metrics['total_executions'],
            'total_failures': bridge.metrics['total_failures']
        },
        'websocket': {
            'active_connections': len(bridge.active_connections)
        },
        'performance': {
            'avg_enhancement_time_seconds': round(avg_enhancement_time, 2),
            'avg_execution_time_seconds': round(avg_execution_time, 2)
        },
        'system': {
            'memory_mb': round(memory_info.rss / 1024 / 1024, 2),
            'cpu_percent': process.cpu_percent(interval=0.1)
        },
        'timestamp': datetime.now().isoformat()
    }


@app.get("/api/metrics")
async def get_metrics():
    """Get detailed metrics"""
    return {
        'metrics': bridge.metrics,
        'recent_errors': bridge.recent_errors[-10:],  # Last 10 errors
        'sessions': {
            'by_status': {
                status: len([s for s in bridge.sessions.values() if s['status'] == status])
                for status in ['pending_review', 'executing', 'completed', 'failed', 'rejected']
            }
        }
    }


@app.get("/api/errors")
async def get_errors(limit: int = 50):
    """Get recent errors for troubleshooting"""
    limit = min(limit, len(bridge.recent_errors))
    return {
        'errors': bridge.recent_errors[-limit:],
        'total_failures': bridge.metrics['total_failures']
    }


@app.get("/api/analytics")
async def get_analytics():
    """Get usage analytics"""
    uptime = time.time() - bridge.metrics['start_time']

    # Calculate success rate
    total_attempts = bridge.metrics['total_executions'] + bridge.metrics['total_failures']
    success_rate = (
        bridge.metrics['total_executions'] / total_attempts if total_attempts > 0 else 0
    )

    # Sessions by project
    projects = {}
    for session in bridge.sessions.values():
        project = session['project_path']
        projects[project] = projects.get(project, 0) + 1

    return {
        'uptime_hours': round(uptime / 3600, 2),
        'total_sessions': len(bridge.sessions),
        'success_rate': round(success_rate, 2),
        'enhancements_per_hour': round(bridge.metrics['total_enhancements'] / (uptime / 3600), 2),
        'executions_per_hour': round(bridge.metrics['total_executions'] / (uptime / 3600), 2),
        'projects': projects,
        'recent_activity': [
            {
                'session_id': sid,
                'status': s['status'],
                'created_at': s['created_at']
            }
            for sid, s in sorted(
                bridge.sessions.items(),
                key=lambda x: x[1]['created_at'],
                reverse=True
            )[:10]
        ]
    }


def main():
    """Main entry point"""
    logger.info("Starting Claude Bridge Agent server")

    config = bridge.config
    host = config.get('server', {}).get('host', '0.0.0.0')
    port = config.get('server', {}).get('port', 8080)

    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )


if __name__ == '__main__':
    main()
