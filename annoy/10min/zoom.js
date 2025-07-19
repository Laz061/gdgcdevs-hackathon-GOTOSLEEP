// zoom.js - content script for 10min alarm


(function() {
  let zoomInterval;
  function randomZoom() {
    chrome.storage.local.get(['zoomActive'], ({ zoomActive }) => {
      if (!zoomActive) return;
      const minScale = 1;
      const maxScale = 2.5;
      const scale = Math.random() * (maxScale - minScale) + minScale;
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      document.body.style.transition = 'transform 0.5s';
      document.body.style.transformOrigin = `${x}px ${y}px`;
      document.body.style.transform = `scale(${scale})`;
      setTimeout(() => {
        document.body.style.transform = 'scale(1)';
      }, 1000);
    });
  }
  function startZoomEffect() {
    if (zoomInterval) clearInterval(zoomInterval);
    zoomInterval = setInterval(() => {
      randomZoom();
    }, Math.random() * 15000 + 5000); // 5-20 seconds
  }
  startZoomEffect();
  window.zoomInterval = zoomInterval;
})();
