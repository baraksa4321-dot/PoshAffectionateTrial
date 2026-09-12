---
name: Loading cycle persistence
description: Deterministic loading animation and message rotation across app openings.
---

The loading screen should claim and persist one shared cycle index once per app opening. Animation and message indexes both derive from that index with their own modulo lengths. Any visual rotation while the loading screen remains visible must use separate transient state and must never advance the persisted opening index. The splash should complete once per WebView lifetime; background/foreground, focus, visibility, and bfcache restoration are refresh events, not new openings.

**Why:** Advancing the persisted value from an interval makes refreshes skip arbitrary numbers of choices, and random fallbacks make opening order impossible to verify. React StrictMode can also replay effects in development, so the initial storage claim needs a ref guard.

**How to apply:** Read and write browser storage only in a client effect, use a new non-conflicting storage key when replacing an older random scheme, and do not reset the splash on bfcache/page visibility restoration. Gate the splash with a one-time in-memory completion flag that resets only when the WebView is created again. The loading presentation must also use a persisted authenticated gender until logout; use auth metadata as an early signal and clear it on every sign-out path so female animation/message and male spinner modes never flash into each other.

On iOS/PWA, the pre-hydration boot shell may remain visible until React takes over. The boot watchdog must rotate the visible animation and message during that window, then stop when the React runtime announces boot completion; share the claimed opening index through a window value so React does not increment storage a second time.

**Why:** A React-only interval can appear completely stuck when hydration is delayed or fails, even though the server-rendered loading shell is still visible to the user.

**How to apply:** Keep the boot watchdog's rotation interval and message/image lists aligned with the React implementation, version its script URL when behavior changes, and stop its observer/timer as soon as `__MY_ROUTINE_BOOTED__` is set.