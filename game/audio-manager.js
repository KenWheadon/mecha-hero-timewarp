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
      // Title Screen & UI
      titleGlitchIn: null,
      titleTrans: null,
      eyeballShow: null,
      // Story & Popups
      storyPage: null,
      popupAppear: null,
      accordionOpen: null,
      // Combat
      playerDamage: null,
      enemyDamage: null,
      timerRunningOut: null,
      shake: null,
      // Victory Screen
      awardStar: null,
      winScreen: null,
      newRecord: null,
      // Trophy
      trophyAward: null,
    };
    // Track currently playing sound effects to prevent overlapping
    this.playingSounds = {};
    // Volume settings for music tracks (0.0 to 1.0)
    this.trackVolumes = {
      titleIntro: 0.2,
      titleMain: 0.15,
      combat: 0.15,
      infinity: 0.15,
    };
    // Volume settings for each sound effect (0.0 to 1.0)
    this.volumes = {
      btnClick: 0.4,
      btnHover: 0.3,
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
      // Title Screen & UI
      titleGlitchIn: 0.5,
      titleTrans: 0.5,
      eyeballShow: 0.6,
      // Story & Popups
      storyPage: 0.75,
      popupAppear: 0.75,
      accordionOpen: 0.75,
      // Combat
      playerDamage: 0.9,
      enemyDamage: 0.8,
      timerRunningOut: 0.8,
      shake: 0.5,
      // Victory Screen
      awardStar: 0.75,
      winScreen: 0.75,
      newRecord: 0.75,
      // Trophy
      trophyAward: 0.6,
    };
    this.currentTrack = null;
    this.isMuted = false;
    this.isInitialized = false;
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

    // Title Screen & UI
    this.soundEffects.titleGlitchIn = new Audio("audio/title-glitch-in.mp3");
    this.soundEffects.titleTrans = new Audio("audio/title-trans.mp3");
    this.soundEffects.eyeballShow = new Audio("audio/eyeball-show.mp3");

    // Story & Popups
    this.soundEffects.storyPage = new Audio("audio/story-page.mp3");
    this.soundEffects.popupAppear = new Audio("audio/popup-appear.mp3");
    this.soundEffects.accordionOpen = new Audio("audio/accordion-open.mp3");

    // Combat
    this.soundEffects.playerDamage = new Audio("audio/player-damage.mp3");
    this.soundEffects.enemyDamage = new Audio("audio/enemy-damage.mp3");
    this.soundEffects.timerRunningOut = new Audio("audio/timer-runningout.mp3");
    this.soundEffects.shake = new Audio("audio/shake.mp3");

    // Victory Screen
    this.soundEffects.awardStar = new Audio("audio/award-star.mp3");
    this.soundEffects.winScreen = new Audio("audio/win-screen.mp3");
    this.soundEffects.newRecord = new Audio("audio/new-record.mp3");

    // Trophy
    this.soundEffects.trophyAward = new Audio("audio/trophy-award.mp3");

    // Apply volume settings to all sound effects
    Object.keys(this.soundEffects).forEach((key) => {
      if (this.soundEffects[key] && this.volumes[key] !== undefined) {
        this.soundEffects[key].volume = this.volumes[key];
      }
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

    // Reset to beginning for immediate playback
    track.currentTime = 0;

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

    // Only play if not muted
    if (this.isMuted) return;

    const effect = this.soundEffects[effectName];
    if (!effect) {
      console.error(`Sound effect "${effectName}" not found`);
      return;
    }

    // Prevent btnHover from overlapping - only allow one instance at a time
    if (effectName === "btnHover" && this.playingSounds.btnHover) {
      return; // Already playing, don't play again
    }

    // Clone the audio to allow overlapping plays
    const soundClone = effect.cloneNode();
    // Apply the volume setting to the clone
    if (this.volumes[effectName] !== undefined) {
      soundClone.volume = this.volumes[effectName];
    }

    // Track that btnHover is playing
    if (effectName === "btnHover") {
      this.playingSounds.btnHover = true;
    }

    // Clean up the cloned audio after it finishes playing
    soundClone.addEventListener("ended", () => {
      if (effectName === "btnHover") {
        this.playingSounds.btnHover = false;
      }
      soundClone.src = "";
      soundClone.remove();
    });

    // Also clean up if there's an error
    soundClone.addEventListener("error", () => {
      if (effectName === "btnHover") {
        this.playingSounds.btnHover = false;
      }
      soundClone.src = "";
      soundClone.remove();
    });

    soundClone.play().catch((err) => {
      console.error("Error playing sound effect:", err);
      // Clean up on playback error
      if (effectName === "btnHover") {
        this.playingSounds.btnHover = false;
      }
      soundClone.src = "";
      soundClone.remove();
    });
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
