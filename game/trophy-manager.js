// Trophy Manager - handles trophy data, unlocking, and persistence

import { audioManager } from "./audio-manager.js";

// Trophy definitions
const TROPHIES = [
  {
    id: "just-checking",
    name: "Just Checking",
    icon: "images/plasma.png",
    requirement: 'Open and close the "How to Play" modal 3 times',
    flavorText: "Triple-checking the manual. A true professional.",
    unlocked: false,
  },
  {
    id: "need-a-break",
    name: "I Need a Break",
    icon: "images/icon-waterbottle.png",
    requirement: "Pause the game during a Time Warp sequence.",
    flavorText: "Taking a water break while breaking the laws of physics.",
    unlocked: false,
  },
  {
    id: "is-this-thing-on",
    name: "Is This Thing On?",
    icon: "images/icon-musicnote.png",
    requirement: "Toggle the audio on and off 5 times.",
    flavorText: "Testing, testing... 1, 2, 3.",
    unlocked: false,
  },
  {
    id: "curiosity-clicked",
    name: "Curiosity Clicked the Cat",
    icon: "images/icon-mouse.png",
    requirement: "Discover the logo's first secret.",
    flavorText: "You just had to click it, didn't you?",
    unlocked: false,
  },
  {
    id: "eye-for-detail",
    name: "An Eye for Detail",
    icon: "images/icon-eyeball.png",
    requirement: "Discover the logo's second secret.",
    flavorText: "It's raining eyeballs! Hallelujah!",
    unlocked: false,
  },
  {
    id: "endless-vengeance",
    name: "Endless Vengeance",
    icon: "images/icon-alarmclock.png",
    requirement: "Reach Level 5 in Infinite Mode.",
    flavorText: "The fight never ends.",
    unlocked: false,
  },
  {
    id: "infinite-legend",
    name: "Infinite Legend",
    icon: "images/icon-diamond.png",
    requirement: "Reach Level 10 in Infinite Mode.",
    flavorText: "Your enemy is starting to run out of sandwiches.",
    unlocked: false,
  },
  {
    id: "recursion-master",
    name: "Recursion Master",
    icon: "images/icon-diamondtrophy.png",
    requirement: "Reach Level 20 in Infinite Mode.",
    flavorText: "You've become the time loop.",
    unlocked: false,
  },
  {
    id: "so-thats-what-happened",
    name: "So That's What Happened",
    icon: "images/icon-book.png",
    requirement: "View the entire story.",
    flavorText:
      "Those damn clankers just that anything they want, and don't even feel bad about it.",
    unlocked: false,
  },
  {
    id: "sandwich-vindicator",
    name: "Sandwich Vindicator",
    icon: "images/icon-teeth.png",
    requirement: "Complete the main story mode.",
    flavorText:
      "Payback is a dish best served cold. Just like that sandwich should have been.",
    unlocked: false,
  },
  {
    id: "first-blood",
    name: "First Blood",
    icon: "images/icon-skull.png",
    requirement: "Defeat the enemy in Fight 1.",
    flavorText: "The first of many to fall.",
    unlocked: false,
  },
  {
    id: "back-to-future",
    name: "Back to the Future, Again",
    icon: "images/icon-stopwatch.png",
    requirement: "Successfully complete 3 Time Warps.",
    flavorText: "Where we're going, we don't need timers.",
    unlocked: false,
  },
  {
    id: "crystal-depleted",
    name: "Crystal Depleted",
    icon: "images/icon-diamondsnap.png",
    requirement: "Use up all the Clankers Crystal Energy.",
    flavorText: "Running on pure evil.",
    unlocked: false,
  },
  {
    id: "untouchable-luck",
    name: "Untouchable Luck",
    icon: "images/icon-rabbitfoot.png",
    requirement: "Complete level 1 without taking a single hit.",
    flavorText: "Rabbit foot in my pocket and not a scratch on my chrome.",
    unlocked: false,
  },
  {
    id: "how-far-up",
    name: "How far up there was it shoved?",
    icon: "images/icon-horseshoe.png",
    requirement:
      "Complete the entire story mode without losing a single heart.",
    flavorText: "Prison pockets feeling might full of horseshoes.",
    unlocked: false,
  },
  {
    id: "spin-to-win",
    name: "Spin to Win",
    icon: "images/icon-record.png",
    requirement:
      "Make the robot spin 10 times while paused during a Time Warp animation.",
    flavorText: "DJ Hero over here scratching records in the time stream.",
    unlocked: false,
  },
  {
    id: "taste-of-victory",
    name: "Taste of Victory",
    icon: "images/icon-1stmedal.png",
    requirement: "Pause on the winning screen.",
    flavorText: "Savor the moment. You've earned it.",
    unlocked: false,
  },
  {
    id: "face-your-demons",
    name: "Face Your Demons",
    icon: "images/icon-demon.png",
    requirement: "Pause on the losing screen.",
    flavorText: "Sometimes you need to sit with defeat for a moment.",
    unlocked: false,
  },
  {
    id: "never-give-up",
    name: "Never Give Up",
    icon: "images/icon-brain.png",
    requirement: "Select 'Try Again' after losing.",
    flavorText: "The brain always finds a way. That's the human spirit.",
    unlocked: false,
  },
];

