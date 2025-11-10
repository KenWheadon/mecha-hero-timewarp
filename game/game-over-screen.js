// Game Over Screen - handles victory and defeat screens

import { audioManager } from "./audio-manager.js";
import { getStarRating, getInfiniteStarRating } from "./storage-manager.js";
import { SpriteSheet } from "./sprite-sheet.js";
import { getSpriteConfig } from "./sprites-config.js";
import {
  trackPauseOnWinScreen,
  trackPauseOnLoseScreen,
  trackTryAgainSelected,
} from "./trophy-manager.js";

export class GameOverScreen {
  constructor() {
    this.victoryScreen = document.getElementById("victory-screen");
    this.defeatScreen = document.getElementById("defeat-screen");
    this.restartButtons = document.querySelectorAll(".game-over-restart");
    this.mainMenuButtons = document.querySelectorAll(".game-over-main-menu");
    this.onRestartCallback = null;
    this.onMainMenuCallback = null;

    // Initialize sprite animations
    this.losingSprite = null;
    this.winningSprite = null;
    this.initSprites();

    this.initEventListeners();
  }

  /**
   * Initialize sprite animations for victory and defeat screens
   */
  initSprites() {
    // Create losing animation sprite using config
    const losingConfig = getSpriteConfig("losing-animation");
    console.log("Losing sprite config:", losingConfig);
    this.losingSprite = new SpriteSheet(losingConfig);

    // Create winning animation sprite using config
    const winningConfig = getSpriteConfig("winning-animation");
    console.log("Winning sprite config:", winningConfig);
    this.winningSprite = new SpriteSheet(winningConfig);
  }

