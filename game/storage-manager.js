// Storage Manager - handles local storage for high scores and first-time flags

const STORAGE_KEYS = {
  HIGH_SCORE: 'mecha-hero-high-score',
  FIRST_TIME_FLAGS: 'mecha-hero-first-time',
};

// Get high score (fight level reached)
export function getHighScore() {
  const score = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
  return score ? parseInt(score, 10) : 0;
}

// Save high score (fight level reached)
export function saveHighScore(fightLevel) {
  const currentHighScore = getHighScore();
  if (fightLevel > currentHighScore) {
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, fightLevel.toString());
    return true; // New high score
  }
  return false; // Not a new high score
}

// Check if it's the first time for a specific fight
export function isFirstTime(fightLevel) {
  const flags = getFirstTimeFlags();
  return !flags[fightLevel];
}

// Mark a fight as seen
export function markFightAsSeen(fightLevel) {
  const flags = getFirstTimeFlags();
  flags[fightLevel] = true;
  localStorage.setItem(STORAGE_KEYS.FIRST_TIME_FLAGS, JSON.stringify(flags));
}

// Get all first-time flags
function getFirstTimeFlags() {
  const flags = localStorage.getItem(STORAGE_KEYS.FIRST_TIME_FLAGS);
  return flags ? JSON.parse(flags) : {};
}

// Reset all progress (for testing or user request)
export function resetAllProgress() {
  localStorage.removeItem(STORAGE_KEYS.HIGH_SCORE);
  localStorage.removeItem(STORAGE_KEYS.FIRST_TIME_FLAGS);
}
