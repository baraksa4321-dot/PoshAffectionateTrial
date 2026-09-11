-- Exercise library images are public assets; exercise records store only the
-- returned URL, never the image bytes.
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-images', 'exercise-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Authenticated users can upload exercise library images" ON storage.objects;
CREATE POLICY "Authenticated users can upload exercise library images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'exercise-images'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can update own exercise library images" ON storage.objects;
CREATE POLICY "Users can update own exercise library images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'exercise-images'
    AND owner_id = (select auth.uid()::text)
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'exercise-images'
    AND owner_id = (select auth.uid()::text)
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can delete own exercise library images" ON storage.objects;
CREATE POLICY "Users can delete own exercise library images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'exercise-images'
    AND owner_id = (select auth.uid()::text)
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

DROP POLICY IF EXISTS "Anyone can view exercise library images" ON storage.objects;
CREATE POLICY "Anyone can view exercise library images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'exercise-images');