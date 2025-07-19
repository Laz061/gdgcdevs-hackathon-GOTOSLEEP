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
          // If less than 30 minutes remain, trigger greyscale immediately
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
        // 10-min alarm
        const tenMinBefore = target - 10 * 60 * 1000;
        if (tenMinBefore > now) {
          chrome.alarms.create('10minAlarm', { when: tenMinBefore });
        } else if (delay > 0 && delay <= 10 * 60 * 1000) {
          chrome.storage.local.set({ zoomActive: true });
          applyZoomToAllTabs();
        }
        sendResponse({ success: true });
      });
    });
    return true;
  }
  if (msg.type === 'reset') {
    chrome.storage.local.set({ greyscaleActive: false, corruptActive: false, zoomActive: false }, () => {
      chrome.alarms.clearAll(() => {
        removeGreyscaleFromAllTabs();
        removeCorruptFromAllTabs();
        removeZoomFromAllTabs();
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

function applyZoomToAllTabs() {
  chrome.storage.local.set({ zoomActive: true }, () => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url?.startsWith('http')) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['annoy/10min/zoom.js']
          }).catch(err => {
            console.log(`Skipping tab ${tab.id}: ${err.message}`);
          });
        }
      });
    });
  });
}

function removeZoomFromAllTabs() {
  chrome.storage.local.set({ zoomActive: false }, () => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url?.startsWith('http')) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['annoy/10min/unzoom.js']
          }).catch(err => {
            console.log(`Skipping tab ${tab.id}: ${err.message}`);
          });
        }
      });
    });
  });
}

function flashTimeOnAllTabs() {
  removeGreyscaleFromAllTabs();

  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url?.startsWith('http')) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['annoy/0sec/flashtime/timeflash.js']
        }).catch(err => {
          console.log(`Skipping tab ${tab.id}: ${err.message}`);
        });
      }
    });
  });
  setTimeout(() => {
    chrome.storage.local.get('greyscaleActive', ({ greyscaleActive }) => {
      if (greyscaleActive) {
        applyGreyscaleToAllTabs();
      }
    });
  }, 11000);

}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === '30minAlarm') {
    notifyPet();
    applyGreyscaleToAllTabs();
  }
  if (alarm.name === '20minAlarm') {
    notifyPet();
    applyCorruptToAllTabs();
  }
  if (alarm.name === '10minAlarm') {
    notifyPet();
    applyZoomToAllTabs();
  }
  if (alarm.name === 'sleepAlarm') {
    flashTimeOnAllTabs();
    }
  });



chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
    chrome.storage.local.get(['greyscaleActive', 'corruptActive', 'zoomActive'], ({ greyscaleActive, corruptActive, zoomActive }) => {
      if (greyscaleActive) {

        applyGreyscaleToAllTabs();
      }
      if (corruptActive) {

        applyCorruptToAllTabs();
      }
      if (zoomActive) {

        applyZoomToAllTabs();
      }
    });
  }
});

function notifyPet() {
  // Log to the console that the function was called
  console.log('notifyPet called');
  
  // Query for the currently active tab in the current window

  //active: true, currentWindow: true
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {

    // For each tab returned (should be one, but could be more in rare cases)
    tabs.forEach(tab => {
      
      // Log to the console that a message is being sent to this tab
      console.log('Sending petReact to tab', tab.id);
      
      // Send a message of type 'petReact' to the content script in this tab
      chrome.tabs.sendMessage(tab.id, { type: 'petReact' });
    });
  });
}