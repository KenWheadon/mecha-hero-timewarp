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
    this.onComplete = null; // Callback when animation completes (for non-looping animations)
    this.onCycleComplete = null; // Callback when a full yoyo cycle completes (for pingPong animations)

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
    this.currentElement = null; // Store the element for resume functionality

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
      if (this.imagePath.includes("losing")) {
        console.log("Animation already playing, returning");
      }
      return;
    }
    this.reset(); // Ensure state is clean before playing.

    this.currentElement = element; // Store the element for pause/resume
    this.isPlaying = true;
    if (this.imagePath.includes("losing")) {
      console.log("Starting animation for:", this.imagePath);
      console.log("Element:", element);
    }

    // Apply the initial frame immediately
    this.applyToElement(element);

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
              // Trigger cycle complete callback
              if (this.onCycleComplete) {
                this.onCycleComplete();
              }
            } else {
              this.stop();
              if (this.onComplete) {
                this.onComplete();
              }
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
            if (this.onComplete) {
              this.onComplete();
            }
            return;
          }
        }
      }

      if (element && this.isPlaying) this.applyToElement(element);
    }, this.frameDelay);
  }

  /**
   * Pause the animation
   */
  pause() {
    if (this.isPlaying && this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
      // Keep isPlaying true to indicate it's paused, not stopped
    }
  }

  /**
   * Resume a paused animation
   */
  resume() {
    // Only resume if it was playing and there's no active interval
    if (this.isPlaying && !this.animationInterval && this.currentElement) {
      // Don't call play() as it would reset the animation
      // Instead, just restart the interval from the current frame
      this.animationInterval = setInterval(() => {
        // Safety check: if element no longer exists, stop animation
        if (this.currentElement && !this.currentElement.isConnected) {
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
                // Trigger cycle complete callback
                if (this.onCycleComplete) {
                  this.onCycleComplete();
                }
              } else {
                this.stop();
                if (this.onComplete) {
                  this.onComplete();
                }
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
              if (this.onComplete) {
                this.onComplete();
              }
              return;
            }
          }
        }

        if (this.currentElement && this.isPlaying) this.applyToElement(this.currentElement);
      }, this.frameDelay);
    }
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
    const isLosingSprite = this.imagePath.includes("losing");

    if (!this.isLoaded) {
      if (isLosingSprite) {
        console.log("Sprite not loaded yet");
      }
      return;
    }

    // Find the actual <img> tag inside the provided clipper element.
    const imgElement = element.querySelector("img");
    if (!imgElement) {
      if (isLosingSprite) {
        console.log("No img element found in container");
      }
      // This might run once before the img is appended, which is fine.
      return;
    }

    if (isLosingSprite) {
      console.log("Applying frame", this.currentFrame, "to element");
    }

    const col = this.currentFrame % this.cols;
    const row = Math.floor(this.currentFrame / this.cols);

    // This is the most robust method for sprite animation in the DOM.
    // It avoids background-position/size bugs by using a clipping div
    // and transforming an actual <img> element inside it.

    // 1. Set the size of the <img> tag to the full sprite sheet dimensions.
    const fullWidth = this.cols * (this.frameWidth + this.frameContentWidth + this.gapX);
    const fullHeight = this.rows * (this.frameHeight + this.frameContentHeight + this.gapY);

    imgElement.style.width = `${fullWidth}px`;
    imgElement.style.height = `${fullHeight}px`;

    if (isLosingSprite) {
      console.log("Image dimensions set to:", fullWidth, "x", fullHeight);
      console.log("Frame config:", {
        frameWidth: this.frameWidth,
        frameContentWidth: this.frameContentWidth,
        gapX: this.gapX,
        frameHeight: this.frameHeight,
        frameContentHeight: this.frameContentHeight,
        gapY: this.gapY
      });
    }

    // 2. Calculate the negative offset to show the correct frame.
    // This should be the top-left of the content area for the current frame.
    const cellWidth = this.frameWidth + this.frameContentWidth + this.gapX;
    const cellHeight = this.frameHeight + this.frameContentHeight + this.gapY;
    const imgX = -(col * cellWidth + this.frameWidth); // Negative offset to the content area
    const imgY = -(row * cellHeight + this.frameHeight); // Negative offset to the content area

    if (isLosingSprite) {
      console.log("Transform offset:", imgX, imgY, "for col/row:", col, row);
    }

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
