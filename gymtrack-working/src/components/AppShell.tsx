import { Link, useLocation } from "@tanstack/react-router";
import {
  Apple,
  Cloud,
  Dumbbell,
  Home,
  LayoutGrid,
  LogIn,
  LogOut,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { saveTheme, useAuthUser, useGym } from "../lib/gym-store";
import { supabase } from "../lib/supabase";
import { applyTheme, DEFAULT_THEME, THEME_PALETTES } from "../lib/theme";
import type { ThemePalette } from "../lib/gym-types";
import { Overlay } from "./ui-app/Overlay";

const WORKSPACE_KEY = "gymtrack.workspace";

function isManagementPath(pathname: string) {
  return /(^|\/)(coach|exercises)(\/|$)/.test(pathname);
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function AppShell({
  title,
  subtitle,
  kicker,
  action,
  authOnly = false,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  kicker?: string | undefined;
  action?: ReactNode | undefined;
  authOnly?: boolean | undefined;
  children: ReactNode;
}) {
  const store = useGym();
  const user = useAuthUser();
  const role = store.userProfile?.role;
  const isOwner = role === "owner";
  const isCoach = role === "coach" || isOwner;
  const location = useLocation();
  const isManagementRoute = isManagementPath(location.pathname);

  const [activeMode, setActiveMode] = useState<"personal" | "management">(() => {
    if (typeof window === "undefined") return "personal";
    if (isManagementPath(window.location.pathname)) return "management";
    return window.sessionStorage.getItem(WORKSPACE_KEY) === "management"
      ? "management"
      : "personal";
  });
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [themeError, setThemeError] = useState("");
  const theme = store.userProfile?.theme ?? DEFAULT_THEME;
  const managementView = isCoach && (activeMode === "management" || isManagementRoute);

  useEffect(() => {
    if (isManagementRoute) {
      setActiveMode("management");
      window.sessionStorage.setItem(WORKSPACE_KEY, "management");
    }
  }, [isManagementRoute]);

  const setWorkspace = (workspace: "personal" | "management") => {
    setActiveMode(workspace);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(WORKSPACE_KEY, workspace);
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const NAV = managementView
    ? [
        {
          to: "/coach",
          label: "מתאמנים",
          id: "coach",
          icon: Users,
          onClick: () => setWorkspace("management"),
        },
        {
          to: "/exercises",
          label: "תרגילים",
          id: "exercises",
          icon: Dumbbell,
          onClick: () => setWorkspace("management"),
        },
      ]
    : [
        {
          to: "/",
          label: "היום שלי",
          id: "home",
          icon: Home,
          onClick: () => setWorkspace("personal"),
        },
        {
          to: "/programs",
          label: "האימונים שלי",
          id: "programs",
          icon: LayoutGrid,
          onClick: () => setWorkspace("personal"),
        },
        {
          to: "/nutrition",
          label: "התזונה שלי",
          id: "nutrition",
          icon: Apple,
          onClick: () => setWorkspace("personal"),
        },
      ];

  const [showAuthModal, setShowAuthModal] = useState(authOnly);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
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
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: { theme },
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
      const { error: themeSaveError } = await supabase.auth.updateUser({ data: { theme } });
      if (themeSaveError) throw themeSaveError;
      setShowAuthModal(false);
      setEmail("");
      setPassword("");
      setPendingVerificationEmail(null);
    } catch (err: unknown) {
      setErrorMsg(errorMessage(err, "אירעה שגיאה בחיבור ל-Supabase"));
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
    } catch (err: unknown) {
      setErrorMsg(errorMessage(err, "שגיאה בשליחת מייל אימות מחדש"));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setErrorMsg("יש להזין כתובת אימייל כדי לקבל קישור לאיפוס סיסמה.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });
      if (error) throw error;
      setSuccessMsg("אם קיים חשבון עם כתובת זו, נשלח אליו קישור לאיפוס סיסמה.");
    } catch (err: unknown) {
      setErrorMsg(errorMessage(err, "שגיאה בשליחת קישור איפוס הסיסמה"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div
      className={
        authOnly
          ? "fixed inset-0 z-[100] min-h-[100dvh] w-full overflow-auto bg-background text-foreground"
          : "min-h-[100dvh] w-full bg-background text-foreground"
      }
      dir="rtl"
    >
      <header
        className="sticky top-0 z-30 border-b border-border/70 bg-background/90 shadow-[0_8px_24px_oklch(0.2_0.03_35_/_0.035)] backdrop-blur-xl"
        style={{ paddingTop: "max(0.6rem, env(safe-area-inset-top))" }}
      >
        <div className="mx-auto w-full max-w-2xl px-4 pb-4 pt-1 sm:px-6">
          {isCoach ? (
            <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[11px] font-bold text-muted-foreground">מצב עבודה</span>
              <div
                className="flex items-center gap-0.5 rounded-full border border-border bg-surface-2 p-0.5"
                role="group"
                aria-label="בחירת מצב עבודה"
              >
                <Link
                  to="/"
                  onClick={() => setWorkspace("personal")}
                  aria-current={activeMode === "personal" ? "page" : undefined}
                  className={`min-w-20 rounded-full px-3 py-1.5 text-center text-[11px] font-bold transition-colors ${
                    activeMode === "personal"
                      ? "bg-surface text-ink shadow-sm"
                      : "text-muted-foreground hover:text-ink"
                  }`}
                >
                  אישי
                </Link>
                <Link
                  to="/coach"
                  onClick={() => setWorkspace("management")}
                  aria-current={activeMode === "management" ? "page" : undefined}
                  className={`min-w-20 rounded-full px-3 py-1.5 text-center text-[11px] font-bold transition-colors ${
                    activeMode === "management"
                      ? isOwner
                        ? "bg-ink text-primary-foreground"
                        : "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-ink"
                  }`}
                >
                  {isOwner ? "בעלים" : "מאמן"}
                </Link>
              </div>
            </div>
          ) : null}
          {isCoach ? (
            <div
              className={`mb-3 flex items-center justify-between border-b px-1 pb-2 ${
                managementView ? "border-ink/20 text-ink" : "border-primary/20 text-primary"
              }`}
            >
              <div className="text-start">
                <p className="text-[10px] font-bold tracking-[0.16em] uppercase">
                  {managementView ? (isOwner ? "מרחב בעלים" : "מרחב מאמן") : "מרחב אישי"}
                </p>
              </div>
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full ${
                  managementView ? (isOwner ? "bg-ink" : "bg-primary") : "bg-sage"
                }`}
              />
            </div>
          ) : null}
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 text-start">
              {kicker ? (
                <p className="mb-1 text-[10px] font-bold tracking-widest text-primary uppercase">
                  {kicker}
                </p>
              ) : null}
              {title ? (
                <h1 className="truncate font-display text-[23px] font-extrabold leading-tight tracking-tight text-ink">
                  {title}
                </h1>
              ) : null}
              {subtitle ? (
                <p className="mt-1 truncate text-[13px] leading-snug text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-0.5">
              {user ? (
                <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[12px] font-bold text-ink shadow-sm">
                  <Cloud className="h-3.5 w-3.5 text-primary" />
                  <span className="max-w-[80px] truncate">{user.email?.split("@")[0]}</span>
                  <div className="h-3 w-px bg-border/80 mx-1" />
                  <button
                    type="button"
                    onClick={() => setShowThemeModal(true)}
                    title="בחירת פלטה"
                    aria-label="בחירת פלטת צבעים"
                    className="cursor-pointer text-muted-foreground transition-colors hover:text-primary"
                  >
                    <div className="h-3.5 w-3.5 rounded-sm bg-primary border border-primary/20" />
                  </button>
                  <button
                    onClick={handleSignOut}
                    title="התנתק"
                    className="cursor-pointer text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
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
        className="page-enter mx-auto w-full max-w-2xl px-4 pb-8 pt-5 sm:px-6 sm:pt-7"
        style={{
          paddingBottom: "calc(6.5rem + env(safe-area-inset-bottom))",
        }}
      >
        {!authOnly ? children : null}
      </main>

      {showAuthModal && (
        <Overlay
          open={authOnly || showAuthModal}
          onClose={() => {
            if (!authOnly) setShowAuthModal(false);
          }}
          ariaLabel="התחברות לחשבון"
        >
          <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-primary">
                  <User className="h-4 w-4" />
                </div>
                <h3 className="font-display font-bold text-[18px] text-ink uppercase tracking-wide">
                  {isResettingPassword ? "איפוס סיסמה" : isSignUp ? "הרשמה" : "התחברות"}
                </h3>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="grid h-8 w-8 place-items-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-ink transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-sm bg-destructive/10 p-3 text-[13px] text-destructive font-semibold border border-destructive/20">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="rounded-sm bg-primary/10 p-3 text-[13px] text-primary font-semibold border border-primary/20">
                {successMsg}
              </div>
            )}

            {pendingVerificationEmail && (
              <div className="rounded-sm bg-accent/30 p-4 border border-border text-ink text-start space-y-3">
                <p className="text-[13px] font-bold">
                  ממתין לאימות כתובת המייל ({pendingVerificationEmail})
                </p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  אם לא קיבלת את מייל האימות או שהקישור פג תוקף, לחצי כאן לשליחת קישור מחדש.
                </p>
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="w-full rounded-sm bg-ink py-2 text-[13px] font-bold text-background shadow-sm hover:bg-ink/90 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {loading ? "שולח..." : "שלח מייל אימות מחדש"}
                </button>
              </div>
            )}

            <ThemeChooser
              value={theme}
              onChange={async (nextTheme) => {
                setThemeError("");
                const result = await saveTheme(nextTheme);
                if (!result.success) setThemeError(result.error ?? "שמירת הפלטה נכשלה");
              }}
              compact
            />
            {themeError ? (
              <p className="text-[12px] font-semibold text-destructive">{themeError}</p>
            ) : null}

            {isResettingPassword ? (
              <div className="space-y-4">
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  הזיני את כתובת האימייל שלך ונשלח קישור מאובטח לאיפוס הסיסמה.
                </p>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className="w-full rounded-sm bg-primary py-3 text-[14px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {loading ? "שולח..." : "שלח קישור איפוס"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                    כתובת אימייל
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="name@example.com"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                    סיסמה
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-sm bg-primary py-3 text-[14px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition-colors mt-2"
                >
                  {loading ? "מעבד..." : isSignUp ? "צור חשבון" : "התחבר"}
                </button>
              </form>
            )}

            <div className="text-center pt-3 border-t border-border/60">
              <button
                onClick={() => {
                  setIsResettingPassword(false);
                  setIsSignUp(!isSignUp);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-[12px] font-bold text-primary hover:underline cursor-pointer"
              >
                {isSignUp ? "כבר יש לך חשבון? התחבר כאן" : "אין לך חשבון? הירשם כאן"}
              </button>
              {!isSignUp && !isResettingPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsResettingPassword(true);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="mt-3 block w-full text-[12px] font-semibold text-muted-foreground hover:text-primary hover:underline cursor-pointer"
                >
                  שכחתי את הסיסמה
                </button>
              ) : null}
            </div>
          </div>
        </Overlay>
      )}

      {showThemeModal && (
        <Overlay
          open={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          ariaLabel="בחירת פלטת צבעים"
        >
          <div className="w-full max-w-sm">
            <ThemeChooser
              value={theme}
              onClose={() => setShowThemeModal(false)}
              onChange={async (nextTheme) => {
                setThemeError("");
                const result = await saveTheme(nextTheme);
                if (!result.success) setThemeError(result.error ?? "שמירת הפלטה נכשלה");
              }}
            />
            {themeError ? (
              <p className="mt-3 rounded-sm bg-destructive/10 px-4 py-3 text-[13px] font-semibold text-destructive border border-destructive/20">
                {themeError}
              </p>
            ) : null}
          </div>
        </Overlay>
      )}

      {!authOnly ? (
        <nav aria-label="ניווט ראשי" className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
          <div
            className="nav-shell pointer-events-auto mx-auto flex w-full max-w-2xl items-center justify-between border-t bg-background/95 backdrop-blur-xl"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
          >
            {NAV.map(({ to, label, id, icon: Icon, onClick }) => (
              <Link
                key={to}
                to={to}
                onClick={onClick}
                activeOptions={{ exact: to === "/" }}
                data-testid={`link-nav-${id}`}
                className="group relative flex min-h-[4rem] flex-1 flex-col items-center justify-center gap-1.5 py-2 text-muted-foreground transition-colors data-[status=active]:text-primary hover:text-ink"
              >
                <span className="absolute inset-x-0 top-0 h-[2px] bg-primary opacity-0 transition-opacity group-data-[status=active]:opacity-100" />
                <Icon
                  className="h-[20px] w-[20px] transition-transform group-active:scale-95"
                  strokeWidth={2}
                />
                <span className="text-[11px] font-bold tracking-wide">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function ThemeChooser({
  value,
  onChange,
  compact = false,
  onClose,
}: {
  value: ThemePalette;
  onChange: (theme: ThemePalette) => void | Promise<void>;
  compact?: boolean;
  onClose?: () => void;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-surface p-4 text-start ${
        compact ? "" : "w-full shadow-xl"
      }`}
      aria-label="פלטת צבעים"
    >
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-border/50 pb-3">
        <div>
          <h2 className="font-display text-[16px] font-bold text-ink uppercase tracking-wide">
            פלטת צבעים
          </h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            הבחירה משפיעה על כל המסכים והחלונות.
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור בחירת פלטה"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-secondary text-muted-foreground hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {THEME_PALETTES.map((palette) => (
          <button
            key={palette.id}
            type="button"
            aria-pressed={value === palette.id}
            title={palette.description}
            onClick={() => void onChange(palette.id)}
            className={`group relative flex items-center gap-3 overflow-hidden rounded-sm border p-2 text-start transition-all ${
              value === palette.id
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-background hover:border-primary/40"
            }`}
          >
            <span
              className="block h-8 w-8 shrink-0 rounded-sm border border-border/50 shadow-sm transition-transform group-hover:scale-105 group-active:scale-95"
              style={{ backgroundColor: palette.swatch }}
              aria-hidden="true"
            />
            <span className="block text-[13px] font-bold text-ink truncate">{palette.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
