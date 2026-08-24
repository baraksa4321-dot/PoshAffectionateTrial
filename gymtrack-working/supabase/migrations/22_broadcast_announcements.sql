-- Additive role-aware announcements. Run after the existing coach/owner policies.
CREATE TABLE IF NOT EXISTS public.broadcast_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  audience TEXT NOT NULL CHECK (audience IN ('assigned_clients', 'coaches', 'clients', 'everyone')),
  message TEXT NOT NULL CHECK (char_length(trim(message)) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcast_announcements_created
  ON public.broadcast_announcements(created_at DESC);

ALTER TABLE public.broadcast_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recipients can read broadcasts" ON public.broadcast_announcements;
CREATE POLICY "Recipients can read broadcasts"
  ON public.broadcast_announcements FOR SELECT
  USING (
    public.is_owner()
    OR audience = 'everyone'
    OR (audience = 'coaches' AND EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'coach'
    ))
    OR (audience = 'clients' AND EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'client'
    ))
    OR (audience = 'assigned_clients' AND EXISTS (
      SELECT 1 FROM public.coach_clients cc
      WHERE cc.coach_id = sender_id AND cc.client_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Coaches and owners can create broadcasts" ON public.broadcast_announcements;
CREATE POLICY "Coaches and owners can create broadcasts"
  ON public.broadcast_announcements FOR INSERT
  WITH CHECK (
    (
      audience = 'assigned_clients'
      AND sender_id = auth.uid()
      AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'coach')
    )
    OR (
      audience IN ('coaches', 'clients', 'everyone')
      AND sender_id = auth.uid()
      AND public.is_owner()
    )
  );

DROP POLICY IF EXISTS "Senders can delete broadcasts" ON public.broadcast_announcements;
CREATE POLICY "Senders can delete broadcasts"
  ON public.broadcast_announcements FOR DELETE
  USING (sender_id = auth.uid() OR public.is_owner());