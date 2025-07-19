// background.js (service worker)

// Listen for new target time from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'setSleepTime') {
    const now = Date.now();
    const target = msg.timestamp;
    const delay = target - now;
    if (delay <= 0) {
      return sendResponse({ success: false, error: 'Time must be in the future.' });
    }

    // Store both the start and target timestamp
    chrome.storage.local.set({ sleepTarget: target, sleepStart: now });

    // Clear existing alarm, then create a new one
    chrome.alarms.clear('sleepAlarm', () => {
      chrome.alarms.create('sleepAlarm', { when: target });
    });

    sendResponse({ success: true });
  }
});

// Alarm fired: notify (could do more here)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sleepAlarm') {
    // Optionally you could push a notification here
    console.log('Time to sleep!');
  }
});