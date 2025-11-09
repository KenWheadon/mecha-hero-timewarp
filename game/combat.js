// Combat System - all game logic for battles

import {
  neutralPose,
  attackPoses,
  damagedPose,
  finalDestroyPose,
  GAME_CONFIG,
  createInitialGameState,
  generateDefenseMapping,
} from "./config.js";
import { audioManager } from "./audio-manager.js";
import { saveHighScore, saveInfiniteHighScore } from "./storage-manager.js";
import { initOnboarding, checkAndShowOnboarding } from "./onboarding.js";
import { SpriteSheet } from "./sprite-sheet.js";
import { getSpriteConfig, hasSprite } from "./sprites-config.js";
import { GameOverScreen } from "./game-over-screen.js";
import {
  trackPauseDuringTimewarp,
  trackTimeWarpComplete,
  trackFight1Complete,
  trackCrystalDepleted,
  trackInfiniteLevel,
  trackLevel1NoHits,
  trackStoryModeComplete,
  trackRobotSpinDuringTimewarpPause,
  trackPauseOnWinScreen,
  trackPauseOnLoseScreen,
} from "./trophy-manager.js";

// Game state
let gameState = createInitialGameState();

// Active sprite sheet instance
let activeSpriteSheet = null;

// Interval for checking if a sprite is loaded
let spriteLoadCheckInterval = null;

// Game over screen manager
let gameOverScreen = null;

// Track if event listeners have been initialized
let eventListenersInitialized = false;

// Track if we're currently in a time warp
let isInTimewarp = false;

// Time warp particle effect
let timewarpParticleCanvas = null;
let timewarpParticleCtx = null;
let timewarpParticles = [];
let timewarpParticleAnimationId = null;

// Time warp timing and sprite
let timewarpTimeoutId = null;
let timewarpSprite = null;
let timewarpStartTime = null;
let timewarpRemainingTime = null;
let timewarpLoadInterval = null;
let timewarpClipper = null;

// Helper function to add both click and touch event listeners
function addTouchAndClickListener(element, handler) {
  // Remove any existing listeners to prevent duplicates
  element.removeEventListener("click", handler);
  element.removeEventListener("touchend", handler);

  // Add click listener for mouse/desktop
  element.addEventListener("click", handler);

  // Add touchend listener for touch devices
  element.addEventListener("touchend", (e) => {
    e.preventDefault(); // Prevent ghost click
    handler(e);
  });
}

// Cache DOM elements
const elements = {
  pause: document.getElementById("pause"),
  playerHearts: document.getElementById("player-hearts"),
  playerImg: document.getElementById("player-img"),
  timerBarFill: document.getElementById("timer-bar-fill"),
  timerText: document.getElementById("timer-text"),
  crystalDisplay: document.getElementById("crystal-display"),
  enemyHearts: document.getElementById("enemy-hearts"),
  poseImg: document.getElementById("pose-img"),
  message: document.getElementById("message"),
  attacks: document.querySelectorAll(".attack-btn"),
  defenseButtons: document.getElementById("defense-buttons"),
  restart: document.getElementById("restart"),
  quitBtn: document.getElementById("quit-btn"),
  audioToggleCombat: document.getElementById("audio-toggle-combat"),
  pauseOverlay: document.getElementById("pause-overlay"),
  pauseResumeBtn: document.getElementById("pause-resume-btn"),
  pauseQuitBtn: document.getElementById("pause-quit-btn"),
  timewarpOverlay: document.getElementById("timewarp-overlay"),
  timewarpAnimationContainer: document.getElementById(
    "timewarp-animation-container"
  ),
  timewarpMessage: document.getElementById("timewarp-message"),
};

// Initialize game
export function initGame(isInfiniteMode = false) {
  gameState = createInitialGameState();
  gameState.isInfiniteMode = isInfiniteMode;
  gameState.infiniteLevel = isInfiniteMode ? 1 : 0;

  // Generate random defense mapping for this game session
  gameState.defenseMapping = generateDefenseMapping();

  initHearts();
  initOnboarding();

  // Initialize game over screen
  if (!gameOverScreen) {
    gameOverScreen = new GameOverScreen();
    gameOverScreen.onRestart(restartGame);
    gameOverScreen.onMainMenu(quitToMainMenu);
  }

  setupFight();

  // Only initialize event listeners once to prevent duplicates
  if (!eventListenersInitialized) {
    addTouchAndClickListener(elements.pause, () => {
      audioManager.playSoundEffect("btnClick");
      togglePause();
    });
    addTouchAndClickListener(elements.restart, () => {
      audioManager.playSoundEffect("btnClick");
      restartGame();
    });
    addTouchAndClickListener(elements.quitBtn, () => {
      audioManager.playSoundEffect("btnClick");
      quitToMainMenu();
    });
    addTouchAndClickListener(elements.audioToggleCombat, () => {
      audioManager.playSoundEffect("btnClick");
      toggleAudio();
    });
    elements.attacks.forEach((btn) => {
      addTouchAndClickListener(btn, () => handleAttack(btn.dataset.action));
    });

    // Pause popup buttons
    addTouchAndClickListener(elements.pauseResumeBtn, () => {
      audioManager.playSoundEffect("btnClick");
      togglePause();
    });
    addTouchAndClickListener(elements.pauseQuitBtn, () => {
      audioManager.playSoundEffect("btnClick");
      quitToMainMenu();
    });

    // Add hover sound effects to all buttons
    [
      elements.pause,
      elements.restart,
      elements.audioToggleCombat,
      elements.quitBtn,
      elements.pauseResumeBtn,
      elements.pauseQuitBtn,
      ...elements.attacks,
    ].forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        audioManager.playSoundEffect("btnHover");
      });
    });

    eventListenersInitialized = true;
  }

  // Start combat audio (infinity mode uses different track)
  if (isInfiniteMode) {
    audioManager.play("infinity");
  } else {
    audioManager.play("combat");
  }
}

