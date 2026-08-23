---
name: Body measurement schema compatibility
description: Extended body measurements must have matching Supabase columns before coach saves can work.
---

The body-measurements UI records calves, neck, body-fat percentage, and muscle mass in addition to the core circumference fields. The connected Supabase schema must expose these columns.

**Why:** A schema that only contains the original circumference fields rejects the whole measurement upsert, so a coach's valid measurement entry appears to save locally but fails in the cloud.

**How to apply:** When adding a measurement field in the UI or sync payload, confirm its column exists in Supabase and use an additive migration for missing optional fields before relying on the feature.