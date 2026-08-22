-- ===================================================
-- 09_security_fixes.sql: Security Fix for Profile Role Self-Escalation
-- ===================================================

-- 1. Drop insecure UPDATE policy on profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Create secure UPDATE policy enforcing WITH CHECK constraint
-- Users can update their own profile, but CANNOT alter their role column!
-- Changing roles MUST go through the owner-only SECURITY DEFINER RPC `change_user_role`.
CREATE POLICY "Users can update own profile non-sensitive fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- Role cannot be changed by user, or must equal existing role, or caller is Owner
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
      OR public.is_owner()
    )
  );

-- 3. Trigger Guard: Prevent direct UPDATE on role column unless called by Owner or RPC
CREATE OR REPLACE FUNCTION public.prevent_role_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_owner() THEN
      RAISE EXCEPTION 'Access Denied: Only the Owner can change user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_role_self_update ON public.profiles;
CREATE TRIGGER tr_prevent_role_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_update();
