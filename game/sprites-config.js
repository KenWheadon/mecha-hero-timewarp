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
 * Factory function to create a standard sprite configuration.
 * This reduces boilerplate for sprites that share common properties.
 * @param {string} imagePath - Path to the sprite sheet.
 * @param {object} overrides - Optional properties to override defaults.
 * @returns {object} A full sprite configuration object.
 */
function createHitSpriteConfig(imagePath, overrides = {}) {
  const defaults = {
    rows: 6,
    cols: 6,
    fps: 12,
    loop: true,
    scale: 1.5,
    offsetX: 0,
    offsetY: 0,
  };

  const config = { ...defaults, imagePath, ...overrides };

  return {
    ...config,
    get frameWidth() {
      const dims = parseDimensions(this.imagePath);
      return dims.width / this.cols;
    },
    get frameHeight() {
      const dims = parseDimensions(this.imagePath);
      return dims.height / this.rows;
    },
  };
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
  "pose2-hit": createHitSpriteConfig(
    "images/pose2-hit-spritesheet-2112-1548.png"
  ),
  "pose3-hit": createHitSpriteConfig(
    "images/pose3-hit-spritesheet-2406-1962.png"
  ),
  "pose4-hit": createHitSpriteConfig(
    "images/pose4-hit-spritesheet-1902-1818.png"
  ),
  "pose5-hit": createHitSpriteConfig(
    "images/pose5-hit-spritesheet-2316-2454.png"
  ),
  // Time warp animation
  "pose8-timewarp": createHitSpriteConfig(
    "images/pose8-spritesheet-2076-2814.png",
    {
      scale: 2.0, // Larger scale for dramatic effect
      fps: 24, // Slightly faster animation
      loop: true,
      pingPong: true, // Play forward, backward, forward
    }
  ),
  // Use a direct configuration for the logo to handle custom offsets and gaps correctly.
  "logo-thin": {
    imagePath: "images/logo-thin-spritesheet-3072-3072.png",
    rows: 6,
    cols: 6,
    fps: 12,
    loop: true,
    scale: 1.5,
    offsetX: 0,
    offsetY: 0,
    frameContentWidth: 279, // The actual width of the graphic in the frame
    frameContentHeight: 277, // The actual height of the graphic in the frame
    frameWidth: 117, // This is the X offset from the test page
    frameHeight: 118, // This is the Y offset from the test page
    gapX: 116, // Horizontal gap between frames
    gapY: 117, // Vertical gap between frames
  },
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
