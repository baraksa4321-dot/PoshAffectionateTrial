---
name: Live role RPC safeguard
description: The live role-change function has an approved self-change guard that must be preserved.
---

The approved live role-change behavior allows an authenticated Owner to assign `client` or `coach` to another user, including another Owner, but never to change their own role.

**Why:** This preserves Owner management while preventing an Owner from accidentally removing their own administrative access. The user approved a body-only live update and explicitly did not want schema, RLS, permissions, or migration changes.

**How to apply:** Before editing or deploying role-related database logic, verify this safeguard remains present along with the existing security-definer and search-path protections. Do not add a migration solely to mirror this approved live change unless the user explicitly authorizes that migration.