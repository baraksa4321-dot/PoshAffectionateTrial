---
name: Meal scan preview routing
description: The web preview has a separate /api artifact route that can intercept app-specific POST endpoints.
---

Keep app-specific server endpoints off a shared `/api` prefix when another registered artifact owns `/api`; use a unique route that the web artifact serves.

**Why:** Local requests reached the web server, but external Preview requests were intercepted by an inactive API artifact and returned 502.

**How to apply:** Test mutation endpoints through the external Preview URL, not only localhost, whenever multiple artifacts register overlapping paths.

The Gemini request also needs an independent timeout race; aborting the controller immediately after receiving a response can cancel `response.json()` before the body is read.