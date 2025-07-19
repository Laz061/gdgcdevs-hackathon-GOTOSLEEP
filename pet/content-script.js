window.onload = loadPet();

function loadPet() {
  console.log("Window loaded, attempting to create pet...");

  if (document.getElementById("pet-container")) {
    console.log("Pet already exists, skipping creation");
    return;
  }

  const container = document.createElement("div");
  container.id = "pet-container";

  Object.assign(container.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "9999999",
    filter: "none",
    WebkitFilter: "none",
  });

  const pet = document.createElement("img");
  pet.id = "pet";
  pet.src = chrome.runtime.getURL("pet/pet.png");

  // Apply .pet styles here
  Object.assign(pet.style, {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    position: "absolute", // absolute inside fixed container
    bottom: "20px",
    left: "20px", // matches your updated CSS
    zIndex: "99999",
    transition: "all 2s ease-in-out",
    filter: "none",
    WebkitFilter: "none",
    pointerEvents: "none",
    filter: "none",
    webkitFilter: "none",
  });

  container.appendChild(pet);
  document.documentElement.appendChild(container);

  console.log("Pet element created and added to page");

  setInterval(moveRandomly, 6000);
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