// Initialize hearts display (player hearts)
function initHearts() {
  elements.playerHearts.innerHTML = "";
  for (let i = 0; i < gameState.hearts; i++) {
    const heart = document.createElement("img");
    heart.className = "heart";
    heart.src = "images/heart.png";
    heart.onerror = () => {
      console.error("Missing image: images/heart.png");
    };
    elements.playerHearts.appendChild(heart);
  }
  // Update player image to match HP
  updatePlayerImage();
}

// Update hearts display and player image
function updateHearts() {
  const hearts = elements.playerHearts.querySelectorAll(".heart");
  hearts.forEach((heart, i) => {
    if (i < gameState.hearts) {
      heart.classList.remove("depleted");
    } else {
      heart.classList.add("depleted");
    }
  });
  // Update player image to match HP
  updatePlayerImage();
}

// Update player image based on HP
function updatePlayerImage() {
  const imageMap = {
    3: "images/player-default.png",
    2: "images/player-2hp.png",
    1: "images/player-1hp.png",
    0: "images/player-0hp.png",
  };
  elements.playerImg.src = imageMap[gameState.hearts] || imageMap[3];
  elements.playerImg.onerror = () => {
    console.error(`Missing image: ${imageMap[gameState.hearts]}`);
  };
}

// Calculate timer duration for infinite mode based on level
function calculateInfiniteTimerDuration(level) {
  let baseDuration = 10000; // Start at 10 seconds

  // Reduce by 0.5s per level until 2s
  if (level <= 17) {
    baseDuration = 10000 - (level - 1) * 500;
  } else if (level <= 27) {
    // At level 17 we're at 2s, now reduce by 0.1s until 1s
    baseDuration = 2000 - (level - 17) * 100;
  } else if (level <= 47) {
    // At level 27 we're at 1s, now reduce by 0.025s until 0.5s
    baseDuration = 1000 - (level - 27) * 25;
  } else {
    // At level 47 we're at 0.5s, now reduce by 0.01s
    baseDuration = 500 - (level - 47) * 10;
    // Don't go below 100ms
    if (baseDuration < 100) baseDuration = 100;
  }

  return baseDuration;
}

// Setup fight
function setupFight() {
  let config;

  if (gameState.isInfiniteMode) {
    // Infinite mode: all attacks available, HP scales with level
    config = {
      maxHP: 4, // 4 hits per level
      availableAttacks: ["shield", "rocket", "sword", "plasma"],
      timerDuration: calculateInfiniteTimerDuration(gameState.infiniteLevel),
      showCrystal: false,
    };
  } else {
    // Normal mode
    config = GAME_CONFIG.FIGHT_CONFIGS[gameState.currentFight];
  }

  gameState.maxEnemyHP = config.maxHP;
  gameState.enemyHP = config.maxHP;
  gameState.availableAttacks = config.availableAttacks;
  gameState.baseTimerDuration = config.timerDuration;
  gameState.counteredPoses.clear();

  // Update UI
  updateEnemyHearts();
  updateCrystalDisplay();

  // Show/hide attack buttons based on available attacks
  elements.attacks.forEach((btn) => {
    const action = btn.dataset.action;
    const isAvailable = gameState.availableAttacks.includes(action);
    btn.disabled = !isAvailable;
    // Hide buttons that are not available instead of showing them as locked
    btn.style.display = isAvailable ? "flex" : "none";
  });

  // Check for first-time onboarding popup (skip in infinite mode)
  if (gameState.isInfiniteMode) {
    // Start game timer on first level
    if (gameState.infiniteLevel === 1 && gameState.gameStartTime === null) {
      gameState.gameStartTime = Date.now();
    }
    startNewPose();
  } else {
    checkAndShowOnboarding(gameState.currentFight, () => {
      // Start game timer on first fight
      if (gameState.currentFight === 1 && gameState.gameStartTime === null) {
        gameState.gameStartTime = Date.now();
      }
      // Start first pose after popup closes (or immediately if not first time)
      startNewPose();
    });
  }
}

// Update enemy hearts display
function updateEnemyHearts() {
  elements.enemyHearts.innerHTML = "";
  for (let i = 0; i < gameState.maxEnemyHP; i++) {
    const heart = document.createElement("img");
    heart.className = "heart";
    heart.src = "images/heart.png";
    if (i >= gameState.enemyHP) {
      heart.classList.add("depleted");
    } else {
      heart.classList.remove("depleted");
    }
    heart.onerror = () => {
      console.error("Missing image: images/heart.png");
    };
    elements.enemyHearts.appendChild(heart);
  }
}

// Update crystal display for normal/infinite modes
function updateCrystalDisplay() {
  elements.crystalDisplay.innerHTML = "";

  // Add label
  const label = document.createElement("div");
  label.className = "crystal-label";
  label.textContent = "Time Warps Left";
  elements.crystalDisplay.appendChild(label);

  // Create container for crystal items
  const itemsContainer = document.createElement("div");
  itemsContainer.className = "crystal-items-container";

  if (gameState.isInfiniteMode) {
    // Infinite mode: 1 crystal + infinity symbol
    const crystalItem = document.createElement("div");
    crystalItem.className = "crystal-item";
    const crystalImg = document.createElement("img");
    crystalImg.src = "images/timecrystal.png";
    crystalImg.alt = "Crystal";
    crystalImg.onerror = () => {
      console.error("Missing image: images/timecrystal.png");
    };
    crystalItem.appendChild(crystalImg);
    itemsContainer.appendChild(crystalItem);

    const infiniteSymbol = document.createElement("div");
    infiniteSymbol.className = "infinite-symbol";
    infiniteSymbol.textContent = "∞";
    itemsContainer.appendChild(infiniteSymbol);
  } else {
    // Normal mode: show 3 crystals total
    const maxCrystals = GAME_CONFIG.INITIAL_CRYSTAL_CHARGES;
    for (let i = 0; i < maxCrystals; i++) {
      const crystalItem = document.createElement("div");
      crystalItem.className = "crystal-item";

      const crystalImg = document.createElement("img");
      crystalImg.src = "images/timecrystal.png";
      crystalImg.alt = "Crystal";
      crystalImg.onerror = () => {
        console.error("Missing image: images/timecrystal.png");
      };
      crystalItem.appendChild(crystalImg);

      if (i >= gameState.crystalCharges) {
        crystalItem.classList.add("depleted");
      }

      itemsContainer.appendChild(crystalItem);
    }
  }

  elements.crystalDisplay.appendChild(itemsContainer);
}

