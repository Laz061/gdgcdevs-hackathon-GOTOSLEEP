(function flashCurrentTime() {
  const old = document.getElementById('gosleep-flash-time');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.id = 'gosleep-flash-time';
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.95)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = 999999;
  overlay.style.transition = 'opacity 0.5s';


  // Add GIF
  const gif = document.createElement('img');
  gif.src = chrome.runtime.getURL('annoy/30min/timeflash/gojo.gif');  gif.alt = 'Alert GIF';
  gif.style.width = '1280px';
  gif.style.height = '720px';
  gif.style.objectFit = 'contain';
  overlay.appendChild(gif);
  document.body.appendChild(overlay);

  // Show GIF for 2 seconds, then flash the time
  setTimeout(() => {
    overlay.innerHTML = ''; // Remove GIF

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = '#222';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    ctx.fillText(timeStr, canvas.width / 2, canvas.height / 2);



    overlay.appendChild(canvas);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = 0;
        setTimeout(() => overlay.remove(), 500);
    }, 2000);
  }, 7750);
})();