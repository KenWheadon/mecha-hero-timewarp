// How to Play Module - manages the tutorial modal with improved UX

import { audioManager } from "./audio-manager.js";

export class HowToPlay {
  constructor() {
    this.elements = {
      overlay: document.getElementById("overlay"),
      modal: document.getElementById("how-to-play"),
      closeBtn: document.getElementById("close-htp"),
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button
    this.elements.closeBtn.addEventListener("click", () => {
      audioManager.playSoundEffect("btnClick");
      this.close();
    });

    // Close on overlay click
    this.elements.overlay.addEventListener("click", () => {
      this.close();
    });

    // Add hover sound effect to close button
    this.elements.closeBtn.addEventListener("mouseenter", () => {
      audioManager.playSoundEffect("btnHover");
    });
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
