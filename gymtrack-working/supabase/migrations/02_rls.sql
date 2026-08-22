-- ===================================================
-- 02_rls.sql: Row Level Security Policies for GymTrack
-- ===================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_favorites ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Exercises Table (Public Read, No Public Writes)
CREATE POLICY "Public exercises are viewable by all authenticated users"
  ON public.exercises FOR SELECT
  TO authenticated, anon
  USING (true);

-- 3. Custom Exercises RLS
CREATE POLICY "Users can manage own custom exercises"
  ON public.custom_exercises FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Programs RLS
CREATE POLICY "Users can manage own programs"
  ON public.programs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Program Days RLS
CREATE POLICY "Users can manage own program days"
  ON public.program_days FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Workout Sessions RLS
CREATE POLICY "Users can manage own workout sessions"
  ON public.workout_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Foods Table (Public Read, No Public Writes)
CREATE POLICY "Public foods are viewable by all authenticated users"
  ON public.foods FOR SELECT
  TO authenticated, anon
  USING (true);

-- 8. Custom Foods RLS
CREATE POLICY "Users can manage own custom foods"
  ON public.custom_foods FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. Nutrition Days RLS
CREATE POLICY "Users can manage own nutrition logs"
  ON public.nutrition_days FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 10. Food Favorites RLS
CREATE POLICY "Users can manage own favorites"
  ON public.food_favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
