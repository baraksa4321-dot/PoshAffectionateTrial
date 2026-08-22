-- ===================================================
-- 07_owner_role.sql: OWNER → COACH → CLIENT Security & Role RPCs
-- ===================================================

-- 1. Update Profile Role Constraint to allow 'owner', 'coach', 'client'
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS check_profile_role,
  ADD CONSTRAINT check_profile_role CHECK (role IN ('owner', 'coach', 'client'));

-- Ensure default role for all new accounts is strictly 'client'
ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT 'client';

-- 2. Helper Security Function: Is Current User Owner?
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  );
$$;

-- 3. Secure RPC: Change User Role (OWNER-ONLY)
CREATE OR REPLACE FUNCTION public.change_user_role(target_user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify Caller is Owner
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Access denied. Only the Owner can change user roles.';
  END IF;

  -- Verify valid target role
  IF new_role NOT IN ('coach', 'client') THEN
    RAISE EXCEPTION 'Invalid role specified. Only coach or client roles can be assigned.';
  END IF;

  -- Update Role
  UPDATE public.profiles
  SET role = new_role,
      updated_at = NOW()
  WHERE id = target_user_id;

  -- Record in Change History
  INSERT INTO public.coach_change_history (coach_id, client_id, change_description)
  VALUES (auth.uid(), target_user_id, 'שינוי הרשאת תפקיד ל-' || new_role);

  RETURN TRUE;
END;
$$;

-- 4. Secure RPC: Assign / Reassign Client to Coach (OWNER-ONLY)
CREATE OR REPLACE FUNCTION public.assign_client_to_coach(target_client_id UUID, new_coach_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify Caller is Owner
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Access denied. Only the Owner can reassign clients.';
  END IF;

  -- Upsert Coach-Client Link
  INSERT INTO public.coach_clients (coach_id, client_id)
  VALUES (new_coach_id, target_client_id)
  ON CONFLICT (coach_id, client_id) DO NOTHING;

  -- Update Client's Coach ID in Profile
  UPDATE public.profiles
  SET coach_id = new_coach_id,
      updated_at = NOW()
  WHERE id = target_client_id;

  RETURN TRUE;
END;
$$;

-- 5. Extend RLS Policies for Owner

-- Owner can view and update all profiles
CREATE POLICY "Owner can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_owner());

CREATE POLICY "Owner can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_owner());

-- Owner can view and manage all coach-client links
CREATE POLICY "Owner can manage all coach_clients links"
  ON public.coach_clients FOR ALL
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

-- Owner can view all programs and workouts across platform
CREATE POLICY "Owner can view all programs"
  ON public.programs FOR SELECT
  USING (public.is_owner());

CREATE POLICY "Owner can view all program days"
  ON public.program_days FOR SELECT
  USING (public.is_owner());

CREATE POLICY "Owner can view all workout sessions"
  ON public.workout_sessions FOR SELECT
  USING (public.is_owner());
