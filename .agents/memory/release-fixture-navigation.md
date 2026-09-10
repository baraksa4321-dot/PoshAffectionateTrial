---
name: Release fixture navigation state
description: One-shot browser fixture failures must survive client-route navigation before the selected-data effect runs.
---

Persist one-shot release-fixture state when the tested flow navigates between routes; an in-memory init-script flag can be reset before the selected data load begins.

**Why:** The coach client workspace route can recreate browser initialization before its selected-trainee effect runs, so a failure armed immediately before clicking the trainee can otherwise disappear.

**How to apply:** Store only the short-lived fixture marker in browser storage, consume it at the selected-details boundary, and verify the user-visible error before exercising retry.