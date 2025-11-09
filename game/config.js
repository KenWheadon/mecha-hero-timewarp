// Game Configuration - poses, constants, and tunable parameters

export const neutralPose = {
  id: 1,
  desc: "Neutral Stance",
  img: "images/pose1.png",
};

export const attackPoses = [
  {
    id: 2,
    desc: "Laser Beam Charge",
    img: "images/pose2.png",
    hitSprite: "pose2-hit", // Use sprite sheet for hit animation
    dmgImg: "images/pose2-dmg.png",
    correct: "shield",
  },
  {
    id: 3,
    desc: "Launcher Warm Up",
    img: "images/pose3.png",
    hitSprite: "pose3-hit", // Use sprite sheet for hit animation
    dmgImg: "images/pose3-dmg.png",
    correct: "rocket",
  },
  {
    id: 4,
    desc: "Short Blade Ready",
    img: "images/pose4.png",
    hitSprite: "pose4-hit", // Use sprite sheet for hit animation
    dmgImg: "images/pose4-dmg.png",
    correct: "sword",
  },
  {
    id: 5,
    desc: "Heavy Blade Ready",
    img: "images/pose5.png",
    hitSprite: "pose5-hit", // Use sprite sheet for hit animation
    dmgImg: "images/pose5-dmg.png",
    correct: "plasma",
  },
];

export const damagedPose = {
  id: 7,
  desc: "Damaged",
  img: "images/pose7.png",
};

export const timeWarpPose = {
  id: 8,
  desc: "Time Warp",
  img: "images/pose8.png",
  sprite: "pose8-timewarp", // Use sprite sheet for time warp animation (used in time warp popup, not enemy container)
};

export const finalDestroyPose = {
  id: 9,
  desc: "Destroyed",
  img: "images/pose9.png",
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
      timerDuration: 5000,
      showCrystal: true,
    },
    4: {
      maxHP: 8,
      availableAttacks: ["shield", "rocket", "sword", "plasma"],
      timerDuration: 3000,
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
    // Randomized defense mappings for this game session
    defenseMapping: null,
  };
}

// Helper function to shuffle an array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate random defense mapping for the game
// Level 1: shuffle shield/rocket between poses 2 and 3
// Level 2+: shuffle sword/plasma between poses 4 and 5 (only in infinite mode)
export function generateDefenseMapping(isInfiniteMode = false) {
  if (isInfiniteMode) {
    // Infinite Mode: Shuffle all defenses
    const allDefenses = shuffleArray(["shield", "rocket", "sword", "plasma"]);
    return {
      2: allDefenses[0],
      3: allDefenses[1],
      4: allDefenses[2],
      5: allDefenses[3],
    };
  } else {
    // Story Mode: Fixed mapping
    return {
      2: "shield", // Pose 2 (Laser Beam)
      3: "rocket", // Pose 3 (Launcher)
      4: "sword", // Pose 4 (Short Blade)
      5: "plasma", // Pose 5 (Heavy Blade)
    };
  }
}
