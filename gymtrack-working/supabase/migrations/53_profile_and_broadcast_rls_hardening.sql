-- Close additive RLS gaps left by the original coach/profile and broadcast
-- policies. Direct profile updates may still edit ordinary body/profile fields,
-- but role, assignment, and approval state are owner/RPC-only.

CREATE OR REPLACE FUNCTION public.prevent_role_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (
    NEW.role IS DISTINCT FROM OLD.role
    OR NEW.coach_id IS DISTINCT FROM OLD.coach_id
    OR NEW.approval_status IS DISTINCT FROM OLD.approval_status
  ) AND NOT public.is_owner() THEN
    RAISE EXCEPTION
      'Access denied: role, coach assignment, and approval changes are owner-only.';
  END IF;
  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS "Recipients can read broadcasts"
  ON public.broadcast_announcements;
CREATE POLICY "Recipients can read broadcasts"
  ON public.broadcast_announcements FOR SELECT
  TO authenticated
  USING (
    public.is_owner()
    OR audience = 'everyone'
    OR (audience = 'coaches' AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('coach', 'owner')
    ))
    OR (audience = 'clients' AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'client'
    ))
    OR (audience = 'assigned_clients' AND EXISTS (
      SELECT 1
      FROM public.coach_clients cc
      WHERE cc.coach_id = sender_id AND cc.client_id = auth.uid()
    ))
  );