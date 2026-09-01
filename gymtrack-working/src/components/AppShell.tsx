import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Apple,
  Activity,
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
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  completeUserProfileName,
  saveTheme,
  saveUserProfile,
  useAuthUser,
  useCloudSyncStatus,
  useGym,
} from "../lib/gym-store";
import { supabase } from "../lib/supabase";
import { applyNightMode, applyTheme, DEFAULT_THEME, THEME_PALETTES } from "../lib/theme";
import type { ThemePalette, UserProfile } from "../lib/gym-types";
import { Overlay } from "./ui-app/Overlay";
import { BrandLogo } from "./BrandLogo";
import { genderText } from "../lib/gender-copy";
import { LOADING_GENDER_STORAGE_KEY } from "../lib/loading-copy";

const WORKSPACE_KEY = "gymtrack.workspace";
const FULL_NAME_REQUIRED_ERROR = "יש להזין שם פרטי ושם משפחה כדי ליצור חשבון.";

type ProfileDraft = {
  fullName: string;
  weight: string;
  height: string;
  age: string;
  gender: "female" | "male";
  coachId: string;
};

function profileDraftFrom(profile?: UserProfile): ProfileDraft {
  return {
    fullName: profile?.fullName ?? "",
    weight: profile?.weight && profile.weight > 0 ? String(profile.weight) : "",
    height: profile?.height && profile.height > 0 ? String(profile.height) : "",
    age: profile?.age && profile.age > 0 ? String(profile.age) : "",
    gender: profile?.gender ?? "female",
    coachId: profile?.coachId ?? "",
  };
}

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
  headerAccessory,
  authOnly = false,
  compactHeader = false,
  pageClassName = "",
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  kicker?: string | undefined;
  action?: ReactNode | undefined;
  headerAccessory?: ReactNode | undefined;
  authOnly?: boolean | undefined;
  compactHeader?: boolean | undefined;
  pageClassName?: string | undefined;
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
  const navigate = useNavigate();
  const isManagementRoute = isManagementPath(location.pathname);
  const showHomeOnlyHeaderControls =
    location.pathname === "/" || location.pathname === "/coach";
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const topbarRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);

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
  const SyncIcon = cloudSyncStatus === "offline" ? CloudOff : Cloud;
  const syncIconClass =
    cloudSyncStatus === "offline"
      ? "text-amber-700"
      : cloudSyncStatus === "error"
        ? "text-destructive"
        : cloudSyncStatus === "syncing" || cloudSyncStatus === "pending"
          ? "text-primary"
          : "text-primary";
  const syncTitle =
    cloudSyncStatus === "offline"
      ? "אין חיבור לאינטרנט — השינויים נשמרים במכשיר"
      : cloudSyncStatus === "syncing"
        ? "מסנכרנים את השינויים לענן"
        : cloudSyncStatus === "pending"
          ? "שינויים ממתינים לסנכרון"
          : cloudSyncStatus === "error"
            ? "השינויים נשמרו במכשיר — הסנכרון דורש תשומת לב"
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

  useEffect(() => {
    const shell = shellRef.current;
    const topbar = topbarRef.current;
    if (!shell || !topbar || typeof window === "undefined") return;

    const updateTopbarHeight = () => {
      shell.style.setProperty("--app-topbar-height", `${topbar.offsetHeight}px`);
    };
    updateTopbarHeight();
    const observer = new ResizeObserver(updateTopbarHeight);
    observer.observe(topbar);
    window.addEventListener("resize", updateTopbarHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateTopbarHeight);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const visualViewport = window.visualViewport;
    let focusTimer = 0;

    const updateKeyboardMetrics = () => {
      const visibleHeight = visualViewport?.height ?? window.innerHeight;
      const viewportTop = visualViewport?.offsetTop ?? 0;
      const rawKeyboardInset = Math.max(0, window.innerHeight - visibleHeight - viewportTop);
      // Safari can report a shorter visual viewport while its browser chrome is
      // visible. Only reserve space once the reduction is large enough to be a
      // keyboard; otherwise the page gets an unnecessary bottom gap.
      const keyboardInset = rawKeyboardInset > 80 ? rawKeyboardInset : 0;
      document.documentElement.style.setProperty("--keyboard-inset", `${keyboardInset}px`);
      document.documentElement.toggleAttribute("data-keyboard-open", keyboardInset > 80);
    };

    const keepDocumentFieldVisible = () => {
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => {
        const field = document.activeElement;
        if (
          !(field instanceof HTMLElement) ||
          !field.matches(
            'input:not([type="hidden"]):not([type="file"]), textarea, select, [contenteditable="true"]',
          ) ||
          field.closest('[data-overlay-panel="true"]')
        ) {
          return;
        }

        const viewportTop = visualViewport?.offsetTop ?? 0;
        const viewportHeight = visualViewport?.height ?? window.innerHeight;
        const headerHeight = topbarRef.current?.offsetHeight ?? 0;
        const navHeight =
          shellRef.current?.querySelector<HTMLElement>(".nav-shell")?.offsetHeight ?? 0;
        const visibleTop = viewportTop + headerHeight + 12;
        const visibleBottom =
          viewportTop +
          viewportHeight -
          (document.documentElement.hasAttribute("data-keyboard-open") ? 16 : navHeight + 16);
        const rect = field.getBoundingClientRect();
        const scrollContainer = mainRef.current;

        if (rect.bottom > visibleBottom) {
          scrollContainer?.scrollBy({ top: rect.bottom - visibleBottom, behavior: "auto" });
        } else if (rect.top < visibleTop) {
          scrollContainer?.scrollBy({ top: rect.top - visibleTop, behavior: "auto" });
        }
      }, 120);
    };

    const onViewportChange = () => {
      updateKeyboardMetrics();
      keepDocumentFieldVisible();
    };
    updateKeyboardMetrics();
    window.addEventListener("focusin", keepDocumentFieldVisible);
    visualViewport?.addEventListener("resize", onViewportChange);
    visualViewport?.addEventListener("scroll", onViewportChange);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("focusin", keepDocumentFieldVisible);
      visualViewport?.removeEventListener("resize", onViewportChange);
      visualViewport?.removeEventListener("scroll", onViewportChange);
      document.documentElement.style.removeProperty("--keyboard-inset");
      document.documentElement.removeAttribute("data-keyboard-open");
    };
  }, []);

  const toggleNightMode = () => {
    const nextNightMode = !isNightMode;
    applyNightMode(nextNightMode);
    setIsNightMode(nextNightMode);
  };

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
          to: "/coach/tracking",
          label: "מעקב",
          id: "tracking",
          icon: Activity,
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

  const handleMainTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    if (event.touches.length !== 1) {
      touchStartRef.current = null;
      return;
    }
    touchStartRef.current = {
      x: event.touches[0]?.clientX ?? 0,
      y: event.touches[0]?.clientY ?? 0,
    };
  };

  const handleMainTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || event.changedTouches.length !== 1) return;

    const end = event.changedTouches[0];
    if (!end) return;
    const deltaX = end.clientX - start.x;
    const deltaY = end.clientY - start.y;
    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;

    const currentIndex = NAV.reduce(
      (matchedIndex, item, index) =>
        item.to === "/"
          ? location.pathname === "/"
            ? index
            : matchedIndex
          : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
            ? index
            : matchedIndex,
      -1,
    );
    if (currentIndex < 0) return;

    // Keep the requested navigation direction: a left-to-right swipe moves
    // forward through the navigation items, including nested coach routes.
    const nextIndex = deltaX > 0 ? currentIndex + 1 : currentIndex - 1;
    const nextItem = NAV[nextIndex];
    if (!nextItem) return;
    nextItem.onClick?.();
    void navigate({ to: nextItem.to });
  };

  const [showAuthModal, setShowAuthModal] = useState(authOnly);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"female" | "male">("female");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(() =>
    profileDraftFrom(store.userProfile),
  );
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [coachOptions, setCoachOptions] = useState<
    Array<{ id: string; full_name: string | null; role: "coach" | "owner" }>
  >([]);
  const [coachOptionsLoading, setCoachOptionsLoading] = useState(false);
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

  useEffect(() => {
    if (!showProfileModal || !isOwner) {
      setCoachOptions([]);
      return;
    }

    let active = true;
    setCoachOptionsLoading(true);
    void supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["coach", "owner"])
      .order("full_name", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setProfileError(`טעינת רשימת המאמנים נכשלה: ${error.message}`);
          setCoachOptions([]);
        } else {
          setCoachOptions(
            (data ?? []).filter(
              (profile): profile is { id: string; full_name: string | null; role: "coach" | "owner" } =>
                typeof profile.id === "string" &&
                (profile.role === "coach" || profile.role === "owner"),
            ),
          );
        }
        setCoachOptionsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOwner, showProfileModal]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
      if (isSignUp) {
        const normalizedFullName = fullName.trim().replace(/\s+/g, " ");
        if (normalizedFullName.split(" ").filter(Boolean).length < 2) {
          throw new Error(FULL_NAME_REQUIRED_ERROR);
        }
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
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
          setPendingVerificationEmail(normalizedEmail);
          setSuccessMsg(
            "נרשמת בהצלחה! שלחנו מייל אימות לכתובת " +
              normalizedEmail +
              ". יש לאשר את המייל להתחברות.",
          );
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            setPendingVerificationEmail(normalizedEmail);
            throw new Error(
              "כתובת האימייל עדיין לא אומתה. יש לאשר את המייל או ללחוץ על 'שלח מייל אימות מחדש'.",
            );
          }
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            throw new Error(
              genderText(
                gender,
                "האימייל או הסיסמה אינם נכונים. בדקי את הפרטים או השתמשי ב'שכחתי את הסיסמה'.",
                "האימייל או הסיסמה אינם נכונים. בדוק את הפרטים או השתמש ב'שכחתי את הסיסמה'.",
              ),
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
    const normalizedEmail = email.trim().toLowerCase();
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
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
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
    try {
      window.localStorage.removeItem(LOADING_GENDER_STORAGE_KEY);
    } catch {
      // The auth event still clears the in-memory loading mode.
    }
    await supabase.auth.signOut();
  };

  const openProfileModal = () => {
    setProfileDraft(profileDraftFrom(store.userProfile));
    setProfileError("");
    setShowProfileModal(true);
  };

  const handleProfileSave = async () => {
    const normalizedName = profileDraft.fullName.trim().replace(/\s+/g, " ");
    const parsePositiveNumber = (value: string, label: string) => {
      if (!value.trim()) return undefined;
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`יש להזין ${label} תקין.`);
      }
      return parsed;
    };

    if (normalizedName.split(" ").filter(Boolean).length < 2) {
      setProfileError("יש להזין שם פרטי ושם משפחה.");
      return;
    }

    let weight: number | undefined;
    let height: number | undefined;
    let age: number | undefined;
    try {
      weight = parsePositiveNumber(profileDraft.weight, "משקל");
      height = parsePositiveNumber(profileDraft.height, "גובה");
      age = parsePositiveNumber(profileDraft.age, "גיל");
    } catch (error) {
      setProfileError(errorMessage(error, "יש לבדוק את פרטי הפרופיל."));
      return;
    }

    setProfileSaving(true);
    setProfileError("");
    try {
      const nameResult = await completeUserProfileName(normalizedName);
      if (!nameResult.success) {
        setProfileError(nameResult.error);
        return;
      }

      const currentProfile = store.userProfile ?? { weight: 0 };
      const nextProfile: UserProfile = {
        ...currentProfile,
        fullName: normalizedName,
        weight: weight ?? currentProfile.weight ?? 0,
        gender: profileDraft.gender,
        ...(profileDraft.coachId ? { coachId: profileDraft.coachId } : {}),
      };
      if (height === undefined) delete nextProfile.height;
      else nextProfile.height = height;
      if (age === undefined) delete nextProfile.age;
      else nextProfile.age = age;
      if (!profileDraft.coachId) delete nextProfile.coachId;
      saveUserProfile(nextProfile);
      setShowProfileModal(false);
    } catch (error) {
      setProfileError(errorMessage(error, "שמירת הפרופיל נכשלה."));
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div
      ref={shellRef}
      className={
        authOnly
          ? `app-shell fixed inset-0 z-[100] min-h-[100dvh] w-full overflow-auto bg-background text-foreground ${pageClassName}`
          : `app-shell flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-background text-foreground ${pageClassName}`
      }
      dir="rtl"
    >
      <header
        ref={topbarRef}
        className="app-topbar shrink-0 sticky top-0 z-30 border-b border-border/70 bg-background/90 shadow-[0_8px_24px_oklch(0.2_0.03_35_/_0.035)] backdrop-blur-xl"
        style={{ paddingTop: "max(0.35rem, env(safe-area-inset-top))" }}
      >
        <div
          className={`mx-auto w-full max-w-3xl px-4 sm:px-6 ${
            compactHeader ? "pb-1.5 pt-0" : "pb-2 pt-0"
          }`}
        >
          <div
            className={`flex items-center justify-between gap-3 border-b border-border/50 ${
              compactHeader ? "mb-1 pb-0.5" : "mb-2 pb-1"
            }`}
          >
            <BrandLogo />
            <button
              type="button"
              onClick={toggleNightMode}
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
          {headerAccessory || (isCoach && showHomeOnlyHeaderControls) ? (
            <div
              className={`flex items-center justify-between gap-2 border-b border-border/50 ${
                compactHeader ? "mb-1 pb-0.5" : "mb-2 pb-1"
              }`}
            >
              {headerAccessory ? (
                <div className="min-w-0 shrink-0">{headerAccessory}</div>
              ) : (
                <span />
              )}
              {isCoach && showHomeOnlyHeaderControls ? (
                <div
                  className="flex items-center gap-2 rounded-full border border-border bg-surface-2 p-0.5"
                  role="group"
                  aria-label="בחירת מצב עבודה"
                >
                  <Link
                    to="/"
                    onClick={() => setWorkspace("personal")}
                    aria-current={activeMode === "personal" ? "page" : undefined}
                    className={`press min-w-20 rounded-full px-3 ${
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
                    className={`press min-w-20 rounded-full px-3 ${
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
              ) : null}
            </div>
          ) : null}
          {title || action || (user && showHomeOnlyHeaderControls) || !user ? (
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1 text-start">
                {kicker ? <p className="app-shell-kicker">{kicker}</p> : null}
                {title ? (
                  <h1
                    className={`min-w-0 truncate whitespace-nowrap font-display font-extrabold leading-snug tracking-tight text-ink ${
                      compactHeader
                        ? "text-[clamp(15px,4vw,18px)]"
                        : "text-[clamp(16px,4.5vw,20px)]"
                    }`}
                  >
                    {headerTitle}
                  </h1>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2 pt-0.5">
                {user && showHomeOnlyHeaderControls ? (
                  <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[12px] font-bold text-ink shadow-sm">
                    <SyncIcon
                      className={`h-3.5 w-3.5 ${syncIconClass} ${
                        cloudSyncStatus === "syncing" ? "animate-pulse" : ""
                      }`}
                      aria-hidden="true"
                    />
                    <button
                      type="button"
                      onClick={openProfileModal}
                      aria-label="פתיחת הפרופיל האישי"
                      className="flex max-w-[150px] min-w-0 cursor-pointer flex-col truncate text-start leading-tight transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="truncate">
                        {store.userProfile?.fullName || "החשבון שלי"}
                      </span>
                      {user.email ? (
                        <span className="truncate text-[9px] font-medium text-muted-foreground">
                          {user.email}
                        </span>
                      ) : null}
                    </button>
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
                ) : !user ? (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>התחברות</span>
                  </button>
                ) : null}
                {action}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main
        ref={mainRef}
        data-app-scroll-container="true"
        className={`app-main page-enter page-scroll-container mx-auto w-full max-w-3xl px-4 pb-8 sm:px-6 ${
          compactHeader ? "flex flex-col pt-1.5" : "pt-5 sm:pt-7"
        }`}
        onTouchStart={handleMainTouchStart}
        onTouchEnd={handleMainTouchEnd}
        style={{
          paddingBottom: "calc(6.5rem + env(safe-area-inset-bottom) + var(--keyboard-inset, 0px))",
        }}
      >
        {user ? <span className="sr-only">{syncTitle}</span> : null}
        {!authOnly ? children : null}
      </main>

      {showProfileModal ? (
        <Overlay
          open={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          ariaLabel="הפרופיל האישי"
        >
          <div
            className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-surface p-5 text-start shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  הפרופיל שלי
                </p>
                <h2 className="mt-1 truncate font-display text-lg font-extrabold text-ink">
                  פרטים אישיים
                </h2>
                {user?.email ? (
                  <p className="mt-1 truncate text-xs text-muted-foreground" dir="ltr">
                    {user.email}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                aria-label="סגירת הפרופיל"
                className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {profileError ? (
              <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-xs font-semibold text-destructive">
                {profileError}
              </p>
            ) : null}

            <div className="space-y-3">
              <label className="block text-xs font-bold text-muted-foreground">
                שם מלא
                <input
                  type="text"
                  autoComplete="name"
                  value={profileDraft.fullName}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-3.5 py-3 text-sm font-bold text-ink outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-bold text-muted-foreground">
                  משקל (ק״ג)
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={profileDraft.weight}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        weight: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-3.5 py-3 text-sm font-bold text-ink outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </label>
                <label className="block text-xs font-bold text-muted-foreground">
                  גובה (ס״מ)
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={profileDraft.height}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        height: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-3.5 py-3 text-sm font-bold text-ink outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </label>
                <label className="block text-xs font-bold text-muted-foreground">
                  גיל
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={profileDraft.age}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        age: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-3.5 py-3 text-sm font-bold text-ink outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </label>
                <label className="block text-xs font-bold text-muted-foreground">
                  מין
                  <select
                    value={profileDraft.gender}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        gender: event.target.value as "female" | "male",
                      }))
                    }
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-3.5 py-3 text-sm font-bold text-ink outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="female">נקבה</option>
                    <option value="male">זכר</option>
                  </select>
                </label>
              </div>

              {isOwner ? (
                <label className="block text-xs font-bold text-muted-foreground">
                  מאמן לפרופיל
                  <select
                    value={profileDraft.coachId}
                    disabled={coachOptionsLoading}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        coachId: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-3.5 py-3 text-sm font-bold text-ink outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-wait disabled:opacity-60"
                  >
                    <option value="">
                      {coachOptionsLoading ? "טוענת מאמנים..." : "ללא מאמן משויך"}
                    </option>
                    {coachOptions.map((coach) => (
                      <option key={coach.id} value={coach.id}>
                        {coach.id === user?.id
                          ? "אני (בעלים)"
                          : coach.full_name?.trim() || (coach.role === "owner" ? "בעלים" : "מאמן")}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-[10px] font-medium text-muted-foreground">
                    הבחירה אינה משנה את תפקיד החשבון.
                  </span>
                </label>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => void handleProfileSave()}
              disabled={profileSaving}
              className="w-full cursor-pointer rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
            >
              {profileSaving ? "שומרת..." : "שמירת הפרופיל"}
            </button>
          </div>
        </Overlay>
      ) : null}

      {showAuthModal && (
        <Overlay
          open={authOnly || showAuthModal}
          onClose={() => {
            if (!authOnly) setShowAuthModal(false);
          }}
          ariaLabel="התחברות לחשבון"
        >
          <div className="auth-panel auth-editorial-panel w-full max-w-sm space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex justify-center">
              <BrandLogo compact auth />
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
                  <label
                    htmlFor="reset-email"
                    className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-muted-foreground"
                  >
                    כתובת אימייל
                  </label>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete={isSignUp ? "email" : "username"}
                    inputMode="email"
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
                    <label
                      htmlFor="signup-name"
                      className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-muted-foreground"
                    >
                      שם מלא
                    </label>
                    <input
                      id="signup-name"
                      name="name"
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
                      inputMode="text"
                      className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="השם שיוצג באפליקציה"
                    />
                  </div>
                ) : null}
                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-[12px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5"
                  >
                    כתובת אימייל
                  </label>
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="name@example.com"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-[12px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5"
                  >
                    סיסמה
                  </label>
                  <input
                    id="auth-password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    inputMode="text"
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
                  {loading
                    ? genderText(gender, "מעבדת...", "מעבד...")
                    : isSignUp
                      ? genderText(gender, "צרי חשבון", "צור חשבון")
                      : genderText(gender, "התחברי", "התחבר")}
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
                    ? genderText(
                        gender,
                        "כבר יש לך חשבון? התחברי כאן",
                        "כבר יש לך חשבון? התחבר כאן",
                      )
                    : genderText(gender, "אין לך חשבון? הירשמי כאן", "אין לך חשבון? הירשם כאן")}
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
            className="nav-shell pointer-events-auto mx-auto flex w-full max-w-3xl items-center justify-between border-t bg-background/95 backdrop-blur-xl"
            style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
          >
            {NAV.map(({ to, label, id, icon: Icon, onClick }) => (
              <Link
                key={to}
                to={to}
                onClick={onClick}
                activeOptions={{ exact: to === "/" || to === "/coach" }}
                data-testid={`link-nav-${id}`}
                className="app-nav-link press group relative flex min-h-[3.1rem] flex-1 flex-col items-center justify-center gap-0.5 py-1 text-muted-foreground transition-colors data-[status=active]:text-primary hover:text-ink"
              >
                <span className="absolute inset-x-0 top-0 h-[2px] bg-primary opacity-0 transition-opacity group-data-[status=active]:opacity-100" />
                <Icon
                  className="h-[20px] w-[20px] transition-transform duration-200 group-data-[status=active]:scale-110 group-active:scale-95"
                  strokeWidth={2}
                />
                <span className="max-w-full truncate px-1 text-[10px] font-medium tracking-wide">
                  {label}
                </span>
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
              <span
                className="mx-1.5 mt-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: palette.swatch }}
              />
              <span
                className="mx-1.5 mt-1 h-2.5 rounded-sm"
                style={{ backgroundColor: palette.swatch, opacity: 0.65 }}
              />
            </div>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold text-ink">{palette.label}</span>
              <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                רקע בהיר · גוון מותאם
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
