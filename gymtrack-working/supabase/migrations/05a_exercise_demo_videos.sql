-- Persist coach-provided exercise demonstration videos with custom exercises.
ALTER TABLE public.custom_exercises
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_urls TEXT[],
  ADD COLUMN IF NOT EXISTS video_male_url TEXT,
  ADD COLUMN IF NOT EXISTS video_female_url TEXT;