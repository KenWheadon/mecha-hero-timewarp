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
    text: "Welcome to your first fight! Watch the enemy's pose and click the correct counter move before time runs out. You have 10 seconds per move. Only 2 attacks are unlocked: Shield Bash and Rocket Fist.",
  },
  2: {
    title: "Fight 2: More Attacks",
    text: "The enemy is getting stronger! All 4 attacks are now unlocked. Timer reduced to 6 seconds. Watch your Crystal Energy - it drains when warping to the next fight!",
  },
  3: {
    title: "Fight 3: Speed Up",
    text: "Things are heating up! You only have 4 seconds to counter each pose. Crystal energy is running low - make it count!",
  },
  4: {
    title: "Fight 4: Final Battle",
    text: "This is it - the final showdown! Only 2 seconds per move and the enemy has 8 HP. Stay focused and counter perfectly to win!",
  },
};

// Current callback for when popup closes
let onCloseCallback = null;

// Track if event listeners have been initialized
let eventListenersInitialized = false;

// Initialize onboarding system
export function initOnboarding() {
  // Only add event listeners once to prevent duplicates
  if (eventListenersInitialized) return;

  elements.closeBtn.addEventListener("click", closePopup);
  elements.overlay.addEventListener("click", closePopup);

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
