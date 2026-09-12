---
name: Gram portion convention
description: Nutrition rows must store per-gram values when quantity represents grams.
---

Gram-based MealFood rows use per-gram nutrition with a quantity equal to the entered grams. Legacy rows that combine whole-serving nutrition with a numeric gram quantity must be normalized at save boundaries and interpreted compatibly while still in storage.

**Why:** Mixing whole-serving values with quantities such as 100 or 150 multiplies the same serving repeatedly and can produce implausible calorie totals.

**How to apply:** Route all new gram selections through the shared food-portion conversion, use the shared nutrition multiplier for totals and editor displays, and keep a fixture for legacy whole-serving rows.