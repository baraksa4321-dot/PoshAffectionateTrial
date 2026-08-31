-- Store trainee performance videos in a shared Supabase Storage bucket.
-- The bucket is public so a coach can play a completed-session URL directly
-- from the workout_sessions JSONB entry after cross-account sync.
INSERT INTO storage.buckets (id, name, public)
VALUES ('workout-videos', 'workout-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

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
  )
  WITH CHECK (
    bucket_id = 'workout-videos'
    AND owner_id = (select auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can delete own workout videos" ON storage.objects;
CREATE POLICY "Users can delete own workout videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'workout-videos'
    AND owner_id = (select auth.uid()::text)
  );
