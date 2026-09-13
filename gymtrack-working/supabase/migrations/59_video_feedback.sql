-- Coach feedback attached to a specific trainee performance video.
CREATE TABLE IF NOT EXISTS public.video_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  workout_id TEXT,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  video_path TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(btrim(message)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  seen_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_video_feedback_client_unseen
  ON public.video_feedback (client_id, seen_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_feedback_video
  ON public.video_feedback (client_id, session_id, exercise_id, video_path);

ALTER TABLE public.video_feedback ENABLE ROW LEVEL SECURITY;
REVOKE UPDATE ON public.video_feedback FROM authenticated;
GRANT UPDATE (seen_at) ON public.video_feedback TO authenticated;

DROP POLICY IF EXISTS "Clients and assigned coaches can view video feedback"
  ON public.video_feedback;
CREATE POLICY "Clients and assigned coaches can view video feedback"
  ON public.video_feedback FOR SELECT TO authenticated
  USING (auth.uid() = client_id OR public.is_coach_of(client_id));

DROP POLICY IF EXISTS "Assigned coaches can create video feedback"
  ON public.video_feedback;
CREATE POLICY "Assigned coaches can create video feedback"
  ON public.video_feedback FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = coach_id
    AND public.is_coach_of(client_id)
  );

DROP POLICY IF EXISTS "Clients can mark video feedback seen"
  ON public.video_feedback;
CREATE POLICY "Clients can mark video feedback seen"
  ON public.video_feedback FOR UPDATE TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

DO $$
BEGIN
  IF to_regclass('public.video_feedback') IS NOT NULL THEN
    ALTER TABLE public.video_feedback REPLICA IDENTITY FULL;
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication pub
      JOIN pg_publication_rel rel ON rel.prpubid = pub.oid
      JOIN pg_class relation ON relation.oid = rel.prrelid
      JOIN pg_namespace schema_name ON schema_name.oid = relation.relnamespace
      WHERE pub.pubname = 'supabase_realtime'
        AND schema_name.nspname = 'public'
        AND relation.relname = 'video_feedback'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.video_feedback;
    END IF;
  END IF;
END;
$$;