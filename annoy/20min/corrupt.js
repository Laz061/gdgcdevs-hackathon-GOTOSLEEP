// corrupt.js - content script for 20min alarm
(function() {
  // Corrupt random words, but only in visible text nodes (not script/style)
  function corruptWords() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        // Only accept nodes that are not inside script, style, or noscript tags
        const parent = node.parentNode;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.nodeName.toLowerCase();
        if (["script", "style", "noscript"].includes(tag)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }, false);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.trim().length > 2 && Math.random() < 0.2) {
        node.nodeValue = node.nodeValue.replace(/\b\w+\b/g, function(word) {
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
