import { Link, useLocation } from "@tanstack/react-router";
import {
  Apple,
  Cloud,
  CloudOff,
  Dumbbell,
  Home,
  LayoutGrid,
  LogIn,
  LogOut,
  Moon,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { saveTheme, useAuthUser, useCloudSyncStatus, useGym } from "../lib/gym-store";
import { supabase } from "../lib/supabase";
import { applyNightMode, applyTheme, DEFAULT_THEME, THEME_PALETTES } from "../lib/theme";
import type { ThemePalette } from "../lib/gym-types";
import { Overlay } from "./ui-app/Overlay";
import { BrandLogo } from "./BrandLogo";
import { genderText } from "../lib/gender-copy";

const WORKSPACE_KEY = "gymtrack.workspace";
const FULL_NAME_REQUIRED_ERROR = "יש להזין שם פרטי ושם משפחה כדי ליצור חשבון.";

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
  compactHeader = false,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  kicker?: string | undefined;
  action?: ReactNode | undefined;
  authOnly?: boolean | undefined;
  compactHeader?: boolean | undefined;
  children: ReactNode;
}) {
  const store = useGym();
  const user = useAuthUser();
  const cloudSyncStatus = useCloudSyncStatus();
  const role = store.userProfile?.role;
  const isOwner = role === "owner";
  const isCoach = role === "coach" || isOwner;
  const profileGender = store.userProfile?.gender;
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
  const [isNightMode, setIsNightMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("gymtrack.night-mode") === "true";
  });
  const managementView = isCoach && (activeMode === "management" || isManagementRoute);
  const syncNotice =
    cloudSyncStatus === "offline"
      ? {
          text: "אין חיבור לאינטרנט — השינויים נשמרים במכשיר ויסתנכרנו אוטומטית כשהחיבור יחזור.",
          tone: "border-amber-300/70 bg-amber-50 text-amber-950",
        }
      : cloudSyncStatus === "syncing"
        ? {
            text: "מסנכרנים את השינויים שלך לענן…",
            tone: "border-primary/20 bg-primary/5 text-primary",
          }
        : cloudSyncStatus === "pending"
          ? {
              text: "השינויים נשמרו במכשיר וממתינים לסנכרון.",
              tone: "border-primary/20 bg-primary/5 text-primary",
            }
          : null;
  const SyncIcon = cloudSyncStatus === "offline" ? CloudOff : Cloud;
  const syncIconClass =
    cloudSyncStatus === "offline"
      ? "text-amber-700"
      : cloudSyncStatus === "error"
        ? "text-destructive"
        : cloudSyncStatus === "syncing" || cloudSyncStatus === "pending"
          ? "text-primary"
          : "text-emerald-600";
  const syncTitle =
    cloudSyncStatus === "offline"
      ? "אין חיבור לאינטרנט — השינויים נשמרים במכשיר"
      : cloudSyncStatus === "syncing"
        ? "מסנכרנים את השינויים לענן"
        : cloudSyncStatus === "pending"
          ? "שינויים ממתינים לסנכרון"
          : cloudSyncStatus === "error"
            ? "השינויים נשמרו במכשיר וננסה לסנכרן שוב"
            : "הנתונים מסונכרנים";

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

  useEffect(() => {
    applyNightMode(isNightMode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("gymtrack.night-mode", String(isNightMode));
    }
  }, [isNightMode]);

  const NAV = managementView
    ? [
        {
          to: "/coach",
          label: "",
          id: "management-home",
          icon: Home,
          onClick: () => setWorkspace("management"),
        },
        {
          to: "/coach/clients",
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
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"female" | "male">("female");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const headerTitle = authOnly ? genderText(gender, "ברוכה הבאה", "ברוך הבא") : title;
  const headerSubtitle = authOnly
    ? genderText(gender, "התחברי כדי להמשיך לאימונים ולתזונה", "התחבר כדי להמשיך לאימונים ולתזונה")
    : subtitle;

  useEffect(() => {
    if (profileGender) setGender(profileGender);
  }, [profileGender]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
      if (isSignUp) {
        const normalizedFullName = fullName.trim().replace(/\s+/g, " ");
        if (normalizedFullName.split(" ").filter(Boolean).length < 2) {
          throw new Error(FULL_NAME_REQUIRED_ERROR);
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
            data: {
              theme,
              gender,
              full_name: normalizedFullName,
            },
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
      const { error: themeSaveError } = await supabase.auth.updateUser({
        data: {
          theme,
          gender,
          ...(isSignUp ? { full_name: fullName.trim().replace(/\s+/g, " ") } : {}),
        },
      });
      if (themeSaveError) throw themeSaveError;
      setShowAuthModal(false);
      setEmail("");
      setFullName("");
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
          ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
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
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setErrorMsg("יש להזין כתובת אימייל כדי לקבל קישור לאיפוס סיסמה.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMsg("יש להזין כתובת אימייל תקינה.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        redirectTo ? { redirectTo } : {},
      );
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
        <div
          className={`mx-auto w-full max-w-2xl px-4 sm:px-6 ${
            compactHeader ? "pb-2 pt-0.5" : "pb-4 pt-1"
          }`}
        >
          <div
            className={`flex items-center justify-between gap-3 border-b border-border/50 ${
              compactHeader ? "mb-1 pb-1" : "mb-3 pb-2"
            }`}
          >
            <BrandLogo />
            <button
              type="button"
              onClick={() => setIsNightMode((enabled) => !enabled)}
              aria-pressed={isNightMode}
              aria-label={isNightMode ? "מעבר לתצוגת יום" : "מעבר לתצוגת לילה"}
              title={isNightMode ? "תצוגת יום" : "תצוגת לילה"}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border/70 bg-surface text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isNightMode ? (
                <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Moon className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
          {isCoach ? (
            <div
              className={`flex justify-end border-b border-border/50 ${
                compactHeader ? "mb-1 pb-1" : "mb-3 pb-2"
              }`}
            >
              <div
                className="flex items-center gap-0.5 rounded-full border border-border bg-surface-2 p-0.5"
                role="group"
                aria-label="בחירת מצב עבודה"
              >
                <Link
                  to="/"
                  onClick={() => setWorkspace("personal")}
                  aria-current={activeMode === "personal" ? "page" : undefined}
                    className={`min-w-20 rounded-full px-3 ${
                      compactHeader ? "py-1 text-[10px]" : "py-1.5 text-[11px]"
                    } text-center font-bold transition-colors ${
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
                    className={`min-w-20 rounded-full px-3 ${
                      compactHeader ? "py-1 text-[10px]" : "py-1.5 text-[11px]"
                    } text-center font-bold transition-colors ${
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
          {title || action ? (
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1 text-start">
                {title ? (
                  <h1
                    className={`min-w-0 break-words font-display font-extrabold leading-snug tracking-tight text-ink ${
                      compactHeader
                        ? "text-[clamp(16px,4.5vw,20px)]"
                        : "text-[clamp(18px,5vw,23px)]"
                    }`}
                  >
                    {headerTitle}
                  </h1>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2 pt-0.5">
                {user ? (
                  <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[12px] font-bold text-ink shadow-sm">
                    <SyncIcon
                      className={`h-3.5 w-3.5 ${syncIconClass} ${
                        cloudSyncStatus === "syncing" ? "animate-pulse" : ""
                      }`}
                      aria-hidden="true"
                    />
                    <span className="max-w-[120px] truncate">
                      {store.userProfile?.fullName || "החשבון שלי"}
                    </span>
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
          ) : null}
        </div>
      </header>

      <main
        className={`page-enter mx-auto w-full max-w-2xl px-4 pb-8 sm:px-6 ${
          compactHeader ? "flex flex-col pt-1.5" : "pt-5 sm:pt-7"
        }`}
        style={{
          paddingBottom: "calc(6.5rem + env(safe-area-inset-bottom))",
        }}
      >
        {user && syncNotice ? (
          <div
            role="status"
            aria-live="polite"
            className={`mb-4 flex items-start gap-2 rounded-2xl border px-3 py-2.5 text-xs font-semibold leading-relaxed ${syncNotice.tone}`}
          >
            <SyncIcon
              className={`mt-0.5 h-4 w-4 shrink-0 ${syncIconClass} ${
                cloudSyncStatus === "syncing" ? "animate-pulse" : ""
              }`}
              aria-hidden="true"
            />
            <span>{syncNotice.text}</span>
          </div>
        ) : null}
        {user ? <span className="sr-only">{syncTitle}</span> : null}
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
            <div className="flex justify-center">
              <BrandLogo compact />
            </div>
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-primary">
                  <User className="h-4 w-4" />
                </div>
                <h3 className="font-display font-bold text-[18px] text-ink uppercase tracking-wide">
                  {isResettingPassword ? "איפוס סיסמה" : isSignUp ? "הרשמה" : "התחברות"}
                </h3>
              </div>
              {!authOnly ? (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  aria-label="סגירת התחברות"
                  className="grid h-8 w-8 place-items-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-ink transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <span className="h-8 w-8" aria-hidden="true" />
              )}
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
                  {genderText(
                    gender,
                    "אם לא קיבלת את מייל האימות או שהקישור פג תוקף, לחצי כאן לשליחת קישור מחדש.",
                    "אם לא קיבלת את מייל האימות או שהקישור פג תוקף, לחץ כאן לשליחת קישור מחדש.",
                  )}
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

            <LoginThemeSelector
              value={theme}
              onChange={async (nextTheme) => {
                setThemeError("");
                const result = await saveTheme(nextTheme);
                if (!result.success) setThemeError(result.error ?? "שמירת הפלטה נכשלה");
              }}
            />
            {themeError ? (
              <p className="text-[12px] font-semibold text-destructive">{themeError}</p>
            ) : null}

            {isResettingPassword ? (
              <div className="space-y-4">
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {genderText(
                    gender,
                    "הזיני את כתובת האימייל שלך ונשלח קישור מאובטח לאיפוס הסיסמה.",
                    "הזן את כתובת האימייל שלך ונשלח קישור מאובטח לאיפוס הסיסמה.",
                  )}
                </p>
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                    כתובת אימייל
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="name@example.com"
                    dir="ltr"
                  />
                </div>
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
                {isSignUp ? (
                  <div>
                    <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                      שם מלא
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        const nextName = e.target.value;
                        setFullName(nextName);
                        if (
                          errorMsg === FULL_NAME_REQUIRED_ERROR &&
                          nextName.trim().split(/\s+/).filter(Boolean).length >= 2
                        ) {
                          setErrorMsg("");
                        }
                      }}
                      autoComplete="name"
                      className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="השם שיוצג באפליקציה"
                    />
                  </div>
                ) : null}
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                    כתובת אימייל
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
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
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>

                {isSignUp ? (
                  <fieldset>
                    <legend className="block text-[12px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                      איך לפנות אלייך/אליך?
                    </legend>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          ["female", "אישה"],
                          ["male", "גבר"],
                        ] as const
                      ).map(([value, label]) => (
                        <label
                          key={value}
                          className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-colors ${
                            gender === value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={value}
                            checked={gender === value}
                            onChange={() => setGender(value)}
                            className="sr-only"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : null}

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
                type="button"
                onClick={() => {
                  if (isResettingPassword) {
                    setIsResettingPassword(false);
                  } else {
                    setIsSignUp(!isSignUp);
                  }
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-[12px] font-bold text-primary hover:underline cursor-pointer"
              >
                {isResettingPassword
                  ? "חזרה להתחברות"
                  : isSignUp
                    ? "כבר יש לך חשבון? התחבר כאן"
                    : "אין לך חשבון? הירשם כאן"}
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
                activeOptions={{ exact: to === "/" || to === "/coach" }}
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
  onClose,
}: {
  value: ThemePalette;
  onChange: (theme: ThemePalette) => void | Promise<void>;
  onClose?: () => void;
}) {
  return (
    <section
      className="w-full rounded-2xl border border-border bg-surface p-4 text-start shadow-xl"
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
            <div
              className="flex h-12 w-14 shrink-0 flex-col overflow-hidden rounded-sm border border-border/60 bg-white shadow-sm transition-transform group-hover:scale-105 group-active:scale-95"
              style={{ backgroundColor: palette.previewSurface }}
              aria-hidden="true"
            >
              <span className="h-2.5" style={{ backgroundColor: palette.previewAccent }} />
              <span className="mx-1.5 mt-1.5 h-1.5 rounded-full bg-[#111111]" />
              <span
                className="mx-1.5 mt-1 h-2.5 rounded-sm"
                style={{ backgroundColor: palette.swatch, opacity: 0.65 }}
              />
            </div>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold text-ink">{palette.label}</span>
              <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                רקע בהיר · טקסט שחור
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function LoginThemeSelector({
  value,
  onChange,
}: {
  value: ThemePalette;
  onChange: (theme: ThemePalette) => void | Promise<void>;
}) {
  const activePalette = THEME_PALETTES.find((palette) => palette.id === value);

  return (
    <div className="flex items-center justify-between gap-3 border-y border-border/50 py-3 text-start">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground">צבע ממשק</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground/80">אפשר לשנות גם אחרי ההתחברות</p>
      </div>
      <label className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-ink transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        <span
          className="h-3 w-3 rounded-full border border-border/60"
          style={{ backgroundColor: activePalette?.swatch ?? "currentColor" }}
          aria-hidden="true"
        />
        <select
          value={value}
          onChange={(event) => void onChange(event.target.value as ThemePalette)}
          aria-label="בחירת צבע ממשק"
          className="max-w-28 appearance-none bg-transparent text-[11px] font-semibold outline-none"
        >
          {THEME_PALETTES.map((palette) => (
            <option key={palette.id} value={palette.id}>
              {palette.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
