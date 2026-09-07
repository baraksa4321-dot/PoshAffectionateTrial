-- Shared coach-created challenge templates.
-- The client also ships with a safe built-in catalog, so this table is additive.

CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'כוח',
  difficulty TEXT NOT NULL DEFAULT 'מתחילים',
  duration_label TEXT NOT NULL DEFAULT 'אימון אחד',
  accent TEXT NOT NULL DEFAULT 'sage',
  sessions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenges_owner_id ON public.challenges(owner_id);
CREATE INDEX IF NOT EXISTS idx_challenges_published ON public.challenges(is_published);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view published challenges" ON public.challenges;
CREATE POLICY "Authenticated users can view published challenges"
  ON public.challenges FOR SELECT
  USING (auth.uid() IS NOT NULL AND (is_published = true OR owner_id = auth.uid()));

DROP POLICY IF EXISTS "Coaches can manage own challenges" ON public.challenges;
CREATE POLICY "Coaches can manage own challenges"
  ON public.challenges FOR ALL
  USING (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('coach', 'owner')
    )
  )
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('coach', 'owner')
    )
  );

ALTER TABLE public.challenges REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF to_regclass('public.challenges') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM pg_publication pub
       JOIN pg_publication_rel rel ON rel.prpubid = pub.oid
       JOIN pg_class relation ON relation.oid = rel.prrelid
       JOIN pg_namespace schema_name ON schema_name.oid = relation.relnamespace
       WHERE pub.pubname = 'supabase_realtime'
         AND schema_name.nspname = 'public'
         AND relation.relname = 'challenges'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
  END IF;
END;
$$;