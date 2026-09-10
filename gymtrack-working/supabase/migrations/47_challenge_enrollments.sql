-- Personal challenge journeys belong to the trainee, not to a coach program.
-- Keep the generated workout snapshot with the enrollment so another device
-- can restore the journey without relying on local storage.

CREATE TABLE IF NOT EXISTS public.challenge_enrollments (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  workout_ids TEXT[] NOT NULL DEFAULT '{}',
  workouts JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_enrollments_user
  ON public.challenge_enrollments(user_id);

ALTER TABLE public.challenge_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own challenge enrollments"
  ON public.challenge_enrollments;
CREATE POLICY "Users can manage own challenge enrollments"
  ON public.challenge_enrollments FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE public.challenge_enrollments REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF to_regclass('public.challenge_enrollments') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM pg_publication pub
       JOIN pg_publication_rel rel ON rel.prpubid = pub.oid
       JOIN pg_class relation ON relation.oid = rel.prrelid
       JOIN pg_namespace schema_name ON schema_name.oid = relation.relnamespace
       WHERE pub.pubname = 'supabase_realtime'
         AND schema_name.nspname = 'public'
         AND relation.relname = 'challenge_enrollments'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_enrollments;
  END IF;
END;
$$;