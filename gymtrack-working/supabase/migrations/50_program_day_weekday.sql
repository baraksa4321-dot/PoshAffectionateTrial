-- Schedule each assigned workout on a stable Sunday-first weekday.
ALTER TABLE public.program_days
  ADD COLUMN IF NOT EXISTS weekday SMALLINT;

ALTER TABLE public.program_days
  DROP CONSTRAINT IF EXISTS program_days_weekday_check;

ALTER TABLE public.program_days
  ADD CONSTRAINT program_days_weekday_check
  CHECK (weekday IS NULL OR (weekday >= 0 AND weekday <= 6));

CREATE INDEX IF NOT EXISTS idx_program_days_user_weekday
  ON public.program_days(user_id, weekday);