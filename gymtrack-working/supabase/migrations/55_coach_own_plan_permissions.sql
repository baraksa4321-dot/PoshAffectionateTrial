-- Coaches can build and use their own workout plans without reopening plan
-- writes to client accounts. Assigned-client writes remain protected by the
-- existing is_coach_of(user_id) policies.

DROP POLICY IF EXISTS "Coaches can manage own programs" ON public.programs;
CREATE POLICY "Coaches can manage own programs"
  ON public.programs FOR ALL
  USING (
    auth.uid() = user_id
    AND public.is_current_user_coach()
  )
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_current_user_coach()
  );

DROP POLICY IF EXISTS "Coaches can manage own program days" ON public.program_days;
CREATE POLICY "Coaches can manage own program days"
  ON public.program_days FOR ALL
  USING (
    auth.uid() = user_id
    AND public.is_current_user_coach()
  )
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_current_user_coach()
  );