// Sprites Configuration - Store all sprite sheet data

/**
 * Parse sprite filename to extract dimensions
 * Expected format: name-{width}-{height}.png
 * Example: pose2-hit-spritesheet-2112-1548.png
 * @param {string} filename
 * @returns {object} { width, height }
 */
function parseDimensions(filename) {
  const match = filename.match(/-(\d+)-(\d+)\.png$/);
  if (match) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10),
    };
  }
  throw new Error(`Could not parse dimensions from filename: ${filename}`);
}

/**
 * Sprite sheet configurations
 * Each sprite config includes:
 * - imagePath: Path to the sprite sheet image
 * - frameWidth: Width of a single frame
 * - frameHeight: Height of a single frame
 * - rows: Number of rows in the sprite sheet (default: 6)
 * - cols: Number of columns in the sprite sheet (default: 6)
 * - fps: Frames per second for animation (default: 12)
 * - loop: Whether to loop the animation (default: true)
 * - scale: Scale factor for the container (default: 1)
 * - offsetX: Horizontal offset in pixels (default: 0)
 * - offsetY: Vertical offset in pixels (default: 0)
 */
export const SPRITE_CONFIGS = {
  "pose2-hit": {
    imagePath: "images/pose2-hit-spritesheet-2112-1548.png",
    get frameWidth() {
      const dims = parseDimensions(this.imagePath);
      return dims.width / (this.cols || 6);
    },
    get frameHeight() {
      const dims = parseDimensions(this.imagePath);
      return dims.height / (this.rows || 6);
    },
    rows: 6,
    cols: 6,
    fps: 12,
    loop: true,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  },

  // Add more sprite configurations here as needed
  // Example:
  // "pose3-hit": {
  //   imagePath: "images/pose3-hit-spritesheet-1920-1080.png",
  //   get frameWidth() {
  //     const dims = parseDimensions(this.imagePath);
  //     return dims.width / (this.cols || 6);
  //   },
  //   get frameHeight() {
  //     const dims = parseDimensions(this.imagePath);
  //     return dims.height / (this.rows || 6);
  //   },
  //   rows: 6,
  //   cols: 6,
  //   fps: 12,
  //   loop: false,
  // },
};

/**
 * Get sprite configuration by name
 * @param {string} name - Sprite name
 * @returns {object} Sprite configuration
 */
export function getSpriteConfig(name) {
  const config = SPRITE_CONFIGS[name];
  if (!config) {
    throw new Error(`Sprite configuration not found: ${name}`);
  }
  return config;
}

/**
 * Check if a sprite exists
 * @param {string} name - Sprite name
 * @returns {boolean}
 */
export function hasSprite(name) {
  return name in SPRITE_CONFIGS;
}
