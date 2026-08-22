-- ===================================================
-- 04_coach_system.sql: Coach ↔ Client Architecture & RLS
-- ===================================================

-- 1. Add Role & Coach ID to Profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Ensure valid role constraint
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS check_profile_role,
  ADD CONSTRAINT check_profile_role CHECK (role IN ('coach', 'client'));

-- 2. Coach-Clients Relationship Table
CREATE TABLE IF NOT EXISTS public.coach_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_coach_client UNIQUE (coach_id, client_id)
);

-- Index for relationship queries
CREATE INDEX IF NOT EXISTS idx_coach_clients_coach ON public.coach_clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_clients_client ON public.coach_clients(client_id);

-- Enable RLS on coach_clients
ALTER TABLE public.coach_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_clients
CREATE POLICY "Coaches can view their client links"
  ON public.coach_clients FOR SELECT
  USING (auth.uid() = coach_id OR auth.uid() = client_id);

CREATE POLICY "Coaches can manage client links"
  ON public.coach_clients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'coach'
    ) AND auth.uid() = coach_id
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'coach'
    ) AND auth.uid() = coach_id
  );

-- Helper security function to check if current user is coach of client_id
CREATE OR REPLACE FUNCTION public.is_coach_of(target_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coach_clients
    WHERE coach_id = auth.uid() AND client_id = target_client_id
  );
$$;

-- Secure function allowing authenticated coaches to look up a client ID by email for linking
CREATE OR REPLACE FUNCTION public.lookup_client_id_by_email(lookup_email TEXT)
RETURNS TABLE (client_id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach'
  ) THEN
    RAISE EXCEPTION 'Access denied. Only coaches can look up clients.';
  END IF;

  RETURN QUERY
  SELECT p.id AS client_id, p.email
  FROM public.profiles p
  WHERE LOWER(p.email) = LOWER(TRIM(lookup_email))
  LIMIT 1;
END;
$$;

-- 3. Extend existing RLS policies to allow coaches access to their assigned clients' data

-- Profiles RLS
CREATE POLICY "Coaches can view assigned clients profiles"
  ON public.profiles FOR SELECT
  USING (public.is_coach_of(id));

CREATE POLICY "Coaches can update assigned clients profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_coach_of(id));

-- Programs RLS
CREATE POLICY "Coaches can view assigned clients programs"
  ON public.programs FOR SELECT
  USING (public.is_coach_of(user_id));

CREATE POLICY "Coaches can manage assigned clients programs"
  ON public.programs FOR ALL
  USING (public.is_coach_of(user_id))
  WITH CHECK (public.is_coach_of(user_id));

-- Program Days RLS
CREATE POLICY "Coaches can view assigned clients program days"
  ON public.program_days FOR SELECT
  USING (public.is_coach_of(user_id));

CREATE POLICY "Coaches can manage assigned clients program days"
  ON public.program_days FOR ALL
  USING (public.is_coach_of(user_id))
  WITH CHECK (public.is_coach_of(user_id));

-- Nutrition Days RLS
CREATE POLICY "Coaches can view assigned clients nutrition"
  ON public.nutrition_days FOR SELECT
  USING (public.is_coach_of(user_id));

CREATE POLICY "Coaches can manage assigned clients nutrition"
  ON public.nutrition_days FOR ALL
  USING (public.is_coach_of(user_id))
  WITH CHECK (public.is_coach_of(user_id));

-- Workout Sessions RLS (Coaches can view client history)
CREATE POLICY "Coaches can view assigned clients workout history"
  ON public.workout_sessions FOR SELECT
  USING (public.is_coach_of(user_id));

-- Custom Foods RLS
CREATE POLICY "Coaches can manage assigned clients custom foods"
  ON public.custom_foods FOR ALL
  USING (public.is_coach_of(user_id))
  WITH CHECK (public.is_coach_of(user_id));

-- Custom Exercises RLS
CREATE POLICY "Coaches can manage assigned clients custom exercises"
  ON public.custom_exercises FOR ALL
  USING (public.is_coach_of(user_id))
  WITH CHECK (public.is_coach_of(user_id));
