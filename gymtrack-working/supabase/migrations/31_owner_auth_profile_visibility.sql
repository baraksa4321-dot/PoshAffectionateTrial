-- Let the Owner diagnose Auth accounts that are missing their public profile.
-- auth.users is only read inside these Owner-only SECURITY DEFINER functions;
-- it is never exposed to browser code or non-Owner callers.

CREATE OR REPLACE FUNCTION public.list_owner_auth_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  email_confirmed_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  profile_exists BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
AS $$
  SELECT
    u.id,
    u.email,
    u.email_confirmed_at,
    u.last_sign_in_at,
    u.created_at,
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = u.id
    ) AS profile_exists
  FROM auth.users u
  WHERE public.is_owner()
  ORDER BY u.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.repair_missing_client_profile(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  target_email TEXT;
  target_full_name TEXT;
  target_gender TEXT;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Access denied. Only the Owner can repair missing profiles.';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'The current Owner profile cannot be repaired by this function.';
  END IF;

  SELECT
    u.email,
    NULLIF(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    CASE
      WHEN u.raw_user_meta_data ->> 'gender' IN ('male', 'female')
        THEN u.raw_user_meta_data ->> 'gender'
      ELSE NULL
    END
  INTO target_email, target_full_name, target_gender
  FROM auth.users u
  WHERE u.id = target_user_id;

  IF target_email IS NULL THEN
    RAISE EXCEPTION 'The selected Auth account was not found.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = target_user_id
  ) THEN
    RAISE EXCEPTION 'The selected user already has a profile.';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    gender,
    role,
    approval_status,
    today_routine_enabled,
    show_calories,
    planned_menu,
    updated_at
  )
  VALUES (
    target_user_id,
    target_email,
    target_full_name,
    target_gender,
    'client',
    'pending',
    TRUE,
    TRUE,
    '[]'::jsonb,
    NOW()
  );

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.list_owner_auth_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_owner_auth_users() TO authenticated;
REVOKE ALL ON FUNCTION public.repair_missing_client_profile(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.repair_missing_client_profile(UUID) TO authenticated;