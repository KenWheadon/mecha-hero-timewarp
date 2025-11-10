// Responsive scaling system to ensure the game always fits on screen
export function initResponsiveScaling() {
  let updateTimeout;
  let titleLogoHeight = 200; // Estimated height after logo animation

  function updateScale() {
    const titleScreen = document.getElementById("title-screen");
    const gameScreen = document.getElementById("game");
    const victoryScreen = document.getElementById("victory-screen");
    const defeatScreen = document.getElementById("defeat-screen");
    const htpModal = document.getElementById("how-to-play");
    const trophyModal = document.getElementById("trophy-popup");
    const trophyDetailModal = document.getElementById("trophy-detail-popup");
    const storyPanel = document.getElementById("story-panel");
    const onboardingPopup = document.getElementById("onboarding-popup");
    const pauseOverlay = document.getElementById("pause-overlay");
    const pausePopup = document.getElementById("pause-popup");

    // Get the viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Target aspect ratio for the game (16:9 landscape optimal for this game)
    const targetAspectRatio = 16 / 9;

    // Determine which screen/modal is visible
    let visibleScreen = null;
    let isModal = false;
    let isStoryPanel = false;
    let isPausePopup = false;

    // Check for modals first (in order of z-index priority)
    if (storyPanel && storyPanel.style.display === "block") {
      visibleScreen = storyPanel;
      isStoryPanel = true;
    } else if (pauseOverlay && pauseOverlay.classList.contains("show")) {
      visibleScreen = pausePopup;
      isPausePopup = true;
      isModal = true;
    } else if (trophyDetailModal && trophyDetailModal.style.display === "block") {
      visibleScreen = trophyDetailModal;
      isModal = true;
    } else if (onboardingPopup && onboardingPopup.style.display === "block") {
      visibleScreen = onboardingPopup;
      isModal = true;
    } else if (htpModal && htpModal.style.display === "block") {
      visibleScreen = htpModal;
      isModal = true;
    } else if (trophyModal && trophyModal.style.display === "block") {
      visibleScreen = trophyModal;
      isModal = true;
    } else if (victoryScreen && victoryScreen.style.display === "flex") {
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
    const currentTransform = visibleScreen.style.transform;
    if (isModal && !isPausePopup) {
      // Modals with translate(-50%, -50%) positioning
      visibleScreen.style.transform = "translate(-50%, -50%) scale(1)";
    } else {
      // Regular elements or pause popup (centered by flex)
      visibleScreen.style.transform = "scale(1)";
    }

    // Use requestAnimationFrame for smooth measurement
    requestAnimationFrame(() => {
      // Get the actual content dimensions
      let contentWidth = visibleScreen.scrollWidth;
      let contentHeight = visibleScreen.scrollHeight;

      // Special handling for title screen - adjust for logo animation height
      if (visibleScreen === titleScreen) {
        const titleElement = document.getElementById("title");
        const hasLogo = titleElement && titleElement.querySelector('img');

        if (!hasLogo) {
          // Pre-calculate assuming logo will appear (prevents shift)
          const currentTitleHeight = titleElement ? titleElement.offsetHeight : 0;
          const heightDiff = Math.max(0, titleLogoHeight - currentTitleHeight);
          contentHeight += heightDiff;
        } else {
          // Logo is present, cache its height for future calculations
          titleLogoHeight = titleElement.offsetHeight;
        }
      }

      // Calculate scale factors for both width and height
      // For modals, use more aggressive scaling (98% of viewport) to fill space better
      // For game screens, use 95% to leave some breathing room
      const margin = (isModal || isStoryPanel) ? 0.98 : 0.95;

      // Calculate viewport aspect ratio
      const viewportAspectRatio = viewportWidth / viewportHeight;
      const contentAspectRatio = contentWidth / contentHeight;

      let scaleX = (viewportWidth * margin) / contentWidth;
      let scaleY = (viewportHeight * margin) / contentHeight;

      // For main game screens (not modals), maintain aspect ratio more strictly
      // This ensures the game scales uniformly and maintains proper proportions
      if (!isModal && !isStoryPanel) {
        // If viewport is wider than content, scale based on height
        // If viewport is taller than content, scale based on width
        if (viewportAspectRatio > contentAspectRatio) {
          // Viewport is wider - use height as constraint
          scaleX = scaleY = (viewportHeight * margin) / contentHeight;
        } else {
          // Viewport is taller - use width as constraint
          scaleX = scaleY = (viewportWidth * margin) / contentWidth;
        }
      }

      // Use the smaller scale to ensure everything fits, cap at 1 to prevent upscaling
      const scale = Math.min(scaleX, scaleY, 1);

      // Apply the scale transform
      // For modals with translate, preserve that transform
      // Pause popup is centered by flex, so it doesn't need translate
      if ((isModal || isStoryPanel) && !isPausePopup) {
        visibleScreen.style.transform = `translate(-50%, -50%) scale(${scale})`;
      } else {
        visibleScreen.style.transform = `scale(${scale})`;
      }
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
  const htpModal = document.getElementById("how-to-play");
  const trophyModal = document.getElementById("trophy-popup");
  const trophyDetailModal = document.getElementById("trophy-detail-popup");
  const storyPanel = document.getElementById("story-panel");
  const onboardingPopup = document.getElementById("onboarding-popup");
  const pauseOverlay = document.getElementById("pause-overlay");

  // Observe all screens for display changes
  [titleScreen, gameScreen, victoryScreen, defeatScreen, htpModal, trophyModal, trophyDetailModal, storyPanel, onboardingPopup, pauseOverlay].forEach(screen => {
    if (screen) {
      observer.observe(screen, {
        attributes: true,
        attributeFilter: ["style", "class"],
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
