// corrupt.js - content script for 20min alarm
(function() {
  // Corrupt random words
  function corruptWords() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim().length > 2 && Math.random() < 0.2) {
        node.nodeValue = node.nodeValue.replace(/\w+/g, function(word) {
          return Math.random() < 0.5 ? '*#$&)' : word;
        });
      }
    }
  }

  // Blur random images
  function blurImages() {
    const images = Array.from(document.images);
    images.forEach(img => {
      if (Math.random() < 0.3) {
        img.style.filter = 'blur(6px)';
      }
    });
  }

  corruptWords();
  blurImages();
})();
