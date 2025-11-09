// Visibility Manager - Pauses animations when elements are not visible
// This optimizes performance by stopping unnecessary animations

export class VisibilityManager {
  constructor() {
    this.observers = new Map(); // Store IntersectionObservers
    this.cssAnimationElements = new Map(); // Store elements with CSS animations
  }

  /**
   * Monitor a sprite animation and pause/resume based on visibility
   * @param {HTMLElement} element - The DOM element containing the sprite
   * @param {SpriteSheet} spriteSheet - The sprite sheet instance
   */
  monitorSpriteAnimation(element, spriteSheet) {
    if (!element || !spriteSheet) return;

    // Create an IntersectionObserver for this element
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is visible, resume animation
            if (spriteSheet.isPlaying && !spriteSheet.animationInterval) {
              spriteSheet.play(element);
            }
          } else {
            // Element is not visible, pause animation
            if (spriteSheet.isPlaying && spriteSheet.animationInterval) {
              clearInterval(spriteSheet.animationInterval);
              spriteSheet.animationInterval = null;
            }
          }
        });
      },
      {
        // Trigger when any part of the element is visible
        threshold: 0,
      }
    );

    observer.observe(element);

    // Store the observer so we can disconnect it later
    const key = `sprite_${Date.now()}_${Math.random()}`;
    this.observers.set(key, { observer, element, spriteSheet });

    return key;
  }

  /**
   * Monitor a CSS animated element and pause/resume based on visibility
   * @param {HTMLElement} element - The DOM element with CSS animation
   * @param {string} animationName - Optional: the animation-name to pause (otherwise pauses all)
   */
  monitorCSSAnimation(element, animationName = null) {
    if (!element) return;

    // Store the original animation value
    const originalAnimation = window.getComputedStyle(element).animation;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is visible, resume animation
            element.style.animationPlayState = "running";
          } else {
            // Element is not visible, pause animation
            element.style.animationPlayState = "paused";
          }
        });
      },
      {
        threshold: 0,
      }
    );

    observer.observe(element);

    const key = `css_${Date.now()}_${Math.random()}`;
    this.observers.set(key, { observer, element, originalAnimation });
    this.cssAnimationElements.set(element, originalAnimation);

    return key;
  }

  /**
   * Stop monitoring an element
   * @param {string} key - The key returned by monitor methods
   */
  stopMonitoring(key) {
    const entry = this.observers.get(key);
    if (entry) {
      entry.observer.disconnect();
      this.observers.delete(key);

      // Restore CSS animation if it was stored
      if (entry.originalAnimation && entry.element) {
        this.cssAnimationElements.delete(entry.element);
      }
    }
  }

  /**
   * Stop monitoring all elements
   */
  stopAll() {
    this.observers.forEach((entry) => {
      entry.observer.disconnect();

      // Restore CSS animations
      if (entry.originalAnimation && entry.element) {
        this.cssAnimationElements.delete(entry.element);
      }
    });

    this.observers.clear();
    this.cssAnimationElements.clear();
  }

  /**
   * Check if an element is currently visible
   * @param {HTMLElement} element - The element to check
   * @returns {boolean} - True if visible
   */
  isElementVisible(element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;

    // Check if element is in viewport
    const inViewport =
      rect.top < windowHeight &&
      rect.bottom > 0 &&
      rect.left < windowWidth &&
      rect.right > 0;

    // Check if element or its parents are hidden
    const style = window.getComputedStyle(element);
    const isHidden = style.display === "none" || style.visibility === "hidden";

    return inViewport && !isHidden;
  }
}

// Export singleton instance
export const visibilityManager = new VisibilityManager();
