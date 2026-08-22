-- Keep coach-prescribed menus separate from the client's actual nutrition log.
ALTER TABLE public.nutrition_days
  ADD COLUMN IF NOT EXISTS planned_meals JSONB NOT NULL DEFAULT '[]'::jsonb;