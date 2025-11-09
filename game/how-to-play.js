// How to Play Module - manages the tutorial modal with improved UX

import { audioManager } from "./audio-manager.js";
import { storyPanel } from "./story-panel.js";

export class HowToPlay {
  constructor() {
    this.elements = {
      overlay: document.getElementById("overlay"),
      modal: document.getElementById("how-to-play"),
      closeBtn: document.getElementById("close-htp"),
      viewStoryBtn: document.getElementById("view-story-btn"),
    };

    // Bind methods to preserve 'this' context
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleViewStory = this.handleViewStory.bind(this);
    this.handleCloseHover = this.handleCloseHover.bind(this);
    this.handleViewStoryHover = this.handleViewStoryHover.bind(this);

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

  handleOverlayClick(e) {
    // Only close if clicking the overlay itself, not the modal
    if (e.target === this.elements.overlay) {
      this.close();
    }
  }

  handleClose() {
    audioManager.playSoundEffect("btnClick");
    this.close();
  }

  handleViewStory() {
    audioManager.playSoundEffect("btnClick");
    // Close the How to Play modal first
    this.close();
    // Then open the story panel
    storyPanel.replay();
  }

  handleCloseHover() {
    audioManager.playSoundEffect("btnHover");
  }

  handleViewStoryHover() {
    audioManager.playSoundEffect("btnHover");
  }

  setupEventListeners() {
    // Close button
    this.addTouchAndClickListener(this.elements.closeBtn, this.handleClose);

    // View Story button
    this.addTouchAndClickListener(this.elements.viewStoryBtn, this.handleViewStory);

    // Close on overlay click (only if clicking overlay, not modal content)
    this.addTouchAndClickListener(this.elements.overlay, this.handleOverlayClick);

    // Add hover sound effect to buttons
    this.elements.closeBtn.addEventListener("mouseenter", this.handleCloseHover);
    this.elements.viewStoryBtn.addEventListener("mouseenter", this.handleViewStoryHover);
  }

  open() {
    audioManager.playSoundEffect("btnClick");
    this.elements.overlay.style.display = "block";
    this.elements.modal.style.display = "block";
  }

  close() {
    this.elements.overlay.style.display = "none";
    this.elements.modal.style.display = "none";
  }
}
