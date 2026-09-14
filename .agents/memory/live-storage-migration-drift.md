---
name: Live storage migration drift
description: Verifying Supabase Storage buckets when local migrations and upload code disagree with live behavior.
---

When Supabase reports `Bucket not found`, or an upload works but playback/signing fails, verify the live `storage.buckets` catalog, object metadata, policies, and migration history before changing upload code. A valid local migration does not prove that the linked Supabase project has received every bucket setting.

**Why:** The exercise image uploader already used the intended bucket name and the repository contained its creation migration, but the connected project had not applied that migration. A later live project can also have the private video bucket and policies while still missing a local file-size-limit migration.

**How to apply:** Compare the live bucket, object metadata, policies, and migration state with local migrations. Apply existing DDL through the Supabase migration path only after backup/recovery verification, then re-query the live bucket before asking the user to retry.