// Clean up active sprite sheet
function cleanupSpriteSheet() {
  // Clear any pending load-check interval first to prevent race conditions
  if (spriteLoadCheckInterval) {
    clearInterval(spriteLoadCheckInterval);
    spriteLoadCheckInterval = null;
  }

  if (activeSpriteSheet) {
    activeSpriteSheet.stop();
    activeSpriteSheet.destroy();
    activeSpriteSheet = null;
  }

  // Reset to using img element and clear sprite container
  elements.poseImg.style.display = "block";
  const container = elements.poseImg.parentElement;

  // Remove any existing sprite structure (scaler div contains clipper)
  const existingClipper = container.querySelector(".sprite-clipper");
  if (existingClipper) {
    // The clipper is inside a scaler div, so remove the scaler (parent of clipper)
    const scaler = existingClipper.parentElement;
    if (scaler && scaler.parentElement === container) {
      container.removeChild(scaler);
    }
  }
  elements.poseImg.style.transform = ""; // Reset transform on static image element
}

// Set pose image or sprite - no fallback, log error if missing
function setPose(pose, useSprite = null) {
  // Clean up any existing sprite
  cleanupSpriteSheet();

  // Check if we should use a sprite sheet
  const spriteKey = useSprite || pose.sprite;

  if (spriteKey && hasSprite(spriteKey)) {
    // Use sprite sheet animation
    const spriteConfig = getSpriteConfig(spriteKey);
    activeSpriteSheet = new SpriteSheet(spriteConfig);

    // Hide the img element and use a nested structure for the sprite
    elements.poseImg.style.display = "none";
    const container = elements.poseImg.parentElement;

    // Get container dimensions
    const containerHeight = container.offsetHeight;

    // Calculate what the scaled sprite height will be
    const scaledSpriteHeight =
      activeSpriteSheet.frameContentHeight * activeSpriteSheet.scale;

    // Calculate scale to match container height (allow clipping at top if needed)
    const heightScale = containerHeight / scaledSpriteHeight;

    // Combine with the sprite's configured scale
    const finalScale = activeSpriteSheet.scale * heightScale;

    // Create the structure for scaling and clipping: scaler -> clipper -> img
    // 1. The SCALER container. This will be scaled.
    const scaler = document.createElement("div");
    scaler.style.transform = `scale(${finalScale}) translate(${activeSpriteSheet.offsetX}px, ${activeSpriteSheet.offsetY}px)`;
    scaler.style.transformOrigin = "center center";
    container.appendChild(scaler); // Add the scaler to the DOM

    // 2. The CLIPPER container. Sized to one frame at original dimensions (scale will handle sizing)
    const clipper = document.createElement("div");
    clipper.className = "sprite-clipper";
    clipper.style.width = `${activeSpriteSheet.frameContentWidth}px`;
    clipper.style.height = `${activeSpriteSheet.frameContentHeight}px`;
    scaler.appendChild(clipper); // Clipper goes inside the scaler

    // 3. The IMAGE element itself, which will be moved around inside the clipper.
    const spriteImg = document.createElement("img");
    spriteImg.src = activeSpriteSheet.imagePath;
    clipper.appendChild(spriteImg);
    // Wait for sprite to load, then start animation
    spriteLoadCheckInterval = setInterval(() => {
      if (activeSpriteSheet && activeSpriteSheet.isLoaded) {
        clearInterval(spriteLoadCheckInterval);
        spriteLoadCheckInterval = null;
        // Pass the CLIPPER to the play method, which contains the img
        activeSpriteSheet.play(clipper);
      }
    }, 50);
  } else {
    // Use static image
    // All pose static images now have uniform dimensions and don't need custom scaling
    elements.poseImg.src = pose.img;
    elements.poseImg.onerror = () => {
      console.error(
        `Missing image: ${pose.img}${pose.desc ? ` (${pose.desc})` : ""}`
      );
    };

    // Reset transform - all static pose images are now standardized
    elements.poseImg.style.transform = "";
  }
}

// Start new pose sequence
function startNewPose() {
  // Reset UI
  elements.message.textContent = "";
  elements.defenseButtons.classList.remove("show");

  // Show neutral stance first
  setPose(neutralPose);

  setTimeout(() => {
    showAttackPose();
  }, GAME_CONFIG.NEUTRAL_STANCE_DELAY);
}

// Show attack pose
function showAttackPose() {
  const pose = selectRandomPose();
  gameState.pendingPose = pose;

  setPose(pose);
  elements.defenseButtons.classList.add("show");

  // Play charge sound based on pose ID
  const chargeSoundMap = {
    2: "pose2Charge",
    3: "pose3Charge",
    4: "pose4Charge",
    5: "pose5Charge",
  };
  const chargeSound = chargeSoundMap[pose.id];
  if (chargeSound) {
    audioManager.playSoundEffect(chargeSound);
  }

  startTimer();
}

