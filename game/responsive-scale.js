// Responsive scaling system to ensure the game always fits on screen
export function initResponsiveScaling() {
  let updateTimeout;

  function updateScale() {
    const titleScreen = document.getElementById("title-screen");
    const gameScreen = document.getElementById("game");
    const victoryScreen = document.getElementById("victory-screen");
    const defeatScreen = document.getElementById("defeat-screen");

    // Get the viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine which screen is visible
    let visibleScreen = null;

    // Check for game over screens first (they're overlays)
    if (victoryScreen && victoryScreen.style.display === "flex") {
      visibleScreen = victoryScreen.querySelector(".game-over-container");
    } else if (defeatScreen && defeatScreen.style.display === "flex") {
      visibleScreen = defeatScreen.querySelector(".game-over-container");
    } else if (titleScreen && titleScreen.style.display !== "none") {
      visibleScreen = titleScreen;
    } else if (gameScreen && gameScreen.style.display !== "none") {
      visibleScreen = gameScreen;
    }

    if (!visibleScreen) return;

    // Reset scale temporarily to measure natural size
    visibleScreen.style.transform = "scale(1)";

    // For game over containers, we need to wait a tick for the browser to calculate size
    requestAnimationFrame(() => {
      // Get the actual content dimensions
      const contentWidth = visibleScreen.scrollWidth;
      const contentHeight = visibleScreen.scrollHeight;

      // Calculate scale factors for both width and height
      // Leave some margin (0.95) to prevent touching edges
      const scaleX = (viewportWidth * 0.95) / contentWidth;
      const scaleY = (viewportHeight * 0.95) / contentHeight;

      // Use the smaller scale to ensure everything fits, cap at 1 to prevent upscaling
      const scale = Math.min(scaleX, scaleY, 1);

      // Apply the scale transform
      visibleScreen.style.transform = `scale(${scale})`;
    });
  }

  // Debounced update to avoid too many calls
  function scheduleUpdate() {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    updateTimeout = setTimeout(updateScale, 50);
  }

  // Update scale on load and resize
  updateScale();
  window.addEventListener("resize", scheduleUpdate);

  // Also update when orientation changes (mobile)
  window.addEventListener("orientationchange", () => {
    setTimeout(updateScale, 100);
  });

  // Watch for screen changes (title -> game transition, game over screens)
  const observer = new MutationObserver(() => {
    scheduleUpdate();
  });

  const titleScreen = document.getElementById("title-screen");
  const gameScreen = document.getElementById("game");
  const victoryScreen = document.getElementById("victory-screen");
  const defeatScreen = document.getElementById("defeat-screen");

  // Observe all screens for display changes
  [titleScreen, gameScreen, victoryScreen, defeatScreen].forEach(screen => {
    if (screen) {
      observer.observe(screen, {
        attributes: true,
        attributeFilter: ["style"],
        childList: true,
        subtree: true
      });
    }
  });

  // Also watch the title element for logo animation changes
  const titleElement = document.getElementById("title");
  if (titleElement) {
    observer.observe(titleElement, {
      childList: true,
      subtree: true
    });
  }
}
