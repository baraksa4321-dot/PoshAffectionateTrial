-- Progress photos are private profile assets. The metadata row stores the
-- captured date while the original image lives in the private bucket.
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_path TEXT NOT NULL,
  captured_on DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date
  ON public.progress_photos (user_id, captured_on DESC, created_at DESC);

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress photos" ON public.progress_photos;
CREATE POLICY "Users can view own progress photos"
  ON public.progress_photos FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches can view assigned progress photos" ON public.progress_photos;
CREATE POLICY "Coaches can view assigned progress photos"
  ON public.progress_photos FOR SELECT TO authenticated
  USING (public.is_coach_of(user_id));

DROP POLICY IF EXISTS "Owners can view all progress photos" ON public.progress_photos;
CREATE POLICY "Owners can view all progress photos"
  ON public.progress_photos FOR SELECT TO authenticated
  USING (public.is_owner());

DROP POLICY IF EXISTS "Users can add own progress photos" ON public.progress_photos;
CREATE POLICY "Users can add own progress photos"
  ON public.progress_photos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches can add assigned progress photos" ON public.progress_photos;
CREATE POLICY "Coaches can add assigned progress photos"
  ON public.progress_photos FOR INSERT TO authenticated
  WITH CHECK (public.is_coach_of(user_id));

DROP POLICY IF EXISTS "Owners can add all progress photos" ON public.progress_photos;
CREATE POLICY "Owners can add all progress photos"
  ON public.progress_photos FOR INSERT TO authenticated
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Users can delete own progress photos" ON public.progress_photos;
CREATE POLICY "Users can delete own progress photos"
  ON public.progress_photos FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches can delete assigned progress photos" ON public.progress_photos;
CREATE POLICY "Coaches can delete assigned progress photos"
  ON public.progress_photos FOR DELETE TO authenticated
  USING (public.is_coach_of(user_id));

DROP POLICY IF EXISTS "Owners can delete all progress photos" ON public.progress_photos;
CREATE POLICY "Owners can delete all progress photos"
  ON public.progress_photos FOR DELETE TO authenticated
  USING (public.is_owner());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'progress-photos',
  'progress-photos',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

DROP POLICY IF EXISTS "Users can upload own progress photos" ON storage.objects;
CREATE POLICY "Users can upload own progress photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'progress-photos'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

DROP POLICY IF EXISTS "Coaches can upload assigned progress photos" ON storage.objects;
CREATE POLICY "Coaches can upload assigned progress photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'progress-photos'
    AND (storage.foldername(name))[1] ~
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
    AND public.is_coach_of(((storage.foldername(name))[1])::uuid)
  );

DROP POLICY IF EXISTS "Owners can upload all progress photos" ON storage.objects;
CREATE POLICY "Owners can upload all progress photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'progress-photos'
    AND public.is_owner()
  );

DROP POLICY IF EXISTS "Profile owners can view progress photos" ON storage.objects;
CREATE POLICY "Profile owners can view progress photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

DROP POLICY IF EXISTS "Coaches can view assigned progress photos" ON storage.objects;
CREATE POLICY "Coaches can view assigned progress photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND (storage.foldername(name))[1] ~
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
    AND public.is_coach_of(((storage.foldername(name))[1])::uuid)
  );

DROP POLICY IF EXISTS "Owners can view all progress photos" ON storage.objects;
CREATE POLICY "Owners can view all progress photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND public.is_owner()
  );

DROP POLICY IF EXISTS "Users can delete own progress photos" ON storage.objects;
CREATE POLICY "Users can delete own progress photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

DROP POLICY IF EXISTS "Coaches can delete assigned progress photos" ON storage.objects;
CREATE POLICY "Coaches can delete assigned progress photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND (storage.foldername(name))[1] ~
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
    AND public.is_coach_of(((storage.foldername(name))[1])::uuid)
  );

DROP POLICY IF EXISTS "Owners can delete all progress photos" ON storage.objects;
CREATE POLICY "Owners can delete all progress photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'progress-photos'
    AND public.is_owner()
  );