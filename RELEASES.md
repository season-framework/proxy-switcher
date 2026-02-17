# RELEASES

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
