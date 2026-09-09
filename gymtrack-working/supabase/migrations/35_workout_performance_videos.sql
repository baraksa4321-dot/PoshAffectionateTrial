-- Store trainee performance videos in a private Supabase Storage bucket.
-- Workout history stores only the object path; clients create short-lived
-- signed URLs after the database RLS check has authorized the viewer.
INSERT INTO storage.buckets (id, name, public)
VALUES ('workout-videos', 'workout-videos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Authenticated users can upload own workout videos" ON storage.objects;
CREATE POLICY "Authenticated users can upload own workout videos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'workout-videos'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can update own workout videos" ON storage.objects;
CREATE POLICY "Users can update own workout videos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'workout-videos'
    AND owner_id = (select auth.uid()::text)
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'workout-videos'
    AND owner_id = (select auth.uid()::text)
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can delete own workout videos" ON storage.objects;
CREATE POLICY "Users can delete own workout videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'workout-videos'
    AND owner_id = (select auth.uid()::text)
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Remove common legacy/public variants before adding the scoped read policy.
-- Storage policies are additive, so leaving one old policy in place would
-- silently widen access again.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public can view workout videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view workout videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view workout videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own workout videos" ON storage.objects;
DROP POLICY IF EXISTS "Trainees and assigned coaches can view workout videos" ON storage.objects;
CREATE POLICY "Trainees and assigned coaches can view workout videos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'workout-videos'
    AND (
      (storage.foldername(name))[1] = (select auth.uid()::text)
      OR CASE
        WHEN (storage.foldername(name))[1] ~
          '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
        THEN public.is_coach_of(((storage.foldername(name))[1])::uuid)
        ELSE false
      END
    )
  );