// Select random pose based on fight level
function selectRandomPose() {
  // Fight 1: 2 unique poses (only poses 2 and 3, which map to the available attacks)
  if (gameState.currentFight === 1) {
    const availablePoses = attackPoses.filter(
      (p) =>
        gameState.availableAttacks.includes(gameState.defenseMapping[p.id]) &&
        !gameState.counteredPoses.has(p.id)
    );
    if (availablePoses.length === 0) {
      gameState.counteredPoses.clear();
      return selectRandomPose();
    }
    const pose =
      availablePoses[Math.floor(Math.random() * availablePoses.length)];
    gameState.counteredPoses.add(pose.id);
    return pose;
  }

  // Fight 2-3: 4 unique poses
  if (gameState.currentFight === 2 || gameState.currentFight === 3) {
    const availablePoses = attackPoses.filter(
      (p) => !gameState.counteredPoses.has(p.id)
    );
    if (availablePoses.length === 0) {
      gameState.counteredPoses.clear();
      return selectRandomPose();
    }
    const pose =
      availablePoses[Math.floor(Math.random() * availablePoses.length)];
    gameState.counteredPoses.add(pose.id);
    return pose;
  }

  // Fight 4: 8 random (repeats ok)
  return attackPoses[Math.floor(Math.random() * attackPoses.length)];
}

// Start timer
function startTimer() {
  gameState.timer = gameState.baseTimerDuration;
  elements.timerBarFill.style.width = "100%";
  elements.timerBarFill.classList.remove("warning", "danger");

  // Reset timer warning state
  gameState.hasPlayedWarningSound = false;
  gameState.hasPlayedDangerSound = false;

  // Update timer text initially
  const secondsRemaining = Math.ceil(gameState.timer / 1000);
  elements.timerText.textContent = secondsRemaining;

  gameState.timerInterval = setInterval(() => {
    if (gameState.isPaused) return;

    gameState.timer -= 100;
    const percentage = (gameState.timer / gameState.baseTimerDuration) * 100;
    elements.timerBarFill.style.width = `${percentage}%`;

    // Update color based on percentage
    elements.timerBarFill.classList.remove("warning", "danger");
    if (percentage <= 33) {
      elements.timerBarFill.classList.add("danger");
      // Play danger sound on repeat (every second)
      if (!gameState.hasPlayedDangerSound || gameState.timer % 1000 < 100) {
        audioManager.playSoundEffect("timerRunningOut");
        gameState.hasPlayedDangerSound = true;
      }
    } else if (percentage <= 66) {
      elements.timerBarFill.classList.add("warning");
      // Play warning sound once
      if (!gameState.hasPlayedWarningSound) {
        audioManager.playSoundEffect("timerRunningOut");
        gameState.hasPlayedWarningSound = true;
      }
    }

    // Update timer text (show seconds remaining, rounded up)
    const secondsRemaining = Math.ceil(gameState.timer / 1000);
    elements.timerText.textContent = secondsRemaining;

    if (gameState.timer <= 0) {
      clearInterval(gameState.timerInterval);
      handleTimeout();
    }
  }, 100);
}

// Stop timer
function stopTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
  // Clear the timer text
  elements.timerText.textContent = "";
}

// Handle timeout
function handleTimeout() {
  stopTimer();
  elements.defenseButtons.classList.remove("show");

  // Flash red and shake for timeout
  flashScreen(false);
  shakeScreen();

  elements.message.textContent = "Too slow!";
  elements.message.style.color = "#f00";
  elements.message.style.fontSize = "32px";
  elements.message.style.textShadow = "0 0 10px #f00, 3px 3px 0px #000";

  // Lose a heart
  gameState.hearts--;
  updateHearts();

  if (gameState.hearts <= 0) {
    gameOver();
  } else {
    setTimeout(() => {
      // Reset message styles
      elements.message.style.fontSize = "";
      elements.message.style.textShadow = "3px 3px 0px #000";
      startNewPose();
    }, GAME_CONFIG.FEEDBACK_DURATION);
  }
}

// Add visual feedback to button press
function addButtonFeedback(action, isCorrect) {
  const button = document.querySelector(`.attack-btn[data-action="${action}"]`);
  if (!button) return;

  // Add appropriate feedback class
  if (isCorrect) {
    button.classList.add("btn-correct");
    // Trigger particle shower
    createParticleShower(button);
    // Trigger icon projectile towards enemy
    createIconProjectile(button, action);
  } else {
    button.classList.add("btn-incorrect");
  }

  // Remove the class after animation
  setTimeout(() => {
    button.classList.remove("btn-correct", "btn-incorrect");
  }, 500);
}

// Create particle shower effect for correct answers
function createParticleShower(button) {
  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    // Random colors for particles - bright neon colors
    const colors = ["#00ff00", "#00ffff", "#ffff00", "#ff00ff"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.background = color;
    particle.style.boxShadow = `0 0 10px ${color}`;

    // Position at button center
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;

    document.body.appendChild(particle);

    // Random spread angle and distance
    const angle = (Math.PI * 2 * i) / particleCount;
    const distance = 100 + Math.random() * 100;

    const targetX = centerX + Math.cos(angle) * distance;
    const targetY = centerY + Math.sin(angle) * distance;

    // Animate particle
    const duration = 800 + Math.random() * 400;
    particle.style.animation = `particleRise ${duration}ms ease-out forwards`;
    particle.style.setProperty("--target-x", `${targetX - centerX}px`);
    particle.style.setProperty("--target-y", `${targetY - centerY}px`);

    // Apply transform for spreading effect
    const animateTimeout = setTimeout(() => {
      particle.style.transform = `translate(${targetX - centerX}px, ${
        targetY - centerY - 200
      }px) scale(0.5) rotate(${Math.random() * 360}deg)`;
      particle.style.opacity = "0";
    }, 10);

    // Remove particle after animation with proper cleanup
    const cleanupTimeout = setTimeout(() => {
      if (particle.parentNode) {
        document.body.removeChild(particle);
      }
    }, duration + 100);

    // Store timeout IDs for potential cleanup
    particle.dataset.animateTimeout = animateTimeout;
    particle.dataset.cleanupTimeout = cleanupTimeout;
  }
}

