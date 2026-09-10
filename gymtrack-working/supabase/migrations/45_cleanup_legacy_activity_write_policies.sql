-- Remove legacy activity-log write policies that allowed coaches and owners
-- to mutate trainee-owned activity history.
--
-- The supported contract is:
--   * trainees may insert, update, and delete their own logs;
--   * assigned coaches and owners may read logs through the existing SELECT
--     policies;
--   * coaches and owners do not write body-weight or cardio logs directly.
--
-- RLS policies are additive, so dropping the newer-looking replacement
-- policies alone would not remove these older grants.

-- Body-weight logs: remove legacy coach/owner write access.
DROP POLICY IF EXISTS "Coaches can manage assigned clients weight logs"
  ON public.body_weight_logs;
DROP POLICY IF EXISTS "Owners can manage all weight logs"
  ON public.body_weight_logs;
DROP POLICY IF EXISTS "body_weight_logs_insert_own_or_coach_or_owner"
  ON public.body_weight_logs;
DROP POLICY IF EXISTS "body_weight_logs_update_own_or_coach_or_owner"
  ON public.body_weight_logs;
DROP POLICY IF EXISTS "body_weight_logs_delete_own_or_coach_or_owner"
  ON public.body_weight_logs;

-- Cardio logs: remove legacy coach/owner write access.
DROP POLICY IF EXISTS "Coaches can manage assigned clients cardio logs"
  ON public.cardio_logs;
DROP POLICY IF EXISTS "Owners can manage all cardio logs"
  ON public.cardio_logs;