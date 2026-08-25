-- Owner-only registration rejection and account deletion.
-- Account deletion goes through auth.users so the profile and all cascaded
-- user-owned records are removed together.

CREATE OR REPLACE FUNCTION public.reject_client_registration(target_client_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Access denied. Only the Owner can reject registrations.';
  END IF;

  UPDATE public.profiles
  SET approval_status = 'rejected',
      coach_id = NULL,
      updated_at = NOW()
  WHERE id = target_client_id
    AND role = 'client'
    AND approval_status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The selected registration is not pending approval.';
  END IF;

  DELETE FROM public.coach_clients
  WHERE client_id = target_client_id;

  INSERT INTO public.coach_change_history (coach_id, client_id, change_description)
  VALUES (auth.uid(), target_client_id, 'דחיית הרשמת מתאמן');

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Access denied. Only the Owner can delete users.';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'The current Owner account cannot be deleted.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = target_user_id AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Another Owner account cannot be deleted.';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'The selected user was not found.';
  END IF;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.reject_client_registration(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_client_registration(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.delete_user_account(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO authenticated;