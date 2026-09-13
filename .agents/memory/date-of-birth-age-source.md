---
name: Date-of-birth age source
description: Product and data-integrity rule for profile age and BMR inputs.
---

The app treats date of birth as the source of truth for age. Users enter a validated calendar date; age is calculated from the local calendar date and is never edited directly.

**Why:** A manually stored age becomes stale on birthdays and can silently change calorie/BMR results. Existing legacy age values cannot identify an exact birth date.

**How to apply:** Keep date-of-birth fields on registration and profile/BMR editing, show calculated age as read-only, and prompt legacy profiles with only an old age value to provide a date of birth.