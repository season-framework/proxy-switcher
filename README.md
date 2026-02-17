# SEASON Proxy Switcher

A Chrome extension for quick and easy web proxy switching.

## Features

- **One-Click Proxy Switching** — Select a proxy from the list via radio buttons
- **No Proxy Mode** — Built-in "No Proxy" option at the top of the list for direct connection
- **Multiple Protocols** — HTTP, HTTPS, SOCKS4, SOCKS5, or Apply All (default)
- **Policy Modes**
  - **Blacklist** — Proxy all traffic, bypass specified domains
  - **Whitelist** — Direct connection by default, proxy only specified domains
- **Auto Restore** — Automatically restores your last proxy setting on browser restart
- **Badge Indicator** — Extension icon shows current proxy mode (BL/WL)

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `season-chrome-extension` folder
6. The extension icon will appear in your toolbar

### From ZIP Package

1. Download `season-proxy-switcher-v1.0.0.zip` from the `dist/` folder
2. Extract the ZIP file to a local directory
3. Open Chrome and navigate to `chrome://extensions`
4. Enable **Developer mode**
5. Click **Load unpacked**
6. Select the extracted folder

## Usage

1. Click the extension icon in the Chrome toolbar
2. Click **+ 프록시 추가** to add a new proxy
3. Fill in the proxy details:
   - **이름** — A friendly name for the proxy
   - **프로토콜** — Select protocol or "일괄 적용" to apply across all protocols
   - **호스트** — Proxy server address
   - **포트** — Proxy server port
   - **프록시 정책 모드** — Choose Blacklist or Whitelist mode
   - **도메인 목록** — Domains to bypass or include (depending on policy mode)
4. Select a proxy from the list using the radio button to activate it
5. Select **프록시 미사용** to disconnect and use direct connection

## Project Structure

```
season-chrome-extension/
├── manifest.json      # Chrome Extension Manifest V3
├── background.js      # Service worker for proxy control
├── popup.html         # Extension popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic
├── icons/             # Extension icons (16/48/128px)
├── dist/              # Distribution packages
└── RELEASES.md        # Release history
```

## Build

To create a distribution ZIP package:

```bash
mkdir -p dist
zip -r dist/season-proxy-switcher-v1.0.0.zip \
  manifest.json background.js popup.html popup.js popup.css icons/ \
  -x "icons/icon.svg" "icons/.DS_Store"
```

## License

This project is licensed under the [MIT License](LICENSE).
