/**
 * Claude Bridge - Chrome Extension Content Script
 * Adds "Send to Bridge" button to Claude.ai conversations
 */

(function() {
  'use strict';

  const BRIDGE_API_URL = 'http://localhost:8080/api/enhance';

  // Add styles
  const styles = `
    .bridge-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .bridge-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(99, 102, 241, 0.4);
    }

    .bridge-button:active {
      transform: translateY(0);
    }

    .bridge-button.sending {
      opacity: 0.7;
      pointer-events: none;
    }

    .bridge-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10001;
      background: rgba(30, 41, 59, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 16px 20px;
      color: #f1f5f9;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
      min-width: 300px;
    }

    .bridge-notification.success {
      border-left: 4px solid #10b981;
    }

    .bridge-notification.error {
      border-left: 4px solid #ef4444;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .bridge-notification-title {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .bridge-notification-message {
      font-size: 14px;
      color: #94a3b8;
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create button
  function createBridgeButton() {
    const button = document.createElement('button');
    button.className = 'bridge-button';
    button.innerHTML = `
      <span>🌉</span>
      <span>Send to Bridge</span>
    `;
    button.addEventListener('click', handleSendToBridge);
    document.body.appendChild(button);
    return button;
  }

  // Extract conversation text
  function extractConversation() {
    // Find the last user message and Claude's response
    const messages = document.querySelectorAll('[data-testid="user-message"], [data-testid="assistant-message"]');

    if (messages.length === 0) {
      // Fallback: try to find any message containers
      const allMessages = document.querySelectorAll('.font-user-message, .font-claude-message');
      if (allMessages.length > 0) {
        const lastMessage = allMessages[allMessages.length - 1];
        return lastMessage.textContent.trim();
      }
      return null;
    }

    // Get last user message
    let userMessage = '';
    let claudeResponse = '';

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.getAttribute('data-testid') === 'user-message' && !userMessage) {
        userMessage = msg.textContent.trim();
      } else if (msg.getAttribute('data-testid') === 'assistant-message' && !claudeResponse) {
        claudeResponse = msg.textContent.trim();
      }

      if (userMessage && claudeResponse) break;
    }

    return {
      userMessage,
      claudeResponse,
      combined: userMessage + '\n\n' + claudeResponse
    };
  }

  // Show notification
  function showNotification(title, message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `bridge-notification ${type}`;
    notification.innerHTML = `
      <div class="bridge-notification-title">${title}</div>
      <div class="bridge-notification-message">${message}</div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Handle send to bridge
  async function handleSendToBridge(e) {
    const button = e.currentTarget;
    button.classList.add('sending');
    button.innerHTML = '<span>⏳</span><span>Sending...</span>';

    try {
      const conversation = extractConversation();

      if (!conversation || !conversation.userMessage) {
        showNotification('No conversation found', 'Please have an active conversation first', 'error');
        return;
      }

      // Get selected project from storage or use default
      const { project = 'dirt-free-crm' } = await chrome.storage.sync.get('project');
      const { projectPath } = await chrome.storage.sync.get('projectPath');

      // Send to bridge API
      const response = await fetch(BRIDGE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw_prompt: conversation.userMessage,
          project_path: projectPath || `/Users/royaltyvixion/Documents/cge software/${project}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      showNotification(
        '✅ Sent to Bridge Agent!',
        `Session ${data.session_id} created. Open Bridge to review.`,
        'success'
      );

      // Open bridge in new tab (optional)
      const { autoOpenBridge } = await chrome.storage.sync.get('autoOpenBridge');
      if (autoOpenBridge) {
        window.open('http://localhost:8080', '_blank');
      }

    } catch (error) {
      console.error('Bridge send error:', error);
      showNotification(
        '❌ Send Failed',
        error.message || 'Could not connect to Bridge Agent. Is it running?',
        'error'
      );
    } finally {
      button.classList.remove('sending');
      button.innerHTML = '<span>🌉</span><span>Send to Bridge</span>';
    }
  }

  // Initialize
  function init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Create button after a short delay to ensure page is ready
    setTimeout(() => {
      createBridgeButton();
    }, 1000);
  }

  init();
})();
