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
import { saveHighScore } from "./storage-manager.js";
import { initOnboarding, checkAndShowOnboarding } from "./onboarding.js";

// Game state
let gameState = createInitialGameState();

// Cache DOM elements
const elements = {
  pause: document.getElementById("pause"),
  hearts: document.getElementById("hearts"),
  fightInfo: document.getElementById("fight-info"),
  timerFill: document.getElementById("timer-fill"),
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
  audioToggleCombat: document.getElementById("audio-toggle-combat"),
};

// Initialize game
export function initGame() {
  gameState = createInitialGameState();
  initHearts();
  initOnboarding();
  setupFight();
  elements.pause.addEventListener("click", () => {
    audioManager.playSoundEffect("btnClick");
    togglePause();
  });
  elements.restart.addEventListener("click", () => {
    audioManager.playSoundEffect("btnClick");
    restartGame();
  });
  elements.audioToggleCombat.addEventListener("click", () => {
    audioManager.playSoundEffect("btnClick");
    toggleAudio();
  });
  elements.attacks.forEach((btn) => {
    btn.addEventListener("click", () => handleAttack(btn.dataset.action));
  });

  // Add hover sound effects to all buttons
  [elements.pause, elements.restart, elements.audioToggleCombat, ...elements.attacks].forEach((btn) => {
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
      heart.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBvbHlnb24gcG9pbnRzPSIyMCw4IDI1LDIgMzUsMiAzNSwxMiAyMCwyOCA1LDEyIDUsMiAxNSwyIiBmaWxsPSIjZjAwIi8+PC9zdmc+";
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

// Setup fight
function setupFight() {
  const config = GAME_CONFIG.FIGHT_CONFIGS[gameState.currentFight];

  gameState.maxEnemyHP = config.maxHP;
  gameState.enemyHP = config.maxHP;
  gameState.availableAttacks = config.availableAttacks;
  gameState.baseTimerDuration = config.timerDuration;
  gameState.counteredPoses.clear();

  // Update UI
  elements.fightInfo.textContent = `Fight: ${gameState.currentFight}/${gameState.maxFights}`;
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

  // Check for first-time onboarding popup
  checkAndShowOnboarding(gameState.currentFight, () => {
    // Start game timer on first fight
    if (gameState.currentFight === 1 && gameState.gameStartTime === null) {
      gameState.gameStartTime = Date.now();
    }
    // Start first pose after popup closes (or immediately if not first time)
    startNewPose();
  });
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
      (p) => gameState.availableAttacks.includes(p.correct) && !gameState.counteredPoses.has(p.id)
    );
    if (availablePoses.length === 0) {
      gameState.counteredPoses.clear();
      return selectRandomPose();
    }
    const pose = availablePoses[Math.floor(Math.random() * availablePoses.length)];
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
    const pose = availablePoses[Math.floor(Math.random() * availablePoses.length)];
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

  gameState.timerInterval = setInterval(() => {
    if (gameState.isPaused) return;

    gameState.timer -= 100;
    const percentage = (gameState.timer / gameState.baseTimerDuration) * 100;
    elements.timerFill.style.width = `${percentage}%`;

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

  // Add button press feedback immediately
  addButtonFeedback(action);

  stopTimer();
  elements.attacksDiv.classList.remove("show");

  const correct = action === gameState.pendingPose.correct;
  const poseId = gameState.pendingPose.id;

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
    setPose({ img: gameState.pendingPose.dmgImg, desc: "Hit!" });

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
    setPose({ img: gameState.pendingPose.hitImg, desc: "Blocked!" });

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
    if (gameState.currentFight === gameState.maxFights) {
      // Final fight won - calculate and save time-based score
      const totalGameTime = calculateTotalGameTime();
      const isNewHighScore = saveHighScore(totalGameTime);

      setPose(finalDestroyPose);
      elements.instruction.textContent = "VICTORY!";

      // Play final death sound for level 4 victory
      audioManager.playSoundEffect("roboFinalDeath");

      // Show time and high score status
      const timeText = formatTimeForDisplay(totalGameTime);
      if (isNewHighScore) {
        elements.message.textContent = `New Record: ${timeText}!`;
        elements.message.style.color = "#ffff00";
      } else {
        elements.message.textContent = `Time: ${timeText}`;
        elements.message.style.color = "#0f0";
      }

      elements.restart.style.display = "block";
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
  return `${minutes}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
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
  elements.message.textContent = `You reached Fight ${gameState.currentFight}`;
  elements.message.style.color = "#f00";
  elements.restart.style.display = "block";
}

// Toggle pause
function togglePause() {
  gameState.isPaused = !gameState.isPaused;

  if (gameState.isPaused) {
    // Track when pause started
    gameState.lastPauseTime = Date.now();
    elements.pause.textContent = "Resume";
    elements.timerPaused.style.display = "block";
  } else {
    // Add paused time to total when resuming
    if (gameState.lastPauseTime) {
      gameState.totalPausedTime += Date.now() - gameState.lastPauseTime;
      gameState.lastPauseTime = null;
    }
    elements.pause.textContent = "Pause";
    elements.timerPaused.style.display = "none";
  }
}

// Restart game
function restartGame() {
  stopTimer();
  elements.restart.style.display = "none";
  elements.pause.textContent = "Pause";
  elements.timerPaused.style.display = "none";
  gameState = createInitialGameState();
  initHearts();
  setupFight();
}

// Toggle audio on/off
function toggleAudio() {
  const isMuted = audioManager.toggleMute();
  // Update button visual state
  elements.audioToggleCombat.style.opacity = isMuted ? "0.5" : "1";
}
