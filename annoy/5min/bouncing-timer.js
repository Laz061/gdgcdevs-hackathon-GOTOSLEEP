// bouncing-timer.js
(function createBouncingTimer() {
  // Prevent duplicate timers
  const existingTimer = document.getElementById('gosleep-bouncing-timer');
  if (existingTimer) return;

  // Create the timer element
  const timer = document.createElement('div');
  timer.id = 'gosleep-bouncing-timer';
  timer.style.cssText = `
    position: fixed;
    top: 50px;
    left: 50px;
    width: 200px;
    height: 60px;
    background: linear-gradient(45deg, #000000ff, #ffffffff);
    color: white;
    font-family: 'Courier New', monospace;
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    border: 3px solid white;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 999999;
    user-select: none;
    pointer-events: none;
    transition: background 0.3s ease;
  `;

  document.body.appendChild(timer);

  // Movement variables
  let x = 50;
  let y = 50;
  let dx = 2; // horizontal speed
  let dy = 1.5; // vertical speed
  
  function updateTimer() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    timer.textContent = timeString;
  }

  function moveTimer() {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const timerWidth = timer.offsetWidth;
    const timerHeight = timer.offsetHeight;

    // Update position
    x += dx;
    y += dy;

    // Check for collisions and bounce
    if (x <= 0 || x >= viewportWidth - timerWidth) {
      dx = -dx;
    }
    
    if (y <= 0 || y >= viewportHeight - timerHeight) {
      dy = -dy;
    }

    // Keep within bounds
    x = Math.max(0, Math.min(x, viewportWidth - timerWidth));
    y = Math.max(0, Math.min(y, viewportHeight - timerHeight));

    // Apply position
    timer.style.left = x + 'px';
    timer.style.top = y + 'px';
  }

  // Update timer display every second
  updateTimer();
  const timeInterval = setInterval(updateTimer, 1000);

  // Move timer every 16ms (~60fps)
  const moveInterval = setInterval(moveTimer, 16);

  // Auto-cleanup after 2 minutes (120,000ms)
  const autoCleanupTimeout = setTimeout(() => {
    timer.cleanup();
  }, 120000);

  // Handle window resize
  function handleResize() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const timerWidth = timer.offsetWidth;
    const timerHeight = timer.offsetHeight;

    // Keep timer within new bounds
    x = Math.min(x, viewportWidth - timerWidth);
    y = Math.min(y, viewportHeight - timerHeight);
    timer.style.left = x + 'px';
    timer.style.top = y + 'px';
  }

  window.addEventListener('resize', handleResize);

  // Clean up function (for when extension is disabled/reloaded)
  timer.cleanup = function() {
    clearInterval(timeInterval);
    clearInterval(moveInterval);
    clearTimeout(autoCleanupTimeout);
    window.removeEventListener('resize', handleResize);
    timer.remove();
  };

  // Store cleanup function globally for extension management
  window.goSleepBouncingTimerCleanup = timer.cleanup;
})();