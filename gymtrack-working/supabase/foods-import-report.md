# Foods import report

**Report date:** 2026-08-22  
**Reference source:** FoodsDictionary, for inspiration only
**Imported source:** USDA FoodData Central SR Legacy Release 1 (2018-04)

## Scope and outcome

| Check                                         |    Result |
| --------------------------------------------- | --------: |
| Original local built-in records preserved     |       488 |
| New documented USDA records                   |       512 |
| Local built-in catalog after import           | **1,000** |
| `public.foods` after additive synchronization | **1,000** |

The original `f-israel-*` records were left unchanged. The new generic food
records use separate `f-usda-sr-*` IDs, so the import is additive and safe to
repeat.

## Source and nutrition data

- Dataset page: <https://fdc.nal.usda.gov/download-datasets.html>
- Download file: `FoodData_Central_sr_legacy_food_csv_2018-04.zip`
- License: USDA FoodData Central data are public-domain U.S. government data.
- Every imported row includes documented calories, protein, carbohydrates, fat,
  and dietary fiber, with values stated **per 100 g**.
- The source FoodData Central ID is retained in the local record note for
  traceability.

## Accuracy policy

The app treats a food's listed calories, protein, carbohydrates, fat, and
fiber as values for its stated reference serving. Meal and daily totals scale
those values by the selected quantity; they do not re-estimate calories from
macros, because nutrition labels and source datasets can use legally permitted
rounding.

| Catalog segment        | Records | Status in the app                                                                                  |
| ---------------------- | ------: | -------------------------------------------------------------------------------------------------- |
| USDA SR Legacy         |     512 | Verified source, documented FDC ID, values per 100 g                                               |
| Original local catalog |     488 | Structurally valid catalog data; shown as requiring confirmation against the current package label |

The original local records are preserved rather than being silently replaced
with generic USDA estimates. Their brands, serving sizes, and recipes can
change, so an app cannot truthfully present them as source-verified without a
current manufacturer label or official product record. The food library now
shows the source status before a user logs a food.

No data was scraped or copied from FoodsDictionary, and no generic USDA food
is presented as a Rami Levy SKU or as a branded Israeli product.

## Import safeguards

1. Only candidates with all required macro and fiber values were included.
2. New records are kept in a separate local expansion module and preserve the
   existing 488-item catalog exactly.
3. The database synchronization is versioned in
   `supabase/migrations/13_foods_usda_expansion.sql`, is additive, and uses
   stable IDs for repeatable imports. It performs no schema, RLS, role,
   permission, or RPC change.
4. The library's search now also considers English names and aliases; filtered
   results are no longer limited to the first 80 items.
5. All food values are checked for a non-empty reference serving and finite,
   non-negative calories, protein, carbohydrates, fat, and fiber before a
   food can be saved or added to the diary.
6. Editing only a meal quantity retains the complete saved macro snapshot
   instead of replacing it, so refresh-safe meal and daily totals continue to
   use the original logged values.

## Verification

- Local catalog count: 488 + 512 = **1,000**.
- Supabase `public.foods` count after synchronization: **1,000**.
- All added food records have complete macro and fiber values.
- Structural audit: **0** records with missing/negative macro values and
  **0** duplicate IDs in both the local catalog and the synchronized database.
