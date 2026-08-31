---
name: Catalog source URL normalization
description: Canonicalize mixed Hebrew and percent-encoded product URLs before exposing them to catalog consumers.
---

When a curated catalog source URL contains mixed Hebrew and percent encoding, normalize it once while constructing the catalog product and reuse the canonical URL for audit metadata.

**Why:** Mixed encoding can look valid in source text but produce inconsistent or unusable links for consumers and tests.

**How to apply:** Keep public catalog metadata and review-source metadata on the same canonical URL; do not invent identifiers when a reliable source does not provide them.