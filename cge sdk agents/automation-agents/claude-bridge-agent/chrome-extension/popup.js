// Popup script for Claude Bridge extension

document.addEventListener('DOMContentLoaded', async () => {
  const apiUrlInput = document.getElementById('apiUrl');
  const projectSelect = document.getElementById('project');
  const projectPathInput = document.getElementById('projectPath');
  const customPathContainer = document.getElementById('customPathContainer');
  const autoOpenBridgeCheckbox = document.getElementById('autoOpenBridge');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  const settings = await chrome.storage.sync.get(['apiUrl', 'project', 'projectPath', 'autoOpenBridge']);

  apiUrlInput.value = settings.apiUrl || 'http://localhost:8080';
  projectSelect.value = settings.project || 'dirt-free-crm';
  projectPathInput.value = settings.projectPath || '';
  autoOpenBridgeCheckbox.checked = settings.autoOpenBridge || false;

  if (settings.project === 'custom') {
    customPathContainer.style.display = 'block';
  }

  // Show/hide custom path
  projectSelect.addEventListener('change', () => {
    if (projectSelect.value === 'custom') {
      customPathContainer.style.display = 'block';
    } else {
      customPathContainer.style.display = 'none';
    }
  });

  // Save settings
  saveBtn.addEventListener('click', async () => {
    await chrome.storage.sync.set({
      apiUrl: apiUrlInput.value,
      project: projectSelect.value,
      projectPath: projectPathInput.value,
      autoOpenBridge: autoOpenBridgeCheckbox.checked,
    });

    showStatus('Settings saved!', 'success');
  });

  // Test connection
  testBtn.addEventListener('click', async () => {
    showStatus('Testing connection...', 'info');

    try {
      const response = await fetch(`${apiUrlInput.value}/health`);

      if (response.ok) {
        const data = await response.json();
        showStatus(`✅ Connected! (${data.status})`, 'success');
      } else {
        showStatus('❌ Bridge not responding', 'error');
      }
    } catch (error) {
      showStatus('❌ Connection failed. Is Bridge running?', 'error');
    }
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';

    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
});
