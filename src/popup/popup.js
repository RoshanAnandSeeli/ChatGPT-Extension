(() => {
  "use strict";

  const BACKGROUND_KEY = "backgroundImage";
  const MAX_FILE_BYTES = 3 * 1024 * 1024;
  const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  const input = document.getElementById("background-input");
  const removeButton = document.getElementById("remove-background");
  const preview = document.getElementById("preview");
  const previewImage = document.getElementById("preview-image");
  const status = document.getElementById("status");

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("status--error", isError);
  }

  function showPreview(dataUrl) {
    preview.hidden = !dataUrl;
    previewImage.src = dataUrl || "";
    removeButton.disabled = !dataUrl;
  }

  async function restoreState() {
    try {
      const { [BACKGROUND_KEY]: dataUrl } = await chrome.storage.local.get(BACKGROUND_KEY);
      showPreview(dataUrl);
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
      await chrome.storage.local.remove(BACKGROUND_KEY);
      showPreview(null);
      setStatus("Background removed.");
    } catch {
      setStatus("Could not remove the background.", true);
    }
  });

  restoreState();
})();
