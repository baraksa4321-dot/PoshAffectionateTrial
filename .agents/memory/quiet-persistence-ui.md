---
name: Quiet persistence UI
description: Product preference for unobtrusive save and synchronization feedback throughout GymTrack
---

Routine persistence should be silent in the interface. Do not show transient captions saying that data was saved locally, is waiting for another sync attempt, or was saved automatically. Keep actionable failures, validation messages, retry controls, and conflict-resolution choices visible.

**Why:** The user considers routine save and cloud-sync status captions unnecessary visual noise across the product.

**How to apply:** When adding or changing a feature, use icons or existing controls for normal sync state and reserve visible text for an error, a required decision, or a recovery action.