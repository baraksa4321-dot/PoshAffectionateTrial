---
name: Live storage migration drift
description: Verifying Supabase Storage buckets when local migrations and upload code disagree with live behavior.
---

When Supabase reports `Bucket not found`, verify the live `storage.buckets` catalog and migration history before changing upload code. A valid local migration does not prove that the linked Supabase project has received it.

**Why:** The exercise image uploader already used the intended bucket name and the repository contained its creation migration, but the connected project had not applied that migration.

**How to apply:** Compare the live bucket and migration state with local migrations, apply the existing DDL through the Supabase migration path, then re-query the live bucket before asking the user to retry.