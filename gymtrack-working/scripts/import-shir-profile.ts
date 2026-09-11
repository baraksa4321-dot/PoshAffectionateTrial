import { createClient } from "@supabase/supabase-js";

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing runtime configuration: ${name}`);
  return value;
};

const supabaseUrl = required("VITE_SUPABASE_URL")
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/+$/, "");
const supabase = createClient(supabaseUrl, required("VITE_SUPABASE_ANON_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: required("GYMTRACK_IMPORT_OWNER_EMAIL"),
  password: required("GYMTRACK_IMPORT_OWNER_PASSWORD"),
});
if (authError) throw new Error(`Owner authentication failed: ${authError.message}`);
if (!authData.user?.id) throw new Error("Owner authentication returned no user.");

const { data: owner, error: ownerError } = await supabase
  .from("profiles")
  .select("id, full_name, role")
  .eq("id", authData.user.id)
  .single();
if (ownerError) throw new Error(`Owner profile read failed: ${ownerError.message}`);

const { data: candidates, error: candidateError } = await supabase
  .from("profiles")
  .select("id, full_name, role, coach_id, email")
  .eq("full_name", "שיר יוספן");
if (candidateError) throw new Error(`Target profile search failed: ${candidateError.message}`);

console.log(
  JSON.stringify(
    {
      authenticatedUser: { id: owner.id, fullName: owner.full_name, role: owner.role },
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