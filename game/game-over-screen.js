// Game Over Screen - handles victory and defeat screens

import { audioManager } from "./audio-manager.js";
import { getStarRating } from "./storage-manager.js";

export class GameOverScreen {
  constructor() {
    this.victoryScreen = document.getElementById("victory-screen");
    this.defeatScreen = document.getElementById("defeat-screen");
    this.restartButtons = document.querySelectorAll(".game-over-restart");
    this.onRestartCallback = null;

    this.initEventListeners();
  }

  initEventListeners() {
    // Add click handlers to all restart buttons
    this.restartButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        audioManager.playSoundEffect("btnClick");
        this.hide();
        if (this.onRestartCallback) {
          this.onRestartCallback();
        }
      });

      // Add hover sound
      btn.addEventListener("mouseenter", () => {
        audioManager.playSoundEffect("btnHover");
      });
    });
  }

  /**
   * Show victory screen
   * @param {string} timeText - Formatted time text (e.g., "1:23.45")
   * @param {boolean} isNewHighScore - Whether this is a new high score
   * @param {number} timeInSeconds - The time in seconds for star rating calculation
   */
  showVictory(timeText, isNewHighScore, timeInSeconds) {
    // Update time display
    const timeElement = document.getElementById("victory-time");
    timeElement.textContent = timeText;

    // Update high score badge visibility
    const badge = document.getElementById("victory-badge");
    if (isNewHighScore) {
      badge.style.display = "block";
    } else {
      badge.style.display = "none";
    }

    // Update star rating
    this.updateStarRating(timeInSeconds);

    // Show victory screen
    this.victoryScreen.style.display = "flex";

    // Play victory music
    audioManager.play("victory");
  }

  /**
   * Update star rating based on time
   * @param {number} timeInSeconds - The completion time in seconds
   */
  updateStarRating(timeInSeconds) {
    const stars = document.querySelectorAll(".star");
    const rating = getStarRating(timeInSeconds);

    // Reset all stars first
    stars.forEach((star) => {
      star.classList.remove("unlocked");
    });

    // Unlock stars with staggered animation
    for (let i = 0; i < rating; i++) {
      setTimeout(() => {
        stars[i].classList.add("unlocked");
      }, i * 200); // 200ms delay between each star
    }
  }

  /**
   * Show defeat screen
   * @param {number} fightReached - The fight number the player reached
   */
  showDefeat(fightReached) {
    // Update fight reached display
    const fightElement = document.getElementById("defeat-fight");
    fightElement.textContent = fightReached;

    // Show defeat screen
    this.defeatScreen.style.display = "flex";

    // Continue playing combat music (no special defeat music)
  }

  /**
   * Hide both screens
   */
  hide() {
    this.victoryScreen.style.display = "none";
    this.defeatScreen.style.display = "none";
  }

  /**
   * Set callback for when restart is clicked
   * @param {Function} callback - Function to call on restart
   */
  onRestart(callback) {
    this.onRestartCallback = callback;
  }
}
