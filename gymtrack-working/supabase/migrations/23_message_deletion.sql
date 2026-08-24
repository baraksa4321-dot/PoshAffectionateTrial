-- Allow a recipient to remove an individual coach message from their inbox.
DROP POLICY IF EXISTS "Recipients can delete coach messages" ON public.coach_messages;
CREATE POLICY "Recipients can delete coach messages"
  ON public.coach_messages FOR DELETE
  USING (client_id = auth.uid());