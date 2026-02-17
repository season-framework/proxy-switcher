# Copilot Instructions — SEASON Proxy Switcher

## Project Overview

SEASON Proxy Switcher is a Chrome Extension (Manifest V3) that allows users to quickly switch between web proxy configurations. It is built with pure JavaScript, HTML, and CSS — no build tools or frameworks.

## Tech Stack

- **Platform**: Chrome Extension (Manifest V3)
- **Languages**: JavaScript (ES2020+), HTML5, CSS3
- **APIs**: `chrome.proxy`, `chrome.storage.local`, `chrome.webRequest`, `chrome.action`
- **No build tools**: Source files are loaded directly by Chrome

## Project Structure

```
season-chrome-extension/
├── manifest.json       # Extension manifest (MV3)
├── background.js       # Service worker — proxy control, auth, badge
├── popup.html          # Popup UI entry point
├── popup.css           # All popup styles (CSS custom properties for theming)
├── popup.js            # Popup logic — view switching, CRUD, proxy activation
├── locales.js          # i18n translations (en, ko, ja, zh)
├── icons/              # Extension icons (logo.svg, icon16/48/128.png)
├── RELEASES.md         # Version history (newest first)
├── README.md           # Project documentation
└── LICENSE             # MIT License
```

## Architecture

### View System (popup.js)
- Single-page popup with exclusive view switching via `switchView('list' | 'form' | 'settings')`
- Views: **proxy list** (default), **add/edit form**, **settings panel**
- Only one view is visible at a time

### Proxy Engine (background.js)
- `setProxy()` — Configures chrome.proxy with fixed_servers or PAC script (whitelist mode)
- `clearProxy()` — Resets to direct connection
- `restoreProxy()` — Restores last active proxy on startup/install
- Auth listener via `onAuthRequired` with `asyncBlocking` (MV3 pattern)
- `cidrToMask()` — Converts CIDR prefix to subnet mask for PAC `isInNet()`

### i18n (locales.js)
- `LOCALES` object with language keys: `en`, `ko`, `ja`, `zh`
- `t(key)` function returns translated string, falls back to English
- `setLang(lang)` switches the active language
- All UI text must use `t('key')` — never hardcode display strings

### Theming (popup.css)
- CSS custom properties defined in `:root` (light) and `[data-theme="dark"]`
- Theme applied via `document.documentElement.setAttribute('data-theme', ...)`
- Three modes: `light`, `dark`, `system` (follows OS preference)

## Coding Conventions

- Use `const` / `let` (never `var`)
- Use `async/await` for Chrome API calls
- Use `chrome.storage.local` for persistence
- All user-facing strings must go through `t('key')` in locales.js
- CSS colors must use `var(--property-name)` — no hardcoded color values in new code
- Keep functions small and focused; use section comment headers (`// ── Section ──`)

## Development History Rules

When making changes to this project, the following rules must be followed:

### RELEASES.md
- **Every version change** must be documented in `RELEASES.md`
- Entries are ordered **newest first**
- Each version entry must include:
  - Version number and date: `## v{X.Y.Z} (YYYY-MM-DD)`
  - A descriptive section title: `### {Feature/Change Summary}`
  - Categorized sub-sections: `#### New Features`, `#### Improvements`, `#### Fixes`, `#### Breaking Changes` (as applicable)
  - Each item as a bullet with bold label and description
- Use semantic versioning:
  - **Major** (X): Breaking changes or major rewrites
  - **Minor** (Y): New features, new UI sections, new language support
  - **Patch** (Z): Bug fixes, small improvements, text changes

### README.md
- Must reflect the **current** feature set at all times
- Update the Features section when adding/removing capabilities
- Update the Project Structure section when adding/removing files
- Update the Build section when the version changes
- Keep Usage instructions in sync with actual UI labels (use English as reference)

### manifest.json
- `version` field must match the latest version in RELEASES.md
- Update `description` if the extension's scope significantly changes

### Git Commits
- Use conventional commit format: `type: description`
  - Types: `feat`, `fix`, `refactor`, `docs`, `style`, `chore`
- Include a body with bullet points for multi-change commits
- Commit related changes together (e.g., feature code + RELEASES + README)

## Important Notes

- This is a **Manifest V3** extension — no `blocking` webRequest, use `asyncBlocking` with `webRequestAuthProvider`
- PAC scripts are used for whitelist mode — they run in a sandboxed context with limited functions (`dnsDomainIs`, `isInNet`, `dnsResolve`)
- The `locales.js` file is loaded as a separate `<script>` before `popup.js` — its functions (`t`, `setLang`) and `currentLang` are global
- Never use `eval()` or inline scripts — Chrome Extension CSP forbids them
