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
  gif.src = chrome.runtime.getURL('annoy/0sec/flashtime/gojo.gif');  gif.alt = 'Alert GIF';
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

    // Draw rounded rectangle background
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    // Theme colors
    const bgColor = '#f8faff';
    const borderColor = '#5468ff';
    const shadowColor = 'rgba(60, 79, 224, 0.12)';
    const textColor = '#3c4fe0';
    const fontFamily = 'bold 96px "JetBrains Mono", monospace';

    // Draw shadow
    ctx.save();
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 32;
    roundRect(ctx, 240, 160, 800, 400, 48);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.restore();

    // Draw border
    roundRect(ctx, 240, 160, 800, 400, 48);
    ctx.lineWidth = 8;
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    // Draw time text
    ctx.font = fontFamily;
    ctx.fillStyle = textColor;
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