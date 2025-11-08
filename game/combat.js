// Combat System - all game logic for battles

import {
  neutralPose,
  attackPoses,
  damagedPose,
  timeWarpPose,
  finalDestroyPose,
  GAME_CONFIG,
  createInitialGameState,
} from "./config.js";
import { audioManager } from "./audio-manager.js";
import { saveHighScore, saveInfiniteHighScore } from "./storage-manager.js";
import { initOnboarding, checkAndShowOnboarding } from "./onboarding.js";
import { SpriteSheet } from "./sprite-sheet.js";
import { getSpriteConfig, hasSprite } from "./sprites-config.js";
import { GameOverScreen } from "./game-over-screen.js";

// Game state
let gameState = createInitialGameState();

// Active sprite sheet instance
let activeSpriteSheet = null;

// Interval for checking if a sprite is loaded
let spriteLoadCheckInterval = null;

// Game over screen manager
let gameOverScreen = null;

// Cache DOM elements
const elements = {
  pause: document.getElementById("pause"),
  hearts: document.getElementById("hearts"),
  fightInfo: document.getElementById("fight-info"),
  timerFill: document.getElementById("timer-fill"),
  timerText: document.getElementById("timer-text"),
  timerPaused: document.getElementById("timer-paused"),
  crystalEnergy: document.getElementById("crystal-energy"),
  crystalFill: document.getElementById("crystal-fill"),
  enemyHpFill: document.getElementById("enemy-hp-fill"),
  poseImg: document.getElementById("pose-img"),
  instruction: document.getElementById("instruction"),
  message: document.getElementById("message"),
  attacks: document.querySelectorAll(".attack-btn"),
  attacksDiv: document.getElementById("attacks"),
  restart: document.getElementById("restart"),
  quitBtn: document.getElementById("quit-btn"),
  audioToggleCombat: document.getElementById("audio-toggle-combat"),
};

// Initialize game
export function initGame(isInfiniteMode = false) {
  gameState = createInitialGameState();
  gameState.isInfiniteMode = isInfiniteMode;
  gameState.infiniteLevel = isInfiniteMode ? 1 : 0;
  initHearts();
  initOnboarding();

  // Initialize game over screen
  if (!gameOverScreen) {
    gameOverScreen = new GameOverScreen();
    gameOverScreen.onRestart(restartGame);
    gameOverScreen.onMainMenu(quitToMainMenu);
  }

  setupFight();
  elements.pause.addEventListener("click", () => {
    audioManager.playSoundEffect("btnClick");
    togglePause();
  });
  elements.restart.addEventListener("click", () => {
    audioManager.playSoundEffect("btnClick");
    restartGame();
  });
  elements.quitBtn.addEventListener("click", () => {
    audioManager.playSoundEffect("btnClick");
    quitToMainMenu();
  });
  elements.audioToggleCombat.addEventListener("click", () => {
    audioManager.playSoundEffect("btnClick");
    toggleAudio();
  });
  elements.attacks.forEach((btn) => {
    btn.addEventListener("click", () => handleAttack(btn.dataset.action));
  });

  // Add hover sound effects to all buttons
  [
    elements.pause,
    elements.restart,
    elements.audioToggleCombat,
    elements.quitBtn,
    ...elements.attacks,
  ].forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      audioManager.playSoundEffect("btnHover");
    });
  });

  // Start combat audio
  audioManager.play("combat");
}

// Initialize hearts display
function initHearts() {
  elements.hearts.innerHTML = "";
  for (let i = 0; i < gameState.hearts; i++) {
    const heart = document.createElement("img");
    heart.className = "heart";
    heart.src = "images/heart.png";
    heart.onerror = () => {
      console.error("Missing image: images/heart.png");
    };
    elements.hearts.appendChild(heart);
  }
}

