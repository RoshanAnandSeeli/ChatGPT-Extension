(() => {
  "use strict";

  const BACKGROUND_KEY = "backgroundImage";
  const ROOT_ID = "chatgpt-customizer-background";

  function getLayer() {
    let layer = document.getElementById(ROOT_ID);
    if (layer) return layer;

    layer = document.createElement("div");
    layer.id = ROOT_ID;
    layer.setAttribute("aria-hidden", "true");
    const image = document.createElement("div");
    image.className = "chatgpt-customizer-background__image";
    const overlay = document.createElement("div");
    overlay.className = "chatgpt-customizer-background__overlay";
    layer.append(image, overlay);
    (document.documentElement || document).appendChild(layer);
    return layer;
  }

  function applyBackground(dataUrl) {
    const existing = document.getElementById(ROOT_ID);
    if (!dataUrl) {
      existing?.remove();
      document.documentElement.classList.remove("chatgpt-customizer--background-active");
      return;
    }

    const layer = getLayer();
    layer.querySelector(".chatgpt-customizer-background__image").style.backgroundImage = `url("${dataUrl}")`;
    document.documentElement.classList.add("chatgpt-customizer--background-active");
  }

  async function loadBackground() {
    try {
      const stored = await chrome.storage.local.get(BACKGROUND_KEY);
      applyBackground(stored[BACKGROUND_KEY]);
    } catch (error) {
      console.warn("ChatGPT Customizer: could not load background.", error);
    }
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[BACKGROUND_KEY]) {
      applyBackground(changes[BACKGROUND_KEY].newValue);
    }
  });

  // The page may replace parts of its DOM during SPA navigation. Re-add only if needed.
  new MutationObserver(() => {
    if (document.documentElement.classList.contains("chatgpt-customizer--background-active") && !document.getElementById(ROOT_ID)) {
      loadBackground();
    }
  }).observe(document.documentElement, { childList: true });

  loadBackground();
})();
