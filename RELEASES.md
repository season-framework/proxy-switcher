# RELEASES

## v1.1.0 (2026-02-18)

### Internationalization, Theme & View System

#### New Features
- **Multi-language Support** — Added 4 languages: English, Korean (한국어), Japanese (日本語), Chinese (中文)
- **Dark Mode** — Light / Dark / System theme switcher
- **Settings Panel** — Gear icon in header opens language and theme preferences
- **Exclusive View Switching** — List, form, and settings views now switch exclusively (`switchView()`)
- Auto-detect browser language on first launch
- System theme option follows OS-level dark mode preference

#### Improvements
- CIDR/IP address support in whitelist PAC scripts (e.g. `192.168.0.0/24`, `10.0.0.0/8`)
- All UI text dynamically rendered via i18n translation keys
- CSS custom properties for consistent theming across light/dark modes
- Logo inverts automatically in dark mode
- Settings panel includes back button for navigation

---

## v1.0.1 (2026-02-18)

### Proxy Authentication Support

#### New Features
- **Proxy Authentication** — Added username/password fields for proxy servers that require authentication
- Auto-respond to proxy auth challenges via `onAuthRequired` listener
- Auth indicator (🔑) shown in proxy list for proxies with credentials

#### Fixes
- Fixed `webRequestAuthProvider` permission for Manifest V3 compatibility
- Changed `onAuthRequired` from `blocking` to `asyncBlocking` mode (MV3 requirement)

---

## v1.0.0 (2026-02-17)

### Initial Release

#### Core Features
- **Proxy Switching** — One-click proxy switching via radio button selection from the proxy list
- **No Proxy Mode** — Fixed "No Proxy" item at the top of the list for direct connection
- **Proxy CRUD** — Add, edit, and delete proxy configurations

#### Protocol Support
- Individual protocol selection: HTTP, HTTPS, SOCKS4, SOCKS5
- **Apply All** option (default) — Apply the same proxy across all protocols at once

#### Proxy Policy Modes
- **Blacklist** — Proxy all traffic by default, bypass only specified domains
- **Whitelist** — Direct connection by default, proxy only specified domains (PAC script-based)

#### UI/UX
- Radio button-based proxy selection interface
- Inline badges next to proxy name (policy mode: BL/WL, protocol: HTTP/ALL, etc.)
- Active proxy status indicator in header (status dot + text)
- Extension icon badge showing current mode (BL/WL)

#### System
- Built on Chrome Manifest V3
- Auto-restore last proxy settings on browser restart
- Proxy error logging
- Distribution zip packaging
