import { createClient } from "@supabase/supabase-js";

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing runtime configuration: ${name}`);
  return value;
};

const supabase = createClient(
  required("VITE_SUPABASE_URL"),
  required("VITE_SUPABASE_ANON_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: required("GYMTRACK_SMOKE_COACH_EMAIL"),
  password: required("GYMTRACK_SMOKE_COACH_PASSWORD"),
});
if (authError) throw new Error(`Coach authentication failed: ${authError.message}`);
if (!authData.user?.id) throw new Error("Coach authentication returned no user.");

const { data: coach, error: coachError } = await supabase
  .from("profiles")
  .select("id, full_name, role, coach_id")
  .eq("id", authData.user.id)
  .single();
if (coachError) throw new Error(`Coach profile read failed: ${coachError.message}`);

const { data: candidates, error: candidateError } = await supabase
  .from("profiles")
  .select("id, full_name, role, coach_id, email")
  .eq("full_name", "שיר יוספן");
if (candidateError) throw new Error(`Target profile search failed: ${candidateError.message}`);

console.log(
  JSON.stringify(
    {
      authenticatedCoach: {
        id: coach.id,
        fullName: coach.full_name,
        role: coach.role,
      },
      exactCandidates: (candidates ?? []).map((candidate) => ({
        id: candidate.id,
        fullName: candidate.full_name,
        role: candidate.role,
        coachId: candidate.coach_id,
        hasEmail: Boolean(candidate.email),
      })),
    },
    null,
    2,
  ),
);