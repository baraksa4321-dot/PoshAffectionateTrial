---
name: Installed PWA safe-area chrome
description: iOS home-screen PWAs need the bottom safe-area painted by the fixed app chrome.
---

In an installed iOS PWA, the bottom safe-area inset should belong to the fixed navigation parent and use the active surface color; leaving it to the page background creates a visible empty strip below the tab bar.

**Why:** Safari reserves the home-indicator area separately from the scroll content, so a child tab bar alone may not paint the full viewport edge.

**How to apply:** Keep the main content's scroll padding independent, put `env(safe-area-inset-bottom)` on the fixed navigation wrapper in standalone/fullscreen mode, and let the wrapper inherit the active palette surface.