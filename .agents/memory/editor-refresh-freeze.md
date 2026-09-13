---
name: Editor refresh freeze
description: Prevent background and realtime refreshes from replacing visible coach editor state.
---

While a coach is editing a program or nutrition menu, background, focus, realtime, polling, initial-cache, and autosave refreshes must not replace the visible editor data. Queue one silent refresh for after the editor closes, and mark every controlled field change as a local draft. Same-client refreshes after a successful autosave must preserve expansion, search, and focus state; reset those controls only when the selected client changes.

**Why:** Replacing the selected client snapshot during typing or item selection makes the editor jump, loses focus, and can overwrite unsaved values even when the remote data is valid.

**How to apply:** Keep the refresh lock local to the coach workspace, preserve draft ownership until the save succeeds, refresh once after the lock is released rather than refreshing on every lifecycle event, track the editor owner separately from the client snapshot identity, and gate deep-link scrolling so refreshed arrays cannot scroll the editor again.