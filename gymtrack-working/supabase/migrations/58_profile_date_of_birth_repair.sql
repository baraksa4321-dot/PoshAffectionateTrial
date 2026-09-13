-- Repair the profile DOB column for environments where the original DOB
-- migration was not applied, and refresh PostgREST's schema cache.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

NOTIFY pgrst, 'reload schema';