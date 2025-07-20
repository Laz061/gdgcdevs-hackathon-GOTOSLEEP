// Clear the entire page and show sleep message
document.body.innerHTML = '';

const sleepMsg = document.createElement('div');
sleepMsg.textContent = '💤 Time to sleep! 💤';
sleepMsg.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  color: white;
  font-size: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;
document.body.appendChild(sleepMsg);

// Optional: Prevent further interaction
document.body.style.pointerEvents = 'none';