import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const read = (relativePath: string) => readFileSync(`${here}/${relativePath}`, "utf8");

const appShell = read("../components/AppShell.tsx");
const router = read("../router.tsx");
const rootRoute = read("../routes/__root.tsx");
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
      'const isHomeRoute = location.pathname === "/" || location.pathname === "/coach";',
    );
    expect(appShell).toContain("const showWorkspaceSwitcher = Boolean(user && isCoach);");
    expect(appShell).toContain("{utilityAccessory || showWorkspaceSwitcher || user ? (");
    expect(appShell).toContain("{showWorkspaceSwitcher ? (");
  });

  test("management Programs opens the combined coach plan workspace", () => {
    expect(appShell).toContain('to: "/coach/clients"');
    expect(appShell).toContain('label: "תוכניות"');
    expect(appShell).toContain('to="/coach"');
    expect(appShell).toContain('preload="render"');
  });

  test("coach program and tracking entry points stay on separate routes", () => {
    expect(coachRoute).toContain('"/coach/clients/$clientId/program"');
    expect(coachRoute).toContain('{trackingLanding ? "פתח דוח" : "פתח תוכניות"}');
    expect(coachRoute).toContain('"/coach/tracking/$clientId"');
    expect(coachRoute).toMatch(
      /openTrackedPlan\(\s*dayItem\.id,\s*exerciseId,/,
    );
    expect(coachRoute).toContain("dayId: resolvedWorkoutId");
    expect(coachRoute).toContain("dayName");
    expect(coachRoute).toContain("exerciseId");
    expect(coachRoute).toContain("exerciseName");
  });

  test("the DOB repair migration is idempotent and refreshes PostgREST", () => {
    expect(dateOfBirthRepairMigration).toContain("ADD COLUMN IF NOT EXISTS date_of_birth DATE");
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

  test("route transitions keep the old screen until the new route is ready", () => {
    expect(router).toContain("defaultViewTransition: true");
    expect(router).toContain("router.startViewTransition = (update) =>");
    expect(router).toContain('viewDocument.visibilityState !== "visible"');
    expect(router).toContain("transition.finished.catch");
    expect(router).toContain("if (!updateStarted) void update()");
    expect(styles).toContain("::view-transition-old(root)");
    expect(styles).toContain("::view-transition-new(root)");
    expect(styles).toContain("transform: translate3d(104%, 0, 0)");
    expect(styles).toContain("transform: translate3d(-104%, 0, 0)");
  });

  test("returning from iOS background keeps the current route interactive", () => {
    expect(rootRoute).toContain('window.addEventListener("pageshow", handlePageShow)');
    expect(rootRoute).toContain(
      'document.addEventListener("visibilitychange", handleVisibilityChange)',
    );
    expect(router).toContain('viewDocument.visibilityState !== "visible"');
    expect(router).toContain("void update()");
  });
});
