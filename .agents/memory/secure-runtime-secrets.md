---
name: Secure runtime secrets
description: Replit-managed secret behavior when authenticated one-off operations need to run in a project workflow.
---

Managed secrets can appear in the workspace inventory while remaining unavailable to ShellExec and to a newly configured workflow. A secure secret request followed by a workflow restart is the reliable path for an authenticated one-off operation.

**Why:** Direct shell execution and copying values from another process are not reliable or appropriate for protected credentials; they produced missing values even though the secret keys existed.

**How to apply:** Request missing or corrected credentials through the secure secrets flow, restart the workflow that consumes them, run the smallest scoped authenticated operation, verify the result with a fresh read, and remove any temporary workflow or script afterward.