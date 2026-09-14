-- Coach-created challenges are private until an owner approves them.
-- The existing is_published flag is the approval state to keep this additive
-- migration compatible with projects that already applied the challenge table.

DROP POLICY IF EXISTS "Authenticated users can view published challenges" ON public.challenges;
CREATE POLICY "Authenticated users can view approved challenges"
  ON public.challenges FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      is_published = true
      OR owner_id = auth.uid()
      OR public.is_owner()
    )
  );

DROP POLICY IF EXISTS "Coaches can manage own challenges" ON public.challenges;
CREATE POLICY "Coaches and owners can manage challenges"
  ON public.challenges FOR ALL
  USING (
    (
      owner_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role IN ('coach', 'owner')
      )
    )
    OR public.is_owner()
  )
  WITH CHECK (
    (
      owner_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role IN ('coach', 'owner')
      )
    )
    OR public.is_owner()
  );