// Create icon projectile that shoots towards enemy container
function createIconProjectile(button, action) {
  const buttonRect = button.getBoundingClientRect();
  const enemyContainer = document.getElementById("enemy-container");
  if (!enemyContainer) return;

  const enemyRect = enemyContainer.getBoundingClientRect();

  // Get the icon image from the button
  const buttonImg = button.querySelector("img");
  if (!buttonImg) return;

  // Create projectile element
  const projectile = document.createElement("div");
  projectile.className = "icon-projectile";

  // Create image inside projectile
  const projectileImg = document.createElement("img");
  projectileImg.src = buttonImg.src;
  projectileImg.alt = action;
  projectile.appendChild(projectileImg);

  // Position at button center
  const startX = buttonRect.left + buttonRect.width / 2;
  const startY = buttonRect.top + buttonRect.height / 2;

  projectile.style.left = `${startX}px`;
  projectile.style.top = `${startY}px`;

  document.body.appendChild(projectile);

  // Calculate target position (center of enemy container)
  const targetX = enemyRect.left + enemyRect.width / 2;
  const targetY = enemyRect.top + enemyRect.height / 2;

  // Calculate travel distance for animation
  const deltaX = targetX - startX;
  const deltaY = targetY - startY;

  // Trigger animation
  requestAnimationFrame(() => {
    projectile.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.5) rotate(360deg)`;
    projectile.style.opacity = "0";
  });

  // Remove projectile after animation completes
  setTimeout(() => {
    if (projectile.parentNode) {
      document.body.removeChild(projectile);
    }
  }, 600);
}

// Add screen flash effect for feedback
function flashScreen(isCorrect) {
  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.top = "0";
  flash.style.left = "0";
  flash.style.width = "100%";
  flash.style.height = "100%";
  flash.style.pointerEvents = "none";
  flash.style.zIndex = "1000";
  flash.style.opacity = "0";
  flash.style.transition = "opacity 0.2s ease";

  if (isCorrect) {
    flash.style.background = "rgba(0, 255, 0, 0.3)";
  } else {
    flash.style.background = "rgba(255, 0, 0, 0.3)";
  }

  document.body.appendChild(flash);

  // Trigger animation
  setTimeout(() => {
    flash.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    flash.style.opacity = "0";
  }, 150);

  setTimeout(() => {
    document.body.removeChild(flash);
  }, 350);
}

// Shake animation for incorrect answers
function shakeScreen() {
  audioManager.playSoundEffect("shake");
  document.body.style.animation = "shake 0.5s ease";
  setTimeout(() => {
    document.body.style.animation = "";
  }, 500);
}

// Handle attack
function handleAttack(action) {
  if (!gameState.pendingPose) return;

  // Store the pending pose and clear it immediately to prevent multiple clicks
  const currentPose = gameState.pendingPose;
  gameState.pendingPose = null;

  stopTimer();
  elements.defenseButtons.classList.remove("show");

  // Use the defense mapping to determine the correct answer
  const correctDefense = gameState.defenseMapping[currentPose.id];
  const correct = action === correctDefense;
  const poseId = currentPose.id;

  // Add button press feedback with correct/incorrect indication
  addButtonFeedback(action, correct);

  // Sound effect map for each pose
  const hitSoundMap = {
    2: "pose2Hit",
    3: "pose3Hit",
    4: "pose4Hit",
    5: "pose5Hit",
  };
  const missSoundMap = {
    2: "pose2Miss",
    3: "pose3Miss",
    4: "pose4Miss",
    5: "pose5Miss",
  };

  if (correct) {
    // Flash green for correct answer
    flashScreen(true);

    // Play miss sound (player successfully dodged/countered)
    const missSound = missSoundMap[poseId];
    if (missSound) {
      audioManager.playSoundEffect(missSound);
    }

    // Show damage feedback pose (player successfully damaged enemy)
    setPose({ img: currentPose.dmgImg, desc: "Hit!" });

    setTimeout(() => {
      elements.message.textContent = "Perfect counter!";
      elements.message.style.color = "#0f0";
      elements.message.style.fontSize = "32px";
      elements.message.style.textShadow = "0 0 10px #0f0, 3px 3px 0px #000";

      // Deal damage
      gameState.enemyHP--;
      audioManager.playSoundEffect("enemyDamage");
      updateEnemyHearts();

      if (gameState.enemyHP <= 0) {
        handleFightWon();
      } else {
        setTimeout(() => {
          // Reset message styles
          elements.message.style.fontSize = "";
          elements.message.style.textShadow = "3px 3px 0px #000";
          startNewPose();
        }, GAME_CONFIG.FEEDBACK_DURATION);
      }
    }, GAME_CONFIG.FEEDBACK_POSE_DURATION);
  } else {
    // Flash red and shake for incorrect answer
    flashScreen(false);
    shakeScreen();

    // Play hit sound (enemy hit the player)
    const hitSound = hitSoundMap[poseId];
    if (hitSound) {
      audioManager.playSoundEffect(hitSound);
    }

    // Show hit feedback pose (enemy hit the player)
    // Use sprite sheet if available, otherwise use static image
    if (currentPose.hitSprite) {
      setPose({
        img: currentPose.hitImg,
        desc: "Blocked!",
        sprite: currentPose.hitSprite,
      });

      // If using sprite animation, wait for it to complete
      if (activeSpriteSheet && !activeSpriteSheet.loop) {
        activeSpriteSheet.onComplete = () => {
          elements.message.textContent = "Wrong move!";
          elements.message.style.color = "#f00";
          elements.message.style.fontSize = "32px";
          elements.message.style.textShadow = "0 0 10px #f00, 3px 3px 0px #000";

          // Lose a heart
          gameState.hearts--;
          audioManager.playSoundEffect("playerDamage");
          updateHearts();

          if (gameState.hearts <= 0) {
            gameOver();
          } else {
            setTimeout(() => {
              // Reset message styles
              elements.message.style.fontSize = "";
              elements.message.style.textShadow = "3px 3px 0px #000";
              startNewPose();
            }, GAME_CONFIG.FEEDBACK_DURATION);
          }
        };
        return; // Exit early, the onComplete callback will handle the rest
      }
    } else {
      setPose({ img: currentPose.hitImg, desc: "Blocked!" });
    }

    setTimeout(() => {
      elements.message.textContent = "Wrong move!";
      elements.message.style.color = "#f00";
      elements.message.style.fontSize = "32px";
      elements.message.style.textShadow = "0 0 10px #f00, 3px 3px 0px #000";

      // Lose a heart
      gameState.hearts--;
      audioManager.playSoundEffect("playerDamage");
      updateHearts();

      if (gameState.hearts <= 0) {
        gameOver();
      } else {
        setTimeout(() => {
          // Reset message styles
          elements.message.style.fontSize = "";
          elements.message.style.textShadow = "3px 3px 0px #000";
          startNewPose();
        }, GAME_CONFIG.FEEDBACK_DURATION);
      }
    }, GAME_CONFIG.FEEDBACK_POSE_DURATION);
  }
}

// Handle fight won
function handleFightWon() {
  // Enemy defeated

  // Show damaged pose
  setPose(damagedPose);

  // Play robot death sound
  audioManager.playSoundEffect("roboDeath");

  setTimeout(() => {
    if (gameState.isInfiniteMode) {
      // Infinite mode: advance to next level
      gameState.infiniteLevel++;

      // Track infinite level trophies
      trackInfiniteLevel(gameState.infiniteLevel);

      setupFight();
    } else if (gameState.currentFight === gameState.maxFights) {
      // Final fight won - calculate and save time-based score
      const totalGameTime = calculateTotalGameTime();
      const isNewHighScore = saveHighScore(totalGameTime);

      setPose(finalDestroyPose);

      // Play final death sound for level 4 victory
      audioManager.playSoundEffect("roboFinalDeath");

      // Track story mode completion
      const noHits = gameState.hearts === 3;
      trackStoryModeComplete(noHits);

      // Show victory screen after a brief delay
      const timeText = formatTimeForDisplay(totalGameTime);
      setTimeout(() => {
        gameOverScreen.showVictory(timeText, isNewHighScore, totalGameTime);
      }, 1000);
    } else {
      // Track fight 1 completion
      if (gameState.currentFight === 1) {
        trackFight1Complete();

        // Check if level 1 was completed without hits
        if (gameState.hearts === 3) {
          trackLevel1NoHits();
        }
      }

      // Show time warp transition
      showTimeWarp();
    }
  }, GAME_CONFIG.DAMAGED_STATE_DURATION);
}

// Calculate total game time (excluding paused time)
function calculateTotalGameTime() {
  const endTime = Date.now();
  const totalElapsed = endTime - gameState.gameStartTime;
  const activeTime = totalElapsed - gameState.totalPausedTime;
  return activeTime / 1000; // Convert to seconds
}

// Format time for in-game display
function formatTimeForDisplay(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${minutes}:${secs.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(2, "0")}`;
}

// Create time warp particle canvas
function createTimewarpParticleCanvas() {
  // Create canvas element
  const canvas = document.createElement("canvas");
  canvas.id = "timewarp-particle-canvas";
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "1";
  canvas.style.borderRadius = "50%";

  return canvas;
}

// Initialize time warp particles
function initTimewarpParticles(canvasWidth, canvasHeight) {
  timewarpParticles = [];
  const particleCount = 60;

  for (let i = 0; i < particleCount; i++) {
    timewarpParticles.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      size: Math.random() * 4 + 2,
      alpha: Math.random() * 0.5 + 0.3,
      color: Math.random() > 0.5 ? "#00ffff" : "#0099ff",
      pulseSpeed: Math.random() * 0.05 + 0.02,
      pulsePhase: Math.random() * Math.PI * 2,
    });
  }
}