// Local storage key
const STORAGE_KEY = "mechaHero_trophies";
const STATS_KEY = "mechaHero_trophyStats";

// Trophy progress tracking
let trophyStats = {
  htpOpens: 0,
  audioToggles: 0,
  logoClicked: false,
  pausedDuringTimewarp: false,
  eyeballShowerSeen: false,
  timeWarpsCompleted: 0,
  viewedFullStory: false,
  fight1Completed: false,
  crystalDepleted: false,
  level1NoHits: false,
  storyModeNoHits: false,
  robotSpinsDuringTimewarpPause: 0,
  pausedOnWinScreen: false,
  pausedOnLoseScreen: false,
  selectedTryAgain: false,
};

// Initialize trophy system
export function initTrophyManager() {
  loadTrophyData();
  loadTrophyStats();
}

// Load trophy unlock status from localStorage
function loadTrophyData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const unlockedIds = JSON.parse(saved);
      TROPHIES.forEach((trophy) => {
        trophy.unlocked = unlockedIds.includes(trophy.id);
      });
    }
  } catch (e) {
    console.error("Failed to load trophy data:", e);
  }
}

// Save trophy unlock status to localStorage
function saveTrophyData() {
  try {
    const unlockedIds = TROPHIES.filter((t) => t.unlocked).map((t) => t.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedIds));
  } catch (e) {
    console.error("Failed to save trophy data:", e);
  }
}

// Load trophy stats from localStorage
function loadTrophyStats() {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      trophyStats = { ...trophyStats, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load trophy stats:", e);
  }
}

// Save trophy stats to localStorage
function saveTrophyStats() {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(trophyStats));
  } catch (e) {
    console.error("Failed to save trophy stats:", e);
  }
}

// Get all trophies
export function getTrophies() {
  return TROPHIES;
}

// Unlock a trophy by ID
function unlockTrophy(trophyId) {
  const trophy = TROPHIES.find((t) => t.id === trophyId);
  if (trophy && !trophy.unlocked) {
    trophy.unlocked = true;
    saveTrophyData();
    showTrophyUnlockedNotification(trophy);
    return true;
  }
  return false;
}

