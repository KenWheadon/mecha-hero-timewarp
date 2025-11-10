import { audioManager } from "./audio-manager.js";
import { trackStoryViewed } from "./trophy-manager.js";

// Story panel data
const STORY_PANELS = [
  {
    id: 1,
    image: "images/story0.jpg",
    text: "It's the year 2147. Humanity's evolved and most folks are half-cyborg like me. And the rest? Full-on heartless clankers made of nothing but chrome and circuits. But who cares about a history lession when it's LUNCHTIME...",
  },
  {
    id: 2,
    image: "images/story1.jpg",
    text: "Check it out! One beautiful synth-ham sandwich and an ice-cold OJ juicebox. Nothing like chowing down to reset the energy levels. Life is GOOD, or at least it was...",
  },
  {
    id: 3,
    image: "images/story2.jpg",
    text: "Then THIS clanker barges in, sword already out and slices my sandwich clean in half. Just when I was gonna protest about sharing MY sandwich he steps forward and inhales BOTH pieces like a vacuum! The AUDACITY!",
  },
  {
    id: 4,
    image: "images/story3.jpg",
    text: "Oh, and you know that chrome-dome he wasn't done either. He grabbed my juice box and drained it dry. I couldn't get another OJ even if I wanted, they only had grape and apple left!",
  },
  {
    id: 5,
    image: "images/story4.jpg",
    text: "I'm sitting there ready to cry when he whips out this glowing blue crystal. 'Chill out, cyborg baby' he says. 'Your food's not gone - just in the past.' Then WHOOSH—the crystal explodes with energy and I start to see something too good to be true!",
  },
  {
    id: 6,
    image: "images/story5.jpg",
    text: "HOLY SMOKES. My sandwich and juice are back, good as new. Just floating there all perfect and delicious-looking again. This is amazing!",
  },
  {
    id: 7,
    image: "images/story6.jpg",
    text: "Then he ate them again, and laughed while doing it. It's one thing to steal my lunch once, BUT TWICE? That's it, I officially LOST IT!",
  },
  {
    id: 8,
    image: "images/story7.jpg",
    text: "PAYBACK TIME! Nobody messes with my lunchtime vibes and gets away with it! Time to introduce this tin can to my cybernetic bat!",
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
    let touchHandled = false;

    // Add touchstart listener to track touch events
    element.addEventListener("touchstart", () => {
      touchHandled = true;
    });

    // Add touchend listener for touch devices
    element.addEventListener("touchend", (e) => {
      if (touchHandled) {
        e.preventDefault(); // Prevent ghost click
        handler(e);
        // Reset flag after a short delay
        setTimeout(() => {
          touchHandled = false;
        }, 500);
      }
    });

    // Add click listener for mouse/desktop
    element.addEventListener("click", (e) => {
      // Only handle click if it wasn't preceded by a touch
      if (!touchHandled) {
        handler(e);
      }
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

    audioManager.playSoundEffect("popupAppear");
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
      // Play story page sound
      audioManager.playSoundEffect("storyPage");
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
      // Play story page sound
      audioManager.playSoundEffect("storyPage");
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