// Animate time warp particles
function animateTimewarpParticles() {
  if (!timewarpParticleCanvas || !timewarpParticleCtx) return;

  const width = timewarpParticleCanvas.width;
  const height = timewarpParticleCanvas.height;

  // Clear canvas with slight trail effect
  timewarpParticleCtx.fillStyle = "rgba(0, 0, 0, 0.1)";
  timewarpParticleCtx.fillRect(0, 0, width, height);

  // Update and draw particles
  timewarpParticles.forEach((particle) => {
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Wrap around edges
    if (particle.x < 0) particle.x = width;
    if (particle.x > width) particle.x = 0;
    if (particle.y < 0) particle.y = height;
    if (particle.y > height) particle.y = 0;

    // Update pulse
    particle.pulsePhase += particle.pulseSpeed;
    const pulse = Math.sin(particle.pulsePhase) * 0.3 + 0.7;

    // Draw particle with glow
    const glowSize = particle.size * 3;
    const gradient = timewarpParticleCtx.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      glowSize
    );
    gradient.addColorStop(
      0,
      particle.color +
        Math.floor(particle.alpha * pulse * 255)
          .toString(16)
          .padStart(2, "0")
    );
    gradient.addColorStop(0.5, particle.color + "40");
    gradient.addColorStop(1, particle.color + "00");

    timewarpParticleCtx.fillStyle = gradient;
    timewarpParticleCtx.beginPath();
    timewarpParticleCtx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
    timewarpParticleCtx.fill();

    // Draw core
    timewarpParticleCtx.fillStyle = particle.color;
    timewarpParticleCtx.beginPath();
    timewarpParticleCtx.arc(
      particle.x,
      particle.y,
      particle.size * pulse,
      0,
      Math.PI * 2
    );
    timewarpParticleCtx.fill();
  });

  timewarpParticleAnimationId = requestAnimationFrame(animateTimewarpParticles);
}

