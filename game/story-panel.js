import { audioManager } from "./audio-manager.js";

// Story panel data
const STORY_PANELS = [
  {
    id: 1,
    image: "images/story-1.png",
    text: "In the year 2147, humanity's greatest creation turned against them. The Mecha Warriors, once defenders of peace, became instruments of chaos.",
  },
  {
    id: 2,
    image: "images/story-2.png",
    text: "As cities fell and hope faded, a mysterious temporal anomaly was discovered—a rift in time itself, pulsing with crystalline energy.",
  },
  {
    id: 3,
    image: "images/story-3.png",
    text: "Scientists raced to understand the phenomenon. The crystals held the power to manipulate time, to rewind moments, to change fate.",
  },
  {
    id: 4,
    image: "images/story-4.png",
    text: "You are humanity's last hope: a pilot equipped with a prototype mecha and armed with temporal crystals. Your mission is clear.",
  },
  {
    id: 5,
    image: "images/story-5.png",
    text: "Travel through the time loop. Study your enemies' attack patterns. Use the crystals to rewind when needed. Each loop brings you closer to victory.",
  },
  {
    id: 6,
    image: "images/story-6.png",
    text: "The recursive nature of time is your weapon. Master the patterns, break the cycle, and save humanity from the mecha threat!",
  },
];

export class StoryPanel {
  constructor() {
    this.elements = {
      overlay: document.getElementById("overlay"),
      panel: document.getElementById("story-panel"),
      image: document.getElementById("story-img"),
      text: document.getElementById("story-text"),
      pageIndicator: document.getElementById("story-page-indicator"),
      backBtn: document.getElementById("story-back-btn"),
      nextBtn: document.getElementById("story-next-btn"),
      skipBtn: document.getElementById("story-skip-btn"),
    };

    this.currentPanelIndex = 0;
    this.onCompleteCallback = null;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Next button
    this.elements.nextBtn.addEventListener("click", () => {
      audioManager.playSound("select");
      this.next();
    });

    // Back button
    this.elements.backBtn.addEventListener("click", () => {
      audioManager.playSound("select");
      this.back();
    });

    // Skip button
    this.elements.skipBtn.addEventListener("click", () => {
      audioManager.playSound("select");
      this.close();
    });

    // Click overlay to close
    this.elements.overlay.addEventListener("click", () => {
      audioManager.playSound("select");
      this.close();
    });

    // Prevent clicks on panel from closing overlay
    this.elements.panel.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  open(callback) {
    this.currentPanelIndex = 0;
    this.onCompleteCallback = callback;

    this.updatePanel();
    this.elements.overlay.style.display = "block";
    this.elements.panel.style.display = "block";

    audioManager.playSound("select");
  }

  close() {
    this.elements.overlay.style.display = "none";
    this.elements.panel.style.display = "none";

    if (this.onCompleteCallback) {
      this.onCompleteCallback();
      this.onCompleteCallback = null;
    }
  }

  next() {
    if (this.currentPanelIndex < STORY_PANELS.length - 1) {
      this.currentPanelIndex++;
      this.updatePanel();
    } else {
      // On last panel, next button closes the story
      this.close();
    }
  }

  back() {
    if (this.currentPanelIndex > 0) {
      this.currentPanelIndex--;
      this.updatePanel();
    }
  }

  updatePanel() {
    const panel = STORY_PANELS[this.currentPanelIndex];

    // Update image
    this.elements.image.src = panel.image;
    this.elements.image.alt = `Story Panel ${panel.id}`;

    // Update text
    this.elements.text.textContent = panel.text;

    // Update page indicator
    this.elements.pageIndicator.textContent = `${panel.id} / ${STORY_PANELS.length}`;

    // Update button states
    this.elements.backBtn.disabled = this.currentPanelIndex === 0;

    // Change next button text on last panel
    if (this.currentPanelIndex === STORY_PANELS.length - 1) {
      this.elements.nextBtn.textContent = "Begin →";
    } else {
      this.elements.nextBtn.textContent = "Next →";
    }
  }

  // Method to show story from How to Play button
  replay() {
    this.open(null);
  }
}

// Export singleton instance
export const storyPanel = new StoryPanel();
