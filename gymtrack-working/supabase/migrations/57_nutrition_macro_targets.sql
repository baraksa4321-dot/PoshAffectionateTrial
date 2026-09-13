-- Preserve the full daily macro prescription with nutrition day records.
ALTER TABLE public.nutrition_days
  ADD COLUMN IF NOT EXISTS target_carbs NUMERIC(7,2),
  ADD COLUMN IF NOT EXISTS target_fat NUMERIC(7,2),
  ADD COLUMN IF NOT EXISTS target_fiber NUMERIC(7,2);