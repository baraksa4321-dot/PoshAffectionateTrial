-- ===================================================
-- 12_cardio_logs.sql: Durable cardio history with role-scoped reads
-- ===================================================

CREATE TABLE IF NOT EXISTS public.cardio_logs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (char_length(trim(type)) > 0),
  duration_min NUMERIC(7,2) NOT NULL CHECK (duration_min > 0 AND duration_min <= 1440),
  intensity TEXT CHECK (intensity IN ('low', 'moderate', 'high')),
  speed_kmh NUMERIC(6,2) CHECK (speed_kmh IS NULL OR speed_kmh >= 0),
  incline_pct NUMERIC(6,2) CHECK (incline_pct IS NULL OR incline_pct >= 0),
  distance_km NUMERIC(7,2) CHECK (distance_km IS NULL OR distance_km >= 0),
  calories INTEGER NOT NULL CHECK (calories >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cardio_logs_user_date
  ON public.cardio_logs(user_id, date DESC);

ALTER TABLE public.cardio_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cardio logs" ON public.cardio_logs;
CREATE POLICY "Users can manage own cardio logs"
  ON public.cardio_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Coaches can view assigned clients cardio logs" ON public.cardio_logs;
CREATE POLICY "Coaches can view assigned clients cardio logs"
  ON public.cardio_logs FOR SELECT
  USING (public.is_coach_of(user_id));

DROP POLICY IF EXISTS "Owner can view all cardio logs" ON public.cardio_logs;
CREATE POLICY "Owner can view all cardio logs"
  ON public.cardio_logs FOR SELECT
  USING (public.is_owner());