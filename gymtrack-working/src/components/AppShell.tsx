import { Link } from "@tanstack/react-router";
import {
  Apple,
  Cloud,
  Dumbbell,
  Home,
  LayoutGrid,
  LogIn,
  LogOut,
  Shield,
  Crown,
  User,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuthUser, useGym } from "../lib/gym-store";
import { supabase } from "../lib/supabase";

export function AppShell({
  title,
  subtitle,
  kicker,
  action,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  kicker?: string | undefined;
  action?: ReactNode | undefined;
  children: ReactNode;
}) {
  const store = useGym();
  const user = useAuthUser();
  const role = store.userProfile?.role || "client";
  const isOwner = role === "owner";
  const isCoach = role === "coach" || isOwner;

  // Mode State for Coach / Owner: 'personal' (Client View) vs 'management' (Coach/Owner Dashboard)
  const [activeMode, setActiveMode] = useState<"personal" | "management">(
    typeof window !== "undefined" && window.location.pathname.startsWith("/coach")
      ? "management"
      : "personal",
  );

  // Client gets 3 tabs: בית | אימונים השבוע | תזונה
  // Coach/Owner gets 3 tabs in Personal mode, plus mode switcher to Coach Dashboard
  const NAV = [
    { to: "/", label: "בית", id: "home", icon: Home },
    { to: "/programs", label: "אימונים השבוע", id: "programs", icon: LayoutGrid },
    ...(isCoach && activeMode === "management"
      ? [{ to: "/exercises", label: "תרגילים", id: "exercises", icon: Dumbbell }]
      : []),
    { to: "/nutrition", label: "תזונה", id: "nutrition", icon: Apple },
  ];

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
          },
        });
        if (error) throw error;

        if (data?.user && !data?.session) {
          setPendingVerificationEmail(email);
          setSuccessMsg(
            "נרשמת בהצלחה! שלחנו מייל אימות לכתובת " + email + ". יש לאשר את המייל להתחברות.",
          );
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            setPendingVerificationEmail(email);
            throw new Error(
              "כתובת האימייל עדיין לא אומתה. יש לאשר את המייל או ללחוץ על 'שלח מייל אימות מחדש'.",
            );
          }
          throw error;
        }
      }
      setShowAuthModal(false);
      setEmail("");
      setPassword("");
      setPendingVerificationEmail(null);
    } catch (err: any) {
      setErrorMsg(err?.message || "אירעה שגיאה בחיבור ל-Supabase");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const targetEmail = pendingVerificationEmail || email;
    if (!targetEmail) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) throw error;
      setSuccessMsg("מייל אימות מחדש נשלח בהצלחה לכתובת " + targetEmail + "!");
    } catch (err: any) {
      setErrorMsg(err?.message || "שגיאה בשליחת מייל אימות מחדש");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground" dir="rtl">
      <header
        className="sticky top-0 z-30 border-b border-border/30 bg-background/85 backdrop-blur-xl"
        style={{ paddingTop: "max(0.6rem, env(safe-area-inset-top))" }}
      >
        <div className="mx-auto w-full max-w-md px-5 pb-3.5 pt-1">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 text-start">
              {kicker ? (
                <p className="mb-1 text-[11px] font-bold tracking-[0.14em] text-primary uppercase">
                  {kicker}
                </p>
              ) : null}
              <h1 className="truncate font-display text-[26px] font-extrabold leading-[1.1] tracking-tight text-ink">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 truncate text-[13px] leading-snug text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-0.5">
              {isCoach ? (
                <div className="flex items-center rounded-full bg-secondary p-0.5 border border-border/60">
                  <Link
                    to="/"
                    onClick={() => setActiveMode("personal")}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors ${
                      activeMode === "personal"
                        ? "bg-white text-ink shadow-xs"
                        : "text-muted-foreground hover:text-ink"
                    }`}
                  >
                    אישי
                  </Link>
                  <Link
                    to="/coach"
                    onClick={() => setActiveMode("management")}
                    className={`flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full transition-colors ${
                      activeMode === "management"
                        ? isOwner
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-primary text-white shadow-xs"
                        : "text-muted-foreground hover:text-ink"
                    }`}
                  >
                    {isOwner ? <Crown className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                    <span>{isOwner ? "בעלים" : "מאמן"}</span>
                  </Link>
                </div>
              ) : null}

              {user ? (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60 shadow-xs">
                  <Cloud className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                  <span className="max-w-[80px] truncate">{user.email?.split("@")[0]}</span>
                  <button
                    onClick={handleSignOut}
                    title="התנתק"
                    className="mr-0.5 text-emerald-600 hover:text-emerald-900 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>התחברות</span>
                </button>
              )}
              {action}
            </div>
          </div>
        </div>
      </header>

      <main
        className="page-enter mx-auto w-full max-w-md px-4 pb-8 pt-4 sm:px-5"
        style={{
          paddingBottom: "calc(6.5rem + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </main>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-white/80 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg text-ink">
                  {isSignUp ? "הרשמה ל-My Routine" : "התחברות ל-My Routine"}
                </h3>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-muted-foreground hover:text-ink font-bold text-sm px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-semibold border border-red-200">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 font-semibold border border-emerald-200">
                {successMsg}
              </div>
            )}

            {pendingVerificationEmail && (
              <div className="rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200 text-amber-900 text-start space-y-2">
                <p className="text-xs font-bold">
                  ממתין לאימות כתובת המייל ({pendingVerificationEmail})
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  אם לא קיבלת את מייל האימות או שהקישור פג תוקף, לחצי כאן לשליחת קישור מחדש.
                </p>
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="w-full rounded-xl bg-amber-600 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "שולח..." : "שלח מייל אימות מחדש"}
                </button>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  כתובת אימייל
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">סיסמה</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-primary py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "מעבד..." : isSignUp ? "צור חשבון" : "התחבר"}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                {isSignUp ? "כבר יש לך חשבון? התחבר כאן" : "אין לך חשבון? הירשם כאן"}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label="ניווט ראשי"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3.5 sm:px-4"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-between rounded-[2rem] border border-white/70 bg-white/85 p-1.5 shadow-[0_12px_36px_oklch(0.22_0.02_145/0.12),0_2px_10px_oklch(0.22_0.02_145/0.05)] backdrop-blur-2xl">
          {NAV.map(({ to, label, id, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              data-testid={`link-nav-${id}`}
              className="group relative flex min-h-[3.6rem] min-w-[3.4rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-[1.4rem] py-1 text-muted-foreground transition-all duration-200 data-[status=active]:bg-primary/12 data-[status=active]:text-primary hover:text-foreground"
            >
              <Icon
                className="h-[21px] w-[21px] transition-transform duration-200 group-data-[status=active]:scale-110"
                strokeWidth={2.2}
              />
              <span className="text-[10.5px] font-bold leading-none">{label}</span>
              <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary opacity-0 transition-opacity duration-200 group-data-[status=active]:opacity-100" />
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
