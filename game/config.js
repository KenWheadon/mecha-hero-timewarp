// Game Configuration - poses, constants, and tunable parameters

export const neutralPose = {
  id: 1,
  desc: "Neutral Stance",
  img: "images/pose1.png",
  scale: 1.0,
  x: 0,
  y: 0,
};

export const attackPoses = [
  {
    id: 2,
    desc: "Laser Beam Charge",
    img: "images/pose2.png",
    hitImg: "images/pose2-hit.png",
    hitSprite: "pose2-hit", // Use sprite sheet for hit animation
    dmgImg: "images/pose2-dmg.png",
    correct: "shield",
    scale: 1.0,
    x: 0,
    y: 0,
  },
  {
    id: 3,
    desc: "Launcher Warm Up",
    img: "images/pose3.png",
    hitImg: "images/pose3-hit.png",
    hitSprite: "pose3-hit", // Use sprite sheet for hit animation
    dmgImg: "images/pose3-dmg.png",
    correct: "rocket",
    scale: 1.0,
    x: 0,
    y: 0,
  },
  {
    id: 4,
    desc: "Short Blade Ready",
    img: "images/pose4.png",
    hitImg: "images/pose4-hit.png",
    hitSprite: "pose4-hit", // Use sprite sheet for hit animation
    dmgImg: "images/pose4-dmg.png",
    correct: "sword",
    scale: 1.0,
    x: 0,
    y: 0,
  },
  {
    id: 5,
    desc: "Heavy Blade Ready",
    img: "images/pose5.png",
    hitImg: "images/pose5-hit.png",
    hitSprite: "pose5-hit", // Use sprite sheet for hit animation
    dmgImg: "images/pose5-dmg.png",
    correct: "plasma",
    scale: 1.0,
    x: 0,
    y: 0,
  },
];

export const damagedPose = {
  id: 7,
  desc: "Damaged",
  img: "images/pose7.png",
  scale: 1.0,
  x: 0,
  y: 0,
};

export const timeWarpPose = {
  id: 8,
  desc: "Time Warp",
  img: "images/pose8.png",
  scale: 1.0,
  x: 0,
  y: 0,
};

export const finalDestroyPose = {
  id: 9,
  desc: "Destroyed",
  img: "images/pose9.png",
  scale: 1.0,
  x: 0,
  y: 0,
};

// Game constants
export const GAME_CONFIG = {
  MAX_HEARTS: 3,
  MAX_FIGHTS: 4,
  INITIAL_CRYSTAL_CHARGES: 3,

  // Fight configurations [fight level: { maxHP, availableAttacks, timerDuration, showCrystal }]
  FIGHT_CONFIGS: {
    1: {
      maxHP: 2,
      availableAttacks: ["shield", "rocket"],
      timerDuration: 10000,
      showCrystal: true,
    },
    2: {
      maxHP: 4,
      availableAttacks: ["shield", "rocket", "sword", "plasma"],
      timerDuration: 8000,
      showCrystal: true,
    },
    3: {
      maxHP: 4,
      availableAttacks: ["shield", "rocket", "sword", "plasma"],
      timerDuration: 6000,
      showCrystal: true,
    },
    4: {
      maxHP: 8,
      availableAttacks: ["shield", "rocket", "sword", "plasma"],
      timerDuration: 4000,
      showCrystal: false,
    },
  },

  // Timings
  DAMAGED_STATE_DURATION: 2000,
  TIME_WARP_DURATION: 5000,
  FEEDBACK_DURATION: 1000,
  FEEDBACK_POSE_DURATION: 1000, // Duration to show hit/dmg feedback poses
  NEUTRAL_STANCE_DELAY: 500,

  // Feedback pose suffixes
  FEEDBACK_SUCCESS_SUFFIX: "dmg",
  FEEDBACK_FAIL_SUFFIX: "hit",

  // Crystal cost
  CRYSTAL_COST_ON_WARP: 1,
};

// Default game state
export function createInitialGameState() {
  return {
    currentFight: 1,
    maxFights: GAME_CONFIG.MAX_FIGHTS,
    hearts: GAME_CONFIG.MAX_HEARTS,
    enemyHP: 0,
    maxEnemyHP: 0,
    pendingPose: null,
    availableAttacks: [],
    timer: null,
    timerInterval: null,
    baseTimerDuration: 10000,
    isPaused: false,
    crystalCharges: GAME_CONFIG.INITIAL_CRYSTAL_CHARGES,
    counteredPoses: new Set(),
    // Total game time tracking
    gameStartTime: null,
    totalPausedTime: 0,
    lastPauseTime: null,
  };
}
