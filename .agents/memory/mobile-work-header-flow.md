---
name: Mobile work-header flow
description: Keep management-route header actions in a separate row below the workspace switcher.
---

For authenticated management routes, workspace mode controls must remain above the route title and its actions; home-only greeting controls are the exception.

**Why:** At narrow mobile widths, mixing route actions into the workspace utility row can place controls over the switcher or title, especially when night-mode chrome changes spacing.

**How to apply:** When adding a management-route header control, render it with the route heading actions and verify its bounding box against the workspace row at a mobile viewport.