import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const read = (relativePath: string) => readFileSync(`${here}/${relativePath}`, "utf8");

const appShell = read("../components/AppShell.tsx");
const gymStore = read("./gym-store.ts");
const supabaseSync = read("./supabase-sync.ts");
const coachRoute = read("../routes/coach.tsx");
const styles = read("../styles.css");
const ownerMigration = read("../../supabase/migrations/31_owner_auth_profile_visibility.sql");
const insertHardening = read(
  "../../supabase/migrations/32_registration_profile_insert_hardening.sql",
);
const insertPolicyCleanup = read(
  "../../supabase/migrations/33_cleanup_legacy_profile_insert_policy.sql",
);
const ownerRpcPrivileges = read(
  "../../supabase/migrations/34_revoke_public_owner_auth_rpc_execute.sql",
);
const roleHardening = read("../../supabase/migrations/09_security_fixes.sql");
const dateOfBirthRepairMigration = read(
  "../../supabase/migrations/58_profile_date_of_birth_repair.sql",
);

describe("Supabase auth lifecycle contracts", () => {
  test("signup and resend use the app entry point while password reset keeps its recovery route", () => {
    expect(appShell).toContain("auth.signUp({");
    expect(appShell).toContain("emailRedirectTo: redirectTo");
    expect(appShell).toContain("full_name: normalizedFullName");
    expect(appShell).toContain('type: "signup"');
    expect(appShell).toContain("auth.resend({");
    expect(appShell).toContain("resetPasswordForEmail(");
    expect(appShell).toContain("window.location.origin}/reset-password");
    expect(appShell).not.toContain(
      "window.location.origin}/reset-password` : undefined;\n      if (isSignUp)",
    );
  });

  test("the pending-email path gives users a retryable verification state", () => {
    expect(appShell).toMatch(/data\?\.user && !data\?\.session/);
    expect(appShell).toMatch(/setPendingVerificationEmail\(normalizedEmail\)/);
    expect(appShell).toMatch(/auth\.resend/);
    expect(appShell).toMatch(/Email not confirmed/);
  });

  test("missing profiles are repaired only for the authenticated user as a client", () => {
    expect(supabaseSync).toContain("authUser?.id === userId");
    expect(supabaseSync).toMatch(
      /\.from\("profiles"\)[\s\S]*?\.upsert\([\s\S]*id:\s*userId[\s\S]*role:\s*"client"/,
    );
    expect(supabaseSync).not.toMatch(/profiles"\)\.upsert\([\s\S]*role:\s*"owner"/);
  });

  test("Owner auth visibility and repair stay server-side and Owner-only", () => {
    expect(ownerMigration).toMatch(/FUNCTION public\.list_owner_auth_users/);
    expect(ownerMigration).toMatch(/SECURITY DEFINER/);
    expect(ownerMigration).toMatch(/WHERE public\.is_owner\(\)/);
    expect(ownerMigration).toMatch(/FUNCTION public\.repair_missing_client_profile/);
    expect(ownerMigration).toContain("approval_status,");
    expect(ownerMigration).toContain("'pending'");
    expect(ownerMigration).toContain(
      "REVOKE ALL ON FUNCTION public.list_owner_auth_users() FROM PUBLIC",
    );
    expect(coachRoute).toMatch(/rpc\("list_owner_auth_users"\)/);
    expect(coachRoute).toMatch(/rpc\("repair_missing_client_profile"/);
    expect(coachRoute).not.toMatch(/auth\.users/);
    expect(insertHardening).toContain("role = 'client'");
    expect(insertHardening).toContain("approval_status = 'pending'");
    expect(insertPolicyCleanup).toContain('DROP POLICY IF EXISTS "profiles_insert_self"');
    expect(insertPolicyCleanup).toContain("TO authenticated");
    expect(ownerRpcPrivileges).toContain("FROM anon");
    expect(ownerRpcPrivileges).toContain("TO authenticated");
  });

  test("role changes retain the live Owner self-change safeguard", () => {
    expect(roleHardening).toContain("Only the Owner can change user roles");
    expect(roleHardening).toContain("role = (SELECT p.role FROM public.profiles p");
  });

  test("management users can switch modes from the two home routes", () => {
    expect(appShell).toContain(
      'user && isCoach && (location.pathname === "/" || location.pathname === "/coach")',
    );
    expect(appShell).toContain("{headerAccessory || showWorkspaceSwitcher ? (");
    expect(appShell).toContain("{showWorkspaceSwitcher ? (");
  });

  test("management Programs opens the combined coach plan workspace", () => {
    expect(appShell).toContain('to: "/coach/clients"');
    expect(appShell).toContain('label: "תוכניות"');
  });

  test("the DOB repair migration is idempotent and refreshes PostgREST", () => {
    expect(dateOfBirthRepairMigration).toContain(
      "ADD COLUMN IF NOT EXISTS date_of_birth DATE",
    );
    expect(dateOfBirthRepairMigration).toContain("NOTIFY pgrst, 'reload schema'");
  });

  test("tracking uses a drawn palette heart and keeps profile access on the home directory", () => {
    expect(coachRoute).toContain('<Heart className="h-3.5 w-3.5 fill-current"');
    expect(coachRoute).toContain("לשים לב");
    expect(coachRoute).not.toContain("לשים ❤️");
    expect(coachRoute).toContain('title="פרופילים"');
    expect(coachRoute).not.toContain('aria-label="פתיחת פרופיל המשתמש"');
  });

  test("app fields stay within their card or flex container", () => {
    expect(styles).toContain("box-sizing: border-box;");
    expect(styles).toContain("min-width: 0;");
    expect(styles).toContain("max-width: 100%;");
  });
});
