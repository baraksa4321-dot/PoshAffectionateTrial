---
name: USDA expansion provenance
description: Provenance and verification rules for the generic USDA food expansion.
---

Generic USDA expansion rows may carry a FoodData Central search URL and `same-food` reference, but remain `unreviewed` and `estimated`. A search result is reference provenance, not proof that an exact branded product or serving label was matched.

**Why:** The catalog needs traceable independent references without importing or scraping a third-party food database, and generic USDA data cannot validate Israeli package-specific nutrition.

**How to apply:** Keep the serving basis explicit, show USDA rows as comparison sources in nutrition integrity UI, and only use `exact-product` plus a usable source URL for verified claims.