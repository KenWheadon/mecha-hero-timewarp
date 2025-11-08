export class LoadingScreen {
  constructor() {
    this.elements = {
      screen: document.getElementById("loading-screen"),
      progressBar: document.getElementById("loading-progress-bar"),
      progressFill: document.getElementById("loading-progress-fill"),
      progressText: document.getElementById("loading-progress-text"),
      startButton: document.getElementById("loading-start-btn"),
    };

    this.minimumLoadTime = 3000; // 3 seconds
    this.startTime = null;
    this.isComplete = false;
    this.onStartCallback = null;
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

  async complete(onStartCallback) {
    // Store the callback
    this.onStartCallback = onStartCallback;

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
    this.showStartButton();
  }

  showStartButton() {
    // Hide progress elements
    this.elements.progressBar.style.display = "none";
    this.elements.progressText.style.display = "none";

    // Show and setup start button
    this.elements.startButton.style.display = "block";
    this.elements.startButton.onclick = () => {
      this.hide();
      if (this.onStartCallback) {
        this.onStartCallback();
      }
    };
  }

  async animateToComplete(duration) {
    const startProgress =
      parseFloat(this.elements.progressFill.style.width) || 0;
    const startTime = Date.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const currentProgress = startProgress + (100 - startProgress) * progress;

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
}

// Export singleton instance
export const loadingScreen = new LoadingScreen();
