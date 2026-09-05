# ChatGPT Customizer

A small, open-source Chrome extension for personalizing the appearance of [ChatGPT](https://chatgpt.com/). Version 0.1.0 adds a persistent custom background image, entirely in the browser.

## Features

- Custom JPG, PNG, or WEBP background image
- Persistent local storage and instant updates in open ChatGPT tabs
- Subtle readability overlay

More customization features are planned.

## Installation

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose this project directory.
6. Open [chatgpt.com](https://chatgpt.com/) and use the extension toolbar icon to choose an image.

## Development

- `src/content/` contains the script and styles applied only at `https://chatgpt.com/*`.
- `src/popup/` contains the extension popup UI.
- Images are stored as data URLs in `chrome.storage.local` for simple, persistent V1 storage.

Images are limited to 3 MB before encoding to leave room within Chrome's local storage quota. The popup validates type, file size, and image decoding before saving.

## Permissions

- `storage`: saves the chosen image locally and lets open ChatGPT tabs update immediately.
- `https://chatgpt.com/*`: limits the content script to ChatGPT and prevents it from running on unrelated sites.

## Roadmap

- [x] Custom background
- [ ] Full-width chat
- [ ] Font customization
- [ ] Completion notification sound
- [ ] More background controls
- [ ] More fonts
- [ ] Additional customization options

## License

MIT. See [LICENSE](LICENSE).
