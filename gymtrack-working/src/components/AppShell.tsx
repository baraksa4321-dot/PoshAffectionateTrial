import { Link, useLocation, useNavigate, useRouter } from "@tanstack/react-router";
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
  X,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  completeUserProfileName,
  clearCurrentUserLocalCache,
  getGymStoreSnapshot,
  saveTheme,
  saveReminderPreferences,
  saveUserProfile,
  resolveSyncConflict,
  useSyncConflicts,
  useAuthUser,
  useCloudSyncError,
  useCloudSyncStatus,
  flushCloudSync,
  useGym,
} from "../lib/gym-store";
import {
  configureNotificationDelivery,
  disableNotificationDelivery,
} from "../lib/notification-service";
import { supabase } from "../lib/supabase";
import { clearWorkoutDraftsForUser } from "../lib/workout-video-drafts";
import {
  applyNightMode,
  applyTheme,
  defaultThemeForGender,
  persistTheme,
  readStoredTheme,
  THEME_PALETTES,
} from "../lib/theme";
import type { ThemePalette, UserProfile } from "../lib/gym-types";
import {
  calculateAge,
  dateOfBirthInputBounds,
  isValidDateOfBirth,
} from "../lib/age";
import { Overlay } from "./ui-app/Overlay";
import { BrandLogo } from "./BrandLogo";
import { FreeTextInput } from "./FreeTextInput";
import { genderText } from "../lib/gender-copy";
import { usePersistentDraft, usePersistentFormDrafts } from "../lib/form-drafts";
import { LOADING_GENDER_EVENT, LOADING_GENDER_STORAGE_KEY } from "../lib/loading-copy";
import {
  getKeyboardViewportMetrics,
  isKeyboardEditableElement,
} from "../lib/keyboard-viewport";

const WORKSPACE_KEY = "gymtrack.workspace";
const FULL_NAME_REQUIRED_ERROR = "יש להזין שם פרטי ושם משפחה כדי ליצור חשבון.";

type ProfileDraft = {
  fullName: string;
  weight: string;
  height: string;
  dateOfBirth: string;
  gender: "female" | "male";
  coachId: string;
};

function profileDraftFrom(profile?: UserProfile): ProfileDraft {
  return {
    fullName: profile?.fullName ?? "",
    weight: profile?.weight && profile.weight > 0 ? String(profile.weight) : "",
    height: profile?.height && profile.height > 0 ? String(profile.height) : "",
    dateOfBirth: profile?.dateOfBirth ?? "",
    gender: profile?.gender ?? "female",
    coachId: profile?.coachId ?? "",
  };
}

