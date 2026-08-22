-- ===================================================
-- 10_audit_fixes.sql: durable body-weight sync support
-- ===================================================

-- The client records dated body-weight entries. This was previously sent to
-- body_measurements even though that table has no weight_kg column.
CREATE TABLE IF NOT EXISTS public.body_weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 1000),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_body_weight_date UNIQUE (user_id, date)
);

ALTER TABLE public.body_weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own body weight logs"
  ON public.body_weight_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view assigned clients body weight logs"
  ON public.body_weight_logs FOR SELECT
  USING (public.is_coach_of(user_id) OR public.is_owner());

-- The client sync includes workout difficulty and discomfort fields, but the
-- original workout_sessions table did not define them.
ALTER TABLE public.workout_sessions
  ADD COLUMN IF NOT EXISTS difficulty_rating TEXT
    CHECK (difficulty_rating IN ('easy', 'appropriate', 'difficult')),
  ADD COLUMN IF NOT EXISTS discomfort_notes TEXT;