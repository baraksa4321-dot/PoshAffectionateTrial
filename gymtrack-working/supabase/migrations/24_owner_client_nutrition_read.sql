-- Owners need the same read path as coaches for the client tracking workspace.
-- The shared coach detail pull reads nutrition alongside workout history; without
-- this policy an owner receives an all-or-nothing RLS error and loses the
-- otherwise permitted tracking view.
CREATE POLICY "Owners can view all client nutrition"
  ON public.nutrition_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
    )
  );