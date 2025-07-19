console.log('Content script starting...'); // Initial debug log

window.onload = function() {
    console.log('Window loaded, attempting to create pet...'); // Loading debug log
    
    if (document.getElementById('pet')) {
        console.log('Pet already exists, skipping creation');
        return;
    }
    
    const pet = document.createElement('img');
    pet.id = 'pet';
    pet.className = 'pet';
    pet.src = chrome.runtime.getURL('pet/pet.png');
    document.body.appendChild(pet);
    
    console.log('Pet element created and added to page');

    // Listen for greyscale activation
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'greyscaleActive') {
            // Change to tired pet image
            pet.src = chrome.runtime.getURL('pet/petr.jpg');
            sendResponse({ success: true });
        } else if (message.type === 'removeGreyscale') {
            // Change back to normal pet image
            pet.src = chrome.runtime.getURL('pet/pet.png');
            sendResponse({ success: true });
        }
    });

    // Add random movement
    function moveRandomly() {
        const viewportWidth = window.innerWidth - 100; // Subtract pet width
        const viewportHeight = window.innerHeight - 100; // Subtract pet height
        
        const newX = Math.floor(Math.random() * viewportWidth);
        const newY = Math.floor(Math.random() * viewportHeight);
        
        pet.style.transition = 'all 2s ease-in-out';
        pet.style.left = `${newX}px`;
        pet.style.bottom = `${newY}px`;
    }

    // Move every 3 seconds
    setInterval(moveRandomly, 3000);
    // Initial movement
    moveRandomly();
};