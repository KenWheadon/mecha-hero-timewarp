// Storage Manager - handles local storage for high scores and first-time flags

const STORAGE_KEYS = {
  HIGH_SCORE: 'mecha-hero-high-score',
  FIRST_TIME_FLAGS: 'mecha-hero-first-time',
};

// Get high score (best time in seconds, lower is better)
// Returns null if no score exists yet
export function getHighScore() {
  const score = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
  return score ? parseFloat(score) : null;
}

// Save high score (time in seconds)
// Only saves if game was completed and time is better (lower) than current high score
export function saveHighScore(timeInSeconds) {
  const currentHighScore = getHighScore();

  // If no high score exists, or new time is better (lower), save it
  if (currentHighScore === null || timeInSeconds < currentHighScore) {
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, timeInSeconds.toString());
    return true; // New high score
  }
  return false; // Not a new high score
}

// Format time for display (converts seconds to MM:SS.ms format)
export function formatTime(seconds) {
  if (seconds === null) return "N/A";

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  return `${minutes}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
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
