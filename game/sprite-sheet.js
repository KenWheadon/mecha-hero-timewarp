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
    this.pingPong = config.pingPong || false; // Play forward, backward, forward
    this.direction = 1; // 1 for forward, -1 for backward
    this.cycleCount = 0; // Track how many times we've completed a cycle

    // Handle different config types:
    // 1. If frameContentWidth is defined, we assume a complex sprite with offsets and gaps.
    //    In this case, frameWidth/Height are treated as the top-left offset.
    // 2. Otherwise, we assume a simple sprite where frameWidth/Height is the full size of the content.
    if (config.frameContentWidth !== undefined) {
      this.frameContentWidth = config.frameContentWidth;
      this.frameContentHeight = config.frameContentHeight;
      this.gapX = config.gapX || 0;
      this.gapY = config.gapY || 0;
    } else {
      // Fallback for simple sprites (like the hit animations)
      this.frameContentWidth = this.frameWidth;
      this.frameContentHeight = this.frameHeight;
      this.frameWidth = 0; // No offset
      this.frameHeight = 0; // No offset
      this.gapX = 0;
      this.gapY = 0;
    }

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
    // If it's already playing, do nothing. If it's a non-looping animation that finished, this allows it to be re-triggered.
    if (this.isPlaying) {
      return;
    }
    this.reset(); // Ensure state is clean before playing.

    this.isPlaying = true;

    this.animationInterval = setInterval(() => {
      // Safety check: if element no longer exists, stop animation
      if (element && !element.isConnected) {
        this.stop();
        return;
      }

      if (this.pingPong) {
        // Ping pong mode: forward, backward, forward
        this.currentFrame += this.direction;

        // Check bounds
        if (this.currentFrame >= this.totalFrames - 1) {
          // Reached the end, go backward
          this.direction = -1;
          this.cycleCount++;
        } else if (this.currentFrame <= 0) {
          // Reached the beginning
          if (this.cycleCount < 2) {
            // Not done yet, go forward again
            this.direction = 1;
            this.cycleCount++;
          } else {
            // Completed forward-backward-forward, stop or loop
            if (this.loop) {
              this.cycleCount = 0;
              this.direction = 1;
              this.currentFrame = 0;
            } else {
              this.stop();
              return;
            }
          }
        }
      } else {
        // Standard mode
        this.currentFrame++;

        // Apply style updates for the new frame
        if (this.currentFrame >= this.totalFrames) {
          if (this.loop) {
            this.currentFrame = 0;
          } else {
            this.stop();
            return;
          }
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
    this.direction = 1;
    this.cycleCount = 0;
  }

  /**
   * Get current frame position in sprite sheet
   * @returns {object} { x, y, width, height }
   */
  getCurrentFrameRect() {
    const row = Math.floor(this.currentFrame / this.cols);
    const col = this.currentFrame % this.cols;

    // The total width/height of one cell in the grid
    const cellWidth = this.frameWidth + this.frameContentWidth + this.gapX; // offsetLeft + content + offsetRight
    const cellHeight = this.frameHeight + this.frameContentHeight + this.gapY; // offsetTop + content + offsetBottom

    return {
      x: col * cellWidth + this.frameWidth, // The start of the content for the current frame
      y: row * cellHeight + this.frameHeight, // The start of the content for the current frame
      width: this.frameContentWidth,
      height: this.frameContentHeight,
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
    imgElement.style.width = `${
      this.cols * (this.frameWidth + this.frameContentWidth + this.gapX)
    }px`;
    imgElement.style.height = `${
      this.rows * (this.frameHeight + this.frameContentHeight + this.gapY)
    }px`;

    // 2. Calculate the negative offset to show the correct frame.
    // This should be the top-left of the content area for the current frame.
    const cellWidth = this.frameWidth + this.frameContentWidth + this.gapX;
    const cellHeight = this.frameHeight + this.frameContentHeight + this.gapY;
    const imgX = -(col * cellWidth + this.frameWidth); // Negative offset to the content area
    const imgY = -(row * cellHeight + this.frameHeight); // Negative offset to the content area

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