// Update hearts display
function updateHearts() {
  const hearts = elements.hearts.querySelectorAll(".heart");
  hearts.forEach((heart, i) => {
    heart.style.opacity = i < gameState.hearts ? "1" : "0.3";
  });
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
      maxHP: 1, // One hit per level
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
  if (gameState.isInfiniteMode) {
    elements.fightInfo.textContent = `Level: ${gameState.infiniteLevel}`;
  } else {
    elements.fightInfo.textContent = `Fight: ${gameState.currentFight}/${gameState.maxFights}`;
  }
  updateEnemyHP();
  updateCrystalEnergy();

  // Show/hide crystal energy bar
  if (config.showCrystal) {
    elements.crystalEnergy.style.display = "block";
  } else {
    elements.crystalEnergy.style.display = "none";
  }

  // Enable/disable attack buttons based on available attacks
  elements.attacks.forEach((btn) => {
    const action = btn.dataset.action;
    btn.disabled = !gameState.availableAttacks.includes(action);
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

// Update enemy HP bar
function updateEnemyHP() {
  const percentage = (gameState.enemyHP / gameState.maxEnemyHP) * 100;
  elements.enemyHpFill.style.width = `${percentage}%`;
}

// Update crystal energy bar
function updateCrystalEnergy() {
  const percentage =
    (gameState.crystalCharges / GAME_CONFIG.INITIAL_CRYSTAL_CHARGES) * 100;
  elements.crystalFill.style.width = `${percentage}%`;
}

// Clean up active sprite sheet
function cleanupSpriteSheet() {
  if (activeSpriteSheet) {
    // Also clear any pending load-check interval to prevent race conditions
    if (spriteLoadCheckInterval) {
      clearInterval(spriteLoadCheckInterval);
      spriteLoadCheckInterval = null;
    }
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

    // Create the structure for scaling and clipping: scaler -> clipper -> img
    // 1. The SCALER container. This will be scaled.
    const scaler = document.createElement("div");
    scaler.style.transform = `scale(${activeSpriteSheet.scale}) translate(${activeSpriteSheet.offsetX}px, ${activeSpriteSheet.offsetY}px)`;
    scaler.style.transformOrigin = "center center";
    container.appendChild(scaler); // Add the scaler to the DOM

    // 2. The CLIPPER container. Sized to one frame, clips overflow.
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
    elements.poseImg.src = pose.img;
    elements.poseImg.onerror = () => {
      console.error(
        `Missing image: ${pose.img}${pose.desc ? ` (${pose.desc})` : ""}`
      );
    };

    // Apply scale and position from config
    const scale = pose.scale || 1.0;
    const x = pose.x || 0;
    const y = pose.y || 0;
    elements.poseImg.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }
}

// Start new pose sequence
function startNewPose() {
  // Reset UI
  elements.message.textContent = "";
  elements.attacksDiv.classList.remove("show");

  // Show neutral stance first
  setPose(neutralPose);
  elements.instruction.textContent = "Get ready...";

  setTimeout(() => {
    showAttackPose();
  }, GAME_CONFIG.NEUTRAL_STANCE_DELAY);
}

// Show attack pose
function showAttackPose() {
  const pose = selectRandomPose();
  gameState.pendingPose = pose;

  setPose(pose);
  elements.instruction.textContent = `Counter the ${pose.desc}!`;
  elements.attacksDiv.classList.add("show");

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
  // Fight 1: 2 unique poses
  if (gameState.currentFight === 1) {
    const availablePoses = attackPoses.filter(
      (p) =>
        gameState.availableAttacks.includes(p.correct) &&
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
  elements.timerFill.style.width = "100%";

  // Update timer text initially
  const secondsRemaining = Math.ceil(gameState.timer / 1000);
  elements.timerText.textContent = secondsRemaining;

  gameState.timerInterval = setInterval(() => {
    if (gameState.isPaused) return;

    gameState.timer -= 100;
    const percentage = (gameState.timer / gameState.baseTimerDuration) * 100;
    elements.timerFill.style.width = `${percentage}%`;

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
  elements.attacksDiv.classList.remove("show");

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
function addButtonFeedback(action) {
  const button = document.querySelector(`.attack-btn[data-action="${action}"]`);
  if (!button) return;

  // Add pressed class for visual feedback
  button.classList.add("btn-pressed");

  // Remove the class after animation
  setTimeout(() => {
    button.classList.remove("btn-pressed");
  }, 200);
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

  // Add button press feedback immediately
  addButtonFeedback(action);

  stopTimer();
  elements.attacksDiv.classList.remove("show");

  const correct = action === currentPose.correct;
  const poseId = currentPose.id;

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
      updateEnemyHP();

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
  elements.instruction.textContent = "Enemy defeated!";

  // Show damaged pose
  setPose(damagedPose);

  // Play robot death sound
  audioManager.playSoundEffect("roboDeath");

  setTimeout(() => {
    if (gameState.isInfiniteMode) {
      // Infinite mode: advance to next level
      gameState.infiniteLevel++;
      setupFight();
    } else if (gameState.currentFight === gameState.maxFights) {
      // Final fight won - calculate and save time-based score
      const totalGameTime = calculateTotalGameTime();
      const isNewHighScore = saveHighScore(totalGameTime);

      setPose(finalDestroyPose);
      elements.instruction.textContent = "VICTORY!";

      // Play final death sound for level 4 victory
      audioManager.playSoundEffect("roboFinalDeath");

      // Show victory screen after a brief delay
      const timeText = formatTimeForDisplay(totalGameTime);
      setTimeout(() => {
        gameOverScreen.showVictory(timeText, isNewHighScore, totalGameTime);
      }, 1000);
    } else {
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

// Show time warp transition
function showTimeWarp() {
  setPose(timeWarpPose);
  elements.instruction.textContent = "Time Warp Activated!";
  elements.message.textContent = "Traveling to next fight...";
  elements.message.style.color = "#0ff";

  // Play timewarp sound effect
  audioManager.playSoundEffect("timewarp");

  // Consume crystal charge if applicable
  const currentConfig = GAME_CONFIG.FIGHT_CONFIGS[gameState.currentFight];
  if (currentConfig.showCrystal) {
    gameState.crystalCharges -= GAME_CONFIG.CRYSTAL_COST_ON_WARP;
    updateCrystalEnergy();

    if (gameState.crystalCharges <= 0) {
      elements.message.textContent = "Crystal depleted!";
    }
  }

  setTimeout(() => {
    gameState.currentFight++;
    setupFight();
  }, GAME_CONFIG.TIME_WARP_DURATION);
}

// Game over
function gameOver() {
  stopTimer();
  elements.instruction.textContent = "GAME OVER";

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
    elements.pause.textContent = "Resume";
    elements.quitBtn.style.display = "inline-block";
    elements.timerPaused.style.display = "block";
  } else {
    // Add paused time to total when resuming
    if (gameState.lastPauseTime) {
      gameState.totalPausedTime += Date.now() - gameState.lastPauseTime;
      gameState.lastPauseTime = null;
    }
    elements.pause.textContent = "Pause";
    elements.quitBtn.style.display = "none";
    elements.timerPaused.style.display = "none";
  }
}

// Restart game
function restartGame() {
  stopTimer();
  cleanupSpriteSheet();
  elements.restart.style.display = "none";
  elements.pause.textContent = "Pause";
  elements.quitBtn.style.display = "none";
  elements.timerPaused.style.display = "none";

  // Hide game over screens
  if (gameOverScreen) {
    gameOverScreen.hide();
  }

  // Restart combat music
  audioManager.play("combat");

  gameState = createInitialGameState();
  initHearts();
  setupFight();
}

// Quit to main menu
function quitToMainMenu() {
  stopTimer();
  cleanupSpriteSheet();

  // Hide game elements and show title screen
  document.getElementById("game").style.display = "none";
  const titleScreen = document.getElementById("title-screen");
  titleScreen.style.display = "block";

  // Re-import and re-initialize the title screen to reset its state
  import("./title-screen.js").then((titleScreenModule) => {
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
