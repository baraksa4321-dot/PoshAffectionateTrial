-- Store the prescribed menu once per user instead of copying it to every
-- dated nutrition log. Keep the legacy nutrition_days.planned_meals column
-- untouched so old clients can still read their cached shape during rollout.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_calories BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS planned_menu JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS check_profile_planned_menu_array,
  ADD CONSTRAINT check_profile_planned_menu_array
    CHECK (jsonb_typeof(planned_menu) = 'array');

-- Pick the newest non-empty legacy menu for users who already had a
-- date-bound prescription. Actual meals and their dates are not changed.
WITH latest_legacy_menu AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    planned_meals
  FROM public.nutrition_days
  WHERE jsonb_typeof(planned_meals) = 'array'
    AND jsonb_array_length(planned_meals) > 0
  ORDER BY user_id, updated_at DESC NULLS LAST, date DESC
)
UPDATE public.profiles AS p
SET planned_menu = latest_legacy_menu.planned_meals,
    updated_at = NOW()
FROM latest_legacy_menu
WHERE p.id = latest_legacy_menu.user_id
  AND jsonb_array_length(COALESCE(p.planned_menu, '[]'::jsonb)) = 0;

CREATE OR REPLACE FUNCTION public.prevent_protected_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF current_setting('app.allow_protected_profile_write', true) IS DISTINCT FROM 'true'
     AND NOT (
       auth.uid() = OLD.id
       AND OLD.role IN ('coach', 'owner')
     )
     AND (
       NEW.show_calories IS DISTINCT FROM OLD.show_calories
       OR NEW.planned_menu IS DISTINCT FROM OLD.planned_menu
     ) THEN
    RAISE EXCEPTION 'Protected profile fields can only be changed by an authorized coach.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_protected_profile_update ON public.profiles;
CREATE TRIGGER tr_prevent_protected_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_protected_profile_update();

CREATE OR REPLACE FUNCTION public.can_manage_calorie_visibility(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT
    public.is_owner()
    OR (
      target_user_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role IN ('coach', 'owner')
      )
    )
    OR public.is_coach_of(target_user_id);
$$;

CREATE OR REPLACE FUNCTION public.set_user_calorie_visibility(
  target_user_id UUID,
  show_calories_enabled BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.can_manage_calorie_visibility(target_user_id) THEN
    RAISE EXCEPTION 'Access denied. Only the user''s coach or the Owner can change calorie visibility.';
  END IF;

  PERFORM set_config('app.allow_protected_profile_write', 'true', true);
  UPDATE public.profiles
  SET show_calories = show_calories_enabled,
      updated_at = NOW()
  WHERE id = target_user_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_user_planned_menu(
  target_user_id UUID,
  next_planned_menu JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF jsonb_typeof(next_planned_menu) <> 'array' THEN
    RAISE EXCEPTION 'The planned menu must be a JSON array.';
  END IF;
  IF NOT public.can_manage_calorie_visibility(target_user_id) THEN
    RAISE EXCEPTION 'Access denied. Only the user''s coach or the Owner can edit a planned menu.';
  END IF;

  PERFORM set_config('app.allow_protected_profile_write', 'true', true);
  UPDATE public.profiles
  SET planned_menu = next_planned_menu,
      updated_at = NOW()
  WHERE id = target_user_id;
  RETURN FOUND;
END;
$$;

-- Keep the original three-argument approval RPC compatible, while exposing a
-- four-argument variant for the Owner's explicit calorie-visibility choice.
CREATE OR REPLACE FUNCTION public.approve_client_registration_with_visibility(
  target_client_id UUID,
  approved_full_name TEXT,
  assigned_coach_id UUID,
  show_calories_enabled BOOLEAN
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

  PERFORM set_config('app.allow_protected_profile_write', 'true', true);
  UPDATE public.profiles
  SET full_name = trim(approved_full_name),
      coach_id = assigned_coach_id,
      approval_status = 'approved',
      show_calories = show_calories_enabled,
      updated_at = NOW()
  WHERE id = target_client_id;

  DELETE FROM public.coach_clients WHERE client_id = target_client_id;
  INSERT INTO public.coach_clients (coach_id, client_id)
  VALUES (assigned_coach_id, target_client_id);
  INSERT INTO public.coach_change_history (coach_id, client_id, change_description)
  VALUES (auth.uid(), target_client_id, 'אישור הרשמה, שם מלא, שיוך והגדרת תצוגת קלוריות');
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.can_manage_calorie_visibility(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_user_calorie_visibility(UUID, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_user_planned_menu(UUID, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_client_registration_with_visibility(UUID, TEXT, UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_manage_calorie_visibility(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_calorie_visibility(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_user_planned_menu(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_client_registration_with_visibility(UUID, TEXT, UUID, BOOLEAN) TO authenticated;