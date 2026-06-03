// AutoTask Chrome Extension - Background Service Worker
// Türkçe: Workflow execution ve state management

// Worker URL - deploy sonrası güncelle
const WORKER_URL = 'http://localhost:8787/api/execute';

// Extension state
let activeWorkflow = null;
let executionState = 'idle';

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received:', message);

  switch (message.type) {
    case 'GET_STATUS':
      sendResponse({
        success: true,
        data: { state: executionState, activeWorkflow },
      });
      break;

    case 'START_EXECUTION':
      startExecution(message.payload)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // async response

    case 'STOP_EXECUTION':
      stopExecution();
      sendResponse({ success: true, data: { state: 'idle' } });
      break;

    case 'EXECUTE_STEP':
      executeStep(message.payload)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // async response
  }

  return false;
});

// Start workflow execution
async function startExecution(workflow) {
  console.log('Starting execution:', workflow);
  activeWorkflow = workflow;
  executionState = 'running';

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error('No active tab');
  }

  const results = [];

  // Execute each step
  for (const step of workflow.steps) {
    console.log('Executing step:', step);

    try {
      const result = await executeStepInTab(tab.id, step);
      results.push(result);

      if (!result.success) {
        console.error('Step failed:', result.error);
        executionState = 'error';
        break;
      }
    } catch (error) {
      console.error('Step error:', error);
      results.push({
        stepId: step.id,
        type: step.type,
        success: false,
        error: error.message,
      });
      executionState = 'error';
      break;
    }
  }

  executionState = 'idle';

  return {
    executionId: crypto.randomUUID(),
    results,
    completedAt: new Date().toISOString(),
  };
}

// Stop execution
function stopExecution() {
  executionState = 'idle';
  activeWorkflow = null;
}

// Execute single step in tab
async function executeStepInTab(tabId, step) {
  switch (step.type) {
    case 'navigate':
      await chrome.tabs.update(tabId, { url: step.config.url });
      await waitForNavigation(tabId);
      return { stepId: step.id, type: step.type, success: true };

    case 'wait':
      await new Promise(resolve => setTimeout(resolve, step.config.duration));
      return { stepId: step.id, type: step.type, success: true };

    case 'fill':
      return await chrome.scripting.executeScript({
        target: { tabId },
        func: fillInput,
        args: [step.config],
      }).then(() => ({ stepId: step.id, type: step.type, success: true }));

    case 'click':
      return await chrome.scripting.executeScript({
        target: { tabId },
        func: clickElement,
        args: [step.config],
      }).then(() => ({ stepId: step.id, type: step.type, success: true }));

    case 'extract':
      return await chrome.scripting.executeScript({
        target: { tabId },
        func: extractData,
        args: [step.config],
      }).then(result => ({
        stepId: step.id,
        type: step.type,
        success: true,
        data: result[0].result,
      }));

    default:
      return { stepId: step.id, type: step.type, success: false, error: 'Unknown step type' };
  }
}

// Wait for navigation to complete
async function waitForNavigation(tabId) {
  return new Promise(resolve => {
    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(resolve, 500); // extra buffer for JS execution
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

// Execute single step (called from content script)
async function executeStep(config) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error('No active tab');
  }

  return await executeStepInTab(tab.id, config);
}

// Content script functions (injected via executeScript)
function fillInput(config) {
  const element = document.querySelector(config.selector);
  if (!element) return { success: false, error: 'Element not found' };

  element.value = config.value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));

  return { success: true };
}

function clickElement(config) {
  const element = document.querySelector(config.selector);
  if (!element) return { success: false, error: 'Element not found' };

  element.click();

  const waitFor = config.waitFor || 0;
  if (waitFor > 0) {
    // Note: this won't actually wait in the injected script context
    // The wait happens at the background script level
  }

  return { success: true };
}

function extractData(config) {
  const result = {};

  for (const [key, selector] of Object.entries(config.selectors)) {
    const element = document.querySelector(selector);
    result[key] = element ? (element.textContent?.trim() || null) : null;
  }

  return result;
}

// Handle install/update
chrome.runtime.onInstalled.addListener(() => {
  console.log('AutoTask extension installed');
});
