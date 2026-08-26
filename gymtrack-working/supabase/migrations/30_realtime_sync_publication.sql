-- Prepare the live Realtime publication for cross-account GymTrack updates.
-- Apply this migration only after verifying the target Supabase project and
-- receiving explicit approval for the production schema change.

ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.programs REPLICA IDENTITY FULL;
ALTER TABLE public.program_days REPLICA IDENTITY FULL;
ALTER TABLE public.nutrition_days REPLICA IDENTITY FULL;
ALTER TABLE public.workout_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.body_weight_logs REPLICA IDENTITY FULL;
ALTER TABLE public.cardio_logs REPLICA IDENTITY FULL;
ALTER TABLE public.body_measurements REPLICA IDENTITY FULL;
ALTER TABLE public.client_habits REPLICA IDENTITY FULL;
ALTER TABLE public.client_feedback REPLICA IDENTITY FULL;
ALTER TABLE public.coach_messages REPLICA IDENTITY FULL;
ALTER TABLE public.broadcast_announcements REPLICA IDENTITY FULL;
ALTER TABLE public.coach_clients REPLICA IDENTITY FULL;

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