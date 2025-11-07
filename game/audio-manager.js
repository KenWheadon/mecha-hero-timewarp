// Audio Manager - handles all game audio with mute toggle

class AudioManager {
  constructor() {
    this.tracks = {
      titleIntro: null,
      titleMain: null,
      combat: null,
    };
    this.currentTrack = null;
    this.isMuted = false;
    this.isInitialized = false;
  }

  // Initialize audio files
  init() {
    if (this.isInitialized) return;

    this.tracks.titleIntro = new Audio("audio/intro-song.mp3");
    this.tracks.titleMain = new Audio("audio/intro-2.mp3");
    this.tracks.combat = new Audio("audio/main-audio.mp3");

    // Set all tracks to loop
    Object.values(this.tracks).forEach((track) => {
      track.loop = true;
    });

    this.isInitialized = true;
  }

  // Play a specific track
  play(trackName) {
    this.init(); // Ensure audio is initialized

    // Stop current track if playing
    if (this.currentTrack) {
      this.currentTrack.pause();
      this.currentTrack.currentTime = 0;
    }

    // Get the requested track
    const track = this.tracks[trackName];
    if (!track) {
      console.error(`Track "${trackName}" not found`);
      return;
    }

    this.currentTrack = track;

    // Only play if not muted
    if (!this.isMuted) {
      track
        .play()
        .catch((err) => console.error("Error playing audio:", err));
    }
  }

  // Stop all audio
  stop() {
    if (this.currentTrack) {
      this.currentTrack.pause();
      this.currentTrack.currentTime = 0;
      this.currentTrack = null;
    }
  }

  // Toggle mute state
  toggleMute() {
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      // Mute: pause current track
      if (this.currentTrack) {
        this.currentTrack.pause();
      }
    } else {
      // Unmute: resume current track
      if (this.currentTrack) {
        this.currentTrack
          .play()
          .catch((err) => console.error("Error playing audio:", err));
      }
    }

    return this.isMuted;
  }

  // Get mute state
  getMuted() {
    return this.isMuted;
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
