# Foods import report — blocked pending authorized source

**Report date:** 2026-08-22  
**Requested reference source:** FoodsDictionary  
**FoodsDictionary used as a direct source:** No  
**Authorization or export supplied:** No

## Source decision

The data owner confirmed that no authorized FoodsDictionary API access, export,
or written permission is currently available. FoodsDictionary is therefore
recorded as a requested reference only, not as a data source.

No scraping, copying, substitution with another source, estimate, or inferred
nutrition value was performed.

## Baseline

| Check | Result |
| --- | ---: |
| Local built-in food records (`ISRAELI_FOOD_DATABASE`) | 488 |
| Local `f-israel-*` IDs | 488 |
| Rows in `public.foods` | 488 |
| Database rows with calories, protein, carbs, and fat | 488 |
| Database rows with fiber | 488 |
| Duplicate normalized names in `public.foods` | 0 |

## Import result

| Metric | Count |
| --- | ---: |
| Candidate records received from an authorized source | 0 |
| Candidate records proposed | 0 |
| New records added locally | 0 |
| New records added to `public.foods` | 0 |
| Existing records changed or deleted | 0 |
| Duplicate candidates prevented | 0 |
| Candidates rejected for missing or unreliable nutrition fields | 0 |

No food IDs, names, aliases, or nutritional values were changed. No schema,
migration, RLS policy, permission, role, or RPC was changed.

## Verification status

### FIXED

- A source gate and this import report document why no unauthorised data was
  introduced.

### CODE VERIFIED

- The local built-in list still contains 488 `f-israel-*` records.
- The existing seed file still contains 488 inserts into `public.foods`.

### DATABASE

- `public.foods` contains 488 rows.
- All 488 rows have the required core macro fields and fiber.
- No normalized-name duplicates were found.

### SOURCE

- **BLOCKED:** no licensed FoodsDictionary export, API access, or written
  permission was supplied.

### PERSISTENCE

- No new dataset exists to sync or persist. Existing food data was left
  untouched.

### NOT VERIFIED

- Validation of new records, semantic duplicate review, Food Picker search,
  adding a newly imported food to a meal, quantity recalculation, meal/day
  totals, and refresh persistence cannot be tested until an authorized dataset
  is supplied.

## Resume requirements

Provide one of the following before importing:

1. A licensed FoodsDictionary CSV, XLSX, or JSON export that includes the
   food name, category, serving/grams, calories, protein, carbohydrates, fat,
   and fiber; or
2. Documented permission plus the corresponding data export; or
3. Authorized API access configured in Replit Secrets, without sharing the
   secret value in chat.

The next import must validate every candidate, preserve all current records and
IDs, prevent duplicates by normalized name/aliases/English name and semantic
review, update the local library and `public.foods` consistently, and replace
the zero-count import section above with the actual results.