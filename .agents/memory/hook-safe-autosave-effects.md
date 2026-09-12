---
name: Hook-safe autosave effects
description: React route editors with autosave and permission/loading branches
---

Declare autosave effects before any early return based on authentication, permissions, or loaded route data.

**Why:** Editors often render a loading or access-denied branch before their data exists. Placing the effect after those returns makes hook order change when hydration completes and can break the route at runtime.

**How to apply:** Keep the effect at the top level beside the editor state hooks, guard its body with the current permission/data checks, and use optional route data in its dependency list.