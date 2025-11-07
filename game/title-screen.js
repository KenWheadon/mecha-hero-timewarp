// Title Screen Module - manages the main menu and how-to-play modal

import { neutralPose } from "./config.js";
import { initGame } from "./combat.js";
import { audioManager } from "./audio-manager.js";
import { getHighScore } from "./storage-manager.js";

// Cache DOM elements
const elements = {
  titleScreen: document.getElementById("title-screen"),
  game: document.getElementById("game"),
  overlay: document.getElementById("overlay"),
  htp: document.getElementById("how-to-play"),
  closeHtp: document.getElementById("close-htp"),
  startBtn: document.getElementById("start-btn"),
  htpBtn: document.getElementById("htp-btn"),
  poseImg: document.getElementById("pose-img"),
  title: document.getElementById("title"),
  audioToggleTitle: document.getElementById("audio-toggle-title"),
  highScoreValue: document.getElementById("high-score-value"),
};

// Initialize title screen
export function initTitleScreen() {
  setPose(neutralPose);
  setupEventListeners();
  // Activate colorful background for title screen
  document.body.classList.add("title-active");

  // Load and display high score
  loadHighScore();

  // Start playing intro audio
  audioManager.play("titleIntro");

  startTitleGlitch();
}

// Load and display high score
function loadHighScore() {
  const highScore = getHighScore();
  elements.highScoreValue.textContent = highScore;
}

// Set pose image with fallback
function setPose(pose) {
  elements.poseImg.src = pose.img;
  elements.poseImg.onerror = () => {
    const fallbackText = pose.desc || "Unknown Pose";
    elements.poseImg.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj4=" +
      encodeURIComponent(fallbackText) +
      "</text></svg>";
  };
}

// Setup event listeners
function setupEventListeners() {
  elements.startBtn.addEventListener("click", onStartGame);
  elements.htpBtn.addEventListener("click", onHowToPlay);
  elements.closeHtp.addEventListener("click", closeModal);
  elements.overlay.addEventListener("click", closeModal);
  elements.audioToggleTitle.addEventListener("click", toggleAudio);
}

// Handle start game button
function onStartGame() {
  elements.titleScreen.style.display = "none";
  elements.game.style.display = "block";
  // Remove colorful background when entering game
  document.body.classList.remove("title-active");
  initGame();
}

// Handle how to play button
function onHowToPlay() {
  elements.overlay.style.display = "block";
  elements.htp.style.display = "block";
}

// Close modal
function closeModal() {
  elements.overlay.style.display = "none";
  elements.htp.style.display = "none";
}

// Title glitch effect - replaces title with logo after 3 seconds
function startTitleGlitch() {
  setTimeout(() => {
    // Add intense glitch effect
    elements.title.style.animation = "glitchIntense 0.3s linear";

    // After glitch animation, replace with logo
    setTimeout(() => {
      // Replace the title text with an image
      elements.title.innerHTML =
        '<img id="logo-img" src="images/logo-thin.png" alt="MECHA HERO" style="max-width: 30%; height: auto; cursor: pointer;" />';
      elements.title.style.animation = "none";
      elements.title.style.marginBottom = "10px";

      // Add click event to logo
      const logoImg = document.getElementById("logo-img");
      logoImg.addEventListener("click", onLogoClick);
    }, 300);
  }, 3000);
}

// Handle logo click - switch to thick version and start pulsing
function onLogoClick() {
  const logoImg = document.getElementById("logo-img");
  if (logoImg && !logoImg.classList.contains("logo-pulsing")) {
    logoImg.src = "images/logo-thick.png";
    logoImg.classList.add("logo-pulsing");
    // Switch to main intro audio
    audioManager.play("titleMain");
  }
}

// Toggle audio on/off
function toggleAudio() {
  const isMuted = audioManager.toggleMute();
  // Update button visual state
  elements.audioToggleTitle.style.opacity = isMuted ? "0.5" : "1";
}
