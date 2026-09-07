(() => {
  "use strict";

  const BACKGROUND_KEY = "backgroundImage";
  const SETTINGS_KEY = "backgroundSettings";
  const ROOT_ID = "chatgpt-customizer-background";
  const DEFAULT_SETTINGS = Object.freeze({ brightness: 100, blur: 0, overlay: 18, scale: 100 });

  function settingsWithDefaults(settings = {}) { return { ...DEFAULT_SETTINGS, ...settings }; }

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

  function applyBackground(dataUrl, settings) {
    const existing = document.getElementById(ROOT_ID);
    if (!dataUrl) {
      existing?.remove();
      document.documentElement.classList.remove("chatgpt-customizer--background-active");
      return;
    }

    const layer = getLayer();
    const image = layer.querySelector(".chatgpt-customizer-background__image");
    const overlay = layer.querySelector(".chatgpt-customizer-background__overlay");
    const activeSettings = settingsWithDefaults(settings);
    image.style.backgroundImage = `url("${dataUrl}")`;
    image.style.filter = `brightness(${activeSettings.brightness}%) blur(${activeSettings.blur}px)`;
    image.style.transform = `scale(${activeSettings.scale / 100})`;
    overlay.style.backgroundColor = `rgb(0 0 0 / ${activeSettings.overlay}%)`;
    document.documentElement.classList.add("chatgpt-customizer--background-active");
  }

  async function loadBackground() {
    try {
      const stored = await chrome.storage.local.get([BACKGROUND_KEY, SETTINGS_KEY]);
      applyBackground(stored[BACKGROUND_KEY], stored[SETTINGS_KEY]);
    } catch (error) {
      console.warn("ChatGPT Customizer: could not load background.", error);
    }
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && (changes[BACKGROUND_KEY] || changes[SETTINGS_KEY])) {
      chrome.storage.local.get([BACKGROUND_KEY, SETTINGS_KEY]).then((stored) => {
        applyBackground(stored[BACKGROUND_KEY], stored[SETTINGS_KEY]);
      });
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
