---
name: Focused workspace portals
description: Placement rule for portaled focused editors inside the coach workspace
---

Focused coach editors rendered through a portal should target an anchor inside the owning client workspace rather than a global app-shell or main-content anchor.

**Why:** A global anchor can make the editor visually detach from the workspace overlay and appear outside the intended surface, especially when the workspace is rendered inline on client routes.

**How to apply:** Keep the anchor near the workspace's top content boundary and portal only the active editor into it; leave the source list hidden while the focused editor is open.