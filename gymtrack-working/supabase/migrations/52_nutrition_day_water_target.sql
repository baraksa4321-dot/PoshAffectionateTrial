-- Nutrition-day water targets are persisted by the client sync layer.
ALTER TABLE public.nutrition_days
  ADD COLUMN IF NOT EXISTS water_target_ml INTEGER DEFAULT 2500;