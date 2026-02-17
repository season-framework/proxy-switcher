# Privacy Policy — SEASON Proxy Switcher

**Last updated:** February 18, 2026

## Overview

SEASON Proxy Switcher is a Chrome extension that allows users to configure and switch between web proxy settings. This privacy policy explains how the extension handles user data.

## Data Collection

**SEASON Proxy Switcher does not collect, transmit, or share any personal data.**

No data is sent to external servers. No analytics, tracking, or telemetry services are used.

## Data Storage

All user data is stored **locally on the user's device** using Chrome's `chrome.storage.local` API. This includes:

- Proxy configurations (name, host, port, protocol, policy mode, domain lists)
- Active proxy selection
- Language preference
- Theme preference

This data never leaves the user's device.

## Authentication Credentials

Proxy server usernames and passwords entered by the user are stored locally on the device. These credentials are used **only** to authenticate with the user's configured proxy servers via Chrome's built-in `webRequest.onAuthRequired` API. Credentials are never transmitted to any third party.

## Network Requests

This extension does not make any network requests of its own. It only:

- Configures Chrome's built-in proxy settings via the `chrome.proxy` API
- Responds to proxy authentication challenges from the user's configured proxy servers

## Permissions

| Permission | Purpose |
|---|---|
| `proxy` | Configure Chrome's proxy settings (core functionality) |
| `storage` | Save proxy configurations and user preferences locally |
| `tabs` | Apply proxy settings to active browser tabs |
| `webRequest` | Intercept proxy authentication challenges (HTTP 407) |
| `webRequestAuthProvider` | Handle proxy auth in Manifest V3 asyncBlocking mode |
| `<all_urls>` (host) | Allow proxy auth listener to work on all URLs |

## Third-Party Sharing

- We do **not** sell user data to third parties.
- We do **not** use or transfer user data for purposes unrelated to the extension's core functionality.
- We do **not** use or transfer user data to determine creditworthiness or for lending purposes.

## Changes to This Policy

If this privacy policy is updated, the changes will be reflected in this document with an updated date.

## Contact

For questions regarding this privacy policy, please visit:
https://github.com/season-framework/proxy-switcher
