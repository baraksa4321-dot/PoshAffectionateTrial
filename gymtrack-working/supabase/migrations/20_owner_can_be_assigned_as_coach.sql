-- The owner may also be selected as the responsible coach for a client.

CREATE OR REPLACE FUNCTION public.approve_client_registration(
  target_client_id UUID,
  approved_full_name TEXT,
  assigned_coach_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Access denied. Only the Owner can approve registrations.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = target_client_id
      AND role = 'client'
      AND approval_status = 'pending'
  ) THEN
    RAISE EXCEPTION 'The selected registration is not pending approval.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = assigned_coach_id AND role IN ('coach', 'owner')
  ) THEN
    RAISE EXCEPTION 'The selected user cannot be assigned as a coach.';
  END IF;

  IF length(trim(approved_full_name)) < 3
     OR array_length(regexp_split_to_array(trim(approved_full_name), '\s+'), 1) < 2 THEN
    RAISE EXCEPTION 'A full first and last name is required.';
  END IF;

  UPDATE public.profiles
  SET full_name = trim(approved_full_name),
      coach_id = assigned_coach_id,
      approval_status = 'approved',
      updated_at = NOW()
  WHERE id = target_client_id;

  DELETE FROM public.coach_clients
  WHERE client_id = target_client_id;

  INSERT INTO public.coach_clients (coach_id, client_id)
  VALUES (assigned_coach_id, target_client_id);

  INSERT INTO public.coach_change_history (coach_id, client_id, change_description)
  VALUES (auth.uid(), target_client_id, 'אישור הרשמה, שם מלא ושיוך למאמן');

  RETURN TRUE;
END;
$$;