function isManagementPath(pathname: string) {
  return /(^|\/)(coach|exercises|programs)(\/|$)/.test(pathname);
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function findScrollableAncestor(field: HTMLElement, boundary: HTMLElement | null) {
  let current = field.parentElement;
  while (current) {
    const styles = window.getComputedStyle(current);
    if (
      /(auto|scroll)/.test(styles.overflowY) &&
      current.scrollHeight > current.clientHeight + 1
    ) {
      return current;
    }
    if (current === boundary) break;
    current = current.parentElement;
  }

  if (boundary && boundary.scrollHeight > boundary.clientHeight + 1) return boundary;
  return document.scrollingElement instanceof HTMLElement ? document.scrollingElement : null;
}

type InputScrollSnapshot = {
  field: HTMLElement;
  positions: Array<{ element: HTMLElement; top: number; left: number }>;
};

function scrollAncestorsFor(field: HTMLElement) {
  const ancestors: HTMLElement[] = [];
  let current = field.parentElement;
  while (current) {
    const styles = window.getComputedStyle(current);
    if (
      /(auto|scroll)/.test(styles.overflowY) &&
      current.scrollHeight > current.clientHeight + 1
    ) {
      ancestors.push(current);
    }
    current = current.parentElement;
  }

  const documentScroller =
    document.scrollingElement instanceof HTMLElement ? document.scrollingElement : null;
  if (documentScroller && !ancestors.includes(documentScroller)) ancestors.push(documentScroller);
  return ancestors;
}

export function AppShell({
  title,
  subtitle,
  kicker,
  action,
  headerAccessory,
  hideHeading = false,
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
  hideHeading?: boolean | undefined;
  authOnly?: boolean | undefined;
  compactHeader?: boolean | undefined;
  pageClassName?: string | undefined;
  children: ReactNode;
}) {
  const store = useGym();
  const user = useAuthUser();
  usePersistentFormDrafts(user?.id ?? "guest");
  const cloudSyncStatus = useCloudSyncStatus();
  const cloudSyncError = useCloudSyncError();
  const syncConflicts = useSyncConflicts().filter((conflict) => conflict.status === "unresolved");
  const role = store.userProfile?.role;
  const isOwner = role === "owner";
  const isCoach = role === "coach" || isOwner;
  const profileGender = store.userProfile?.gender;
  const location = useLocation();
  const navigate = useNavigate();
  const router = useRouter();
  const isManagementRoute = isManagementPath(location.pathname);
  const showWorkspaceSwitcher = Boolean(
    user && isCoach && (location.pathname === "/" || location.pathname === "/coach"),
  );
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
  const [guestTheme, setGuestTheme] = useState<ThemePalette>(
    () => readStoredTheme() ?? defaultThemeForGender(profileGender),
  );
  const guestThemeWasChosenRef = useRef(readStoredTheme() !== undefined);
  const profileTheme = store.userProfile?.theme;
  const theme = profileTheme ?? guestTheme;
  const [isNightMode, setIsNightMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("gymtrack.night-mode") === "true";
  });
  const managementView = isCoach && (activeMode === "management" || isManagementRoute);
  const SyncIcon = cloudSyncStatus === "offline" ? CloudOff : Cloud;
  const syncIconClass =
    cloudSyncStatus === "offline"
      ? "text-amber-700"
      : cloudSyncStatus === "conflict"
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
          : cloudSyncStatus === "conflict"
            ? "נמצאה התנגשות — נדרשת בחירה לפני סנכרון"
          : cloudSyncStatus === "error"
            ? "השינויים נשמרו במכשיר — הסנכרון דורש תשומת לב"
            : "הנתונים מסונכרנים";
  const readableSyncError =
    /permission denied|row-level security|42501/i.test(cloudSyncError)
      ? "השרת דחה את השינוי בגלל הרשאה. הנתונים המקומיים נשמרו, אבל צריך לתקן את הרשאת הסנכרון."
      : cloudSyncError;

  useEffect(() => {
    if (!isManagementRoute) return;
    setActiveMode("management");
    if (typeof window !== "undefined") {
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
    if (profileTheme || guestThemeWasChosenRef.current) return;
    const genderTheme = defaultThemeForGender(profileGender);
    setGuestTheme(genderTheme);
    applyTheme(genderTheme);
  }, [profileGender, profileTheme]);

  useEffect(() => {
    applyNightMode(isNightMode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("gymtrack.night-mode", String(isNightMode));
    }
  }, [isNightMode]);

  useEffect(() => {
    if (!user?.id || !isCoach || typeof window === "undefined") return;

    const warmManagementRoute = () => {
      void router.preloadRoute({ to: "/coach" }).catch(() => undefined);
    };
    const requestIdle = (
      window as typeof window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    const cancelIdle = (
      window as typeof window & { cancelIdleCallback?: (handle: number) => void }
    ).cancelIdleCallback;
    let idleHandle: number | null = null;
    let timerHandle: number | null = null;

    if (requestIdle) {
      idleHandle = requestIdle(warmManagementRoute, { timeout: 1_200 });
    } else {
      timerHandle = window.setTimeout(warmManagementRoute, 700);
    }

    return () => {
      if (idleHandle !== null) cancelIdle?.(idleHandle);
      if (timerHandle !== null) window.clearTimeout(timerHandle);
    };
  }, [isCoach, router, user?.id]);

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
    let delayedFocusTimer = 0;
    let snapshotTimer = 0;
    let inputRestoreFrame = 0;
    let inputRestoreSecondFrame = 0;
    let inputScrollSnapshot: InputScrollSnapshot | null = null;

    const updateKeyboardMetrics = () => {
      const { keyboardInset, keyboardOpen } = getKeyboardViewportMetrics();
      document.documentElement.style.setProperty("--keyboard-inset", `${keyboardInset}px`);
      document.documentElement.toggleAttribute("data-keyboard-open", keyboardOpen);
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

        const { viewportTop, visibleHeight: viewportHeight } = getKeyboardViewportMetrics();
        const headerHeight = topbarRef.current?.offsetHeight ?? 0;
        const navElement = shellRef.current?.querySelector<HTMLElement>(".nav-shell");
        const navRect = navElement?.getBoundingClientRect();
        const scrollContainer = findScrollableAncestor(field, mainRef.current);
        const containerRect = scrollContainer?.getBoundingClientRect();
        const visibleTop = Math.max(
          viewportTop + headerHeight + 12,
          containerRect ? containerRect.top + 12 : Number.NEGATIVE_INFINITY,
        );
        const viewportBottom = viewportTop + viewportHeight;
        const navCoversViewport =
          navRect &&
          navRect.top < viewportBottom &&
          navRect.bottom > viewportTop;
        const visibleBottom = Math.min(
          viewportBottom - 16,
          navCoversViewport ? navRect.top - 12 : Number.POSITIVE_INFINITY,
        );
        const constrainedVisibleBottom = Math.min(
          visibleBottom,
          containerRect ? containerRect.bottom - 16 : Number.POSITIVE_INFINITY,
        );
        const rect = field.getBoundingClientRect();
        const delta =
          rect.bottom > constrainedVisibleBottom
            ? rect.bottom - constrainedVisibleBottom
            : rect.top < visibleTop
              ? rect.top - visibleTop
              : 0;

        if (scrollContainer && delta) {
          scrollContainer.scrollTo({
            top: Math.max(0, scrollContainer.scrollTop + delta),
            behavior: "auto",
          });
        }

      }, 120);
    };

    const captureInputScrollSnapshot = (field: HTMLElement) => {
      const positions = scrollAncestorsFor(field).map((element) => ({
        element,
        top: element.scrollTop,
        left: element.scrollLeft,
      }));
      if (positions.length) inputScrollSnapshot = { field, positions };
    };

    const onFocusIn = () => {
      updateKeyboardMetrics();
      keepDocumentFieldVisible();
      window.clearTimeout(delayedFocusTimer);
      delayedFocusTimer = window.setTimeout(keepDocumentFieldVisible, 360);

      const field = document.activeElement;
      if (!(field instanceof HTMLElement) || !isKeyboardEditableElement(field)) return;
      window.clearTimeout(snapshotTimer);
      captureInputScrollSnapshot(field);
      snapshotTimer = window.setTimeout(() => {
        if (document.activeElement === field) captureInputScrollSnapshot(field);
      }, 280);
    };

    const onFocusOut = () => {
      window.setTimeout(updateKeyboardMetrics, 0);
      window.clearTimeout(snapshotTimer);
      inputScrollSnapshot = null;
    };

    const onInput = (event: Event) => {
      const field = event.target;
      if (!(field instanceof HTMLElement) || !isKeyboardEditableElement(field)) return;
      if (document.activeElement !== field || inputScrollSnapshot?.field !== field) return;

      // Capture the position at the start of this input event. On iOS the
      // browser can move the document while opening the keyboard, so a
      // snapshot captured on focus may be stale by the time a controlled
      // input rerenders.
      const currentPositions = scrollAncestorsFor(field).map((element) => ({
        element,
        top: element.scrollTop,
        left: element.scrollLeft,
      }));
      if (currentPositions.length) {
        inputScrollSnapshot = { field, positions: currentPositions };
      }

      window.cancelAnimationFrame(inputRestoreFrame);
      window.cancelAnimationFrame(inputRestoreSecondFrame);
      inputRestoreFrame = window.requestAnimationFrame(() => {
        inputRestoreSecondFrame = window.requestAnimationFrame(() => {
          if (document.activeElement !== field || inputScrollSnapshot?.field !== field) return;
          for (const position of inputScrollSnapshot.positions) {
            position.element.scrollTop = position.top;
            position.element.scrollLeft = position.left;
          }
        });
      });
    };

    const onViewportResize = () => {
      updateKeyboardMetrics();
    };
    updateKeyboardMetrics();
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);
    window.addEventListener("input", onInput, true);
    visualViewport?.addEventListener("resize", onViewportResize);

    return () => {
      window.clearTimeout(focusTimer);
      window.clearTimeout(delayedFocusTimer);
      window.clearTimeout(snapshotTimer);
      window.cancelAnimationFrame(inputRestoreFrame);
      window.cancelAnimationFrame(inputRestoreSecondFrame);
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("input", onInput, true);
      visualViewport?.removeEventListener("resize", onViewportResize);
      document.documentElement.style.removeProperty("--keyboard-inset");
      document.documentElement.removeAttribute("data-keyboard-open");
    };
  }, []);

  const toggleNightMode = () => {
    const nextNightMode = !isNightMode;
    applyNightMode(nextNightMode);
    setIsNightMode(nextNightMode);
  };

  const handleThemeChange = async (nextTheme: ThemePalette) => {
    const previousTheme = theme;
    setThemeError("");
    guestThemeWasChosenRef.current = true;
    setGuestTheme(nextTheme);
    persistTheme(nextTheme);
    applyTheme(nextTheme);

    const result = await saveTheme(nextTheme);
    if (!result.success) {
      setGuestTheme(previousTheme);
      persistTheme(previousTheme);
      applyTheme(previousTheme);
      setThemeError(result.error ?? "שמירת הפלטה נכשלה");
    }
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
          label: "תוכניות",
          id: "programs",
          icon: Dumbbell,
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
          to: "/workouts",
          label: "האימונים שלי",
          id: "workouts",
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
  const [email, setEmail] = usePersistentDraft("auth.email", "");
  const [fullName, setFullName] = usePersistentDraft("auth.signup.fullName", "");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = usePersistentDraft("auth.signup.dateOfBirth", "");
  const [gender, setGender] = usePersistentDraft<"female" | "male" | undefined>(
    "auth.signup.gender",
    undefined,
  );
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
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
  const [reminderDraft, setReminderDraft] = useState(
    store.reminderPreferences ?? {
      enabled: false,
      deliveryState: "not-configured" as const,
    },
  );
  const [notificationSaving, setNotificationSaving] = useState(false);
  const notificationSetupKeyRef = useRef("");
  const headerTitle = authOnly ? genderText(gender, "ברוכה הבאה", "ברוך הבא") : title;
  const headerSubtitle = authOnly
    ? genderText(gender, "התחברי כדי להמשיך לאימונים ולתזונה", "התחבר כדי להמשיך לאימונים ולתזונה")
    : subtitle;

  useEffect(() => {
    if (profileGender) setGender(profileGender);
  }, [profileGender]);

  useEffect(() => {
    if (!user?.id || !store.reminderPreferences?.enabled) {
      notificationSetupKeyRef.current = "";
      return;
    }
    const setupKey = `${user.id}:enabled`;
    if (notificationSetupKeyRef.current === setupKey) return;
    notificationSetupKeyRef.current = setupKey;
    void configureNotificationDelivery(user.id).then((result) => {
      const current = getGymStoreSnapshot().reminderPreferences;
      if (!current?.enabled) return;
      const next = {
        ...current,
        deliveryState: result.state,
        deliveryDetail: result.detail,
        lastAttemptAt: new Date().toISOString(),
      };
      setReminderDraft(next);
      saveReminderPreferences(next);
    });
  }, [store.reminderPreferences?.enabled, user?.id]);

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
        if (!gender) {
          throw new Error("יש לבחור מין כדי להתאים את חוויית הטעינה.");
        }
        if (!isValidDateOfBirth(dateOfBirth)) {
          throw new Error("יש להזין תאריך לידה תקין שאינו בעתיד.");
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
              date_of_birth: dateOfBirth,
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
      try {
        // Seed the loading surface from the choice already made in the auth
        // form, before profile hydration has returned from Supabase.
        if (gender) window.localStorage.setItem(LOADING_GENDER_STORAGE_KEY, gender);
      } catch {
        // The auth metadata/profile remains the source of truth if storage is unavailable.
      }
      const { error: themeSaveError } = await supabase.auth.updateUser({
        data: {
          theme,
          gender,
          ...(isSignUp ? { full_name: fullName.trim().replace(/\s+/g, " ") } : {}),
          ...(isSignUp ? { date_of_birth: dateOfBirth } : {}),
        },
      });
      if (themeSaveError) throw themeSaveError;
      setShowAuthModal(false);
      setEmail("");
      setFullName("");
      setPassword("");
      setDateOfBirth("");
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
      window.localStorage.removeItem("gymtrack.v1.lastAuthenticatedUser");
    } catch {
      // The auth event still clears the in-memory loading mode.
    }
    if (user?.id) await clearWorkoutDraftsForUser(user.id);
    if (user?.id) await disableNotificationDelivery(user.id);
    await supabase.auth.signOut();
  };

  const openProfileModal = () => {
    setProfileDraft(profileDraftFrom(store.userProfile));
    setReminderDraft(
      store.reminderPreferences ?? {
        enabled: false,
        deliveryState: "not-configured",
      },
    );
    setProfileError("");
    setShowProfileModal(true);
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    const next = {
      ...reminderDraft,
      enabled,
      deliveryState: enabled ? ("not-configured" as const) : ("paused" as const),
      lastAttemptAt: new Date().toISOString(),
      ...(enabled ? { deliveryDetail: "מבקשת הרשאת התראות..." } : {}),
    };
    setReminderDraft(next);
    saveReminderPreferences(next);
    if (!user?.id) return;
    setNotificationSaving(true);
    try {
      if (!enabled) {
        notificationSetupKeyRef.current = "";
        await disableNotificationDelivery(user.id);
        setReminderDraft((current) => ({ ...current, deliveryState: "paused", deliveryDetail: "ההתראות כבויות." }));
        saveReminderPreferences({ ...next, deliveryState: "paused", deliveryDetail: "ההתראות כבויות." });
        return;
      }
      notificationSetupKeyRef.current = `${user.id}:enabled`;
      const result = await configureNotificationDelivery(user.id);
      const configured = {
        ...next,
        deliveryState: result.state,
        deliveryDetail: result.detail,
      };
      setReminderDraft(configured);
      saveReminderPreferences(configured);
    } finally {
      setNotificationSaving(false);
    }
  };

  const exportLocalData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      format: "gymtrack-local-export-v1",
      data: getGymStoreSnapshot(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `gymtrack-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
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
    let dateOfBirth: string | undefined;
    try {
      weight = parsePositiveNumber(profileDraft.weight, "משקל");
      height = parsePositiveNumber(profileDraft.height, "גובה");
      if (profileDraft.dateOfBirth && !isValidDateOfBirth(profileDraft.dateOfBirth)) {
        throw new Error("יש להזין תאריך לידה תקין שאינו בעתיד.");
      }
      dateOfBirth = profileDraft.dateOfBirth || undefined;
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
        ...(dateOfBirth ? { dateOfBirth } : {}),
        ...(profileDraft.coachId ? { coachId: profileDraft.coachId } : {}),
      };
      if (height === undefined) delete nextProfile.height;
      else nextProfile.height = height;
      if (dateOfBirth) {
        const calculatedAge = calculateAge(dateOfBirth);
        if (calculatedAge === undefined) {
          setProfileError("לא ניתן לחשב גיל מתאריך הלידה שסופק.");
          return;
        }
        nextProfile.age = calculatedAge;
      } else {
        delete nextProfile.dateOfBirth;
        delete nextProfile.age;
      }
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
            ? `app-shell app-shell--compact-rhythm fixed inset-0 z-[100] min-h-[100lvh] w-full overflow-auto bg-background text-foreground ${pageClassName}`
            : `app-shell app-shell--compact-rhythm flex h-[100lvh] min-h-0 w-full flex-col overflow-hidden bg-background text-foreground ${pageClassName}`
      }
      data-management-view={managementView ? "true" : undefined}
      data-compact-header={compactHeader ? "true" : undefined}
      dir="rtl"
    >
      <header
        ref={topbarRef}
        className="app-topbar shrink-0 sticky top-0 z-30 border-b border-border/70 bg-background/90 shadow-[0_8px_24px_oklch(0.2_0.03_35_/_0.035)] backdrop-blur-xl"
        style={{ paddingTop: "max(0.35rem, env(safe-area-inset-top))" }}
      >
        <div
          className={`app-topbar__inner mx-auto w-full max-w-3xl px-4 sm:px-6 ${
            compactHeader ? "pb-1.5 pt-0" : "pb-1.5 pt-0"
          }`}
        >
          <div
            className={`app-topbar__brand-row flex items-center justify-between gap-3 border-b border-border/50 ${
              compactHeader ? "mb-1 pb-0.5" : "mb-1.5 pb-0.5"
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
          {headerAccessory || showWorkspaceSwitcher ? (
            <div
              className={`app-topbar__utility-row relative flex items-center justify-end gap-2 border-b border-border/50 ${
                showWorkspaceSwitcher ? "min-h-[2.25rem]" : ""
              } ${
                compactHeader ? "mb-1 pb-0.5" : "mb-1.5 pb-0.5"
              }`}
            >
              {headerAccessory ? (
                <div className="app-topbar__accessory min-w-0 flex-1 overflow-visible">
                  {headerAccessory}
                </div>
              ) : null}
              {showWorkspaceSwitcher ? (
                <div
                  className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-full border border-border bg-surface-2 p-0.5"
                  role="group"
                  aria-label="בחירת מצב עבודה"
                >
                  <Link
                    to="/"
                    preload="intent"
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
                    preload="intent"
                    onClick={() => setWorkspace("management")}
                    data-testid="link-nav-coach"
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
          {!hideHeading && (title || action || (user && showHomeOnlyHeaderControls) || !user) ? (
            <div className="app-topbar__heading flex items-start gap-3">
              <div className="min-w-0 flex-1 text-start">
                {kicker ? <p className="app-shell-kicker">{kicker}</p> : null}
                {title ? (
                  <h1
                    className={`min-w-0 break-words font-display font-extrabold leading-snug tracking-tight text-ink ${
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
                    <button
                      type="button"
                      onClick={() => setShowSyncModal(true)}
                      aria-label={syncTitle}
                      title={syncTitle}
                      className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <SyncIcon
                        className={`h-3.5 w-3.5 ${syncIconClass} ${
                          cloudSyncStatus === "syncing" ? "animate-pulse" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
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
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSyncModal(true)}
                    aria-label={syncTitle}
                    title={syncTitle}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border/70 bg-surface text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <SyncIcon
                      className={`h-4 w-4 ${syncIconClass} ${
                        cloudSyncStatus === "syncing" ? "animate-pulse" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                )}
                {action}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main
        ref={mainRef}
        data-app-scroll-container="true"
        data-management-view={managementView ? "true" : undefined}
        className={`app-main page-enter page-scroll-container mx-auto w-full max-w-3xl px-4 pb-7 sm:px-6 ${
          compactHeader ? "flex flex-col pt-1.5" : "pt-3.5 sm:pt-5"
        }`}
        onTouchStart={handleMainTouchStart}
        onTouchEnd={handleMainTouchEnd}
      >
        {user ? <span className="sr-only">{syncTitle}</span> : null}
        {!authOnly ? children : null}
      </main>

      {showSyncModal ? (
        <Overlay
          open={showSyncModal}
          onClose={() => setShowSyncModal(false)}
          ariaLabel="מצב סנכרון ופתרון התנגשויות"
        >
          <div
            className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-surface p-5 text-start shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  שקיפות נתונים
                </p>
                <h2 className="mt-1 font-display text-lg font-extrabold text-ink">
                  מצב סנכרון
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                aria-label="סגירת מצב הסנכרון"
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-3">
              <SyncIcon className={`h-5 w-5 ${syncIconClass}`} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-ink">{syncTitle}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  העריכות נשמרות קודם במכשיר. רענון מרוחק לא יחליף עריכה מקומית ממתינה.
                </p>
              </div>
            </div>
            {cloudSyncStatus === "error" && readableSyncError ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-xs leading-relaxed text-destructive">
                <p className="font-bold">סיבת הכשל</p>
                <p className="mt-1 break-words">{readableSyncError}</p>
              </div>
            ) : null}

            {cloudSyncStatus === "error" || cloudSyncStatus === "pending" ? (
              <button
                type="button"
                onClick={() => void flushCloudSync()}
                className="press inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/25 bg-primary/5 px-3 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                לנסות לסנכרן עכשיו
              </button>
            ) : null}

            {syncConflicts.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-extrabold text-ink">נדרשת הכרעה</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    נמצאו עריכות מקומיות ומרוחקות לאותו מרחב. בחרי איזה snapshot לשמור — אין
                    דריסה אוטומטית.
                  </p>
                </div>
                {syncConflicts.map((conflict) => (
                  <div key={conflict.id} className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3">
                    <p className="text-xs font-bold text-ink">
                      זוהתה התנגשות ב־{new Date(conflict.detectedAt).toLocaleString("he-IL")}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => resolveSyncConflict(conflict.id, "keep-local")}
                        className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-ink transition-colors hover:border-primary"
                      >
                        לשמור את המקומי
                      </button>
                      <button
                        type="button"
                        onClick={() => resolveSyncConflict(conflict.id, "use-remote")}
                        className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        להשתמש בענן
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-primary/10 px-3 py-2.5 text-xs font-semibold text-primary">
                אין התנגשויות פתוחות.
              </p>
            )}

            <p className="text-[11px] leading-relaxed text-muted-foreground">
              במצב offline אפשר להמשיך לעבוד. ניסיון חוזר יופעל כשהחיבור יחזור, ובמקרה של
              שגיאה הנתונים המקומיים יישארו זמינים.
            </p>
          </div>
        </Overlay>
      ) : null}

      {showProfileModal ? (
        <Overlay
          open={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          ariaLabel="הפרופיל האישי"
          variant="top"
          safeTop
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
                  <FreeTextInput
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
                  <FreeTextInput
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
                  תאריך לידה
                  <input
                    type="date"
                    {...dateOfBirthInputBounds()}
                    value={profileDraft.dateOfBirth}
                    onChange={(event) =>
                      setProfileDraft((current) => ({
                        ...current,
                        dateOfBirth: event.target.value,
                      }))
                    }
                    className="mt-1 w-full appearance-none rounded-2xl border border-border bg-background px-3.5 py-3 text-[13px] font-semibold leading-5 text-ink outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <span className="mt-1 block text-[10px] font-medium text-muted-foreground">
                    {!profileDraft.dateOfBirth && store.userProfile?.age !== undefined
                      ? "יש להשלים תאריך לידה כדי שהגיל יתעדכן אוטומטית"
                      : profileDraft.dateOfBirth && calculateAge(profileDraft.dateOfBirth) !== undefined
                        ? `גיל מחושב: ${calculateAge(profileDraft.dateOfBirth)}`
                        : "מלאי תאריך לידה כדי לחשב גיל"}
                  </span>
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

              <section className="space-y-3 rounded-2xl border border-border bg-background p-3">
                <div>
                  <h3 className="text-sm font-extrabold text-ink">התראות</h3>
                </div>
                <label className="flex items-center justify-between gap-3 text-xs font-bold text-ink">
                  <span>התראות</span>
                  <input
                    type="checkbox"
                    checked={reminderDraft.enabled}
                    disabled={notificationSaving}
                    onChange={(event) => void handleNotificationToggle(event.target.checked)}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                </label>
              </section>

              <section className="space-y-3 rounded-2xl border border-border bg-background p-3">
                <div>
                  <h3 className="text-sm font-extrabold text-ink">פרטיות ונתונים</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    הנתונים נשמרים במכשיר לצורך offline ובענן כדי לאפשר סנכרון. המאמן רואה רק
                    מידע שמותר לו לפי הקישור וההרשאות של החשבון.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={exportLocalData}
                    className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-bold text-ink transition-colors hover:border-primary"
                  >
                    ייצוא הנתונים שלי
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          "למחוק את העותק המקומי מהמכשיר? נתוני הענן לא יימחקו, והאפליקציה תטען אותם מחדש בחיבור הבא.",
                        )
                      ) {
                        clearCurrentUserLocalCache();
                        setShowProfileModal(false);
                      }
                    }}
                    className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive/15"
                  >
                    ניקוי העותק מהמכשיר
                  </button>
                </div>
              </section>
            </div>

            <button
              type="button"
              onClick={() => {
                saveReminderPreferences(reminderDraft);
                void handleProfileSave();
              }}
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
          panelClassName="contents"
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
              onChange={handleThemeChange}
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
                {isSignUp ? (
                  <div>
                    <label
                      htmlFor="signup-date-of-birth"
                      className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-muted-foreground"
                    >
                      תאריך לידה
                    </label>
                    <input
                      id="signup-date-of-birth"
                      name="dateOfBirth"
                      type="date"
                      required
                      {...dateOfBirthInputBounds()}
                      value={dateOfBirth}
                      onChange={(event) => setDateOfBirth(event.target.value)}
                      autoComplete="bday"
                      className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      הגיל יחושב אוטומטית וישתנה ביום ההולדת.
                    </p>
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
                            onChange={() => {
                              setGender(value);
                              try {
                                window.localStorage.setItem(LOADING_GENDER_STORAGE_KEY, value);
                                window.dispatchEvent(
                                  new CustomEvent(LOADING_GENDER_EVENT, {
                                    detail: { gender: value },
                                  }),
                                );
                              } catch {
                                // The selected form value still controls the signup flow.
                              }
                              if (!guestThemeWasChosenRef.current && !profileTheme) {
                                const genderTheme = defaultThemeForGender(value);
                                setGuestTheme(genderTheme);
                                applyTheme(genderTheme);
                              }
                            }}
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
              onChange={handleThemeChange}
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
        <nav
          aria-label="ניווט ראשי"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40"
        >
          <div
            className="nav-shell app-bottom-nav pointer-events-auto mx-auto flex w-full max-w-3xl items-center justify-between border-t bg-background/95 backdrop-blur-xl"
            style={{ paddingBottom: "0.25rem" }}
          >
            {NAV.map(({ to, label, id, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                preload="intent"
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
    <div className="login-theme-selector flex items-center justify-between gap-3 border-y border-border/50 py-3 text-start">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground">צבע ממשק</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground/80">אפשר לשנות גם אחרי ההתחברות</p>
      </div>
      <label className="login-theme-selector__control flex shrink-0 items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-ink transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
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
