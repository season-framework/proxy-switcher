# SEASON Proxy Switcher

A Chrome extension for quick and easy web proxy switching with multi-language and dark mode support.

## Features

- **One-Click Proxy Switching** — Select a proxy from the list via radio buttons
- **No Proxy Mode** — Built-in "No Proxy" option at the top of the list for direct connection
- **Multiple Protocols** — HTTP, HTTPS, SOCKS4, SOCKS5, or Apply All (default)
- **Policy Modes**
  - **Blacklist** — Proxy all traffic, bypass specified domains
  - **Whitelist** — Direct connection by default, proxy only specified domains (supports CIDR notation)
- **Proxy Authentication** — Optional username/password for proxies requiring authentication
- **Multi-language** — English, Korean, Japanese, Chinese (auto-detects browser language)
- **Dark Mode** — Light / Dark / System theme options
- **Exclusive View Switching** — Clean single-view UI (list, form, settings switch exclusively)
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

## Usage

1. Click the extension icon in the Chrome toolbar
2. Click **+ Add Proxy** to add a new proxy
3. Fill in the proxy details:
   - **Name** — A friendly name for the proxy
   - **Protocol** — Select protocol or "Apply All" for all protocols
   - **Host** — Proxy server address
   - **Port** — Proxy server port
   - **Authentication** — Username and password (optional)
   - **Policy Mode** — Choose Blacklist or Whitelist mode
   - **Domain List** — Domains to bypass or include (supports CIDR: `192.168.0.0/24`)
4. Select a proxy from the list using the radio button to activate it
5. Select **No Proxy** to disconnect and use direct connection
6. Click the ⚙️ gear icon to change language or theme

## Project Structure

```
season-chrome-extension/
├── manifest.json       # Chrome Extension Manifest V3
├── background.js       # Service worker — proxy control, auth, badge
├── popup.html          # Popup UI entry point
├── popup.css           # Popup styles (CSS custom properties for theming)
├── popup.js            # Popup logic — view switching, CRUD, proxy activation
├── locales.js          # i18n translations (en, ko, ja, zh)
├── icons/              # Extension icons (logo.svg, 16/48/128px PNG)
├── RELEASES.md         # Version history
├── README.md           # Project documentation
└── LICENSE             # MIT License
```

## Build

To create a distribution ZIP package:

```bash
zip -r season-proxy-switcher-v1.1.0.zip \
  manifest.json background.js popup.html popup.js popup.css locales.js icons/ \
  -x "icons/icon.svg" "icons/.DS_Store"
```

## License

This project is licensed under the [MIT License](LICENSE).
