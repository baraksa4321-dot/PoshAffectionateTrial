---
name: Remote persistence smoke fixtures
description: How authenticated browser fixtures should model remote edits that are verified after navigation or reopening.
---

When a browser smoke test verifies that a remote edit survives leaving and reopening a screen, its mocked API must persist mutation payloads and return the updated state on later reads.

**Why:** A fixture that always returns its initial GET payload can make a correct save path look broken, or allow a false positive when the UI only retains in-memory state.

**How to apply:** Keep fixture state scoped to the page opening, update it from the same PATCH/PUT shape used by the app, and make subsequent GET responses read from that state.

When the browser fixture replaces `window.fetch`, Playwright request events do not observe the intercepted mutation. Synchronize cross-page assertions through shared fixture storage or an explicit in-app result instead.

**Why:** A request waiter can time out even though the intercepted POST ran successfully, making a valid persisted edit look broken.

**How to apply:** Persist remote fixture rows in shared origin storage and poll that state before opening the recipient session.