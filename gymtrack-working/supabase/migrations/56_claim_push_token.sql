-- Atomically transfer an FCM token to the currently authenticated device owner.
-- This handles provider token rotation when the old token row belongs to a
-- previous account or stale auth session.

CREATE OR REPLACE FUNCTION public.claim_push_token(
  p_token TEXT,
  p_platform TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  normalized_token TEXT := NULLIF(TRIM(p_token), '');
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  IF normalized_token IS NULL OR p_platform NOT IN ('web', 'ios', 'android') THEN
    RAISE EXCEPTION 'Invalid push token or platform.';
  END IF;

  DELETE FROM public.push_tokens
  WHERE token = normalized_token;

  INSERT INTO public.push_tokens (user_id, token, provider, platform, updated_at)
  VALUES (current_user_id, normalized_token, 'fcm', p_platform, NOW());
END;
$$;

REVOKE ALL ON FUNCTION public.claim_push_token(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_push_token(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_push_token(TEXT, TEXT) TO authenticated;