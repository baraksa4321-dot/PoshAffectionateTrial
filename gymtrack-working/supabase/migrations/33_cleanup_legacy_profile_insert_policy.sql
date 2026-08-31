-- RLS policies are additive. Remove any legacy self-insert policy so it
-- cannot bypass the constrained registration profile policy.

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own pending client profile" ON public.profiles;

CREATE POLICY "Users can insert own pending client profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND role = 'client'
    AND approval_status = 'pending'
  );