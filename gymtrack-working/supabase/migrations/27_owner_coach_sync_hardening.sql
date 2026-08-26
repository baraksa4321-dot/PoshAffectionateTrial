-- Keep the owner usable as an assigned coach and keep both sides of a
-- coach/client assignment synchronized.

CREATE OR REPLACE FUNCTION public.is_current_user_coach()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('coach', 'owner')
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
        AND client.approval_status = 'approved'
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
      SELECT 1
      FROM public.profiles p
      WHERE p.id = target_client_id
        AND p.role = 'client'
        AND p.approval_status = 'approved'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.coach_clients cc
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
  IF NOT public.is_current_user_coach() AND NOT public.is_owner() THEN
    RAISE EXCEPTION 'Access denied.';
  END IF;

  RETURN QUERY
  SELECT p.id, p.email
  FROM public.profiles p
  WHERE LOWER(p.email) = LOWER(TRIM(lookup_email))
    AND p.role = 'client'
    AND p.approval_status = 'approved'
  LIMIT 1;
END;
$$;

-- Used by the regular coach invitation flow. It updates the relationship
-- table and the reverse profile pointer in one transaction.
CREATE OR REPLACE FUNCTION public.link_client_to_current_coach(target_client_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_current_user_coach() THEN
    RAISE EXCEPTION 'Access denied. Only coaches can link clients.';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = target_client_id
      AND role = 'client'
      AND approval_status = 'approved'
  ) THEN
    RAISE EXCEPTION 'The selected user is not an approved client.';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM public.coach_clients
    WHERE client_id = target_client_id
      AND coach_id <> auth.uid()
  ) THEN
    RAISE EXCEPTION 'The client is already assigned to another coach.';
  END IF;

  INSERT INTO public.coach_clients (coach_id, client_id)
  VALUES (auth.uid(), target_client_id)
  ON CONFLICT (coach_id, client_id) DO NOTHING;

  UPDATE public.profiles
  SET coach_id = auth.uid(), updated_at = NOW()
  WHERE id = target_client_id;
  RETURN TRUE;
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
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = target_user_id AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'The Owner role cannot be changed by this function.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = target_user_id
  ) THEN
    RAISE EXCEPTION 'The selected user was not found.';
  END IF;

  IF new_role = 'client' THEN
    -- A former coach must no longer remain the reverse pointer for clients.
    UPDATE public.profiles
    SET coach_id = NULL, updated_at = NOW()
    WHERE coach_id = target_user_id;
    DELETE FROM public.coach_clients WHERE coach_id = target_user_id;
  ELSE
    -- A former client must not retain a coach assignment after becoming one.
    UPDATE public.profiles
    SET coach_id = NULL, updated_at = NOW()
    WHERE id = target_user_id;
    DELETE FROM public.coach_clients WHERE client_id = target_user_id;
  END IF;

  UPDATE public.profiles
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id;

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
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = new_coach_id
      AND role IN ('coach', 'owner')
  ) THEN
    RAISE EXCEPTION 'The selected user cannot be assigned as a coach.';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = target_client_id
      AND role = 'client'
      AND approval_status = 'approved'
  ) THEN
    RAISE EXCEPTION 'The selected user is not an approved client.';
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

DROP POLICY IF EXISTS "Coaches and owners can create broadcasts"
  ON public.broadcast_announcements;
CREATE POLICY "Coaches and owners can create broadcasts"
  ON public.broadcast_announcements FOR INSERT
  WITH CHECK (
    (
      audience = 'assigned_clients'
      AND sender_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('coach', 'owner')
      )
    )
    OR (
      audience IN ('coaches', 'clients', 'everyone')
      AND sender_id = auth.uid()
      AND public.is_owner()
    )
  );

DROP POLICY IF EXISTS "Recipients can read broadcasts"
  ON public.broadcast_announcements;
CREATE POLICY "Recipients can read broadcasts"
  ON public.broadcast_announcements FOR SELECT
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

REVOKE ALL ON FUNCTION public.link_client_to_current_coach(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_client_to_current_coach(UUID) TO authenticated;