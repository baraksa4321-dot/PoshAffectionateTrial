-- Plan builder permissions
--
-- Coaches can manage plans only for their assigned clients through the
-- policies created by 04_coach_system.sql. Owners need the same write access
-- they already have for platform-wide reads. Trainees may read their own
-- assigned plans, but may not create or edit program definitions or days.

DROP POLICY IF EXISTS "Users can manage own programs" ON public.programs;
DROP POLICY IF EXISTS "Clients can view own programs" ON public.programs;
DROP POLICY IF EXISTS "Owners can manage all programs" ON public.programs;
CREATE POLICY "Clients can view own programs"
  ON public.programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage all programs"
  ON public.programs FOR ALL
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Users can manage own program days" ON public.program_days;
DROP POLICY IF EXISTS "Clients can view own program days" ON public.program_days;
DROP POLICY IF EXISTS "Owners can manage all program days" ON public.program_days;
CREATE POLICY "Clients can view own program days"
  ON public.program_days FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage all program days"
  ON public.program_days FOR ALL
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Owners can manage all nutrition" ON public.nutrition_days;
CREATE POLICY "Owners can manage all nutrition"
  ON public.nutrition_days FOR ALL
  USING (public.is_owner())
  WITH CHECK (public.is_owner());