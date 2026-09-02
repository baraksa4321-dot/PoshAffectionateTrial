---
name: Installed PWA safe-area chrome
description: iOS home-screen PWAs need the bottom safe-area painted by the fixed app chrome.
---

In an installed iOS PWA, do not move fixed app content into a negative bottom offset to chase the home-indicator area. WebKit can clip or overlay that content, leaving a strip and hiding bottom-aligned marks.

**Why:** Safari reserves the home-indicator area separately from the scroll content, so a child tab bar alone may not paint the full viewport edge.

**How to apply:** Use the large viewport height (`100lvh`) for full-screen PWA shells and loading surfaces, keep fixed chrome at `bottom: 0`, keep loading marks inside the viewport with a small positive bottom gap, and avoid negative safe-area offsets.