-- Personal custom foods stay private until a coach or owner approves them.
ALTER TABLE public.custom_foods
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_custom_foods_approval_status
  ON public.custom_foods(approval_status);

DROP POLICY IF EXISTS "Users can manage own custom foods" ON public.custom_foods;
DROP POLICY IF EXISTS "Coaches can manage assigned clients custom foods" ON public.custom_foods;
DROP POLICY IF EXISTS "Approved custom foods are public" ON public.custom_foods;
DROP POLICY IF EXISTS "Coaches can review assigned custom foods" ON public.custom_foods;

CREATE POLICY "Users can view own custom foods"
  ON public.custom_foods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit own custom foods"
  ON public.custom_foods FOR INSERT
  WITH CHECK (auth.uid() = user_id AND approval_status = 'pending');

CREATE POLICY "Users can edit pending custom foods"
  ON public.custom_foods FOR UPDATE
  USING (auth.uid() = user_id AND approval_status = 'pending')
  WITH CHECK (auth.uid() = user_id AND approval_status = 'pending');

CREATE POLICY "Approved custom foods are public"
  ON public.custom_foods FOR SELECT
  TO authenticated
  USING (approval_status = 'approved');

CREATE POLICY "Coaches can review assigned custom foods"
  ON public.custom_foods FOR SELECT
  USING (public.is_coach_of(user_id));

CREATE POLICY "Coaches can approve assigned custom foods"
  ON public.custom_foods FOR UPDATE
  USING (public.is_coach_of(user_id))
  WITH CHECK (
    public.is_coach_of(user_id)
    AND approval_status IN ('approved', 'rejected')
    AND approved_by = auth.uid()
  );

CREATE POLICY "Owners can approve any custom food"
  ON public.custom_foods FOR UPDATE
  USING (public.is_owner())
  WITH CHECK (
    public.is_owner()
    AND approval_status IN ('approved', 'rejected')
    AND approved_by = auth.uid()
  );