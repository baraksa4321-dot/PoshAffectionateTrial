---
name: iOS loading scroll lock
description: The mobile Safari behavior that requires a document-level lock during the app splash screen.
---

On iOS standalone/PWA launch, a fixed loading overlay alone does not prevent the underlying document from being dragged. Lock both the document and body while loading, and use viewport-safe sizing on the overlay.

**Why:** Safari can continue scrolling the body beneath a fixed overlay, making the splash artwork and wordmark appear to move or sit at the wrong vertical position.

**How to apply:** Toggle a loading-lock class and temporarily fix the body while the loading state is active; restore the original body styles when the app becomes interactive.