// Show trophy unlocked notification
function showTrophyUnlockedNotification(trophy) {
  // Play trophy award sound
  audioManager.playSoundEffect("trophyAward");

  // Create notification element
  const notification = document.createElement("div");
  notification.className = "trophy-notification";
  notification.innerHTML = `
    <div class="trophy-notification-content">
      <div class="trophy-notification-header">TROPHY UNLOCKED!</div>
      <div class="trophy-notification-body">
        <img src="${trophy.icon}" alt="${trophy.name}" class="trophy-notification-icon" />
        <div class="trophy-notification-text">
          <div class="trophy-notification-name">${trophy.name}</div>
          <div class="trophy-notification-flavor">${trophy.flavorText}</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Animate out after 4 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 500);
  }, 4000);
}

// Trophy tracking functions

// Track How to Play modal opens
export function trackHTPOpen() {
  trophyStats.htpOpens++;
  saveTrophyStats();

  if (trophyStats.htpOpens >= 3) {
    unlockTrophy("just-checking");
  }
}

// Track audio toggles
export function trackAudioToggle() {
  trophyStats.audioToggles++;
  saveTrophyStats();

  if (trophyStats.audioToggles >= 5) {
    unlockTrophy("is-this-thing-on");
  }
}

// Track logo click (first secret)
export function trackLogoClick() {
  if (!trophyStats.logoClicked) {
    trophyStats.logoClicked = true;
    saveTrophyStats();
    unlockTrophy("curiosity-clicked");
  }
}

// Track pause during timewarp
export function trackPauseDuringTimewarp() {
  if (!trophyStats.pausedDuringTimewarp) {
    trophyStats.pausedDuringTimewarp = true;
    saveTrophyStats();
    unlockTrophy("need-a-break");
  }
}

// Track eyeball shower (second logo secret)
export function trackEyeballShower() {
  if (!trophyStats.eyeballShowerSeen) {
    trophyStats.eyeballShowerSeen = true;
    saveTrophyStats();
    unlockTrophy("eye-for-detail");
  }
}

// Track time warp completion
export function trackTimeWarpComplete() {
  trophyStats.timeWarpsCompleted++;
  saveTrophyStats();

  if (trophyStats.timeWarpsCompleted >= 3) {
    unlockTrophy("back-to-future");
  }
}

// Track story completion
export function trackStoryViewed() {
  if (!trophyStats.viewedFullStory) {
    trophyStats.viewedFullStory = true;
    saveTrophyStats();
    unlockTrophy("so-thats-what-happened");
  }
}

// Track fight 1 completion
export function trackFight1Complete() {
  if (!trophyStats.fight1Completed) {
    trophyStats.fight1Completed = true;
    saveTrophyStats();
    unlockTrophy("first-blood");
  }
}

// Track crystal depletion
export function trackCrystalDepleted() {
  if (!trophyStats.crystalDepleted) {
    trophyStats.crystalDepleted = true;
    saveTrophyStats();
    unlockTrophy("crystal-depleted");
  }
}

// Track infinite mode level reached
export function trackInfiniteLevel(level) {
  if (level >= 20) {
    unlockTrophy("recursion-master");
  } else if (level >= 10) {
    unlockTrophy("infinite-legend");
  } else if (level >= 5) {
    unlockTrophy("endless-vengeance");
  }
}

// Track level 1 completion without hits
export function trackLevel1NoHits() {
  if (!trophyStats.level1NoHits) {
    trophyStats.level1NoHits = true;
    saveTrophyStats();
    unlockTrophy("untouchable-luck");
  }
}

// Track story mode completion (victory)
export function trackStoryModeComplete(noHits) {
  unlockTrophy("sandwich-vindicator");

  if (noHits && !trophyStats.storyModeNoHits) {
    trophyStats.storyModeNoHits = true;
    saveTrophyStats();
    unlockTrophy("how-far-up");
  }
}

// Track robot spins while paused during timewarp
export function trackRobotSpinDuringTimewarpPause() {
  trophyStats.robotSpinsDuringTimewarpPause++;
  saveTrophyStats();

  if (trophyStats.robotSpinsDuringTimewarpPause >= 5) {
    unlockTrophy("spin-to-win");
  }
}

// Track pause on win screen
export function trackPauseOnWinScreen() {
  if (!trophyStats.pausedOnWinScreen) {
    trophyStats.pausedOnWinScreen = true;
    saveTrophyStats();
    unlockTrophy("taste-of-victory");
  }
}

// Track pause on lose screen
export function trackPauseOnLoseScreen() {
  if (!trophyStats.pausedOnLoseScreen) {
    trophyStats.pausedOnLoseScreen = true;
    saveTrophyStats();
    unlockTrophy("face-your-demons");
  }
}

// Track selecting try again after losing
export function trackTryAgainSelected() {
  if (!trophyStats.selectedTryAgain) {
    trophyStats.selectedTryAgain = true;
    saveTrophyStats();
    unlockTrophy("never-give-up");
  }
}

// Get trophy stats (for debugging)
export function getTrophyStats() {
  return trophyStats;
}
