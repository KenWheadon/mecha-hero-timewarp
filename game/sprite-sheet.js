// SpriteSheet Class - Handles sprite sheet animations

export class SpriteSheet {
  constructor(config) {
    this.imagePath = config.imagePath;
    this.frameWidth = config.frameWidth;
    this.frameHeight = config.frameHeight;
    this.rows = config.rows || 6;
    this.cols = config.cols || 6;
    this.fps = config.fps || 12;
    this.loop = config.loop !== undefined ? config.loop : true;
    this.scale = config.scale || 1;
    this.offsetX = config.offsetX || 0;
    this.offsetY = config.offsetY || 0;

    this.totalFrames = this.rows * this.cols;
    this.currentFrame = 0;
    this.isPlaying = false;
    this.animationInterval = null;
    this.frameDelay = 1000 / this.fps;

    // Preload the image
    this.image = new Image();
    this.image.src = this.imagePath;
    this.isLoaded = false;

    this.image.onload = () => {
      this.isLoaded = true;
    };

    this.image.onerror = () => {
      console.error(`Failed to load sprite sheet: ${this.imagePath}`);
    };
  }

  /**
   * Play the animation
   */
  play(element) {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.currentFrame = 0;

    // Initial application of the first frame
    if (element) this.applyToElement(element);

    this.animationInterval = setInterval(() => {
      this.currentFrame++;

      // Apply style updates for the new frame
      if (this.currentFrame >= this.totalFrames) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.stop();
        }
      }

      if (element && this.isPlaying) this.applyToElement(element);
    }, this.frameDelay);
  }

  /**
   * Stop the animation
   */
  stop() {
    this.isPlaying = false;
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  /**
   * Reset to first frame
   */
  reset() {
    this.stop();
    this.currentFrame = 0;
  }

  /**
   * Get current frame position in sprite sheet
   * @returns {object} { x, y, width, height }
   */
  getCurrentFrameRect() {
    const row = Math.floor(this.currentFrame / this.cols);
    const col = this.currentFrame % this.cols;

    return {
      x: col * this.frameWidth,
      y: row * this.frameHeight,
      width: this.frameWidth,
      height: this.frameHeight,
    };
  }

  /**
   * Draw the current frame to a canvas context
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   * @param {number} x - X position to draw
   * @param {number} y - Y position to draw
   * @param {number} width - Width to draw (optional, defaults to frame width)
   * @param {number} height - Height to draw (optional, defaults to frame height)
   */
  drawFrame(ctx, x, y, width, height) {
    if (!this.isLoaded) return;

    const frame = this.getCurrentFrameRect();
    const drawWidth = width || this.frameWidth;
    const drawHeight = height || this.frameHeight;

    ctx.drawImage(
      this.image,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      x,
      y,
      drawWidth,
      drawHeight
    );
  }

  /**
   * Set as background for a DOM element using CSS sprite positioning
   * @param {HTMLElement} element - DOM element to apply sprite to
   */
  applyToElement(element) {
    if (!this.isLoaded) return;

    // Find the actual <img> tag inside the provided clipper element.
    const imgElement = element.querySelector("img");
    if (!imgElement) {
      // This might run once before the img is appended, which is fine.
      return;
    }

    const col = this.currentFrame % this.cols;
    const row = Math.floor(this.currentFrame / this.cols);

    // This is the most robust method for sprite animation in the DOM.
    // It avoids background-position/size bugs by using a clipping div
    // and transforming an actual <img> element inside it.

    // 1. Set the size of the <img> tag to the full sprite sheet dimensions.
    imgElement.style.width = `${this.cols * this.frameWidth}px`;
    imgElement.style.height = `${this.rows * this.frameHeight}px`;

    // 2. Calculate the negative offset to show the correct frame.
    const imgX = -col * this.frameWidth;
    const imgY = -row * this.frameHeight;

    // 3. Apply transform to the <img>.
    imgElement.style.transform = `translate(${imgX}px, ${imgY}px)`;
    imgElement.style.transformOrigin = "top left";
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    this.image = null;
  }
}
