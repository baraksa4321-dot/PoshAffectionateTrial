-- Supabase may grant anon EXECUTE directly on newly-created functions.
-- Remove that direct grant; the Owner UI calls these as authenticated users.

REVOKE ALL ON FUNCTION public.list_owner_auth_users() FROM anon;
REVOKE ALL ON FUNCTION public.repair_missing_client_profile(UUID) FROM anon;

GRANT EXECUTE ON FUNCTION public.list_owner_auth_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.repair_missing_client_profile(UUID) TO authenticated;