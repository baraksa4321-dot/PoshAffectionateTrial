-- Store the source of truth for the age used by profile and BMR calculations.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;