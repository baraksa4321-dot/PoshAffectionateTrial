-- ===================================================
-- 01_schema.sql: Relational Schema Definition for GymTrack
-- ===================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  rmr_kcal INTEGER,
  tdee_kcal INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Exercises Table (Built-in Library)
CREATE TABLE IF NOT EXISTS public.exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  english_name TEXT,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  category TEXT,
  description TEXT,
  instructions TEXT,
  video_url TEXT,
  search_aliases TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Custom Exercises Table (User-Created)
CREATE TABLE IF NOT EXISTS public.custom_exercises (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  english_name TEXT,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  category TEXT,
  description TEXT,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Programs Table
CREATE TABLE IF NOT EXISTS public.programs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Program Days Table
CREATE TABLE IF NOT EXISTS public.program_days (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Workout Sessions Table (Completed & History)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_id TEXT,
  workout_name TEXT NOT NULL,
  program_name TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_sec INTEGER NOT NULL DEFAULT 0,
  entries JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Foods Table (Built-in Israeli Food Database)
CREATE TABLE IF NOT EXISTS public.foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  english_name TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  serving_unit TEXT DEFAULT '100g',
  serving_grams NUMERIC(7,2) DEFAULT 100,
  calories INTEGER NOT NULL DEFAULT 0,
  protein NUMERIC(6,2) NOT NULL DEFAULT 0,
  carbs NUMERIC(6,2) NOT NULL DEFAULT 0,
  fat NUMERIC(6,2) NOT NULL DEFAULT 0,
  fiber NUMERIC(6,2) DEFAULT 0,
  search_aliases TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Custom Foods Table (User-Created)
CREATE TABLE IF NOT EXISTS public.custom_foods (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  english_name TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  serving_unit TEXT DEFAULT '100g',
  serving_grams NUMERIC(7,2) DEFAULT 100,
  calories INTEGER NOT NULL DEFAULT 0,
  protein NUMERIC(6,2) NOT NULL DEFAULT 0,
  carbs NUMERIC(6,2) NOT NULL DEFAULT 0,
  fat NUMERIC(6,2) NOT NULL DEFAULT 0,
  fiber NUMERIC(6,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Nutrition Days Table (Daily Meal Logs)
CREATE TABLE IF NOT EXISTS public.nutrition_days (
  id TEXT PRIMARY KEY, -- Format: YYYY-MM-DD or UUID
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  water_ml INTEGER DEFAULT 0,
  target_calories INTEGER DEFAULT 2000,
  meals JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- 10. Food Favorites Table
CREATE TABLE IF NOT EXISTS public.food_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  food_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_food_fav UNIQUE (user_id, food_id)
);

-- Indexes for Fast Queries
CREATE INDEX IF NOT EXISTS idx_custom_exercises_user_id ON public.custom_exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_programs_user_id ON public.programs(user_id);
CREATE INDEX IF NOT EXISTS idx_program_days_program_id ON public.program_days(program_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id_date ON public.workout_sessions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_custom_foods_user_id ON public.custom_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_days_user_date ON public.nutrition_days(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_food_favorites_user_id ON public.food_favorites(user_id);
