-- Keep custom exercise library edits, option metadata, and images in the
-- cloud. Image bytes remain in Storage; these columns store only URLs/maps.
ALTER TABLE public.custom_exercises
  ADD COLUMN IF NOT EXISTS muscle_groups TEXT[],
  ADD COLUMN IF NOT EXISTS custom_muscle_group TEXT,
  ADD COLUMN IF NOT EXISTS secondary_muscles TEXT[],
  ADD COLUMN IF NOT EXISTS approved_substitutes TEXT[],
  ADD COLUMN IF NOT EXISTS equipment_options TEXT[],
  ADD COLUMN IF NOT EXISTS equipment_images JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS cable_grip_options TEXT[],
  ADD COLUMN IF NOT EXISTS cable_grip_images JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tips TEXT,
  ADD COLUMN IF NOT EXISTS english_name TEXT;