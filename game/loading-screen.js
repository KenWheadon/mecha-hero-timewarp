export class LoadingScreen {
  constructor() {
    this.elements = {
      screen: document.getElementById("loading-screen"),
      progressBar: document.getElementById("loading-progress-bar"),
      progressFill: document.getElementById("loading-progress-fill"),
      progressText: document.getElementById("loading-progress-text"),
      startButton: document.getElementById("loading-start-btn"),
      producerText: document.getElementById("producer-text"),
    };

    this.minimumLoadTime = 3000; // 3 seconds
    this.startTime = null;
    this.isComplete = false;
    this.onStartCallback = null;
    this.onCompleteCallback = null;
  }

  // Helper function to add both click and touch event listeners
  addTouchAndClickListener(element, handler) {
    // Remove any existing listeners to prevent duplicates
    element.onclick = null;
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

  show() {
    this.elements.screen.style.display = "flex";
    this.elements.progressBar.style.display = "block";
    this.elements.progressText.style.display = "block";
    this.elements.startButton.style.display = "none";
    this.startTime = Date.now();
    this.isComplete = false;
    this.updateProgress(0);
  }

  hide() {
    this.elements.screen.style.display = "none";
  }

  updateProgress(percent) {
    const clampedPercent = Math.min(100, Math.max(0, percent));
    this.elements.progressFill.style.width = `${clampedPercent}%`;
    this.elements.progressText.textContent = `${Math.floor(clampedPercent)}%`;
  }

  async complete(onCompleteCallback, onStartCallback) {
    // Store the callbacks
    this.onCompleteCallback = onCompleteCallback;
    this.onStartCallback = onStartCallback; // For when the button is clicked

    // Mark as complete
    this.isComplete = true;

    // Calculate elapsed time
    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, this.minimumLoadTime - elapsed);

    // If we haven't reached minimum time, animate to 100% over remaining time
    if (remaining > 0) {
      await this.animateToComplete(remaining);
    } else {
      // Already past minimum time, just set to 100%
      this.updateProgress(100);
    }

    // Brief pause to show 100%
    await this.delay(300);

    // Transform progress bar into start button
    this.showStartButton(); // This will now use the stored callbacks

    // Execute the onCompleteCallback immediately
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }

  showStartButton() {
    // Hide progress elements
    this.elements.progressBar.style.display = "none";
    this.elements.progressText.style.display = "none";

    // Show producer text with fade-in
    if (this.elements.producerText) {
      this.elements.producerText.classList.add("visible");
    }

    // Show and setup start button
    this.elements.startButton.style.display = "block";
    this.addTouchAndClickListener(this.elements.startButton, () => {
      this.hide();
      if (this.onStartCallback) {
        this.onStartCallback();
      }
    });
  }

  async animateToComplete(duration) {
    const startProgress =
      parseFloat(this.elements.progressFill.style.width) || 0;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const currentProgress =
          startProgress + (100 - startProgress) * progress;

        this.updateProgress(currentProgress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Simulate loading progress (useful for actual asset loading)
  simulateProgress(durationMs = 2000) {
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(95, (elapsed / durationMs) * 95); // Cap at 95%

      this.updateProgress(progress);

      if (progress < 95 && !this.isComplete) {
        requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
  }

  /**
   * Preload specific images and update progress
   * @param {Array<string>} imageUrls - Array of image URLs to preload
   * @returns {Promise} - Resolves when all images are loaded
   */
  async preloadImages(imageUrls) {
    if (!imageUrls || imageUrls.length === 0) {
      this.updateProgress(100);
      return Promise.resolve();
    }

    let loadedCount = 0;
    const totalImages = imageUrls.length;

    const loadPromises = imageUrls.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
          loadedCount++;
          const progress = (loadedCount / totalImages) * 95; // Cap at 95%
          this.updateProgress(progress);
          resolve();
        };

        img.onerror = () => {
          console.error(`Failed to load image: ${url}`);
          loadedCount++;
          const progress = (loadedCount / totalImages) * 95;
          this.updateProgress(progress);
          resolve(); // Resolve anyway to not block loading
        };

        img.src = url;
      });
    });

    return Promise.all(loadPromises);
  }
}

// Export singleton instance
export const loadingScreen = new LoadingScreen();
