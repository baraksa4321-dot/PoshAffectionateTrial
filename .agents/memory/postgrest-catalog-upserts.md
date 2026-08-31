---
name: PostgREST catalog upserts
description: The unique-index shape required for server-side Supabase REST upserts
---

Supabase REST upserts using `on_conflict=column_a,column_b` require a unique constraint or full unique index on exactly those columns. Do not make that index partial unless the request also supplies a matching conflict predicate.

**Why:** PostgreSQL conflict inference cannot match a partial unique index from the plain PostgREST `on_conflict` column list, so an importer can fail even when the data appears to have a uniqueness rule.

**How to apply:** For catalog rows, use nullable columns in a full unique index so legacy rows with null values remain allowed while imported rows can upsert by `(catalog_source, catalog_source_product_id)`.