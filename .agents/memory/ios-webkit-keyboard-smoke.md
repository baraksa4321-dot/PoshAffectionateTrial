---
name: iPhone WebKit keyboard smoke
description: Release-runner behavior around the authenticated iPhone keyboard visibility assertion.
---

The authenticated iPhone smoke can intermittently time out while checking that the completed-workout feedback field remains visible above the simulated keyboard, even though the same scenario passes on a subsequent run.

**Why:** The assertion depends on WebKit's visual viewport and focus timing. A single failure is not enough to classify the product behavior as broken, but repeated failures should be investigated as a test or layout regression.

**How to apply:** Run the release wrapper, which configures the Nix WebKit libraries, before using direct Playwright commands. If the focused scenario is needed, preserve that runtime setup and use Playwright retries; distinguish browser-launch failures from the app-level visibility assertion.