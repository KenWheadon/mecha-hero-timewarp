// Onboarding Module - handles first-time popups for each level

import { isFirstTime, markFightAsSeen } from "./storage-manager.js";

// Cache DOM elements
const elements = {
  overlay: document.getElementById("overlay"),
  popup: document.getElementById("onboarding-popup"),
  title: document.getElementById("onboarding-title"),
  text: document.getElementById("onboarding-text"),
  closeBtn: document.getElementById("onboarding-close"),
};

// Fight-specific instructions
const FIGHT_INSTRUCTIONS = {
  1: {
    title: "Fight 1: Basics",
    text: "I gotta watch the clanker's pose and select the correct counter before he attacks. Clankers still booting up so I should have 10 seconds per move.",
  },
  2: {
    title: "Fight 2: More Attacks",
    text: "That time crystal is INCREDIBLE, but also a pain in my ass! Gotta keep kicking butt until it runs out of juice - looks like I got 8 seconds now.",
  },
  3: {
    title: "Fight 3: Speed Up",
    text: "Things are heating up with only 5 seconds to counter each move. I think the crystal energy is running low though, I have this bucket of bolts in my sights now!",
  },
  4: {
    title: "Fight 4: Final Battle",
    text: "This is it - the final showdown! Only 3 seconds per move and the enemy has 8 HP. I gotta stay focused and counter perfectly to win!",
  },
  infinite: {
    title: "Infinite Mode",
    text: "Welcome to Infinite Mode! The correct defence for each of the enemy's attack has been randomized. Survive as long as you can!",
  },
};

// Current callback for when popup closes
let onCloseCallback = null;

// Track if event listeners have been initialized
let eventListenersInitialized = false;

// Helper function to add both click and touch event listeners
function addTouchAndClickListener(element, handler) {
  let touchHandled = false;

  // Add touchstart listener to track touch events
  element.addEventListener("touchstart", () => {
    touchHandled = true;
  });

  // Add touchend listener for touch devices
  element.addEventListener("touchend", (e) => {
    if (touchHandled) {
      e.preventDefault(); // Prevent ghost click
      handler(e);
      // Reset flag after a short delay
      setTimeout(() => {
        touchHandled = false;
      }, 500);
    }
  });

  // Add click listener for mouse/desktop
  element.addEventListener("click", (e) => {
    // Only handle click if it wasn't preceded by a touch
    if (!touchHandled) {
      handler(e);
    }
  });
}

// Initialize onboarding system
export function initOnboarding() {
  // Only add event listeners once to prevent duplicates
  if (eventListenersInitialized) return;

  addTouchAndClickListener(elements.closeBtn, closePopup);
  addTouchAndClickListener(elements.overlay, closePopup);

  eventListenersInitialized = true;
}

// Check if we should show onboarding for this fight
export function checkAndShowOnboarding(fightLevel, callback) {
  if (isFirstTime(fightLevel)) {
    showOnboarding(fightLevel, callback);
    markFightAsSeen(fightLevel);
  } else if (callback) {
    // Not first time, just run the callback immediately
    callback();
  }
}

// Show onboarding popup for a specific fight
function showOnboarding(fightLevel, callback) {
  const instruction = FIGHT_INSTRUCTIONS[fightLevel];

  if (!instruction) {
    if (callback) callback();
    return;
  }

  // Store the callback to run when popup closes
  onCloseCallback = callback;

  // Set content
  elements.title.textContent = instruction.title;
  elements.text.textContent = instruction.text;

  // Show popup
  elements.overlay.style.display = "block";
  elements.popup.style.display = "block";
}

// Close popup
function closePopup() {
  elements.overlay.style.display = "none";
  elements.popup.style.display = "none";

  // Run the callback if exists
  if (onCloseCallback) {
    onCloseCallback();
    onCloseCallback = null;
  }
}
