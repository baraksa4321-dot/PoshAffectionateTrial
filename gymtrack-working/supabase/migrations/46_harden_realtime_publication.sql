-- Keep Realtime setup safe for projects that are upgraded in stages.
-- Missing optional tables must not abort publication setup for tables that exist.

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
    IF to_regclass('public.' || table_name) IS NOT NULL THEN
      EXECUTE format(
        'ALTER TABLE public.%I REPLICA IDENTITY FULL',
        table_name
      );
      IF NOT EXISTS (
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
    END IF;
  END LOOP;
END;
$$;