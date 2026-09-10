-- Prepare the live Realtime publication for cross-account GymTrack updates.
-- Apply this migration only after verifying the target Supabase project and
-- receiving explicit approval for the production schema change.

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles',
    'programs',
    'program_days',
    'nutrition_days',
    'workout_sessions',
    'body_weight_logs',
    'cardio_logs',
    'body_measurements',
    'client_habits',
    'client_feedback',
    'coach_messages',
    'broadcast_announcements',
    'coach_clients'
  ]
  LOOP
    IF to_regclass('public.' || table_name) IS NOT NULL
       AND EXISTS (
         SELECT 1
         FROM pg_class relation
         JOIN pg_namespace schema_name ON schema_name.oid = relation.relnamespace
         WHERE schema_name.nspname = 'public'
           AND relation.relname = table_name
       ) THEN
      EXECUTE format(
        'ALTER TABLE public.%I REPLICA IDENTITY FULL',
        table_name
      );
    END IF;

    IF to_regclass('public.' || table_name) IS NOT NULL
       AND NOT EXISTS (
         SELECT 1
         FROM pg_publication pub
         JOIN pg_publication_rel rel ON rel.prpubid = pub.oid
         JOIN pg_class relation ON relation.oid = rel.prrelid
         JOIN pg_namespace schema_name ON schema_name.oid = relation.relnamespace
         WHERE pub.pubname = 'supabase_realtime'
           AND schema_name.nspname = 'public'
           AND relation.relname = table_name
       ) THEN
      EXECUTE format(
        'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
        table_name
      );
    END IF;
  END LOOP;
END;
$$;