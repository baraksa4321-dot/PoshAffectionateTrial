-- Allow the Owner to select an approved coach for the Owner's own profile.
-- This is intentionally a narrow RPC: it does not change roles, RLS policies,
-- relationship rows, or any schema objects.

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
      AND (role = 'coach' OR id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'The selected user cannot be assigned as the Owner profile coach.';
  END IF;

  UPDATE public.profiles
  SET coach_id = new_coach_id,
      updated_at = NOW()
  WHERE id = auth.uid()
    AND role = 'owner';

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_owner_profile_coach(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_owner_profile_coach(UUID) TO authenticated;