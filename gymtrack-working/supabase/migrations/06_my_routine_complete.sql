-- ===================================================
-- 06_my_routine_complete.sql: Full Consolidated Schema
-- ===================================================

-- 1. Profile Extensions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS food_preferences JSONB DEFAULT '{"liked":[],"disliked":[]}'::jsonb,
  ADD COLUMN IF NOT EXISTS today_routine_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS next_checkin_date DATE;

-- 2. Coach Messages Table
CREATE TABLE IF NOT EXISTS public.coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Workout Client Feedback Table
CREATE TABLE IF NOT EXISTS public.client_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  workout_id TEXT,
  difficulty_rating TEXT NOT NULL, -- 'easy', 'appropriate', 'difficult'
  discomfort_notes TEXT,
  coach_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Coach Change History Table
CREATE TABLE IF NOT EXISTS public.coach_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  change_description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Coach Recipe Library Table
CREATE TABLE IF NOT EXISTS public.coach_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  foods JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clients can view own coach messages"
  ON public.coach_messages FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = coach_id);

CREATE POLICY "Coaches can insert coach messages"
  ON public.coach_messages FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Clients can manage own feedback"
  ON public.client_feedback FOR ALL
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Coaches can view assigned clients feedback"
  ON public.client_feedback FOR SELECT
  USING (public.is_coach_of(client_id));

CREATE POLICY "Coaches can manage change history"
  ON public.coach_change_history FOR ALL
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Clients can view change history for them"
  ON public.coach_change_history FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Coaches can manage own recipe library"
  ON public.coach_recipes FOR ALL
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);
