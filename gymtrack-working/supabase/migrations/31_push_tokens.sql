-- Device tokens used by the Firebase Edge Function to deliver remote notifications.
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'fcm' CHECK (provider = 'fcm'),
  platform TEXT NOT NULL CHECK (platform IN ('web', 'ios', 'android')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_tokens(user_id);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own push tokens" ON public.push_tokens;
CREATE POLICY "Users can manage own push tokens"
  ON public.push_tokens FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());