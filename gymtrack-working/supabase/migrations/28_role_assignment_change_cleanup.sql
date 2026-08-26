-- Keep role transitions from retaining stale links in either direction.

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