(() => {
  "use strict";

  const BACKGROUND_KEY = "backgroundImage";
  const SETTINGS_KEY = "backgroundSettings";
  const MAX_FILE_BYTES = 3 * 1024 * 1024;
  const DEFAULT_SETTINGS = Object.freeze({ brightness: 100, blur: 0, overlay: 18, scale: 100 });
  const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  const input = document.getElementById("background-input");
  const removeButton = document.getElementById("remove-background");
  const preview = document.getElementById("preview");
  const previewImage = document.getElementById("preview-image");
  const status = document.getElementById("status");
  const adjustments = document.getElementById("adjustments");
  const resetAdjustments = document.getElementById("reset-adjustments");
  const controls = ["brightness", "blur", "overlay", "scale"].map((name) => ({ name, input: document.getElementById(name), output: document.getElementById(`${name}-value`) }));
  let currentSettings = { ...DEFAULT_SETTINGS };

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("status--error", isError);
  }

  function renderSettings(settings) {
    currentSettings = { ...DEFAULT_SETTINGS, ...settings };
    controls.forEach(({ name, input, output }) => { input.value = currentSettings[name]; output.value = `${currentSettings[name]}${name === "blur" ? "px" : "%"}`; });
  }

  function showPreview(dataUrl) {
    preview.hidden = !dataUrl;
    adjustments.hidden = !dataUrl;
    previewImage.src = dataUrl || "";
    removeButton.disabled = !dataUrl;
  }

  async function restoreState() {
    try {
      const { [BACKGROUND_KEY]: dataUrl, [SETTINGS_KEY]: settings } = await chrome.storage.local.get([BACKGROUND_KEY, SETTINGS_KEY]);
      showPreview(dataUrl);
      renderSettings(settings);
    } catch {
      setStatus("Could not load the saved background.", true);
    }
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("The image could not be read."));
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  async function verifyImage(dataUrl) {
    const image = new Image();
    image.src = dataUrl;
    await image.decode();
  }

  input.addEventListener("change", async () => {
    const [file] = input.files;
    input.value = "";
    if (!file) return;
    if (!acceptedTypes.has(file.type)) return setStatus("Choose a JPG, PNG, or WEBP image.", true);
    if (file.size > MAX_FILE_BYTES) return setStatus("Choose an image smaller than 3 MB.", true);

    setStatus("Saving background…");
    try {
      const dataUrl = await readFile(file);
      await verifyImage(dataUrl);
      await chrome.storage.local.set({ [BACKGROUND_KEY]: dataUrl });
      showPreview(dataUrl);
      setStatus("Background saved.");
    } catch (error) {
      setStatus(error?.message || "Could not save this image. Try a smaller image.", true);
    }
  });

  removeButton.addEventListener("click", async () => {
    try {
      await chrome.storage.local.remove([BACKGROUND_KEY, SETTINGS_KEY]);
      showPreview(null);
      renderSettings(DEFAULT_SETTINGS);
      setStatus("Background removed.");
    } catch {
      setStatus("Could not remove the background.", true);
    }
  });

  controls.forEach(({ name, input, output }) => {
    input.addEventListener("input", async () => {
      currentSettings[name] = Number(input.value);
      output.value = `${input.value}${name === "blur" ? "px" : "%"}`;
      try { await chrome.storage.local.set({ [SETTINGS_KEY]: currentSettings }); }
      catch { setStatus("Could not save image adjustments.", true); }
    });
  });

  resetAdjustments.addEventListener("click", async () => {
    renderSettings(DEFAULT_SETTINGS);
    try { await chrome.storage.local.set({ [SETTINGS_KEY]: currentSettings }); setStatus("Image adjustments reset."); }
    catch { setStatus("Could not reset image adjustments.", true); }
  });

  restoreState();
})();
