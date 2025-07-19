// Listen for new target time from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'setSleepTime') {
    const now = Date.now();
    const target = msg.timestamp;
    const delay = target - now;
    if (delay <= 0) {
      sendResponse({ success: false, error: 'Time must be in the future.' });
      return true;
    }

    // Store target timestamp
    chrome.storage.local.set({ sleepTarget: target }, () => {
      // Clear existing alarms
      chrome.alarms.clearAll(() => {
        // Create main sleep alarm
        chrome.alarms.create('sleepAlarm', { when: target });
        // 30-min alarm
        const thirtyMinBefore = target - 30 * 60 * 1000;
        if (thirtyMinBefore > now) {
          chrome.alarms.create('30minAlarm', { when: thirtyMinBefore });
        } else {
          chrome.storage.local.set({ greyscaleActive: true });
          applyGreyscaleToAllTabs();
        }
        // 20-min alarm
        const twentyMinBefore = target - 20 * 60 * 1000;
        if (twentyMinBefore > now) {
          chrome.alarms.create('20minAlarm', { when: twentyMinBefore });
        } else if (delay > 0 && delay <= 20 * 60 * 1000) {
          chrome.storage.local.set({ corruptActive: true });
          applyCorruptToAllTabs();
        }
        sendResponse({ success: true });
      });
    });
    return true;
  }
  if (msg.type === 'reset') {
    chrome.storage.local.set({ greyscaleActive: false, corruptActive: false }, () => {
      chrome.alarms.clearAll(() => {
        removeGreyscaleFromAllTabs();
        removeCorruptFromAllTabs();
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

function applyCorruptToAllTabs() {
  chrome.storage.local.set({ corruptActive: true });
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url?.startsWith('http')) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['annoy/20min/corrupt.js']
        }).catch(err => {
          console.log(`Skipping tab ${tab.id}: ${err.message}`);
        });
      }
    });
  });
}

function removeCorruptFromAllTabs() {
  chrome.storage.local.set({ corruptActive: false });
  // chrome.tabs.query({}, (tabs) => {
  //   tabs.forEach(tab => {
  //     if (tab.url?.startsWith('http')) {
  //       chrome.scripting.executeScript({
  //         target: { tabId: tab.id },
  //         files: ['annoy/20min/uncorrupt.js']
  //       }).catch(err => {
  //         console.log(`Skipping tab ${tab.id}: ${err.message}`);
  //       });
  //     }
  //   });
  // });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === '30minAlarm') {
    notifyPet();
    applyGreyscaleToAllTabs();
  }
  if (alarm.name === '20minAlarm') {
    applyCorruptToAllTabs();
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
    chrome.storage.local.get(['greyscaleActive', 'corruptActive'], ({ greyscaleActive, corruptActive }) => {
      if (greyscaleActive) {
        notifyPet();
        applyGreyscaleToAllTabs();
      }
      if (corruptActive) {
        applyCorruptToAllTabs();
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