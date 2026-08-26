---
name: Supabase MCP fallback
description: Environment-specific fallback when the installed Supabase MCP connection has no generated callbacks.
---

The installed Supabase connection can expose a streamable MCP endpoint through its custom connector even when the generated `mcpSupabase_*` callbacks are not mounted.

**Why:** A live verification should not be abandoned or replaced with unapproved credential handling just because the convenience callback names are unavailable.

**How to apply:** Resolve the installed Supabase connection, use its proxy only for the MCP transport, initialize a fresh MCP session, and keep the returned session identifier inside the sandbox. Never log session identifiers or credentials.