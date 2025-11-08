// Title Screen Module - manages the main menu

import { neutralPose } from "./config.js";
import { initGame } from "./combat.js";
import { audioManager } from "./audio-manager.js";
import { SpriteSheet } from "./sprite-sheet.js";
import { getSpriteConfig } from "./sprites-config.js";
import {
  getHighScore,
  formatTime,
  getStarRating,
  getInfiniteHighScore,
  getInfiniteStarRating,
  hasSeenStory,
  markStorySeen,
} from "./storage-manager.js";
import { HowToPlay } from "./how-to-play.js";
import { storyPanel } from "./story-panel.js";

// Cache DOM elements
const elements = {
  titleScreen: document.getElementById("title-screen"),
  game: document.getElementById("game"),
  startBtn: document.getElementById("start-btn"),
  infiniteBtn: document.getElementById("infinite-btn"),
  htpBtn: document.getElementById("htp-btn"),
  poseImg: document.getElementById("pose-img"),
  title: document.getElementById("title"),
  audioToggleTitle: document.getElementById("audio-toggle-title"),
  highScoreValue: document.getElementById("high-score-value"),
  infiniteScoreValue: document.getElementById("infinite-score-value"),
};

// Initialize How to Play modal
let howToPlayModal;

// For logo animation
let logoSpriteSheet = null;
let logoAnimationInterval = null;

// Initialize title screen
export function initTitleScreen() {
  setPose(neutralPose);

  // Initialize How to Play modal
  howToPlayModal = new HowToPlay();

  setupEventListeners();
  // Activate colorful background for title screen
  document.body.classList.add("title-active");

  // Load and display high score
  loadHighScore();

  // Load and display infinite mode high score
  loadInfiniteHighScore();

  // Queue the intro audio (will play on first user interaction)
  audioManager.play("titleIntro");

  startTitleGlitch();

  // Check if this is the first time loading the game
  if (!hasSeenStory()) {
    // Show story panel on first load
    storyPanel.open(() => {
      // Mark story as seen when it closes
      markStorySeen();
    });
  }
}

// Load and display high score
function loadHighScore() {
  const highScore = getHighScore();
  elements.highScoreValue.textContent = formatTime(highScore);

  // Update stars and progress message
  updateHighScoreStars(highScore);
}

// Update high score stars and progress message
function updateHighScoreStars(timeInSeconds) {
  const stars = document.querySelectorAll("#high-score .star-small");
  const progressMessage = document.getElementById("star-progress-message");

  if (timeInSeconds === null) {
    // No high score yet - all stars locked
    stars.forEach((star) => star.classList.remove("unlocked"));
    progressMessage.textContent = "Complete the game!";
    return;
  }

  const rating = getStarRating(timeInSeconds);

  // Update star visuals
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add("unlocked");
    } else {
      star.classList.remove("unlocked");
    }
  });

  // Set progress message based on current rating
  if (rating === 3) {
    progressMessage.textContent = "Perfect! 3 stars!";
  } else if (rating === 2) {
    progressMessage.textContent = "Under 1 minute for 3 stars";
  } else {
    progressMessage.textContent = "Under 2 minutes for 2 stars";
  }
}

// Load and display infinite mode high score
function loadInfiniteHighScore() {
  const highScore = getInfiniteHighScore();
  elements.infiniteScoreValue.textContent =
    highScore === null ? "N/A" : highScore;

  // Update stars and progress message
  updateInfiniteHighScoreStars(highScore);
}

// Update infinite mode high score stars and progress message
function updateInfiniteHighScoreStars(level) {
  const stars = document.querySelectorAll("#infinite-high-score .star-small");
  const progressMessage = document.getElementById("infinite-progress-message");

  if (level === null) {
    // No high score yet - all stars locked, show requirement for first star
    stars.forEach((star) => star.classList.remove("unlocked"));
    progressMessage.textContent = "Reach level 5 for 1 star";
    return;
  }

  const rating = getInfiniteStarRating(level);

  // Update star visuals
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add("unlocked");
    } else {
      star.classList.remove("unlocked");
    }
  });

  // Set progress message based on current rating
  if (rating === 3) {
    progressMessage.textContent = "Amazing! 3 stars!";
  } else if (rating === 2) {
    progressMessage.textContent = "Reach level 15 for 3 stars";
  } else if (rating === 1) {
    progressMessage.textContent = "Reach level 10 for 2 stars";
  } else {
    progressMessage.textContent = "Reach level 5 for 1 star";
  }
}

// Set pose image - no fallback, log error if missing
function setPose(pose) {
  elements.poseImg.src = pose.img;
  elements.poseImg.onerror = () => {
    console.error(
      `Missing image: ${pose.img}${pose.desc ? ` (${pose.desc})` : ""}`
    );
  };
}