// Stop time warp particle animation
function stopTimewarpParticles() {
  if (timewarpParticleAnimationId) {
    cancelAnimationFrame(timewarpParticleAnimationId);
    timewarpParticleAnimationId = null;
  }
  timewarpParticles = [];
}

// Show time warp transition in popup
function showTimeWarp() {
  // Track that we're in a time warp
  isInTimewarp = true;

  // Play timewarp sound effect
  audioManager.playSoundEffect("timewarp");

  // Check if crystal is being consumed
  const currentConfig = GAME_CONFIG.FIGHT_CONFIGS[gameState.currentFight];
  let crystalDepleted = false;

  if (currentConfig.showCrystal) {
    gameState.crystalCharges -= GAME_CONFIG.CRYSTAL_COST_ON_WARP;
    updateCrystalDisplay();

    if (gameState.crystalCharges <= 0) {
      crystalDepleted = true;
      trackCrystalDepleted();
    }
  }

  // Set the message
  if (crystalDepleted) {
    elements.timewarpMessage.textContent = "Crystal Energy Depleted!";
  } else {
    elements.timewarpMessage.textContent = "Warping Through Time...";
  }

  // Create sprite animation in the popup
  const spriteConfig = getSpriteConfig("pose8-timewarp");
  timewarpSprite = new SpriteSheet(spriteConfig);

  // Clear any existing content
  elements.timewarpAnimationContainer.innerHTML = "";

  // Create and add particle canvas
  timewarpParticleCanvas = createTimewarpParticleCanvas();
  elements.timewarpAnimationContainer.appendChild(timewarpParticleCanvas);

  // Set canvas size to match container
  const containerRect =
    elements.timewarpAnimationContainer.getBoundingClientRect();
  timewarpParticleCanvas.width = containerRect.width || 450;
  timewarpParticleCanvas.height = containerRect.height || 450;
  timewarpParticleCtx = timewarpParticleCanvas.getContext("2d");

  // Initialize particles
  initTimewarpParticles(
    timewarpParticleCanvas.width,
    timewarpParticleCanvas.height
  );

  // Create sprite structure: scaler -> clipper -> img
  const scaler = document.createElement("div");
  scaler.style.transform = `scale(${timewarpSprite.scale}) translate(${timewarpSprite.offsetX}px, ${timewarpSprite.offsetY}px)`;
  scaler.style.transformOrigin = "center center";
  scaler.style.position = "relative";
  scaler.style.zIndex = "2";
  elements.timewarpAnimationContainer.appendChild(scaler);

  timewarpClipper = document.createElement("div");
  timewarpClipper.className = "sprite-clipper";
  timewarpClipper.style.width = `${timewarpSprite.frameContentWidth}px`;
  timewarpClipper.style.height = `${timewarpSprite.frameContentHeight}px`;
  scaler.appendChild(timewarpClipper);

  const spriteImg = document.createElement("img");
  spriteImg.src = timewarpSprite.imagePath;
  timewarpClipper.appendChild(spriteImg);

  // Track when the sprite completes a full yoyo cycle for trophy tracking
  timewarpSprite.onCycleComplete = () => {
    // Only track if game is paused during timewarp
    if (gameState.isPaused && isInTimewarp) {
      trackRobotSpinDuringTimewarpPause();
    }
  };

  // Wait for sprite to load, then start animation and show popup
  timewarpLoadInterval = setInterval(() => {
    if (timewarpSprite.isLoaded) {
      clearInterval(timewarpLoadInterval);
      timewarpLoadInterval = null;
      timewarpSprite.play(timewarpClipper);

      // Start particle animation
      animateTimewarpParticles();

      // Show the popup
      elements.timewarpOverlay.classList.add("show");
    }
  }, 50);

  // Track time warp completion
  trackTimeWarpComplete();

  // Start tracking time for pause/resume
  timewarpStartTime = Date.now();
  timewarpRemainingTime = GAME_CONFIG.TIME_WARP_DURATION;

  // Function to complete the timewarp
  const completeTimewarp = () => {
    // Add closing animation
    elements.timewarpOverlay.classList.add("closing");

    // Wait for exit animation to complete before cleanup
    setTimeout(() => {
      // Stop and cleanup sprite
      if (timewarpSprite) {
        timewarpSprite.stop();
        timewarpSprite.destroy();
        timewarpSprite = null;
      }

      // Stop particle animation
      stopTimewarpParticles();

      // Hide popup and remove closing class
      elements.timewarpOverlay.classList.remove("show", "closing");

      // Clear timeout reference
      timewarpTimeoutId = null;
      timewarpStartTime = null;
      timewarpRemainingTime = null;
      timewarpClipper = null;

      isInTimewarp = false;
      gameState.currentFight++;
      setupFight();
    }, 500); // Match the CSS animation duration
  };

  // Hide popup and advance to next fight after duration
  timewarpTimeoutId = setTimeout(
    completeTimewarp,
    GAME_CONFIG.TIME_WARP_DURATION
  );
}

// Game over
function gameOver() {
  stopTimer();

  if (gameState.isInfiniteMode) {
    // Save infinite mode high score
    const levelReached = gameState.infiniteLevel;
    const isNewHighScore = saveInfiniteHighScore(levelReached);
    elements.message.textContent = `Level Reached: ${levelReached}`;
    elements.message.style.color = "#f00";

    // Show defeat screen after a brief delay
    setTimeout(() => {
      gameOverScreen.showInfiniteDefeat(levelReached, isNewHighScore);
    }, 1000);
  } else {
    elements.message.textContent = `You reached Fight ${gameState.currentFight}`;
    elements.message.style.color = "#f00";

    // Show defeat screen after a brief delay
    setTimeout(() => {
      gameOverScreen.showDefeat(gameState.currentFight);
    }, 1000);
  }
}

