---
name: Editor refresh freeze
description: Prevent background and realtime refreshes from replacing visible coach editor state.
---

While a coach is editing a program or nutrition menu, background, focus, realtime, and polling refreshes must not replace the visible editor data. Queue one silent refresh for after the editor closes, and mark every controlled field change as a local draft.

**Why:** Replacing the selected client snapshot during typing or item selection makes the editor jump, loses focus, and can overwrite unsaved values even when the remote data is valid.

**How to apply:** Keep the refresh lock local to the coach workspace, preserve draft ownership until the save succeeds, refresh once after the lock is released rather than refreshing on every lifecycle event, and gate deep-link scrolling so refreshed arrays cannot scroll the editor again.