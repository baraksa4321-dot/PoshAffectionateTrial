# Role Permission Validation

Validation date: 2026-08-26

## Result

The local role-security suite passed, but the required live user-context
validation could not be run because creation of the disposable Supabase branch
was declined after the current branch price was reported as `$0.01344/hour`.
No Supabase branch was created, no production data was modified, and no cleanup
was necessary.

## Evidence

| Area | Result | Evidence |
| --- | --- | --- |
| Owner can change another user's role | PASS (local contract) | `role-assignment-security.test.ts`, disposable dataset |
| Owner cannot change their own role | PASS (local contract) | `role-assignment-security.test.ts`, owner-only role guard |
| Owner can reassign clients | PASS (local contract) | `role-assignment-security.test.ts`, reverse pointer and link replacement |
| Coach and Client cannot use owner-only operations | PASS (local contract) | `role-assignment-security.test.ts`, owner-only RPC and direct-write cases |
| Coach assignment protections | PASS (local contract) | `role-assignment-security.test.ts`, approved-client and existing-owner checks |
| Stale relationship cleanup in both directions | PASS (local contract) | `role-assignment-security.test.ts`, coach-to-client and client-to-coach transitions |
| SQL RPC and trigger contract | PASS (static contract) | Migrations 11, 27, and 28 are checked by the suite |
| RLS with real Owner/Coach/Client sessions | BLOCKED | Disposable Supabase branch was not approved |
| Foreign-key behavior in an isolated database | BLOCKED | Disposable Supabase branch was not approved |
| RPC behavior against Supabase/PostgREST | BLOCKED | Disposable Supabase branch was not approved |

The local command completed with **8 passing tests, 0 failures, and 46
assertions**. The passing local suite is useful regression coverage, but it
does not substitute for the blocked live RLS and authenticated-session checks.