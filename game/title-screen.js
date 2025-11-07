// Title Screen Module - manages the main menu and how-to-play modal

import { neutralPose } from "./config.js";
import { initGame } from "./combat.js";

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
};

// Initialize title screen
export function initTitleScreen() {
  setPose(neutralPose);
  setupEventListeners();
  // Activate colorful background for title screen
  document.body.classList.add('title-active');
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
}

// Handle start game button
function onStartGame() {
  elements.titleScreen.style.display = "none";
  elements.game.style.display = "block";
  // Remove colorful background when entering game
  document.body.classList.remove('title-active');
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
