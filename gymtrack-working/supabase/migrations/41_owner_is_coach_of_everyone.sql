-- Every Owner is an additional coach for every profile. Coaches and Owners
-- also retain a self relationship, while their optional additional coach
-- remains separate from profiles.coach_id.

CREATE OR REPLACE FUNCTION public.enforce_staff_self_coach()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role IN ('coach', 'owner') THEN
    NEW.coach_id := NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_enforce_staff_self_coach ON public.profiles;
CREATE TRIGGER tr_enforce_staff_self_coach
  BEFORE INSERT OR UPDATE OF role, coach_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_staff_self_coach();

CREATE OR REPLACE FUNCTION public.ensure_owner_coach_links()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.coach_clients (coach_id, client_id)
  SELECT owner_profile.id, NEW.id
  FROM public.profiles owner_profile
  WHERE owner_profile.role = 'owner'
  ON CONFLICT (coach_id, client_id) DO NOTHING;

  IF NEW.role IN ('coach', 'owner') THEN
    INSERT INTO public.coach_clients (coach_id, client_id)
    VALUES (NEW.id, NEW.id)
    ON CONFLICT (coach_id, client_id) DO NOTHING;
  END IF;

  IF NEW.role = 'owner' THEN
    INSERT INTO public.coach_clients (coach_id, client_id)
    SELECT NEW.id, profile.id
    FROM public.profiles profile
    ON CONFLICT (coach_id, client_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_ensure_owner_coach_links ON public.profiles;
CREATE TRIGGER tr_ensure_owner_coach_links
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_owner_coach_links();

-- Keep existing profiles aligned with the invariant before future writes.
-- The protected-profile trigger intentionally rejects unauthenticated direct
-- role/coach writes. Temporarily remove only that trigger for this migration's
-- one-time backfill, then restore it unchanged.
DROP TRIGGER IF EXISTS tr_prevent_role_self_update ON public.profiles;

UPDATE public.profiles
SET coach_id = id, updated_at = NOW()
WHERE role IN ('coach', 'owner')
  AND coach_id IS DISTINCT FROM id;

INSERT INTO public.coach_clients (coach_id, client_id)
SELECT owner_profile.id, profile.id
FROM public.profiles owner_profile
CROSS JOIN public.profiles profile
WHERE owner_profile.role = 'owner'
ON CONFLICT (coach_id, client_id) DO NOTHING;

INSERT INTO public.coach_clients (coach_id, client_id)
SELECT profile.id, profile.id
FROM public.profiles profile
WHERE profile.role IN ('coach', 'owner')
ON CONFLICT (coach_id, client_id) DO NOTHING;

CREATE TRIGGER tr_prevent_role_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_update();

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
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'The Owner role cannot be changed for the current user.';
  END IF;
  IF new_role NOT IN ('owner', 'coach', 'client') THEN
    RAISE EXCEPTION 'Invalid role specified.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = target_user_id
  ) THEN
    RAISE EXCEPTION 'The selected user was not found.';
  END IF;

  UPDATE public.profiles
  SET coach_id = NULL, updated_at = NOW()
  WHERE id = target_user_id
     OR coach_id = target_user_id;

  DELETE FROM public.coach_clients
  WHERE coach_id = target_user_id
     OR client_id = target_user_id;

  UPDATE public.profiles
  SET role = new_role,
      coach_id = CASE WHEN new_role IN ('coach', 'owner') THEN target_user_id ELSE NULL END,
      updated_at = NOW()
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
DECLARE
  target_role TEXT;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Access denied. Only the Owner can reassign users.';
  END IF;
  IF new_coach_id = target_client_id THEN
    RAISE EXCEPTION 'A user cannot be assigned to themselves as a coach.';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = new_coach_id
      AND role IN ('coach', 'owner')
  ) THEN
    RAISE EXCEPTION 'The selected user cannot be assigned as a coach.';
  END IF;

  SELECT role INTO target_role
  FROM public.profiles
  WHERE id = target_client_id;

  IF target_role IS NULL OR target_role NOT IN ('client', 'coach') THEN
    RAISE EXCEPTION 'Only clients and coaches can be assigned a coach.';
  END IF;
  IF target_role = 'client' AND NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = target_client_id
      AND approval_status = 'approved'
  ) THEN
    RAISE EXCEPTION 'The selected client is not approved.';
  END IF;

  -- The Owner's automatic link is additional and must survive reassignment.
  DELETE FROM public.coach_clients existing_link
  WHERE existing_link.client_id = target_client_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.profiles owner_profile
      WHERE owner_profile.id = existing_link.coach_id
        AND owner_profile.role = 'owner'
    );

  INSERT INTO public.coach_clients (coach_id, client_id)
  VALUES (new_coach_id, target_client_id)
  ON CONFLICT (coach_id, client_id) DO NOTHING;

  UPDATE public.profiles
  SET coach_id = CASE
    WHEN target_role = 'coach' THEN target_client_id
    ELSE new_coach_id
  END,
      updated_at = NOW()
  WHERE id = target_client_id;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_owner_profile_coach(new_coach_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Access denied. Only the Owner can choose a coach for the Owner profile.';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = new_coach_id
      AND role IN ('coach', 'owner')
  ) THEN
    RAISE EXCEPTION 'The selected user cannot be assigned as the Owner profile coach.';
  END IF;

  DELETE FROM public.coach_clients existing_link
  WHERE existing_link.client_id = auth.uid()
    AND existing_link.coach_id <> auth.uid()
    AND NOT EXISTS (
      SELECT 1
      FROM public.profiles owner_profile
      WHERE owner_profile.id = existing_link.coach_id
        AND owner_profile.role = 'owner'
    );

  INSERT INTO public.coach_clients (coach_id, client_id)
  VALUES (new_coach_id, auth.uid())
  ON CONFLICT (coach_id, client_id) DO NOTHING;

  UPDATE public.profiles
  SET coach_id = auth.uid(),
      updated_at = NOW()
  WHERE id = auth.uid()
    AND role = 'owner';

  RETURN FOUND;
END;
$$;

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
    FROM public.coach_clients existing_link
    WHERE existing_link.client_id = target_client_id
      AND existing_link.coach_id <> auth.uid()
      AND NOT EXISTS (
        SELECT 1
        FROM public.profiles owner_profile
        WHERE owner_profile.id = existing_link.coach_id
          AND owner_profile.role = 'owner'
      )
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
      FROM public.coach_clients existing_link
      WHERE existing_link.client_id = target_client_id
        AND existing_link.coach_id <> target_coach_id
        AND NOT EXISTS (
          SELECT 1
          FROM public.profiles owner_profile
          WHERE owner_profile.id = existing_link.coach_id
            AND owner_profile.role = 'owner'
        )
    );
$$;

REVOKE ALL ON FUNCTION public.enforce_staff_self_coach() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enforce_staff_self_coach() TO authenticated;
REVOKE ALL ON FUNCTION public.ensure_owner_coach_links() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_owner_coach_links() TO authenticated;
REVOKE ALL ON FUNCTION public.change_user_role(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.change_user_role(UUID, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.assign_client_to_coach(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_client_to_coach(UUID, UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.assign_owner_profile_coach(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_owner_profile_coach(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.link_client_to_current_coach(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_client_to_current_coach(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.can_link_client(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_link_client(UUID, UUID) TO authenticated;