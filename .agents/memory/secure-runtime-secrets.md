---
name: Secure runtime secrets
description: Replit-managed secret behavior when authenticated one-off operations need to run in a project workflow.
---

Managed secrets can appear in the workspace inventory while remaining unavailable to Code Execution or ShellExec until the user confirms the secure request; after confirmation, the consuming shell/workflow may receive the value without exposing it to the agent.

**Why:** `requestSecrets` never returns secret values to Code Execution, and direct shell execution can initially see an empty variable even though the key exists. Retrying after the confirmation status made the secret available to the authenticated shell operation.

**How to apply:** Request missing or corrected credentials through the secure secrets flow, wait for the user confirmation status, then run the smallest scoped authenticated operation in the consuming workflow/shell. Verify with a fresh read and never print the value.