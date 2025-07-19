window.onload = loadPet();

function loadPet() {
  console.log("Window loaded, attempting to create pet..."); // Loading debug log

  if (document.getElementById("pet")) {
    console.log("Pet already exists, skipping creation");
    return;
  }

  const pet = document.createElement("img");
  pet.id = "pet";
  pet.className = "pet";
  pet.src = chrome.runtime.getURL("pet/pet.png");
  document.body.appendChild(pet);

  console.log("Pet element created and added to page");

  // Move every 3 seconds
  setInterval(moveRandomly, 6000);
  // Initial movement
  moveRandomly();
}

// Listen for petReact event
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "petReact") {
    console.log("petReact message received");
    petReact();
  }
});

function petReact() {
  // Change to tired image
  pet.src = chrome.runtime.getURL("pet/petr.png");

  // After 2 seconds, revert to normal image
  setTimeout(() => {
    pet.src = chrome.runtime.getURL("pet/pet.png");
  }, 2000);
}

// Add random movement
function moveRandomly() {
  const viewportWidth = window.innerWidth - 100; // Subtract pet width
  const newX = Math.floor(Math.random() * viewportWidth);

  pet.style.left = `${newX}px`;
  // Do not change pet.style.bottom; it stays at 20px as set in CSS
}
