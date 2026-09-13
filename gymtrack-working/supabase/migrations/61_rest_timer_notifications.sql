-- Durable web rest-timer scheduling. Native Capacitor builds continue to use
-- LocalNotifications; this queue is consumed by the scheduled dispatcher for
-- browsers and installed PWAs that are fully closed.

CREATE TABLE IF NOT EXISTS public.rest_timer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  timer_key TEXT NOT NULL CHECK (char_length(timer_key) BETWEEN 1 AND 200),
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'claimed', 'delivered', 'failed', 'cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  claimed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, timer_key)
);

CREATE INDEX IF NOT EXISTS idx_rest_timer_notifications_due
  ON public.rest_timer_notifications (ends_at)
  WHERE status = 'scheduled';

ALTER TABLE public.rest_timer_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own rest timer notifications"
  ON public.rest_timer_notifications;
CREATE POLICY "Users can read own rest timer notifications"
  ON public.rest_timer_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.schedule_rest_timer(
  p_timer_key TEXT,
  p_ends_at TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  normalized_key TEXT := NULLIF(TRIM(p_timer_key), '');
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;
  IF normalized_key IS NULL OR char_length(normalized_key) > 200 THEN
    RAISE EXCEPTION 'Invalid rest timer key.';
  END IF;
  IF p_ends_at IS NULL OR p_ends_at <= NOW() OR p_ends_at > NOW() + INTERVAL '24 hours' THEN
    RAISE EXCEPTION 'Rest timer end time is outside the supported window.';
  END IF;

  INSERT INTO public.rest_timer_notifications (
    user_id, timer_key, ends_at, status, attempts, claimed_at,
    delivered_at, cancelled_at, last_error, updated_at
  )
  VALUES (
    current_user_id, normalized_key, p_ends_at, 'scheduled', 0, NULL,
    NULL, NULL, NULL, NOW()
  )
  ON CONFLICT (user_id, timer_key) DO UPDATE
  SET ends_at = EXCLUDED.ends_at,
      status = 'scheduled',
      attempts = 0,
      claimed_at = NULL,
      delivered_at = NULL,
      cancelled_at = NULL,
      last_error = NULL,
      updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_rest_timer(p_timer_key TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.rest_timer_notifications
  SET status = 'cancelled',
      cancelled_at = NOW(),
      updated_at = NOW()
  WHERE user_id = auth.uid()
    AND timer_key = NULLIF(TRIM(p_timer_key), '')
    AND status IN ('scheduled', 'claimed');
END;
$$;

REVOKE ALL ON FUNCTION public.schedule_rest_timer(TEXT, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.schedule_rest_timer(TEXT, TIMESTAMPTZ) FROM anon;
GRANT EXECUTE ON FUNCTION public.schedule_rest_timer(TEXT, TIMESTAMPTZ) TO authenticated;

REVOKE ALL ON FUNCTION public.cancel_rest_timer(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_rest_timer(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.cancel_rest_timer(TEXT) TO authenticated;