// Setup event listeners
function setupEventListeners() {
  // Add click listeners with sound effects
  elements.startBtn.addEventListener("click", onStartGame);
  elements.infiniteBtn.addEventListener("click", onStartInfiniteMode);
  elements.htpBtn.addEventListener("click", onHowToPlay);
  elements.audioToggleTitle.addEventListener("click", () => {
    audioManager.playSoundEffect("btnClick");
    ensureAudioUnlocked();
    toggleAudio();
  });

  // Add hover sound effects to all clickable buttons
  [
    elements.startBtn,
    elements.infiniteBtn,
    elements.htpBtn,
    elements.audioToggleTitle,
  ].forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      audioManager.playSoundEffect("btnHover");
    });
  });
}

// Ensure audio is unlocked on first user interaction
function ensureAudioUnlocked() {
  audioManager.unlock();
}

// Handle start game button
function onStartGame() {
  audioManager.playSoundEffect("btnClick");
  ensureAudioUnlocked();
  elements.titleScreen.style.display = "none";
  elements.game.style.display = "block";
  // Remove colorful background when entering game
  document.body.classList.remove("title-active");
  initGame(false);
  // Ensure quit button is hidden on game start
  document.getElementById("quit-btn").style.display = "none";

  // Clean up logo animation if it's running
  if (logoAnimationInterval) {
    clearInterval(logoAnimationInterval);
    logoAnimationInterval = null;
  }
}

// Handle infinite mode button
function onStartInfiniteMode() {
  audioManager.playSoundEffect("btnClick");
  ensureAudioUnlocked();
  elements.titleScreen.style.display = "none";
  elements.game.style.display = "block";
  // Remove colorful background when entering game
  document.body.classList.remove("title-active");
  initGame(true); // Pass true for infinite mode
  // Ensure quit button is hidden on game start
  document.getElementById("quit-btn").style.display = "none";

  // Clean up logo animation if it's running
  if (logoAnimationInterval) {
    clearInterval(logoAnimationInterval);
    logoAnimationInterval = null;
  }
}

// Handle how to play button
function onHowToPlay() {
  audioManager.playSoundEffect("btnHover");
  ensureAudioUnlocked();
  howToPlayModal.open();
}

// Title glitch effect - replaces title with logo after 3 seconds
function startTitleGlitch() {
  setTimeout(() => {
    // Add intense glitch effect
    elements.title.style.animation = "glitchIntense 0.3s linear";

    // After glitch animation, replace with logo
    setTimeout(() => {
      // Clear title text and animation
      elements.title.innerHTML = "";
      elements.title.style.animation = "none";
      elements.title.style.marginBottom = "10px";
      elements.title.style.cursor = "pointer";

      // Setup sprite animation
      const spriteConfig = getSpriteConfig("logo-thin");
      logoSpriteSheet = new SpriteSheet(spriteConfig);

      // Create the structure for scaling and clipping: scaler -> clipper -> img
      // 1. The SCALER container. This will be scaled.
      const scaler = document.createElement("div");
      // This scale makes the sprite visually match the original logo's size
      scaler.style.transformOrigin = "center center";
      elements.title.appendChild(scaler);

      // 2. The CLIPPER container. Sized to one frame, clips overflow.
      const clipper = document.createElement("div");
      clipper.className = "sprite-clipper";
      clipper.style.width = `${logoSpriteSheet.frameContentWidth}px`;
      clipper.style.height = `${logoSpriteSheet.frameContentHeight}px`;
      scaler.appendChild(clipper); // Clipper goes inside the scaler

      // 3. The IMAGE element itself, which will be moved around inside the clipper.
      const spriteImg = document.createElement("img");
      spriteImg.src = logoSpriteSheet.imagePath;
      // The image goes inside the clipper
      clipper.appendChild(spriteImg);

      spriteImg.onload = () => {
        // Play the animation (it will loop based on its config)
        // We pass the CLIPPER to the play method, as it contains the img
        logoSpriteSheet.play(clipper);
      };

      // Add click event to the title container which now holds the sprite
      elements.title.addEventListener("click", onLogoClick);
    }, 300);
  }, 3000);
}

// Handle logo click - switch to thick version and start pulsing
function onLogoClick() {
  const logoImg = document.getElementById("logo-img");
  // If the logo is already thick, do nothing.
  if (logoImg) return;

  // Clear the animation interval and sprite
  if (logoAnimationInterval) {
    clearInterval(logoAnimationInterval);
    logoAnimationInterval = null;
  }
  logoSpriteSheet = null;
  elements.title.innerHTML =
    '<img id="logo-img" src="images/logo-thick.png" alt="MECHA HERO" class="logo-pulsing" style="max-width: 30%; height: auto;" />';

  audioManager.play("titleMain");
}

// Toggle audio on/off
function toggleAudio() {
  const isMuted = audioManager.toggleMute();
  // Update button visual state
  elements.audioToggleTitle.style.opacity = isMuted ? "0.5" : "1";
}
