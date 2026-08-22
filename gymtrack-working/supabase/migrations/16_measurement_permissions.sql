-- Coach-managed monthly measurements.
ALTER TABLE public.body_measurements
  ADD COLUMN IF NOT EXISTS calves_cm NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS neck_cm NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS body_fat_pct NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS muscle_mass_kg NUMERIC(6,2);

DROP POLICY IF EXISTS "Users can manage own body measurements" ON public.body_measurements;
DROP POLICY IF EXISTS "Coaches can view assigned clients measurements" ON public.body_measurements;

CREATE POLICY "Clients can view own body measurements"
  ON public.body_measurements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view assigned clients measurements"
  ON public.body_measurements FOR SELECT
  USING (public.is_coach_of(user_id));

CREATE POLICY "Coaches can manage assigned clients measurements"
  ON public.body_measurements FOR ALL
  USING (public.is_coach_of(user_id))
  WITH CHECK (public.is_coach_of(user_id));

CREATE POLICY "Owners can manage all measurements"
  ON public.body_measurements FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );