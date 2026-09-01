---
name: Supabase MCP destructive output
description: Destructive SQL may execute even when the MCP result is blocked by the security scanner.
---

Treat a blocked destructive Supabase MCP response as an unknown execution state: do not retry blindly; run a separate read-only verification query first.

**Why:** The MCP security scanner can reject the returned output after a destructive statement, while the database transaction may already have committed.

**How to apply:** Verify row counts and schema state with read-only SQL before deciding whether any further mutation is necessary.