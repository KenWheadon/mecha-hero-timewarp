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
      accordionHeaders: document.querySelectorAll(".htp-accordion-header"),
    };

    // Bind methods to preserve 'this' context
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleViewStory = this.handleViewStory.bind(this);
    this.handleCloseHover = this.handleCloseHover.bind(this);
    this.handleViewStoryHover = this.handleViewStoryHover.bind(this);

    this.setupEventListeners();
    this.setupAccordion();
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

  setupAccordion() {
    this.elements.accordionHeaders.forEach((header) => {
      this.addTouchAndClickListener(header, () => {
        const section = header.parentElement;
        const content = section.querySelector(".htp-accordion-content");
        const icon = header.querySelector(".htp-accordion-icon");
        const isOpen = section.classList.contains("active");

        // Play sound effect
        audioManager.playSoundEffect("accordionOpen");

        // Close all other sections
        this.elements.accordionHeaders.forEach((otherHeader) => {
          if (otherHeader !== header) {
            const otherSection = otherHeader.parentElement;
            const otherContent = otherSection.querySelector(".htp-accordion-content");
            const otherIcon = otherHeader.querySelector(".htp-accordion-icon");

            otherSection.classList.remove("active");
            otherContent.style.maxHeight = null;
            otherIcon.style.transform = "rotate(0deg)";
          }
        });

        // Toggle current section
        if (isOpen) {
          section.classList.remove("active");
          content.style.maxHeight = null;
          icon.style.transform = "rotate(0deg)";
        } else {
          section.classList.add("active");
          content.style.maxHeight = content.scrollHeight + "px";
          icon.style.transform = "rotate(180deg)";
        }
      });

      // Add hover sound effect
      header.addEventListener("mouseenter", () => {
        audioManager.playSoundEffect("btnHover");
      });
    });
  }

  open() {
    audioManager.playSoundEffect("popupAppear");
    this.elements.overlay.style.display = "block";
    this.elements.modal.style.display = "block";
  }

  close() {
    this.elements.overlay.style.display = "none";
    this.elements.modal.style.display = "none";
  }
}
