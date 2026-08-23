-- Coach-managed inputs for the BMR/TDEE calculator.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_years NUMERIC(3,0),
  ADD COLUMN IF NOT EXISTS workouts_per_week NUMERIC(3,0);