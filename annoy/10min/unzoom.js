// unzoom.js - removes zoom effect
(function() {
  if (window.zoomInterval) {
    clearInterval(window.zoomInterval);
    window.zoomInterval = null;
  }
  document.body.style.transform = 'scale(1)';
  document.body.style.transformOrigin = '';
  document.body.style.transition = '';
})();
