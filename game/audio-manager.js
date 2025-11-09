// Audio Manager - handles all game audio with mute toggle

class AudioManager {
  constructor() {
    this.tracks = {
      titleIntro: null,
      titleMain: null,
      combat: null,
      infinity: null,
    };
    this.soundEffects = {
      btnClick: null,
      btnHover: null,
      timewarp: null,
      roboDeath: null,
      roboFinalDeath: null,
      // Pose attack sounds
      pose2Charge: null,
      pose2Hit: null,
      pose2Miss: null,
      pose3Charge: null,
      pose3Hit: null,
      pose3Miss: null,
      pose4Charge: null,
      pose4Hit: null,
      pose4Miss: null,
      pose5Charge: null,
      pose5Hit: null,
      pose5Miss: null,
    };
    // Volume settings for music tracks (0.0 to 1.0)
    this.trackVolumes = {
      titleIntro: 0.3,
      titleMain: 0.3,
      combat: 0.3,
      infinity: 0.3,
    };
    // Volume settings for each sound effect (0.0 to 1.0)
    this.volumes = {
      btnClick: 0.4,
      btnHover: 0.4,
      timewarp: 0.7,
      roboDeath: 0.6,
      roboFinalDeath: 0.8,
      // Pose 2 volumes
      pose2Charge: 0.6,
      pose2Hit: 0.7,
      pose2Miss: 0.5,
      // Pose 3 volumes
      pose3Charge: 0.6,
      pose3Hit: 0.7,
      pose3Miss: 0.5,
      // Pose 4 volumes
      pose4Charge: 0.6,
      pose4Hit: 0.7,
      pose4Miss: 0.5,
      // Pose 5 volumes
      pose5Charge: 0.6,
      pose5Hit: 0.7,
      pose5Miss: 0.5,
    };
    this.currentTrack = null;
    this.isMuted = false;
    this.isInitialized = false;
    this.isUnlocked = false;
    this.pendingTrack = null; // Track to play once audio is unlocked
  }

  // Initialize audio files
  init() {
    if (this.isInitialized) return;

    // Initialize music tracks
    this.tracks.titleIntro = new Audio("audio/intro-song.mp3");
    this.tracks.titleMain = new Audio("audio/intro-2.mp3");
    this.tracks.combat = new Audio("audio/main-audio.mp3");
    this.tracks.infinity = new Audio("audio/infi-audio.mp3");

    // Set all tracks to loop and apply volume settings
    Object.keys(this.tracks).forEach((key) => {
      const track = this.tracks[key];
      track.loop = true;
      if (this.trackVolumes[key] !== undefined) {
        track.volume = this.trackVolumes[key];
      }
    });

    // Initialize sound effects (don't loop)
    this.soundEffects.btnClick = new Audio("audio/btn-click.mp3");
    this.soundEffects.btnHover = new Audio("audio/btn-hover.mp3");
    this.soundEffects.timewarp = new Audio("audio/timewarp.mp3");
    this.soundEffects.roboDeath = new Audio("audio/robo-death.mp3");
    this.soundEffects.roboFinalDeath = new Audio("audio/robo-final-death.mp3");

    // Pose 2 (Laser Beam)
    this.soundEffects.pose2Charge = new Audio("audio/pose2-charge.mp3");
    this.soundEffects.pose2Hit = new Audio("audio/pose2-hit.mp3");
    this.soundEffects.pose2Miss = new Audio("audio/pose2-miss.mp3");

    // Pose 3 (Launcher)
    this.soundEffects.pose3Charge = new Audio("audio/pose3-charge.mp3");
    this.soundEffects.pose3Hit = new Audio("audio/pose3-hit.mp3");
    this.soundEffects.pose3Miss = new Audio("audio/pose3-miss.mp3");

    // Pose 4 (Short Blade)
    this.soundEffects.pose4Charge = new Audio("audio/pose4-charge.mp3");
    this.soundEffects.pose4Hit = new Audio("audio/pose4-hit.mp3");
    this.soundEffects.pose4Miss = new Audio("audio/pose4-miss.mp3");

    // Pose 5 (Heavy Blade)
    this.soundEffects.pose5Charge = new Audio("audio/pose5-charge.mp3");
    this.soundEffects.pose5Hit = new Audio("audio/pose5-hit.mp3");
    this.soundEffects.pose5Miss = new Audio("audio/pose5-miss.mp3");

    // Apply volume settings to all sound effects
    Object.keys(this.soundEffects).forEach((key) => {
      if (this.soundEffects[key] && this.volumes[key] !== undefined) {
        this.soundEffects[key].volume = this.volumes[key];
      }
    });

    this.isInitialized = true;
  }

  // Unlock audio context (must be called on user interaction)
  unlock() {
    if (this.isUnlocked) return;

    this.init(); // Ensure audio is initialized
    this.isUnlocked = true;

    // If there's a pending track, play it now
    if (this.pendingTrack && !this.isMuted) {
      const track = this.tracks[this.pendingTrack];
      if (track) {
        this.currentTrack = track;
        track.play().catch((err) => console.error("Error playing audio:", err));
      }
      this.pendingTrack = null;
    }
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

    // If audio not unlocked yet, save it as pending
    if (!this.isUnlocked) {
      this.pendingTrack = trackName;
      return;
    }

    // Only play if not muted
    if (!this.isMuted) {
      track.play().catch((err) => console.error("Error playing audio:", err));
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

  // Play a sound effect
  playSoundEffect(effectName) {
    this.init(); // Ensure audio is initialized

    // Unlock audio on first sound effect attempt
    if (!this.isUnlocked) {
      this.unlock();
    }

    // Only play if not muted
    if (this.isMuted) return;

    const effect = this.soundEffects[effectName];
    if (!effect) {
      console.error(`Sound effect "${effectName}" not found`);
      return;
    }

    // Clone the audio to allow overlapping plays
    const soundClone = effect.cloneNode();
    // Apply the volume setting to the clone
    if (this.volumes[effectName] !== undefined) {
      soundClone.volume = this.volumes[effectName];
    }

    // Clean up the cloned audio after it finishes playing
    soundClone.addEventListener('ended', () => {
      soundClone.src = '';
      soundClone.remove();
    });

    // Also clean up if there's an error
    soundClone.addEventListener('error', () => {
      soundClone.src = '';
      soundClone.remove();
    });

    soundClone
      .play()
      .catch((err) => {
        console.error("Error playing sound effect:", err);
        // Clean up on playback error
        soundClone.src = '';
        soundClone.remove();
      });
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
