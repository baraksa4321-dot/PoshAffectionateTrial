-- ===================================================
-- 05_coach_platform.sql: Advanced Coach Platform Schema & RLS
-- ===================================================

-- 1. Body Measurements Table
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  chest_cm NUMERIC(5,2),
  waist_cm NUMERIC(5,2),
  hips_cm NUMERIC(5,2),
  biceps_cm NUMERIC(5,2),
  thighs_cm NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_measurement_date UNIQUE (user_id, date)
);

-- 2. Client Habit Streaks & Reminders Table
CREATE TABLE IF NOT EXISTS public.client_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  water_ml INTEGER DEFAULT 0,
  water_target_ml INTEGER DEFAULT 2500,
  steps INTEGER DEFAULT 0,
  steps_target INTEGER DEFAULT 8000,
  weigh_in_done BOOLEAN DEFAULT false,
  workout_done BOOLEAN DEFAULT false,
  busy_day_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_habit_date UNIQUE (user_id, date)
);

-- Enable RLS
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_habits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Measurements
CREATE POLICY "Users can manage own body measurements"
  ON public.body_measurements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view assigned clients measurements"
  ON public.body_measurements FOR SELECT
  USING (public.is_coach_of(user_id));

-- RLS Policies for Habits
CREATE POLICY "Users can manage own habits"
  ON public.client_habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view assigned clients habits"
  ON public.client_habits FOR SELECT
  USING (public.is_coach_of(user_id));

-- Public read access to built-in exercise library for all users
DROP POLICY IF EXISTS "Public exercises are viewable by all authenticated users" ON public.exercises;
DROP POLICY IF EXISTS "Coaches can access full exercise library" ON public.exercises;

CREATE POLICY "Exercises viewable by all users"
  ON public.exercises FOR SELECT
  TO authenticated, anon
  USING (true);
