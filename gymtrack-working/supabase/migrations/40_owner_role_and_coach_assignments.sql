-- Let an Owner manage another Owner's role while preserving the self-change
-- safeguard, and allow approved clients plus coaches to have a coach.

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

  DELETE FROM public.coach_clients WHERE client_id = target_client_id;
  INSERT INTO public.coach_clients (coach_id, client_id)
  VALUES (new_coach_id, target_client_id);
  UPDATE public.profiles
  SET coach_id = new_coach_id, updated_at = NOW()
  WHERE id = target_client_id;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.change_user_role(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.change_user_role(UUID, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.assign_client_to_coach(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_client_to_coach(UUID, UUID) TO authenticated;