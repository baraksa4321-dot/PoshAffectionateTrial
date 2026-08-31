-- A newly authenticated user may provision only their own pending client
-- profile. Owners use the protected repair/approval RPCs instead.

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own pending client profile"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id
    AND role = 'client'
    AND approval_status = 'pending'
  );