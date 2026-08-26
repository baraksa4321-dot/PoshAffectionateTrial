-- Senders need to see their own broadcasts in the management screen so they
-- can remove them for every recipient. This does not broaden recipient access.
DROP POLICY IF EXISTS "Senders can read broadcasts" ON public.broadcast_announcements;
CREATE POLICY "Senders can read broadcasts"
  ON public.broadcast_announcements FOR SELECT
  USING (sender_id = auth.uid());