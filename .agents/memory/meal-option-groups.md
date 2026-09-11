---
name: Meal option groups
description: Durable model for coach-prescribed meal alternatives and trainee selection.
---

Represent a choice between a main meal and alternate meals as separate `Meal` records sharing an explicit option-group identifier. A legacy `Meal` without that identifier remains a standalone meal. Keep `MealFood.approvedSubstitutes` exclusively for replacing one food inside the selected meal.

**Why:** Meal-level choices need independent food lists, editing, deletion, persistence, and one selected actual log, while food-level substitutions must not turn into whole-meal alternatives.

**How to apply:** Group only meals with an explicit shared identifier; do not infer alternatives from names or from the legacy meal ID alone. When a legacy meal first receives an alternative, assign the group identifier to both records, and ensure logs replace an earlier selection from that group rather than creating two choices.