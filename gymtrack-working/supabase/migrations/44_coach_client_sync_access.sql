-- Ensure the coach can read every trainee activity collection used by the
-- coach workspace. This migration is intentionally additive and must be
-- reviewed before applying it to a connected Supabase project.

ALTER TABLE public.client_habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coaches can view assigned clients habits" ON public.client_habits;
CREATE POLICY "Coaches can view assigned clients habits"
  ON public.client_habits FOR SELECT
  USING (public.is_coach_of(user_id) OR public.is_owner());

DROP POLICY IF EXISTS "Coaches can view assigned clients body weight logs"
  ON public.body_weight_logs;
CREATE POLICY "Coaches can view assigned clients body weight logs"
  ON public.body_weight_logs FOR SELECT
  USING (public.is_coach_of(user_id) OR public.is_owner());

DROP POLICY IF EXISTS "Coaches can view assigned clients cardio logs"
  ON public.cardio_logs;
CREATE POLICY "Coaches can view assigned clients cardio logs"
  ON public.cardio_logs FOR SELECT
  USING (public.is_coach_of(user_id) OR public.is_owner());