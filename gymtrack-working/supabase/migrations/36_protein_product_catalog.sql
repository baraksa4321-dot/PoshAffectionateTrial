-- Public supermarket protein products are separate from user-owned custom_foods.
-- Existing food IDs and nutrition values remain untouched.

ALTER TABLE public.foods
  ADD COLUMN IF NOT EXISTS barcode TEXT,
  ADD COLUMN IF NOT EXISTS catalog_source TEXT,
  ADD COLUMN IF NOT EXISTS catalog_source_product_id TEXT,
  ADD COLUMN IF NOT EXISTS catalog_source_url TEXT,
  ADD COLUMN IF NOT EXISTS catalog_product_type TEXT,
  ADD COLUMN IF NOT EXISTS catalog_package_size TEXT,
  ADD COLUMN IF NOT EXISTS catalog_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS catalog_source_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS catalog_verification_status TEXT;

ALTER TABLE public.foods
  DROP CONSTRAINT IF EXISTS foods_catalog_source_check,
  DROP CONSTRAINT IF EXISTS foods_catalog_product_type_check,
  DROP CONSTRAINT IF EXISTS foods_catalog_verification_check;

ALTER TABLE public.foods
  ADD CONSTRAINT foods_catalog_source_check
    CHECK (
      catalog_source IS NULL OR
      catalog_source IN ('curated-israel', 'open-food-facts')
    ),
  ADD CONSTRAINT foods_catalog_product_type_check
    CHECK (
      catalog_product_type IS NULL OR
      catalog_product_type IN ('powder', 'bar', 'drink', 'pudding', 'yogurt', 'other')
    ),
  ADD CONSTRAINT foods_catalog_verification_check
    CHECK (
      catalog_verification_status IS NULL OR
      catalog_verification_status IN (
        'curated-unverified',
        'manufacturer-verified',
        'external-unverified'
      )
    );

CREATE UNIQUE INDEX IF NOT EXISTS idx_foods_catalog_source_product
  ON public.foods (catalog_source, catalog_source_product_id)
;

CREATE UNIQUE INDEX IF NOT EXISTS idx_foods_catalog_source_barcode
  ON public.foods (catalog_source, barcode)
;

CREATE INDEX IF NOT EXISTS idx_foods_catalog_type
  ON public.foods (catalog_product_type)
  WHERE catalog_source IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.food_catalog_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed', 'skipped')),
  fetched_count INTEGER NOT NULL DEFAULT 0,
  accepted_count INTEGER NOT NULL DEFAULT 0,
  upserted_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.food_catalog_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_food_catalog_sync_runs_source_started
  ON public.food_catalog_sync_runs (source, started_at DESC);