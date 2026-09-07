-- Keep the origin and review state of user-created food values alongside the
-- food record. This is additive and does not change ownership or RLS rules.
ALTER TABLE public.custom_foods
  ADD COLUMN IF NOT EXISTS nutrition_review JSONB;