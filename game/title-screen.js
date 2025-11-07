// Title Screen Module - manages the main menu

import { neutralPose } from "./config.js";
import { initGame } from "./combat.js";
import { audioManager } from "./audio-manager.js";
import { getHighScore, formatTime } from "./storage-manager.js";
import { HowToPlay } from "./how-to-play.js";

// Cache DOM elements
const elements = {
  titleScreen: document.getElementById("title-screen"),
  game: document.getElementById("game"),
  startBtn: document.getElementById("start-btn"),
  htpBtn: document.getElementById("htp-btn"),
  poseImg: document.getElementById("pose-img"),
  title: document.getElementById("title"),
  audioToggleTitle: document.getElementById("audio-toggle-title"),
  highScoreValue: document.getElementById("high-score-value"),
};

// Initialize How to Play modal
let howToPlayModal;

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

  // Queue the intro audio (will play on first user interaction)
  audioManager.play("titleIntro");

  startTitleGlitch();
}

// Load and display high score
function loadHighScore() {
  const highScore = getHighScore();
  elements.highScoreValue.textContent = formatTime(highScore);
}

// Set pose image - no fallback, log error if missing
function setPose(pose) {
  elements.poseImg.src = pose.img;
  elements.poseImg.onerror = () => {
    console.error(`Missing image: ${pose.img}${pose.desc ? ` (${pose.desc})` : ''}`);
  };
}

// Setup event listeners
function setupEventListeners() {
  // Add click listeners with sound effects
  elements.startBtn.addEventListener("click", onStartGame);
  elements.htpBtn.addEventListener("click", onHowToPlay);
  elements.audioToggleTitle.addEventListener("click", () => {
    audioManager.playSoundEffect("btnClick");
    ensureAudioUnlocked();
    toggleAudio();
  });

  // Add hover sound effects to all clickable buttons
  [elements.startBtn, elements.htpBtn, elements.audioToggleTitle].forEach((btn) => {
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
  initGame();
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
