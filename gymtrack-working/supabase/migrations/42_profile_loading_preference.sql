ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS loading_animations_enabled BOOLEAN;

COMMENT ON COLUMN public.profiles.loading_animations_enabled IS
  'Owner-controlled loading presentation override. NULL follows the profile gender default.';