export class CreditsPopup {
  constructor() {
    this.popup = document.getElementById("credits-popup");
    this.closeButton = document.getElementById("close-credits");
    this.logoContainer = null;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button handler
    this.closeButton.addEventListener("click", () => this.close());

    // Close on overlay click (clicking outside the popup)
    this.popup.addEventListener("click", (e) => {
      if (e.target === this.popup) {
        this.close();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.popup.style.display === "block") {
        this.close();
      }
    });
  }

  attachToLogo(logoContainer) {
    this.logoContainer = logoContainer;

    // Add click handler to the logo container
    if (this.logoContainer) {
      this.logoContainer.style.cursor = "pointer";

      // Add both click and touch events
      this.logoContainer.addEventListener("click", () => this.open());
      this.logoContainer.addEventListener("touchend", (e) => {
        e.preventDefault();
        this.open();
      });
    }
  }

  open() {
    this.popup.style.display = "block";
    // Add animation
    setTimeout(() => {
      this.popup.style.opacity = "1";
    }, 10);
  }

  close() {
    this.popup.style.opacity = "0";
    setTimeout(() => {
      this.popup.style.display = "none";
    }, 200);
  }
}

// Export singleton instance
export const creditsPopup = new CreditsPopup();
