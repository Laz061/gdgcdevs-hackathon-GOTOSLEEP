const sleepInput = document.getElementById('sleepTime');
const startBtn   = document.getElementById('startBtn');
const countdownEl= document.getElementById('countdown');
const hoursEl    = document.getElementById('hours');
const minutesEl  = document.getElementById('minutes');
const secondsEl  = document.getElementById('seconds');
const progressBar= document.querySelector('.progress-bar');
const progressEl = document.getElementById('progress');
const messageEl  = document.getElementById('message');
const loadingEl  = document.getElementById('loading');
const resetBtn   = document.getElementById('resetBtn');
const labelEl    = document.querySelector('label[for="sleepTime"]');

let intervalId;

function showInputUI() {
  // Show input UI, hide countdown/progress/reset
  labelEl.classList.remove('hidden');
  sleepInput.classList.remove('hidden');
  startBtn.classList.remove('hidden');
  resetBtn.classList.add('hidden');
  countdownEl.classList.add('hidden');
  progressBar.classList.add('hidden');
  messageEl.classList.add('hidden');
  progressEl.style.width = '0%';
  sleepInput.value = '';
}

// On load, restore any existing target and start updating
// Always restore timer state from background storage
// Use sleepStart from storage for progress calculation

document.addEventListener('DOMContentLoaded', () => {
  loadingEl.classList.remove('hidden');

  chrome.storage.local.get(['sleepTarget', 'sleepStart'], ({ sleepTarget, sleepStart }) => {
    loadingEl.classList.add('hidden');
    if (sleepTarget && sleepStart) {
      startDisplay(sleepTarget, sleepStart);
    } else if (sleepTarget) {
      // Fallback for legacy: if only sleepTarget exists, use popup open time as start
      startDisplay(sleepTarget, Date.now());
    } else {
      showInputUI();
    }
  });
});

startBtn.addEventListener('click', () => {
  if (!sleepInput.value) return alert('Please select a time.');

  // Compute target timestamp
  const [h, m] = sleepInput.value.split(':').map(Number);
  let target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= new Date()) target.setDate(target.getDate() + 1);
  const ts = target.getTime();

  // Send to background to store and set alarm
  chrome.runtime.sendMessage(
    { type: 'setSleepTime', timestamp: ts },
    (resp) => {
      if (resp.success) {
        // Store start time persistently for progress bar
        chrome.storage.local.set({ sleepStart: Date.now() }, () => {
          startDisplay(ts, Date.now());
        });
      } else {
        alert(resp.error);
      }
    }
  );
});

resetBtn.addEventListener('click', () => {
  // Clear storage and reset UI
  chrome.storage.local.remove(['sleepTarget', 'sleepStart'], () => {
    clearInterval(intervalId);
    showInputUI();
  });
});

function startDisplay(targetTs, startTs) {
  // Hide input UI, show countdown/progress/reset
  labelEl.classList.add('hidden');
  sleepInput.classList.add('hidden');
  startBtn.classList.add('hidden');
  resetBtn.classList.remove('hidden');
  countdownEl.classList.remove('hidden');
  progressBar.classList.remove('hidden');
  messageEl.classList.add('hidden');
  loadingEl.classList.add('hidden');

  clearInterval(intervalId);

  // Use the original start time for progress calculation
  const total = targetTs - startTs;

  function updateCountdown() {
    const now = Date.now();
    const rem = targetTs - now;
    if (rem <= 0) {
      clearInterval(intervalId);
      countdownEl.classList.add('hidden');
      progressBar.classList.add('hidden');
      messageEl.classList.remove('hidden');
      resetBtn.classList.remove('hidden');
      return;
    }

    const hrs = Math.floor(rem / 3600000);
    const mins = Math.floor((rem % 3600000) / 60000);
    const secs = Math.floor((rem % 60000) / 1000);

    hoursEl.textContent = String(hrs).padStart(2, '0');
    minutesEl.textContent = String(mins).padStart(2, '0');
    secondsEl.textContent = String(secs).padStart(2, '0');

    const elapsed = now - startTs;
    const pct = Math.min((elapsed / total) * 100, 100);
    progressEl.style.width = pct + '%';
  }

  updateCountdown(); // Show immediately
  intervalId = setInterval(updateCountdown, 1000);
}

// Add this to your existing popup.js
function setSleepTime() {
  const parsedTime = parseTimeInput(sleepTimeInput.value);
  
  if (!parsedTime) {
    alert('Please enter a valid time (e.g. 9:30PM or 21:30)');
    return;
  }

  // Send to background.js
  chrome.runtime.sendMessage({
    type: 'setSleepTime',
    timestamp: parsedTime.getTime()
  }, (response) => {
    if (response && !response.success) {
      alert(response.error || 'Failed to set timer');
    }
  });
}