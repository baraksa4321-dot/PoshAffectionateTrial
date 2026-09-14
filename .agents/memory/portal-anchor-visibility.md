---
name: Portal anchor visibility
description: Visibility constraints for empty DOM anchors used by coach workout editor portals.
---

Workout editor portal anchors must remain in the layout even while empty. Do not hide the workout surface target with `:empty`, because the portal content mounts asynchronously and WebKit can treat the hidden target as unavailable during editor navigation.

**Why:** The coach editor renders into a DOM anchor after an effect finds it. Hiding that anchor during the empty first render can make authenticated iPhone workspace and active-workout flows fail or become timing-sensitive.

**How to apply:** Hide only genuinely decorative empty anchors. Keep any element queried by a portal placement component visible, even when it has no child content yet.