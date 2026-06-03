// AutoTask Content Script
// Minimal placeholder for MVP

console.log('AutoTask content script loaded');

// Listen for messages from background/popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    sendResponse({
      url: window.location.href,
      title: document.title
    });
  }
  return true;
});
