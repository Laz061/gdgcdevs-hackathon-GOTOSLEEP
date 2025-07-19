// Listen for new target time from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'setSleepTime') {
    const now = Date.now();
    const target = msg.timestamp;
    const delay = target - now;
    
    if (delay <= 0) {
      sendResponse({ success: false, error: 'Time must be in the future.' });
      return true; // Important: return true to keep channel open
    }

    // Store target timestamp
    chrome.storage.local.set({ sleepTarget: target }, () => {
      // Clear existing alarms
      chrome.alarms.clearAll(() => {
        // Create main sleep alarm
        chrome.alarms.create('sleepAlarm', { when: target });
        
        // Create 30-min warning alarm
        const thirtyMinBefore = target - 30 * 60 * 1000;
        if (thirtyMinBefore > now) {
          chrome.alarms.create('30minAlarm', { when: thirtyMinBefore });

        } else {
          // If less than 30 minutes remain, trigger greyscale immediately
          chrome.storage.local.set({ greyscaleActive: true });
          applyGreyscaleToAllTabs();
        }
        sendResponse({ success: true });
      });
    });

    return true; // Indicates we'll respond asynchronously
  }
  if (msg.type === 'resetSleepTime') {
    chrome.storage.local.set({ greyscaleActive: false }, () => {
      chrome.alarms.clearAll(() => {
        removeGreyscaleFromAllTabs();
        sendResponse({ success: true });
      });
    });
    return true;
  }
});

function applyGreyscaleToAllTabs() {
  chrome.storage.local.set({ greyscaleActive: true });
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url?.startsWith('http')) {
        chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['annoy/30min/greyscale/greyscale.css']
        }).catch(err => {
          console.log(`Skipping tab ${tab.id}: ${err.message}`);
        });
      }
    });
  });
}

function removeGreyscaleFromAllTabs() {
    chrome.storage.local.set({ greyscaleActive: false });
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url?.startsWith('http')) {
        chrome.scripting.removeCSS({
          target: { tabId: tab.id },
          files: ['annoy/30min/greyscale/greyscale.css']
        }).catch(err => {
          console.log(`Skipping tab ${tab.id}: ${err.message}`);
        });
      }
    });
  });
}

// Apply grayscale when alarm triggers
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === '30minAlarm') {
    notifyPet();
    applyGreyscaleToAllTabs();
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
    chrome.storage.local.get('greyscaleActive', ({ greyscaleActive }) => {
      if (greyscaleActive) {
        notifyPet();
        applyGreyscaleToAllTabs();
      }
    });
  }
});

function notifyPet() {
  console.log('notifyPet called');
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    tabs.forEach(tab => {
      console.log('Sending petReact to tab', tab.id);
      chrome.tabs.sendMessage(tab.id, { type: 'petReact' });
    });
  });
}