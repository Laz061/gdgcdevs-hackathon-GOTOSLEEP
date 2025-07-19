// greyscale.js - content script
console.log('greyscale.js loaded');

function applyGreyscale() {
  document.documentElement.style.filter = 'grayscale(1)';
  if (document.body) {
    document.body.classList.add('greyscale-active');
  }
}

function removeGreyscale() {
  document.documentElement.style.filter = '';
  if (document.body) {
    document.body.classList.remove('greyscale-active');
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'greyscaleActive') {
    applyGreyscale();
    chrome.storage.local.set({ greyscaleActive: true });
    sendResponse({ success: true });
  }
  if (msg && msg.type === 'removeGreyscale') {
    removeGreyscale();
    chrome.storage.local.set({ greyscaleActive: false });
    sendResponse({ success: true });
  }
});

function checkGreyscaleStatus() {
  chrome.storage.local.get('greyscaleActive', ({ greyscaleActive }) => {
    if (greyscaleActive) {
      applyGreyscale();
    } else {
      removeGreyscale();
    }
  });
}

// Check greyscale status on every page load
checkGreyscaleStatus();
