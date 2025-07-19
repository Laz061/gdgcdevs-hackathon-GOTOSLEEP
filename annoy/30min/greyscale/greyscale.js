// greyscale.js - content script
console.log('greyscale.js loaded');

function applyGreyscale() {
  document.documentElement.style.filter = 'grayscale(1)';
  if (document.body) {
    document.body.classList.add('greyscale-active');
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'greyscaleActive') {
    applyGreyscale();
    chrome.storage.local.set({ greyscaleActive: true });
    sendResponse({ success: true });
  }
});

chrome.storage.local.get('greyscaleActive', ({ greyscaleActive }) => {
  if (greyscaleActive) {
    applyGreyscale();
  }
});