  // Helper function to add both click and touch event listeners
  addTouchAndClickListener(element, handler) {
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

  initEventListeners() {
    // Add click and touch handlers to all restart buttons
    this.restartButtons.forEach((btn) => {
      this.addTouchAndClickListener(btn, () => {
        audioManager.playSoundEffect("btnClick");

        // Track try again click if on defeat screen
        if (this.defeatScreen.style.display === "flex") {
          trackTryAgainSelected();
        }

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

    // Add click and touch handlers to all main menu buttons
    this.mainMenuButtons.forEach((btn) => {
      this.addTouchAndClickListener(btn, () => {
        audioManager.playSoundEffect("btnClick");
        this.hide();
        if (this.onMainMenuCallback) {
          this.onMainMenuCallback();
        }
      });

      btn.addEventListener("mouseenter", () =>
        audioManager.playSoundEffect("btnHover")
      );
    });
  }

  /**
   * Show victory screen
   * @param {string} timeText - Formatted time text (e.g., "1:23.45")
   * @param {boolean} isNewHighScore - Whether this is a new high score
   * @param {number} timeInSeconds - The time in seconds for star rating calculation
   */
  showVictory(timeText, isNewHighScore, timeInSeconds) {
    // Play win screen sound
    audioManager.playSoundEffect("winScreen");

    // Update time display
    const timeElement = document.getElementById("victory-time");
    timeElement.textContent = timeText;

    // Update high score badge visibility with sound
    const badge = document.getElementById("victory-badge");
    if (isNewHighScore) {
      badge.style.display = "block";
      // Play new record sound after a short delay
      setTimeout(() => {
        audioManager.playSoundEffect("newRecord");
      }, 500);
    } else {
      badge.style.display = "none";
    }

    // Update star rating
    this.updateStarRating(timeInSeconds);

    // Setup and play winning sprite animation
    const spriteContainer = this.victoryScreen.querySelector(
      ".victory-player-sprite-container"
    );
    if (spriteContainer && this.winningSprite) {
      // Clear any existing content
      spriteContainer.innerHTML = "";

      // Create image element for the sprite
      const img = document.createElement("img");
      img.src = this.winningSprite.imagePath;
      spriteContainer.appendChild(img);

      // Wait for sprite to load before playing
      const playWhenReady = () => {
        if (this.winningSprite.isLoaded) {
          this.winningSprite.play(spriteContainer);
        } else {
          // Check again in a bit
          requestAnimationFrame(playWhenReady);
        }
      };
      requestAnimationFrame(playWhenReady);
    }

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
        // Play star award sound for each star
        audioManager.playSoundEffect("awardStar");
      }, i * 500); // 500ms delay between each star
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

    console.log("=== DEFEAT SCREEN DEBUG ===");
    console.log("spriteContainer:", this.defeatScreen.querySelector(".defeat-player-sprite-container"));
    console.log("losingSprite:", this.losingSprite);
    console.log("losingSprite.isLoaded:", this.losingSprite?.isLoaded);
    console.log("losingSprite config:", {
      frameContentWidth: this.losingSprite?.frameContentWidth,
      frameContentHeight: this.losingSprite?.frameContentHeight,
      frameWidth: this.losingSprite?.frameWidth,
      frameHeight: this.losingSprite?.frameHeight,
      rows: this.losingSprite?.rows,
      cols: this.losingSprite?.cols,
      totalFrames: this.losingSprite?.totalFrames
    });

    // Setup and play losing sprite animation
    const spriteContainer = this.defeatScreen.querySelector(
      ".defeat-player-sprite-container"
    );
    if (spriteContainer && this.losingSprite) {
      // Clear any existing content
      spriteContainer.innerHTML = "";

      // Create the proper sprite structure
      // The sprite container already has overflow:hidden and position:relative
      // We just need to add the img element directly (no need for extra clipper)
      const img = document.createElement("img");
      img.src = this.losingSprite.imagePath;
      img.style.position = "absolute";
      img.style.top = "0";
      img.style.left = "0";
      spriteContainer.appendChild(img);

      console.log("Image element created, src:", img.src);
      console.log("Attempting to play sprite animation...");
      console.log("Sprite container dimensions:", spriteContainer.offsetWidth, "x", spriteContainer.offsetHeight);

      // Wait for sprite to load before playing
      const playWhenReady = () => {
        if (this.losingSprite.isLoaded) {
          console.log("Sprite loaded! Starting animation...");
          console.log("Image natural dimensions:", img.naturalWidth, "x", img.naturalHeight);
          this.losingSprite.play(spriteContainer);
          console.log("Animation playing:", this.losingSprite.isPlaying);
        } else {
          console.log("Waiting for sprite to load...");
          // Check again in a bit
          requestAnimationFrame(playWhenReady);
        }
      };
      requestAnimationFrame(playWhenReady);
    } else {
      console.log("ERROR: Missing spriteContainer or losingSprite!");
    }

    // Show defeat screen
    this.defeatScreen.style.display = "flex";

    // Continue playing combat music (no special defeat music)
  }

  /**
   * Show infinite mode defeat screen
   * @param {number} levelReached - The level the player reached
   * @param {boolean} isNewHighScore - Whether this is a new high score
   */
  showInfiniteDefeat(levelReached, isNewHighScore) {
    // Update defeat screen with infinite mode info
    const fightElement = document.getElementById("defeat-fight");
    fightElement.textContent = levelReached;

    // Update subtitle for infinite mode
    const subtitle = this.defeatScreen.querySelector(".game-over-subtitle");
    const originalSubtitle = subtitle.textContent;
    subtitle.textContent = isNewHighScore ? "New High Score!" : "Try Again!";

    // Update message for infinite mode
    const message = this.defeatScreen.querySelector(".defeat-message");
    const originalMessage = message.innerHTML;
    message.innerHTML = `Level ${levelReached} reached.<br>Can you go further?`;

    // Setup and play losing sprite animation
    const spriteContainer = this.defeatScreen.querySelector(
      ".defeat-player-sprite-container"
    );
    if (spriteContainer && this.losingSprite) {
      // Clear any existing content
      spriteContainer.innerHTML = "";

      // Create image element for the sprite
      const img = document.createElement("img");
      img.src = this.losingSprite.imagePath;
      spriteContainer.appendChild(img);

      // Wait for sprite to load before playing
      const playWhenReady = () => {
        if (this.losingSprite.isLoaded) {
          this.losingSprite.play(spriteContainer);
        } else {
          // Check again in a bit
          requestAnimationFrame(playWhenReady);
        }
      };
      requestAnimationFrame(playWhenReady);
    }

    // Show defeat screen
    this.defeatScreen.style.display = "flex";

    // Store originals for restoration
    this.defeatScreen.dataset.originalSubtitle = originalSubtitle;
    this.defeatScreen.dataset.originalMessage = originalMessage;

    // Continue playing combat music (no special defeat music)
  }

  /**
   * Hide both screens
   */
  hide() {
    // Stop sprite animations
    if (this.losingSprite) {
      this.losingSprite.stop();
    }
    if (this.winningSprite) {
      this.winningSprite.stop();
    }

    this.victoryScreen.style.display = "none";
    this.defeatScreen.style.display = "none";

    // Restore original defeat screen text if modified
    if (this.defeatScreen.dataset.originalSubtitle) {
      const subtitle = this.defeatScreen.querySelector(".game-over-subtitle");
      subtitle.textContent = this.defeatScreen.dataset.originalSubtitle;
      delete this.defeatScreen.dataset.originalSubtitle;
    }
    if (this.defeatScreen.dataset.originalMessage) {
      const message = this.defeatScreen.querySelector(".defeat-message");
      message.innerHTML = this.defeatScreen.dataset.originalMessage;
      delete this.defeatScreen.dataset.originalMessage;
    }
  }

  /**
   * Set callback for when restart is clicked
   * @param {Function} callback - Function to call on restart
   */
  onRestart(callback) {
    this.onRestartCallback = callback;
  }

  /**
   * Set callback for when main menu is clicked
   * @param {Function} callback - Function to call on main menu click
   */
  onMainMenu(callback) {
    this.onMainMenuCallback = callback;
  }
}
