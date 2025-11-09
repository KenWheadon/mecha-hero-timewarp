import { audioManager } from "./audio-manager.js";
import { trackStoryViewed } from "./trophy-manager.js";

// Story panel data
const STORY_PANELS = [
  {
    id: 1,
    image: "images/story0.jpg",
    text: "It's the year 2147, and most of humanity has either gone cyborg or full on clanker.",
  },
  {
    id: 2,
    image: "images/story1.jpg",
    text: "I'm in the lunchroom ready to eat up my tasty lunch.",
  },
  {
    id: 3,
    image: "images/story2.jpg",
    text: "A clanker busts in and starts cutting up my sandwich, then eats BOTH halves.",
  },
  {
    id: 4,
    image: "images/story3.jpg",
    text: "Then you know what? He drank my juice too!",
  },
  {
    id: 5,
    image: "images/story4.jpg",
    text: "I was getting all sad but then he pulled out this weird crystal and said 'don't worry, your food's not gone for good' and blue light came out of the crystal.",
  },
  {
    id: 6,
    image: "images/story5.jpg",
    text: "Holy smokes, there was my sandwich and juice, all good as new.",
  },
  {
    id: 7,
    image: "images/story6.jpg",
    text: "Then he ate them again. I was so pissed.",
  },
  {
    id: 8,
    image: "images/story7.jpg",
    text: "Now it's time for payback!",
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

  // Helper function to add both click and touch event listeners
  addTouchAndClickListener(element, handler) {
    // Remove any existing listeners to prevent duplicates
    element.removeEventListener("click", handler);
    element.removeEventListener("touchend", handler);

    // Add click listener for mouse/desktop
    element.addEventListener("click", handler);

    // Add touchend listener for touch devices
    element.addEventListener("touchend", (e) => {
      e.preventDefault(); // Prevent ghost click
      handler(e);
    });
  }

  setupEventListeners() {
    // Next button
    this.addTouchAndClickListener(this.elements.nextBtn, () => {
      audioManager.playSoundEffect("btnClick");
      this.next();
    });

    // Back button
    this.addTouchAndClickListener(this.elements.backBtn, () => {
      audioManager.playSoundEffect("btnClick");
      this.back();
    });

    // Skip button
    this.addTouchAndClickListener(this.elements.skipBtn, () => {
      audioManager.playSoundEffect("btnClick");
      this.close();
    });

    // Click overlay to close
    this.addTouchAndClickListener(this.elements.overlay, () => {
      audioManager.playSoundEffect("btnClick");
      this.close();
    });

    // Prevent clicks on panel from closing overlay
    this.addTouchAndClickListener(this.elements.panel, (e) => {
      e.stopPropagation();
    });

    // Add hover sound effects
    [
      this.elements.nextBtn,
      this.elements.backBtn,
      this.elements.skipBtn,
    ].forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        audioManager.playSoundEffect("btnHover");
      });
    });
  }

  open(callback) {
    this.currentPanelIndex = 0;
    this.onCompleteCallback = callback;

    this.updatePanel();
    this.elements.overlay.style.display = "block";
    this.elements.panel.style.display = "block";

    audioManager.playSoundEffect("btnClick");
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
      // Track that user viewed the full story
      trackStoryViewed();
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
