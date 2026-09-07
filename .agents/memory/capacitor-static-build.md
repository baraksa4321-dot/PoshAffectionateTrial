---
name: Capacitor static build
description: The TanStack Start web app needs a separate client-only Vite entry for Capacitor.
---

Capacitor cannot consume the normal TanStack Start SSR output directly because that build does not emit the required root `index.html`. Keep the native shell on a separate client-only entry and static output directory, then sync that output into iOS and Android.

**Why:** The first Capacitor copy failed when the SSR-oriented output had no `index.html`; a dedicated client build preserves the existing Web/PWA build while giving native platforms a valid local bundle.

**How to apply:** Keep `build:mobile` independent from the normal `build`, ensure the final output is named `index.html`, and run Capacitor sync after every native bundle change.