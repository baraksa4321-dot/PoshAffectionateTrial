-- Allow a recipient to remove an individual coach message from their inbox.
-- Remove broad legacy variants before installing the recipient-only policy.
DROP POLICY IF EXISTS "Coaches can delete coach messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Public can delete coach messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Users can delete coach messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Clients can manage own coach messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Recipients can delete coach messages" ON public.coach_messages;
CREATE POLICY "Recipients can delete coach messages"
  ON public.coach_messages FOR DELETE
  USING (client_id = auth.uid());