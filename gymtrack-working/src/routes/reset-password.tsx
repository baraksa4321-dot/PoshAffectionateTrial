import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRecoverySession, setIsRecoverySession] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsRecoverySession(true);
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      setIsRecoverySession(!error && Boolean(data.session));
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    if (password.length < 6) {
      setMessage("הסיסמה חייבת להכיל לפחות 6 תווים.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("הסיסמאות אינן תואמות.");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSaving(false);
    setMessage(error ? `לא ניתן לעדכן את הסיסמה: ${error.message}` : "הסיסמה עודכנה בהצלחה.");
  };

  return (
    <main dir="rtl" className="min-h-screen bg-background px-4 py-12 text-right">
      <section className="mx-auto w-full max-w-sm space-y-5 rounded-3xl border border-border bg-white p-6 shadow-lg">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">בחירת סיסמה חדשה</h1>
          <p className="mt-1 text-sm text-muted-foreground">יש להזין סיסמה חדשה עבור החשבון שלך.</p>
        </div>

        {isRecoverySession === false ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            קישור האיפוס אינו תקף או שפג תוקפו. יש לבקש קישור חדש ממסך ההתחברות.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor="new-password" className="block text-sm font-bold text-ink">
              סיסמה חדשה
              <input
                id="new-password"
                name="new-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                inputMode="text"
                className="mt-1.5 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-primary"
              />
            </label>
            <label htmlFor="confirm-new-password" className="block text-sm font-bold text-ink">
              אימות סיסמה חדשה
              <input
                id="confirm-new-password"
                name="confirm-new-password"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                inputMode="text"
                className="mt-1.5 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              disabled={isSaving || isRecoverySession !== true}
              className="w-full rounded-2xl bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {isSaving ? "מעדכן..." : "עדכון סיסמה"}
            </button>
          </form>
        )}

        {message && <p className="text-sm font-semibold text-primary">{message}</p>}
        <Link to="/" className="block text-center text-sm font-bold text-primary hover:underline">
          חזרה לאפליקציה
        </Link>
      </section>
    </main>
  );
}
