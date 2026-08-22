-- ===================================================
-- 11_role_and_rpc_hardening.sql
-- Additive security hardening for the existing Owner/Coach/Client model.
-- This migration does not recreate tables or modify application data.
-- ===================================================

-- SECURITY DEFINER helpers must not inherit a caller-controlled search path.
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_coach()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'coach'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_coach_of(target_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT public.is_current_user_coach()
    AND EXISTS (
      SELECT 1
      FROM public.coach_clients cc
      JOIN public.profiles client ON client.id = cc.client_id
      WHERE cc.coach_id = auth.uid()
        AND cc.client_id = target_client_id
        AND client.role = 'client'
    );
$$;

CREATE OR REPLACE FUNCTION public.can_link_client(target_client_id UUID, target_coach_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT target_coach_id = auth.uid()
    AND public.is_current_user_coach()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = target_client_id AND p.role = 'client'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.coach_clients cc
      WHERE cc.client_id = target_client_id
        AND cc.coach_id <> target_coach_id
    );
$$;

CREATE OR REPLACE FUNCTION public.lookup_client_id_by_email(lookup_email TEXT)
RETURNS TABLE (client_id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT (public.is_current_user_coach() OR public.is_owner()) THEN
    RAISE EXCEPTION 'Access denied.';
  END IF;

  RETURN QUERY
  SELECT p.id, p.email
  FROM public.profiles p
  WHERE LOWER(p.email) = LOWER(TRIM(lookup_email))
    AND p.role = 'client'
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.change_user_role(target_user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Access denied. Only the Owner can change user roles.';
  END IF;
  IF new_role NOT IN ('coach', 'client') THEN
    RAISE EXCEPTION 'Invalid role specified.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND role = 'owner') THEN
    RAISE EXCEPTION 'The Owner role cannot be changed by this function.';
  END IF;

  UPDATE public.profiles
  SET role = new_role, coach_id = CASE WHEN new_role = 'coach' THEN NULL ELSE coach_id END,
      updated_at = NOW()
  WHERE id = target_user_id;

  -- A non-coach may not retain coach assignments; a non-client may not remain assigned.
  IF new_role = 'client' THEN
    DELETE FROM public.coach_clients WHERE coach_id = target_user_id;
  ELSE
    DELETE FROM public.coach_clients WHERE client_id = target_user_id;
  END IF;

  INSERT INTO public.coach_change_history (coach_id, client_id, change_description)
  VALUES (auth.uid(), target_user_id, 'שינוי הרשאת תפקיד ל-' || new_role);
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_client_to_coach(target_client_id UUID, new_coach_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Access denied. Only the Owner can reassign clients.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = new_coach_id AND role = 'coach') THEN
    RAISE EXCEPTION 'The selected user is not a coach.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_client_id AND role = 'client') THEN
    RAISE EXCEPTION 'The selected user is not a client.';
  END IF;

  DELETE FROM public.coach_clients WHERE client_id = target_client_id;
  INSERT INTO public.coach_clients (coach_id, client_id)
  VALUES (new_coach_id, target_client_id);
  UPDATE public.profiles
  SET coach_id = new_coach_id, updated_at = NOW()
  WHERE id = target_client_id;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_role_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.coach_id IS DISTINCT FROM OLD.coach_id THEN
    IF NOT public.is_owner() THEN
      RAISE EXCEPTION 'Access denied: role and coach assignment changes are owner-only.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Keep direct relationship management restricted to valid coaches and clients.
DROP POLICY IF EXISTS "Coaches can manage client links" ON public.coach_clients;
DROP POLICY IF EXISTS "Owner can manage all coach_clients links" ON public.coach_clients;
CREATE POLICY "Coaches can manage valid client links"
  ON public.coach_clients FOR ALL
  USING (auth.uid() = coach_id AND public.is_current_user_coach())
  WITH CHECK (public.can_link_client(client_id, coach_id));

CREATE POLICY "Owner can view all coach-client links"
  ON public.coach_clients FOR SELECT
  USING (public.is_owner());

-- Owners use the audited RPCs above instead of a broad direct profile update.
DROP POLICY IF EXISTS "Owner can update all profiles" ON public.profiles;

-- Only actual coaches assigned to the client may send a message.
DROP POLICY IF EXISTS "Coaches can insert coach messages" ON public.coach_messages;
CREATE POLICY "Assigned coaches can insert coach messages"
  ON public.coach_messages FOR INSERT
  WITH CHECK (auth.uid() = coach_id AND public.is_coach_of(client_id));

REVOKE ALL ON FUNCTION public.is_owner() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_current_user_coach() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_coach_of(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_link_client(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lookup_client_id_by_email(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.change_user_role(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.assign_client_to_coach(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_owner() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_coach() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_coach_of(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_link_client(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_client_id_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.change_user_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_client_to_coach(UUID, UUID) TO authenticated;