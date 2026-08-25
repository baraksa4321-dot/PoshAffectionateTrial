---
name: Replit preview routing
description: The workspace application router requires a registered root web artifact for browser Preview routing.
---

Browser Preview does not route a standalone custom workflow to the public development URL when the workspace uses the application router. The working pattern is a root web artifact whose managed service command points at the existing app and uses the injected `PORT`; remove duplicate standalone frontend workflows.

**Why:** A healthy local Vite port can still produce the platform “no previewable artifacts” 404 when no root web artifact owns the Preview route.

**How to apply:** Inspect registered artifacts and artifact service logs before changing application code; verify both the managed artifact screenshot and the public development URL. Any hard-coded browser navigation must preserve the artifact prefix; router navigation is preferred.