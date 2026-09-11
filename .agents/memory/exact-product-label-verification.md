---
name: Exact product label verification
description: Nutrition reviews must distinguish an exact product and serving from nearby variants or similarly named listings.
---

Treat a nutrition record as verified only when its provenance explicitly identifies the exact product and includes a usable source URL. A similar flavor, package size, protein amount, or generic category page is evidence for follow-up research, not permission to replace the seed values.

**Why:** Israeli protein products frequently have near-identical names while their serving sizes, protein amounts, and formulations differ; promoting a near match creates more misleading precision than leaving a record unverified.

**How to apply:** Keep unmatched catalog rows unreviewed and preserve their existing values. Record manufacturer and retailer sources separately when an exact match is eventually confirmed.

Barcode lookup and label-photo extraction are intake aids, not verification. Keep both as editable candidates with visible low/medium confidence and a review-needed state until the user confirms the exact package and serving.

**Why:** External barcode databases and OCR can return a nearby market variant or misread a serving line; silently promoting either source would recreate the misleading precision this rule is meant to prevent.

**How to apply:** Store the source/origin with the food record, show it in the library and editor, and only use the verified tier for claims that match the exact product and serving.

Meal-plan snapshots may use a nonzero reference estimate when the prescription itself is generic, but the snapshot must label the assumed food and portion in its notes; do not promote that estimate to a verified catalog value.

**Why:** A plan can still be calculated while the source screenshot lacks enough detail to identify an exact fruit, vegetable mix, energy bar, or prepared dish. Silent guesses look like verified nutrition and are harder to correct later.

**How to apply:** Keep the reference value local to the planned meal, state the assumption and portion, and replace it with label-backed values when the exact product or recipe is confirmed.