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
  play() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.currentFrame = 0;

    this.animationInterval = setInterval(() => {
      this.currentFrame++;

      if (this.currentFrame >= this.totalFrames) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.stop();
        }
      }
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
      frame.x, frame.y, frame.width, frame.height,
      x, y, drawWidth, drawHeight
    );
  }

  /**
   * Set as background for a DOM element using CSS sprite positioning
   * @param {HTMLElement} element - DOM element to apply sprite to
   */
  applyToElement(element) {
    if (!this.isLoaded) return;

    // Set aspect ratio to match frame dimensions for uniform scaling without distortion
    element.style.aspectRatio = `${this.frameWidth} / ${this.frameHeight}`;

    // Apply scale and position transforms to the container
    // This scales the entire container (not the background) to make sprite appear larger
    element.style.transform = `scale(${this.scale}) translate(${this.offsetX}px, ${this.offsetY}px)`;
    element.style.transformOrigin = 'center center';

    // Calculate which row/col we're showing
    const col = this.currentFrame % this.cols;
    const row = Math.floor(this.currentFrame / this.cols);

    // Use percentage-based sizing so the spritesheet scales with container
    // The entire sheet is cols*100% wide and rows*100% tall
    const bgSizeWidth = this.cols * 100;
    const bgSizeHeight = this.rows * 100;

    // Position formula: move to show the correct frame
    // Use percentage positioning: (col/(cols-1))*100 for proper alignment
    let bgPosX = 0;
    let bgPosY = 0;

    if (this.cols > 1) {
      bgPosX = (col / (this.cols - 1)) * 100;
    }

    if (this.rows > 1) {
      bgPosY = (row / (this.rows - 1)) * 100;
    }

    element.style.backgroundImage = `url('${this.imagePath}')`;
    element.style.backgroundSize = `${bgSizeWidth}% ${bgSizeHeight}%`;
    element.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
    element.style.backgroundRepeat = 'no-repeat';
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    this.image = null;
  }
}
