---
name: Playwright WebKit runtime
description: Environment constraint affecting bundled Linux WebKit on the project’s Nix runtime.
---

The Playwright WebKit bundle can require exact Debian ABI library versions that are not provided by the stable Nix channel, even when similarly named Nix packages are installed.

**Why:** Installing the closest Nix packages does not guarantee that the bundle’s loader checks or ABI requirements will pass; silently skipping the browser test would remove the release protection it was meant to provide.

**How to apply:** Keep WebKit as an explicit release gate. If the host cannot launch it, report the missing runtime dependency and repair the runner image or system package set rather than adding an automatic pass-through. In this Nix runner, browser-side Supabase fetch stubs can isolate authenticated smoke fixtures from the unavailable WebKit TLS stack without changing production networking; realtime transport warnings remain environmental.