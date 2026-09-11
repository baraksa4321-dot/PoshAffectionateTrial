---
name: Persistent browser profiles for web Push smoke
description: Chromium Playwright incognito contexts reject the Push API; web Push smoke needs persistent non-incognito profiles.
---

Use separate persistent browser profiles for web Push smoke tests; do not use
ordinary Playwright contexts when the test must obtain an FCM Web token.

**Why:** Chromium deliberately disables the Push API in incognito-style
contexts. A permission grant can still report `granted`, while Firebase token
registration fails with a permission-denied error.

**How to apply:** Launch each independent browser with its own persistent
profile, record permission and token setup only as redacted status, and use a
headed physical browser/device for the final OS notification and click
assertion. A headless send count proves FCM acceptance, not display.