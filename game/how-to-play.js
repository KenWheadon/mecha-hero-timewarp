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
    this.elements.closeBtn.addEventListener("click", this.handleClose);

    // View Story button
    this.elements.viewStoryBtn.addEventListener("click", this.handleViewStory);

    // Close on overlay click (only if clicking overlay, not modal content)
    this.elements.overlay.addEventListener("click", this.handleOverlayClick);

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