// Toggle pause
function togglePause() {
  gameState.isPaused = !gameState.isPaused;

  if (gameState.isPaused) {
    // Track when pause started
    gameState.lastPauseTime = Date.now();
    elements.pauseOverlay.classList.add("show");

    // Check if paused on win screen for trophy
    if (
      gameOverScreen &&
      gameOverScreen.victoryScreen &&
      gameOverScreen.victoryScreen.style.display === "flex"
    ) {
      trackPauseOnWinScreen();
    }

    // Check if paused on lose screen for trophy
    if (
      gameOverScreen &&
      gameOverScreen.defeatScreen &&
      gameOverScreen.defeatScreen.style.display === "flex"
    ) {
      trackPauseOnLoseScreen();
    }

    // Check if paused during time warp for trophy
    if (isInTimewarp) {
      trackPauseDuringTimewarp();

      // Pause the timewarp timeout
      if (timewarpTimeoutId !== null) {
        clearTimeout(timewarpTimeoutId);
        timewarpTimeoutId = null;

        // Calculate remaining time
        const elapsed = Date.now() - timewarpStartTime;
        timewarpRemainingTime -= elapsed;
      }

      // Stop the sprite loading interval if still loading
      if (timewarpLoadInterval !== null) {
        clearInterval(timewarpLoadInterval);
        timewarpLoadInterval = null;
      }

      // Don't pause the sprite animation - let it continue to yoyo
      // The sprite animation should continue even when paused

      // Pause particle animation
      if (timewarpParticleAnimationId) {
        cancelAnimationFrame(timewarpParticleAnimationId);
        timewarpParticleAnimationId = null;
      }
    }
  } else {
    // Add paused time to total when resuming
    if (gameState.lastPauseTime) {
      gameState.totalPausedTime += Date.now() - gameState.lastPauseTime;
      gameState.lastPauseTime = null;
    }
    elements.pauseOverlay.classList.remove("show");

    // Resume timewarp if it was paused during timewarp
    if (
      isInTimewarp &&
      timewarpTimeoutId === null &&
      timewarpRemainingTime !== null
    ) {
      // Check if sprite was still loading when paused
      if (timewarpSprite && !timewarpSprite.isLoaded && timewarpClipper) {
        // Resume the loading interval
        timewarpLoadInterval = setInterval(() => {
          if (timewarpSprite.isLoaded) {
            clearInterval(timewarpLoadInterval);
            timewarpLoadInterval = null;
            timewarpSprite.play(timewarpClipper);
            animateTimewarpParticles();
          }
        }, 50);
      } else {
        // Sprite animation continues running even when paused, so just resume particles
        // Resume particle animation
        animateTimewarpParticles();
      }

      // Restart the timeout with remaining time
      timewarpStartTime = Date.now();
      timewarpTimeoutId = setTimeout(() => {
        // Add closing animation
        elements.timewarpOverlay.classList.add("closing");

        // Wait for exit animation to complete before cleanup
        setTimeout(() => {
          // Stop and cleanup sprite
          if (timewarpSprite) {
            timewarpSprite.stop();
            timewarpSprite.destroy();
            timewarpSprite = null;
          }

          // Stop particle animation
          stopTimewarpParticles();

          // Hide popup and remove closing class
          elements.timewarpOverlay.classList.remove("show", "closing");

          // Clear timeout reference
          timewarpTimeoutId = null;
          timewarpStartTime = null;
          timewarpRemainingTime = null;
          timewarpClipper = null;

          isInTimewarp = false;
          gameState.currentFight++;
          setupFight();
        }, 500); // Match the CSS animation duration
      }, timewarpRemainingTime);
    }
  }
}

// Restart game
function restartGame() {
  stopTimer();
  cleanupSpriteSheet();
  elements.restart.style.display = "none";
  elements.pauseOverlay.classList.remove("show");

  // Hide game over screens
  if (gameOverScreen) {
    gameOverScreen.hide();
  }

  // Restart combat music (use the current mode's track)
  const wasInfiniteMode = gameState.isInfiniteMode;
  audioManager.play(wasInfiniteMode ? "infinity" : "combat");

  gameState = createInitialGameState();
  gameState.isInfiniteMode = wasInfiniteMode;

  // Generate new random defense mapping for the new game
  gameState.defenseMapping = generateDefenseMapping();

  initHearts();
  setupFight();
}

// Quit to main menu
function quitToMainMenu() {
  stopTimer();
  cleanupSpriteSheet();

  // Hide game over screens (defeat/win popups)
  if (gameOverScreen) {
    gameOverScreen.hide();
  }

  // Hide pause overlay and game elements
  elements.pauseOverlay.classList.remove("show");
  gameState.isPaused = false;
  // Also reset the UI elements related to pausing
  elements.pause.textContent = "Pause";
  elements.pause.style.display = "none";
  elements.quitBtn.style.display = "none";

  // Hide game elements and show title screen
  document.getElementById("game").style.display = "none";
  const titleScreen = document.getElementById("title-screen");
  titleScreen.style.display = "block";

  // Re-import and re-initialize the title screen to reset its state
  import("./title-screen.js").then((titleScreenModule) => {
    // Reset the title screen first to clean up any previous state
    titleScreenModule.resetTitleScreen();
    titleScreenModule.initTitleScreen();
  });

  // Ensure combat music stops and title music starts
  audioManager.play("titleIntro");
}

// Toggle audio on/off
function toggleAudio() {
  const isMuted = audioManager.toggleMute();
  // Update button visual state
  elements.audioToggleCombat.style.opacity = isMuted ? "0.5" : "1";
}
