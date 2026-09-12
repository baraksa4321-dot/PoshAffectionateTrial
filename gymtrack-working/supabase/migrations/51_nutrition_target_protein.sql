-- Store the coach-prescribed daily protein target alongside calories.
ALTER TABLE public.nutrition_days
  ADD COLUMN IF NOT EXISTS target_protein NUMERIC(7,2);