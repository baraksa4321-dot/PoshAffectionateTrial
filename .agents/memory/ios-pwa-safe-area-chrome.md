---
name: Installed PWA safe-area chrome
description: iOS home-screen PWAs need the bottom safe-area painted by the fixed app chrome.
---

In an installed iOS PWA, do not rely only on the `display-mode: standalone` media query. The bottom safe-area inset should be handled directly through `env(safe-area-inset-bottom)` on fixed app chrome; otherwise WebKit can leave a visible dead strip below the tab bar.

**Why:** Safari reserves the home-indicator area separately from the scroll content, so a child tab bar alone may not paint the full viewport edge.

**How to apply:** Keep the main content's scroll padding independent, offset bottom-fixed chrome through the safe-area inset, and let the wrapper inherit the active palette surface. For bottom-aligned loading marks, use the same inset so the mark can sit near the physical screen edge without moving centered loading content.