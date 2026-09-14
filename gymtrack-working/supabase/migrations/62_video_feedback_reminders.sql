-- Durable reminder queue for coach feedback that a trainee has not opened.
CREATE TABLE IF NOT EXISTS public.video_feedback_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL UNIQUE REFERENCES public.video_feedback(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'claimed', 'delivered', 'failed', 'cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  claimed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_feedback_reminders_due
  ON public.video_feedback_reminders (remind_at)
  WHERE status = 'scheduled';

ALTER TABLE public.video_feedback_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can read own feedback reminders"
  ON public.video_feedback_reminders;
CREATE POLICY "Clients can read own feedback reminders"
  ON public.video_feedback_reminders FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE OR REPLACE FUNCTION public.schedule_video_feedback_reminder(
  p_feedback_id UUID,
  p_remind_at TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  feedback_client_id UUID;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;
  IF p_remind_at IS NULL
     OR p_remind_at <= NOW()
     OR p_remind_at > NOW() + INTERVAL '30 days' THEN
    RAISE EXCEPTION 'Feedback reminder time is outside the supported window.';
  END IF;

  SELECT client_id
    INTO feedback_client_id
  FROM public.video_feedback
  WHERE id = p_feedback_id
    AND client_id = current_user_id
    AND seen_at IS NULL;

  IF feedback_client_id IS NULL THEN
    RAISE EXCEPTION 'Feedback is not available for reminder scheduling.';
  END IF;

  INSERT INTO public.video_feedback_reminders (
    feedback_id, client_id, remind_at, status, attempts, claimed_at,
    delivered_at, cancelled_at, last_error, updated_at
  )
  VALUES (
    p_feedback_id, current_user_id, p_remind_at, 'scheduled', 0, NULL,
    NULL, NULL, NULL, NOW()
  )
  ON CONFLICT (feedback_id) DO UPDATE
  SET client_id = EXCLUDED.client_id,
      remind_at = EXCLUDED.remind_at,
      status = CASE
        WHEN public.video_feedback_reminders.status IN ('delivered', 'failed')
          THEN public.video_feedback_reminders.status
        ELSE 'scheduled'
      END,
      claimed_at = NULL,
      cancelled_at = NULL,
      last_error = NULL,
      updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_video_feedback_reminder(p_feedback_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.video_feedback_reminders
  SET status = 'cancelled',
      cancelled_at = NOW(),
      updated_at = NOW()
  WHERE feedback_id = p_feedback_id
    AND client_id = auth.uid()
    AND status IN ('scheduled', 'claimed');
END;
$$;

REVOKE ALL ON FUNCTION public.schedule_video_feedback_reminder(UUID, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.schedule_video_feedback_reminder(UUID, TIMESTAMPTZ) FROM anon;
GRANT EXECUTE ON FUNCTION public.schedule_video_feedback_reminder(UUID, TIMESTAMPTZ) TO authenticated;

REVOKE ALL ON FUNCTION public.cancel_video_feedback_reminder(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_video_feedback_reminder(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.cancel_video_feedback_reminder(UUID) TO authenticated;