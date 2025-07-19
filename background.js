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
          chrome.alarms.create('greyscaleAlarm', { when: thirtyMinBefore });
        }
        sendResponse({ success: true });
      });
    });

    return true; // Indicates we'll respond asynchronously
  }
});

// Apply grayscale when alarm triggers
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'greyscaleAlarm') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url?.startsWith('http')) {
          // Correct path to CSS file
          chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['annoy/30min/greyscale/greyscale.css'] // Use correct relative path
          }).catch(err => {
            console.log(`Skipping tab ${tab.id}: ${err.message}`);
          });
        }
      });
    });
  }
});