// AutoTask Chrome Extension - Popup Script
// Türkçe: Popup UI logic ve background communication

const DASHBOARD_URL = 'http://localhost:3000'; // Update after deploy

// State
let currentWorkflows = [];
let selectedWorkflow = null;
let isRunning = false;

// DOM elements
const workflowList = document.getElementById('workflowList');
const emptyState = document.getElementById('emptyState');
const runBtn = document.getElementById('runBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const logsSection = document.getElementById('logsSection');
const logsContainer = document.getElementById('logsContainer');
const workflowsSection = document.getElementById('workflowsSection');

// Initialize
async function init() {
  await loadWorkflows();
  await checkStatus();
  setupEventListeners();
}

// Load workflows from dashboard
async function loadWorkflows() {
  try {
    // Try to fetch from local dashboard first
    const response = await fetch(`${DASHBOARD_URL}/api/workflows`);
    if (response.ok) {
      currentWorkflows = await response.json();
    } else {
      // Fallback to storage
      const { workflows } = await chrome.storage.local.get('workflows');
      currentWorkflows = workflows || [];
    }

    renderWorkflows();
  } catch (error) {
    console.error('Failed to load workflows:', error);
    // Load from storage as fallback
    const { workflows } = await chrome.storage.local.get('workflows');
    currentWorkflows = workflows || [];
    renderWorkflows();
  }
}

// Render workflow list
function renderWorkflows() {
  if (currentWorkflows.length === 0) {
    workflowList.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  workflowList.innerHTML = currentWorkflows.map(w => `
    <div class="workflow-item ${selectedWorkflow?.id === w.id ? 'active' : ''}"
         data-id="${w.id}">
      <div class="workflow-name">${w.name}</div>
      <div class="workflow-desc">${w.description || 'No description'}</div>
      <span class="badge">${w.status}</span>
    </div>
  `).join('');

  // Add click listeners
  workflowList.querySelectorAll('.workflow-item').forEach(item => {
    item.addEventListener('click', () => {
      const workflowId = item.dataset.id;
      selectedWorkflow = currentWorkflows.find(w => w.id === workflowId);
      renderWorkflows();
      updateRunButton();
    });
  });

  updateRunButton();
}

// Update run button state
function updateRunButton() {
  runBtn.disabled = !selectedWorkflow || isRunning;
  stopBtn.disabled = !isRunning;
}

// Check execution status
async function checkStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
    if (response?.success) {
      const { state, activeWorkflow } = response.data;
      isRunning = state === 'running';

      statusDot.classList.toggle('error', state === 'error');
      statusText.textContent = state.charAt(0).toUpperCase() + state.slice(1);

      if (isRunning) {
        workflowsSection.classList.add('hidden');
        logsSection.classList.remove('hidden');
      } else {
        workflowsSection.classList.remove('hidden');
        logsSection.classList.add('hidden');
      }

      updateRunButton();
    }
  } catch (error) {
    console.error('Failed to check status:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  runBtn.addEventListener('click', runWorkflow);
  stopBtn.addEventListener('click', stopWorkflow);

  // Poll status when running
  setInterval(checkStatus, 1000);
}

// Run workflow
async function runWorkflow() {
  if (!selectedWorkflow) return;

  isRunning = true;
  updateRunButton();
  logsContainer.innerHTML = '';
  workflowsSection.classList.add('hidden');
  logsSection.classList.remove('hidden');

  addLog('info', `Starting: ${selectedWorkflow.name}`);

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'START_EXECUTION',
      payload: selectedWorkflow,
    });

    if (response?.success) {
      addLog('success', `Completed: ${response.data.results.length} steps`);
      addLog('info', `Execution ID: ${response.data.executionId}`);
    } else {
      addLog('error', response?.error || 'Execution failed');
    }
  } catch (error) {
    addLog('error', error.message);
  }

  isRunning = false;
  await checkStatus();
}

// Stop workflow
async function stopWorkflow() {
  try {
    await chrome.runtime.sendMessage({ type: 'STOP_EXECUTION' });
    addLog('info', 'Workflow stopped');
  } catch (error) {
    addLog('error', error.message);
  }

  isRunning = false;
  await checkStatus();
}

// Add log entry
function addLog(level, message) {
  const entry = document.createElement('div');
  entry.className = `log-entry ${level}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logsContainer.appendChild(entry);
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Initialize on load
init();
