---
name: Supabase backup verification
description: Live schema changes require an independently verifiable backup because MCP project health and migration history do not prove recoverability.
---

Do not treat `ACTIVE_HEALTHY`, an applied migration list, or a local export filename as proof that the live database can be restored. Verify a Supabase backup or restore point independently before production DDL.

**Why:** The Supabase MCP exposes project health and SQL but not backup availability, and a management API token may be listed in the project snapshot while remaining unavailable to the sandbox.

**How to apply:** If the management API cannot list backups, ask the user to confirm the latest backup/restore-point timestamp from Supabase Dashboard before applying migrations; never substitute a health check for backup verification.