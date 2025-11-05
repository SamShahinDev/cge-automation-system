// Claude Bridge Agent - Frontend Application

class BridgeApp {
    constructor() {
        this.ws = null;
        this.currentSession = null;
        this.sessions = [];

        this.init();
    }

    init() {
        this.connectWebSocket();
        this.setupEventListeners();
        this.loadSessions();
    }

    // WebSocket Connection
    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.updateConnectionStatus(true);
            this.showToast('Connected to Bridge Agent', 'success');
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.updateConnectionStatus(false);
            this.showToast('Disconnected from server', 'error');

            // Reconnect after 3 seconds
            setTimeout(() => this.connectWebSocket(), 3000);
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'status_update':
                this.handleStatusUpdate(data);
                break;
            case 'progress':
                this.handleProgress(data);
                break;
            case 'pong':
                // Keep-alive response
                break;
        }
    }

    updateConnectionStatus(connected) {
        const indicator = document.querySelector('#connection-status .dot');
        const text = document.querySelector('#connection-status');

        if (connected) {
            indicator.className = 'dot online';
            text.innerHTML = '<span class="dot online"></span> Connected';
        } else {
            indicator.className = 'dot offline';
            text.innerHTML = '<span class="dot offline"></span> Disconnected';
        }
    }

    // Event Listeners
    setupEventListeners() {
        document.getElementById('enhance-btn').addEventListener('click', () => this.handleEnhance());
        document.getElementById('approve-btn').addEventListener('click', () => this.handleApprove());
        document.getElementById('reject-btn').addEventListener('click', () => this.handleReject());
        document.getElementById('edit-btn').addEventListener('click', () => this.handleEdit());
        document.getElementById('new-task-btn').addEventListener('click', () => this.handleNewTask());
        document.getElementById('clear-console').addEventListener('click', () => this.clearConsole());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const enhanceBtn = document.getElementById('enhance-btn');
                    if (!enhanceBtn.disabled) {
                        this.handleEnhance();
                    }
                }
            }
        });
    }

    // Enhance Prompt
    async handleEnhance() {
        const projectPath = document.getElementById('project-path').value.trim();
        const rawPrompt = document.getElementById('raw-prompt').value.trim();

        if (!projectPath || !rawPrompt) {
            this.showToast('Please provide both project path and prompt', 'error');
            return;
        }

        const btn = document.getElementById('enhance-btn');
        btn.disabled = true;
        btn.textContent = '✨ Enhancing...';

        try {
            const response = await fetch('/api/enhance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    raw_prompt: rawPrompt,
                    project_path: projectPath
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.currentSession = data;
            this.showReviewSection(data);
            this.showToast('Prompt enhanced successfully!', 'success');

        } catch (error) {
            console.error('Enhancement failed:', error);
            this.showToast(`Enhancement failed: ${error.message}`, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = '✨ Enhance with AI Context';
        }
    }

    // Show Review Section
    showReviewSection(data) {
        // Hide input, show review
        document.getElementById('input-section').style.display = 'none';
        document.getElementById('review-section').style.display = 'block';

        // Populate data
        document.getElementById('original-display').textContent = data.raw_prompt;
        document.getElementById('enhanced-display').textContent = data.enhanced_prompt;
        document.getElementById('session-id').textContent = data.session_id;
        document.getElementById('context-files-count').textContent = data.context_files.length;

        // Complexity badge
        const badge = document.getElementById('complexity-badge');
        badge.textContent = data.estimated_complexity;
        badge.className = `badge ${data.estimated_complexity}`;

        // Improvements
        const improvementsList = document.getElementById('improvements-list');
        improvementsList.innerHTML = '';
        data.improvements.forEach(improvement => {
            const li = document.createElement('li');
            li.textContent = improvement;
            improvementsList.appendChild(li);
        });

        // Scroll to review
        document.getElementById('review-section').scrollIntoView({ behavior: 'smooth' });
    }

    // Approve Execution
    async handleApprove() {
        if (!this.currentSession) return;

        const btn = document.getElementById('approve-btn');
        btn.disabled = true;

        // Hide review, show execution
        document.getElementById('review-section').style.display = 'none';
        document.getElementById('execution-section').style.display = 'block';

        // Start execution
        try {
            const response = await fetch(`/api/execute/${this.currentSession.session_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    enhanced_prompt: this.currentSession.enhanced_prompt,
                    project_path: document.getElementById('project-path').value,
                    approved: true
                })
            });

            const result = await response.json();
            console.log('Execution started:', result);

        } catch (error) {
            console.error('Execution failed:', error);
            this.showToast(`Execution failed: ${error.message}`, 'error');
        }

        // Scroll to execution
        document.getElementById('execution-section').scrollIntoView({ behavior: 'smooth' });
    }

    // Reject
    handleReject() {
        this.showToast('Execution rejected', 'info');
        this.handleNewTask();
    }

    // Edit
    handleEdit() {
        const enhancedPrompt = document.getElementById('enhanced-display').textContent;
        document.getElementById('raw-prompt').value = enhancedPrompt;

        document.getElementById('review-section').style.display = 'none';
        document.getElementById('input-section').style.display = 'block';

        document.getElementById('input-section').scrollIntoView({ behavior: 'smooth' });
    }

    // New Task
    handleNewTask() {
        this.currentSession = null;

        document.getElementById('input-section').style.display = 'block';
        document.getElementById('review-section').style.display = 'none';
        document.getElementById('execution-section').style.display = 'none';

        document.getElementById('raw-prompt').value = '';
        this.clearConsole();

        document.getElementById('input-section').scrollIntoView({ behavior: 'smooth' });
    }

    // Handle Status Update
    handleStatusUpdate(data) {
        if (data.status === 'executing') {
            document.getElementById('progress-status').textContent = 'Executing in Claude Code...';
            this.updateProgress(10);
        } else if (data.status === 'completed') {
            document.getElementById('progress-status').textContent = '✅ Execution completed successfully!';
            this.updateProgress(100);
            document.getElementById('new-task-btn').style.display = 'block';
            this.showToast('Execution completed!', 'success');
            this.loadSessions();
        } else if (data.status === 'failed') {
            document.getElementById('progress-status').textContent = '❌ Execution failed';
            this.updateProgress(0);
            this.showToast('Execution failed', 'error');
        }
    }

    // Handle Progress
    handleProgress(data) {
        const console = document.getElementById('console');
        const line = document.createElement('div');
        line.className = 'console-line';

        // Detect message type
        if (data.message.includes('❌') || data.message.includes('error')) {
            line.className += ' error';
        } else if (data.message.includes('⚠️') || data.message.includes('warning')) {
            line.className += ' warning';
        } else if (data.message.includes('✅') || data.message.includes('success')) {
            line.className += ' success';
        }

        line.textContent = `[${new Date().toLocaleTimeString()}] ${data.message}`;
        console.appendChild(line);

        // Auto-scroll
        console.scrollTop = console.scrollHeight;

        // Update progress bar (simple heuristic)
        const currentProgress = parseInt(document.getElementById('progress-fill').style.width) || 0;
        if (currentProgress < 90) {
            this.updateProgress(currentProgress + 5);
        }
    }

    updateProgress(percent) {
        document.getElementById('progress-fill').style.width = `${percent}%`;
    }

    clearConsole() {
        document.getElementById('console').innerHTML = '';
    }

    // Load Sessions
    async loadSessions() {
        try {
            const response = await fetch('/api/sessions');
            const data = await response.json();

            this.sessions = data.sessions || [];
            this.renderSessions();
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    }

    renderSessions() {
        const container = document.getElementById('sessions-list');

        if (this.sessions.length === 0) {
            container.innerHTML = '<p class="empty-state">No sessions yet</p>';
            return;
        }

        container.innerHTML = '';

        this.sessions.forEach(session => {
            const item = document.createElement('div');
            item.className = 'session-item';

            const statusClass = session.status.replace('_', '-');
            const statusText = session.status.replace('_', ' ').toUpperCase();

            item.innerHTML = `
                <div class="session-header">
                    <span class="session-id">${session.session_id}</span>
                    <span class="session-status ${statusClass}">${statusText}</span>
                </div>
                <div class="session-time">${new Date(session.created_at).toLocaleString()}</div>
            `;

            item.addEventListener('click', () => this.loadSession(session.session_id));

            container.appendChild(item);
        });
    }

    async loadSession(sessionId) {
        try {
            const response = await fetch(`/api/session/${sessionId}`);
            const session = await response.json();

            console.log('Loaded session:', session);
            this.showToast(`Loaded session: ${sessionId}`, 'info');

            // TODO: Populate UI with session data
        } catch (error) {
            console.error('Failed to load session:', error);
            this.showToast('Failed to load session', 'error');
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize app
const app = new BridgeApp();

// Keep WebSocket alive
setInterval(() => {
    if (app.ws && app.ws.readyState === WebSocket.OPEN) {
        app.ws.send('ping');
    }
}, 30000);
