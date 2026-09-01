import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Link,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import "../styles.css";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import { LoadingSpinner } from "../components/ui-app/LoadingSpinner";
import {
  completeUserProfileName,
  retryProfileHydration,
  useAuthStatus,
  useGym,
  useProfileHydrationError,
  useProfileHydrationStatus,
} from "../lib/gym-store";
import { supabase } from "../lib/supabase";
import { genderText } from "../lib/gender-copy";
import {
  LOADING_CYCLE_STORAGE_KEY,
  LOADING_GENDER_STORAGE_KEY,
  loadingCycleIndexes,
  loadingMessageForGender,
  readLoadingGender,
  readLoadingCycle,
  type LoadingGender,
} from "../lib/loading-copy";
import { LockKeyhole, RefreshCw } from "lucide-react";

const useLoadingCycleEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const LOADING_RECOVERY_TIMEOUT_MS = 45_000;

async function resetAuthSessionAndReload() {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // A future-issued JWT can make the network sign-out fail. Clearing the
    // persisted token locally is enough to return to the login screen.
  }
  try {
    const authKeys = Object.keys(window.localStorage).filter(
      (key) => key.startsWith("sb-") && key.endsWith("-auth-token"),
    );
    authKeys.forEach((key) => window.localStorage.removeItem(key));
    window.localStorage.removeItem("supabase.auth.token");
    window.localStorage.removeItem(LOADING_GENDER_STORAGE_KEY);
  } catch {
    // Storage may be unavailable in private browsing; reload still lets the
    // auth client retry with an empty in-memory session.
  }
  window.location.reload();
}

function CompleteProfileName() {
  const { userProfile } = useGym();
  const [fullName, setFullName] = useState(userProfile?.fullName ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const result = await completeUserProfileName(fullName);
    if (!result.success) {
      setError(result.error);
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-sm rounded-3xl border border-border/60 bg-white px-6 py-7 text-center shadow-sm">
        <div className="flex justify-center">
          <BrandLogo compact />
        </div>
        <h1 className="mt-6 text-xl font-bold text-foreground">נשמח להכיר אותך</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          לפני שממשיכים, {genderText(userProfile?.gender, "כתבי", "כתוב")} את השם המלא שיוצג
          באפליקציה ובמסכי המאמן.
        </p>
        {error ? (
          <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm font-semibold text-destructive">
            {error}
          </p>
        ) : null}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-start">
          <label className="block text-sm font-bold text-foreground" htmlFor="required-full-name">
            שם מלא
          </label>
          <input
            id="required-full-name"
            type="text"
            required
            minLength={2}
            autoFocus
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="לדוגמה: ישראל ישראלי"
            className="w-full rounded-xl border border-border bg-background px-3 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? genderText(userProfile?.gender, "שומרת...", "שומר...") : "שמירת השם והמשך"}
          </button>
        </form>
      </div>
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">העמוד לא נמצא</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          העמוד שחיפשת אינו קיים או שהועבר לכתובת אחרת.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { userProfile } = useGym();
  useLoadingCycleEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          אירעה שגיאה בטעינת העמוד
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          משהו השתבש, אפשר לנסות לרענן או לחזור לדף הבית.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {genderText(userProfile?.gender, "נסי שוב", "נסה שוב")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            חזרה לדף הבית
          </a>
        </div>
      </div>
    </div>
  );
}

type RuntimeErrorBoundaryProps = {
  children: ReactNode;
};

type RuntimeErrorBoundaryState = {
  error: Error | null;
};

class RuntimeErrorBoundary extends Component<RuntimeErrorBoundaryProps, RuntimeErrorBoundaryState> {
  override state: RuntimeErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RuntimeErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
    reportLovableError(error, {
      boundary: "application_runtime_boundary",
      componentStack: errorInfo.componentStack ?? "",
    });
  }

  override render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4" dir="rtl">
        <div className="w-full max-w-md rounded-3xl border border-destructive/20 bg-white px-6 py-7 text-center shadow-sm">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <h1 className="mt-5 text-lg font-bold text-foreground">העמוד לא נטען</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            משהו השתבש בטעינת המסך. אפשר לנסות לטעון מחדש בלי לאבד את הנתונים ששמורים במכשיר.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              טעני מחדש
            </button>
            <a
              href="/"
              className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground"
            >
              חזרה לדף הבית
            </a>
          </div>
        </div>
      </div>
    );
  }
}

function isAppLoadingError(error: unknown) {
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === "string"
        ? error
        : "";
  return /chunk|dynamically imported module|importing a module script|loading css/i.test(message);
}

function BrowserRuntimeGuard({ children }: RuntimeErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (event.error || isAppLoadingError(event.message)) {
        setError(
          event.error instanceof Error
            ? event.error
            : new Error(event.message || "שגיאה לא צפויה בדפדפן"),
        );
      }
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      if (!isAppLoadingError(event.reason)) return;
      event.preventDefault();
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  if (!error) return children;

  const recover = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    } catch {
      // Reload still helps when storage or Service Worker APIs are unavailable.
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-md rounded-3xl border border-destructive/20 bg-white px-6 py-7 text-center shadow-sm">
        <div className="flex justify-center">
          <BrandLogo compact />
        </div>
        <h1 className="mt-5 text-lg font-bold text-foreground">האתר לא נטען כראוי</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          זוהתה בעיה בטעינת קובץ של האפליקציה. אפשר לבצע טעינה נקייה בלי למחוק את הנתונים השמורים.
        </p>
        <button
          type="button"
          onClick={() => void recover()}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          טעינה נקייה
        </button>
      </div>
    </div>
  );
}

const LOADING_FOOD_ILLUSTRATIONS: Array<{ color: string; shell: string; growth?: boolean }> = [
  { color: "#f3a24b", shell: "M75 12c23 0 37 16 37 39s-14 40-37 40S38 74 38 51 52 12 75 12z" },
  {
    color: "#f3cf5b",
    shell: "M40 51c9-29 28-40 54-29 19 8 21 26 7 45-14 18-34 28-50 15-11-9-16-17-11-31z",
  },
  {
    color: "#e56e72",
    shell: "M75 28c25 0 34 18 23 43-8 18-15 27-23 27S60 89 52 71C41 46 50 28 75 28z",
  },
  { color: "#e77b75", shell: "M38 47h74c-4 30-17 45-37 45S42 77 38 47z" },
  {
    color: "#e7bd59",
    shell: "M48 31c0-12 12-20 27-20s27 8 27 20v43c0 12-12 18-27 18s-27-6-27-18z",
  },
  { color: "#ed9154", shell: "M51 28h48l-5 60c-1 7-11 9-19 9s-18-2-19-9z" },
  {
    color: "#df786c",
    shell:
      "M59 29c-4-16 12-22 16-10 4-12 20-6 16 10 12 8 9 35-2 55-6 10-21 10-27 0-11-20-14-47-3-55z",
  },
  {
    color: "#c99573",
    shell: "M38 48c0-23 17-37 37-37s37 14 37 37H91v39c0 8-6 12-16 12s-16-4-16-12V48z",
  },
  { color: "#dca66c", shell: "M40 39c0-19 14-28 35-28s35 9 35 28v46c0 8-12 12-35 12S40 93 40 85z" },
  { color: "#f1ca65", shell: "M39 39l36-24 36 24v48c-22 10-50 10-72 0z" },
  { color: "#d993bd", shell: "M38 52c0-23 16-39 37-39s37 16 37 39-16 39-37 39-37-16-37-39z" },
  { color: "#d99cba", shell: "M46 47h58l-6 43H52z" },
  { color: "#d5a36d", shell: "M38 53c0-22 16-39 37-39s37 17 37 39-16 38-37 38-37-16-37-38z" },
  {
    color: "#9d83c7",
    shell:
      "M75 21c-6-12 7-19 13-10-2 7-5 10-13 10zM55 40c-12 0-16 13-8 19-10 6-4 20 8 18-2 12 13 18 20 8 8 10 23 4 20-8 12 2 18-12 8-18 8-6 4-19-8-19-4-10-17-10-20 0-3-10-16-10-20 0z",
  },
  { color: "#83b7a4", shell: "M43 28h64v49c0 13-14 20-32 20S43 90 43 77z" },
  {
    color: "#d99a64",
    shell: "M39 48c0-19 16-32 36-32s36 13 36 32H39zM39 57h72v14H39zM45 76h60c-7 16-53 16-60 0z",
  },
  { color: "#a97c66", shell: "M46 31h58v47c0 12-13 17-29 17S46 90 46 78zM104 43c23-2 23 27 0 25" },
  { color: "#cf91a7", shell: "M48 30h54l-7 63H55zM61 30l8-17h12l8 17z" },
  {
    color: "#d9899d",
    growth: true,
    shell:
      "M75 88c-25 0-39-14-35-31 2-9 9-15 18-16 3-16 16-26 30-22 10 3 16 12 15 22 10 1 17 9 17 19 0 17-17 28-45 28z",
  },
  {
    color: "#c97f93",
    growth: true,
    shell:
      "M52 84c-10-9-11-22-2-31 5-5 11-7 17-6-2-13 7-26 20-27 13-1 23 9 22 22 10 4 15 14 12 24-5 17-36 30-69 18z",
  },
  {
    color: "#e09b9a",
    growth: true,
    shell:
      "M75 90c-24 0-39-12-39-29 0-12 8-22 21-25 4-12 13-20 27-20s23 8 27 20c13 3 21 13 21 25 0 17-15 29-39 29z",
  },
  {
    color: "#d9a39f",
    growth: true,
    shell:
      "M53 18c12-9 32-8 44 1 7 6 10 15 8 25 9 8 10 23 2 32-15 16-54 16-68 0-8-9-7-24 2-32-2-11 2-20 12-26z",
  },
  {
    color: "#d98291",
    growth: true,
    shell:
      "M75 90c-7-17-29-18-35-36-6-17 10-30 24-22 5-16 17-23 28-18 10 4 14 14 12 24 15-5 29 9 23 25-6 17-29 17-52 27z",
  },
  {
    color: "#8fc6b3",
    growth: true,
    shell:
      "M48 76c-11-17-4-34 13-39-1-16 11-27 25-24 12 3 18 14 15 25 17 4 23 22 13 35-13 17-50 20-66 3z",
  },
] as const;

const LOADING_CHARACTER_POSES = [
  "קפיצות פתיחה",
  "סקוואט",
  "ריצה",
  "ברכיים גבוהות",
  "קפיצה בחבל",
  "מתיחת צד",
  "כפיפת מרפקים",
  "תנוחת יוגה",
  "ריקוד",
  "הרמת משקולת",
  "קפיצת כוכב",
  "בעיטת צד",
  "לאנג׳",
  "ריצה במקום",
  "מתיחת בוקר",
  "קפיצת שמחה",
  "סיבוב גוף",
  "אגרוף",
  "הרמת ברכיים",
  "נפנוף",
] as const;

const REFERENCE_LOADING_IMAGES = [
  { file: "banana-dance.png", label: "בננה באימון שיווי משקל" },
  { file: "dog-yoga.png", label: "כלבלב ביוגה" },
  { file: "frog-stretch.png", label: "צפרדע במתיחה" },
  { file: "avocado-hula.png", label: "אבוקדו עם חישוק" },
  { file: "avocado-dumbbells.png", label: "אבוקדו מרים משקולות" },
  { file: "avocado-rope.png", label: "אבוקדו בקפיצה בחבל" },
] as const;

const SIMPLE_LOADING_ILLUSTRATIONS = [
  { file: "user-strawberry.png", label: "תות מצויר" },
  { file: "user-tomato.png", label: "עגבנייה מצוירת" },
  { file: "user-character-01.png", label: "דמות מצוירת" },
  { file: "user-character-02.png", label: "דמות מצוירת" },
  { file: "user-lemon.png", label: "לימון מצויר" },
  { file: "user-character-03.png", label: "דמות מצוירת" },
  { file: "user-character-04.png", label: "דמות מצוירת" },
  { file: "user-character-05.png", label: "דמות מצוירת" },
  { file: "user-character-06.png", label: "דמות מצוירת" },
  { file: "user-character-07.png", label: "דמות מצוירת" },
  { file: "user-character-08.png", label: "דמות מצוירת" },
  { file: "user-character-09.png", label: "דמות מצוירת" },
  { file: "user-character-10.png", label: "דמות מצוירת" },
] as const;

function SimpleLoadingIllustration({ variant }: { variant: number }) {
  const illustration = SIMPLE_LOADING_ILLUSTRATIONS[variant % SIMPLE_LOADING_ILLUSTRATIONS.length]!;
  return (
    <div className={`loading-micro-stage loading-simple-stage loading-simple-pose-${variant % 4}`}>
      <img
        className="loading-simple-image loading-simple-video"
        src={`/loading/tinted/${illustration.file.replace(".png", ".gif")}?v=frame-safe-1`}
        aria-label={`איור טעינה: ${illustration.label}`}
        alt={`איור טעינה: ${illustration.label}`}
      />
    </div>
  );
}

function ReferenceLoadingIllustration({ variant }: { variant: number }) {
  const pose = variant % LOADING_CHARACTER_POSES.length;
  const image = REFERENCE_LOADING_IMAGES[pose % REFERENCE_LOADING_IMAGES.length]!;
  return (
    <div className={`loading-micro-stage loading-reference-stage-pose-${pose}`}>
      <img
        className={`loading-reference-image loading-reference-base loading-reference-pose-${pose}`}
        src={`/loading/references/${image.file}`}
        alt={`איור טעינה: ${image.label}`}
      />
      <img
        className="loading-reference-layer loading-reference-arms"
        src={`/loading/references/${image.file}`}
        alt=""
        aria-hidden="true"
      />
      <img
        className="loading-reference-layer loading-reference-legs"
        src={`/loading/references/${image.file}`}
        alt=""
        aria-hidden="true"
      />
    </div>
  );
}

function LoadingIllustration({ variant }: { variant: number }) {
  const pose = variant % LOADING_CHARACTER_POSES.length;
  const color = pose % 4;
  const characterType = pose % 10;
  return (
    <div className="loading-micro-stage">
      <svg
        className={`loading-character loading-character-pose-${pose} loading-character-type-${characterType} loading-character-color-${color}`}
        viewBox="0 0 180 140"
        role="img"
        aria-label={`איור טעינה: ${LOADING_CHARACTER_POSES[pose]}`}
      >
        <ellipse className="loading-character-shadow" cx="90" cy="126" rx="43" ry="6" />
        <g className="loading-character-legs">
          <path
            className="loading-character-leg loading-character-leg-left"
            d="M78 94C73 103 67 112 58 121"
          />
          <path
            className="loading-character-leg loading-character-leg-right"
            d="M101 94C108 104 115 113 124 121"
          />
          <path className="loading-character-foot" d="M55 121c-8 0-14 3-18 7 9 2 19 2 28-1" />
          <path className="loading-character-foot" d="M122 121c8 0 14 3 18 7-9 2-19 2-28-1" />
        </g>
        <g className="loading-character-arms">
          <path
            className="loading-character-arm loading-character-arm-left"
            d="M67 61C56 67 48 76 42 87"
          />
          <path
            className="loading-character-arm loading-character-arm-right"
            d="M113 61C124 67 132 76 138 87"
          />
          <circle className="loading-character-hand" cx="41" cy="88" r="4" />
          <circle className="loading-character-hand" cx="139" cy="88" r="4" />
        </g>
        <g className="loading-character-body">
          {characterType === 0 ? (
            <>
              <path
                className="loading-character-avocado"
                d="M90 51c-24-8-39 11-35 34 4 20 17 28 35 28s31-8 35-28c4-23-11-42-35-34z"
              />
              <circle className="loading-character-pit" cx="90" cy="88" r="10" />
            </>
          ) : characterType === 1 ? (
            <path
              className="loading-character-banana"
              d="M61 72c12-24 35-28 58-16 11 6 16 17 13 28-4 14-22 22-39 18-20-5-32-15-32-30z"
            />
          ) : characterType === 2 ? (
            <>
              <path
                className="loading-character-carrot"
                d="M68 58c14-5 30-5 44 0l-6 49c-7 12-25 12-32 0z"
              />
              <path
                className="loading-character-leaves"
                d="M78 58c-7-14 3-21 8-8 1-17 12-17 11 0 10-10 17-1 7 10"
              />
            </>
          ) : characterType === 3 ? (
            <>
              <path
                className="loading-character-frog"
                d="M61 64c0-17 13-25 29-25s29 8 29 25v37c-9 11-49 11-58 0z"
              />
              <circle className="loading-character-frog-eye" cx="72" cy="44" r="8" />
              <circle className="loading-character-frog-eye" cx="108" cy="44" r="8" />
            </>
          ) : characterType === 4 ? (
            <>
              <path
                className="loading-character-dog"
                d="M62 61c4-12 18-17 28-8 10-9 24-4 28 8v36c-10 10-46 10-56 0z"
              />
              <path
                className="loading-character-ear"
                d="M67 61c-14-5-17 9-4 17M113 61c14-5 17 9 4 17"
              />
            </>
          ) : characterType === 5 ? (
            <>
              <path
                className="loading-character-apple"
                d="M90 57c-21-13-38 2-34 23 4 22 17 31 34 31s30-9 34-31c4-21-13-36-34-23z"
              />
              <path
                className="loading-character-leaf"
                d="M89 57c3-13 14-17 23-12-4 10-12 14-23 12z"
              />
            </>
          ) : characterType === 6 ? (
            <>
              <path className="loading-character-broccoli-stem" d="M81 76h18l4 29H77z" />
              <path
                className="loading-character-broccoli"
                d="M61 76c-9-18 4-29 16-23-2-17 18-24 27-10 13-10 27 5 18 18 12 8 5 25-9 24-8 13-29 12-37 0-10 4-20-1-15-9z"
              />
            </>
          ) : characterType === 7 ? (
            <>
              <path
                className="loading-character-egg"
                d="M90 51c22 0 31 19 27 38-3 16-13 25-27 25s-24-9-27-25c-4-19 5-38 27-38z"
              />
              <circle className="loading-character-yolk" cx="90" cy="87" r="10" />
            </>
          ) : characterType === 8 ? (
            <>
              <path
                className="loading-character-peach"
                d="M90 57c-23-12-39 5-34 27 5 20 18 30 34 30s29-10 34-30c5-22-11-39-34-27z"
              />
              <path
                className="loading-character-leaf"
                d="M90 59c-2-12 7-18 17-17-1 10-7 16-17 17z"
              />
            </>
          ) : (
            <>
              <path
                className="loading-character-tomato"
                d="M90 57c-22-10-38 7-34 28 4 19 18 29 34 29s30-10 34-29c4-21-12-38-34-28z"
              />
              <path className="loading-character-leaf" d="M90 59c-8-11 1-18 9-10 6-12 15-6 8 7" />
            </>
          )}
        </g>
        <g className="loading-character-head">
          <circle className="loading-character-face" cx="90" cy="37" r="24" />
          <path className="loading-character-hair" d="M68 33c2-25 43-29 47 1-11-8-31-8-47-1z" />
          <circle className="loading-character-eye" cx="81" cy="39" r="2.7" />
          <circle className="loading-character-eye" cx="99" cy="39" r="2.7" />
          <path className="loading-character-smile" d="M84 48c4 4 8 4 12 0" />
          <circle className="loading-character-cheek" cx="76" cy="48" r="3" />
          <circle className="loading-character-cheek" cx="104" cy="48" r="3" />
        </g>
        <g className="loading-character-prop" aria-hidden="true">
          <path
            className="loading-character-rope"
            d="M35 83c-18 10-18 39 5 45M145 83c18 10 18 39-5 45"
          />
          <path className="loading-character-bar" d="M42 82h96" />
          <circle className="loading-character-plate" cx="38" cy="82" r="8" />
          <circle className="loading-character-plate" cx="142" cy="82" r="8" />
        </g>
      </svg>
    </div>
  );
}

function LegacyLoadingIllustration({ variant }: { variant: number }) {
  const activeShape = variant % 9;
  const illustrationLabel = [
    "משקולת ורודה",
    "ברוקולי ירוק",
    "תפוח ירוק",
    "ביצה",
    "שריר יד",
    "אפרסק",
    "בננה צהובה",
    "אבוקדו ירוק",
    "מתאמנת עם משקולת",
  ][activeShape];
  return (
    <div className="loading-micro-stage">
      <svg
        className="loading-dumbbell-svg loading-simple-illustration"
        viewBox="0 0 150 104"
        role="img"
        aria-label={`איור טעינה: ${illustrationLabel}`}
      >
        {activeShape === 0 ? (
          <g className="loading-dumbbell-motion">
            <ellipse className="loading-dumbbell-shadow" cx="75" cy="82" rx="48" ry="5" />
            <path className="loading-dumbbell-bar" d="M37 43h76v8H37z" />
            <path className="loading-dumbbell-grip" d="M57 39h36v16H57z" />
            <rect className="loading-dumbbell-plate" x="17" y="20" width="25" height="54" rx="6" />
            <rect className="loading-dumbbell-plate" x="108" y="20" width="25" height="54" rx="6" />
            <path className="loading-dumbbell-cap" d="M11 30h7v34h-7zM133 30h7v34h-7z" />
          </g>
        ) : activeShape === 1 ? (
          <g className="loading-food-motion">
            <path
              className="loading-broccoli-shell"
              d="M65 76c-10-1-18-8-18-18 0-8 5-15 13-18-1-12 8-22 20-22 6 0 11 3 15 7 3-8 11-13 19-11 10 2 16 11 14 21 8 2 14 9 14 18 0 13-11 23-25 23-4 0-8-1-11-3-5 4-10 6-16 6-5 0-10-1-15-3zM64 76h22l4 21H60z"
            />
            <g className="loading-broccoli-fill">
              <path className="loading-broccoli-stem" d="M65 75h20l4 22H61z" />
              <circle className="loading-broccoli-floret" cx="60" cy="61" r="13" />
              <circle className="loading-broccoli-floret" cx="75" cy="43" r="16" />
              <circle className="loading-broccoli-floret" cx="94" cy="54" r="15" />
              <circle className="loading-broccoli-floret" cx="111" cy="66" r="12" />
              <circle className="loading-broccoli-floret" cx="79" cy="66" r="15" />
            </g>
            <path
              className="loading-broccoli-detail"
              d="M68 80h13M71 86h11M58 58c3 2 5 2 8 1M72 38c3 3 6 4 10 3M90 49c3 3 6 4 10 3M105 63c3 2 5 2 8 1"
            />
          </g>
        ) : activeShape === 2 ? (
          <g className="loading-food-motion">
            <path
              className="loading-food-shell"
              d="M75 27c-4-10 4-17 13-18-1 7 3 11 9 14-7 6-14 7-22 4zM75 29c-22-13-42 3-40 27 2 24 18 39 40 39s38-15 40-39c2-24-18-40-40-27z"
            />
            <path
              className="loading-food-fill loading-apple-fill"
              d="M75 37c-15-9-30 3-29 19 1 18 12 29 29 29s28-11 29-29c1-16-14-28-29-19z"
            />
            <path className="loading-apple-leaf" d="M76 27c5-8 13-9 19-5-3 7-10 10-19 5z" />
            <path className="loading-food-detail" d="M62 51c-2 10 1 18 7 24" />
          </g>
        ) : activeShape === 3 ? (
          <g className="loading-food-motion">
            <path
              className="loading-egg-white"
              d="M77 16c24 0 37 20 32 46-4 21-18 33-37 33-21 0-35-13-38-33-4-26 16-46 43-46z"
            />
            <path
              className="loading-egg-white-fill"
              d="M77 25c16 0 24 14 21 31-3 15-12 25-24 25-14 0-23-10-25-25-2-17 11-31 28-31z"
            />
            <circle className="loading-egg-yolk" cx="75" cy="57" r="12" />
          </g>
        ) : activeShape === 4 ? (
          <g className="loading-food-motion">
            <path
              className="loading-muscle-shell"
              d="M54 77c-5-10-2-21 6-28l11-10c4-4 10-3 12 2l3 7 10-4c6-2 11 3 9 9l-6 18c-3 10-12 17-23 18-9 1-17-3-22-12z"
            />
            <path
              className="loading-muscle-fill"
              d="M62 75c-2-6 0-12 5-16l12-11 4 11 13-5-5 15c-2 6-8 10-15 11-6 1-11-1-14-5z"
            />
            <path className="loading-food-detail" d="M72 65c5 3 10 3 16 0M67 75c6 2 12 2 18-1" />
          </g>
        ) : activeShape === 5 ? (
          <g className="loading-food-motion">
            <path
              className="loading-peach-shell"
              d="M75 22c-5-7-1-14 7-17 0 7 4 10 11 11-4 7-11 9-18 6zM75 27c-24-10-43 8-38 32 5 23 19 36 38 36s33-13 38-36c5-24-14-42-38-32z"
            />
            <path
              className="loading-peach-fill"
              d="M75 36c-16-7-29 7-25 22 4 17 13 26 25 26s21-9 25-26c4-15-9-29-25-22z"
            />
            <path className="loading-food-detail" d="M75 38c-4 10-4 20 0 29" />
          </g>
        ) : activeShape === 6 ? (
          <g className="loading-food-motion">
            <path
              className="loading-banana-shell"
              d="M37 27c8 31 24 51 48 52 13 1 23-5 29-17-4 19-18 31-35 31-29 0-48-24-55-62z"
            />
            <path
              className="loading-banana-fill"
              d="M47 31c8 25 21 38 39 39 9 1 16-2 22-8-5 10-13 15-23 14-22-1-36-18-44-45z"
            />
            <path className="loading-banana-detail" d="M37 27l6-4M114 62l4 3" />
          </g>
        ) : activeShape === 7 ? (
          <g className="loading-food-motion">
            <path
              className="loading-avocado-shell"
              d="M75 12c-11 0-16 13-22 27-7 16-17 32-13 47 4 15 18 20 35 20s31-5 35-20c4-15-6-31-13-47-6-14-11-27-22-27z"
            />
            <path
              className="loading-avocado-fill"
              d="M75 21c-6 0-10 12-15 24-7 17-15 30-12 40 3 9 12 13 27 13s24-4 27-13c3-10-5-23-12-40-5-12-9-24-15-24z"
            />
            <circle className="loading-avocado-pit" cx="75" cy="75" r="13" />
            <path className="loading-avocado-detail" d="M58 35c-5 13-11 23-13 34" />
          </g>
        ) : activeShape === 8 ? (
          <g className="loading-lifter-motion">
            <path
              className="loading-lifter-hair"
              d="M67 28c-2-8 4-14 11-14 8 0 13 6 11 14-2-4-5-6-9-6-4 3-8 5-13 6z"
            />
            <circle className="loading-lifter-head" cx="75" cy="29" r="8" />
            <path
              className="loading-lifter-body"
              d="M64 43c3-4 19-4 22 0l6 20c-4 5-8 7-17 7s-13-2-17-7z"
            />
            <path
              className="loading-lifter-shorts"
              d="M65 66h29l-4 15c-3 3-7 4-11 1-4 3-8 2-11-1z"
            />
            <path className="loading-lifter-arms" d="M65 46 51 29 43 19M85 46l14-17 8-10" />
            <path className="loading-lifter-bar" d="M35 15h80" />
            <path className="loading-lifter-plate" d="M32 10v10M38 7v16M112 10v10M118 7v16" />
            <path className="loading-lifter-legs" d="M70 86 62 99M80 86l8 13" />
          </g>
        ) : null}
      </svg>
    </div>
  );

  const shape = variant % 8;
  return (
    <div className="loading-micro-stage" aria-hidden="true">
      <svg className="loading-dumbbell-svg" viewBox="0 0 150 104" role="presentation">
        <defs>
          <linearGradient id="loading-metal" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="var(--primary)" stopOpacity="0.42" />
            <stop offset="0.48" stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--rose)" />
          </linearGradient>
          <linearGradient id="loading-avocado" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#d6ed9e" />
            <stop offset="1" stopColor="#7ba447" />
          </linearGradient>
          <linearGradient id="loading-sunny" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ffe69c" />
            <stop offset="1" stopColor="#f3ae45" />
          </linearGradient>
          <linearGradient id="loading-tomato" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ffb0a6" />
            <stop offset="1" stopColor="#df6d64" />
          </linearGradient>
          <linearGradient id="loading-violet" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#d8c3ef" />
            <stop offset="1" stopColor="#9b7bc1" />
          </linearGradient>
          <clipPath id="loading-left-plate">
            <rect x="17" y="19" width="25" height="54" rx="6" />
          </clipPath>
          <clipPath id="loading-right-plate">
            <rect x="108" y="19" width="25" height="54" rx="6" />
          </clipPath>
        </defs>
        {shape === 0 ? (
          <g className="loading-object-motion loading-dumbbell-motion">
            <ellipse className="loading-dumbbell-shadow" cx="75" cy="79" rx="51" ry="5" />
            <path className="loading-dumbbell-bar" d="M37 42h76v8H37z" />
            <path className="loading-dumbbell-grip" d="M57 39h36v14H57z" />
            <g className="loading-dumbbell-plate">
              <rect x="17" y="19" width="25" height="54" rx="6" />
              <rect className="loading-dumbbell-fill" x="17" y="19" width="25" height="54" rx="6" />
              <path className="loading-dumbbell-highlight" d="M22 24v44" />
            </g>
            <g className="loading-dumbbell-plate">
              <rect x="108" y="19" width="25" height="54" rx="6" />
              <rect
                className="loading-dumbbell-fill"
                x="108"
                y="19"
                width="25"
                height="54"
                rx="6"
              />
              <path className="loading-dumbbell-highlight" d="M113 24v44" />
            </g>
            <path className="loading-dumbbell-cap" d="M11 29h7v34h-7zM133 29h7v34h-7z" />
          </g>
        ) : shape === 1 ? (
          <g className="loading-object-motion">
            <path className="loading-object-shell" d="M43 23h64l-5 51H48z" />
            <path className="loading-object-fill" d="M48 74h54l-5-51H43z" />
            <path className="loading-object-lip" d="M39 22h72v8H39z" />
            <path className="loading-object-highlight" d="M51 35l3 31" />
          </g>
        ) : shape === 2 ? (
          <g className="loading-object-motion">
            <path className="loading-object-shell" d="M58 16h34v9l8 8v41H50V33l8-8z" />
            <path className="loading-object-fill" d="M50 74h50V33l-8-8H58l-8 8z" />
            <path className="loading-object-lip" d="M58 16h34v9H58z" />
            <path className="loading-object-highlight" d="M58 36v29" />
          </g>
        ) : shape === 3 ? (
          <g className="loading-object-motion">
            <path
              className="loading-object-shell"
              d="M48 31c0-13 9-20 27-20s27 7 27 20v37c0 7-6 11-13 11H61c-7 0-13-4-13-11z"
            />
            <path className="loading-object-fill" d="M48 74h54V31c0-13-9-20-27-20S48 18 48 31z" />
            <path className="loading-object-lip" d="M53 19h44v8H53z" />
            <path className="loading-object-highlight" d="M60 34v32" />
          </g>
        ) : shape === 4 ? (
          <g className="loading-food-motion">
            <path
              className="loading-food-shell"
              d="M74 13c26 0 40 27 36 49-4 22-19 35-36 35S42 84 38 62C34 40 48 13 74 13z"
            />
            <path
              className="loading-food-fill"
              fill="url(#loading-avocado)"
              d="M74 21c20 0 30 21 27 39-3 18-14 28-27 28S50 78 47 60c-3-18 7-39 27-39z"
            />
            <circle className="loading-food-pit" cx="74" cy="67" r="12" />
            <path className="loading-food-highlight" d="M59 36c-5 8-6 16-5 22" />
          </g>
        ) : shape === 5 ? (
          <g className="loading-food-motion">
            <path
              className="loading-food-shell"
              d="M77 16c24 0 37 20 32 46-4 21-18 33-37 33-21 0-35-13-38-33-4-26 16-46 43-46z"
            />
            <path
              className="loading-food-fill"
              fill="url(#loading-sunny)"
              d="M77 25c16 0 24 14 21 31-3 15-12 25-24 25-14 0-23-10-25-25-2-17 11-31 28-31z"
            />
            <circle className="loading-food-yolk" cx="75" cy="57" r="12" />
            <path className="loading-food-highlight" d="M57 39c-4 8-4 15-2 20" />
          </g>
        ) : shape === 6 ? (
          <g className="loading-food-motion">
            <path
              className="loading-food-shell"
              d="M75 24c24-15 47 5 41 33-4 22-20 34-41 34S38 79 34 57c-5-28 17-48 41-33z"
            />
            <path
              className="loading-food-fill"
              fill="url(#loading-tomato)"
              d="M75 31c18-11 34 4 29 26-3 17-15 26-29 26S50 74 47 57c-4-22 10-37 28-26z"
            />
            <path
              className="loading-food-leaf"
              d="M75 28c-7-8-2-14 6-17-1 8 2 11 9 12-5 6-10 7-15 5z"
            />
            <path className="loading-food-highlight" d="M56 46c-4 7-3 13-1 18" />
          </g>
        ) : shape === 7 ? (
          <g className="loading-food-motion">
            <path
              className="loading-food-shell"
              d="M53 23c7 0 10 5 9 11 15-9 37 1 34 21-3 20-20 40-40 40-14 0-19-12-10-22 7-8 9-18 5-27-4-8-3-16 2-23z"
            />
            <path
              className="loading-food-fill"
              fill="url(#loading-sunny)"
              d="M58 35c13-7 28 1 25 16-3 16-16 31-28 31-8 0-11-7-5-15 9-12 11-25 8-32z"
            />
            <path className="loading-food-leaf" d="M53 24c-5-6 1-13 9-15 0 8-2 12-9 15z" />
            <path className="loading-food-highlight" d="M60 48c3 9 1 17-3 23" />
          </g>
        ) : shape === 8 ? (
          <g className="loading-food-motion">
            <path
              className="loading-food-shell"
              d="M46 47c0-21 13-35 29-35s29 14 29 35c0 26-12 44-29 44S46 73 46 47z"
            />
            <path
              className="loading-food-fill"
              fill="url(#loading-violet)"
              d="M54 47c0-16 9-27 21-27s21 11 21 27c0 20-9 35-21 35S54 67 54 47z"
            />
            <path
              className="loading-food-leaf"
              d="M72 16c-6-7-2-12 5-15 0 8 5 10 9 12-4 5-9 6-14 3z"
            />
            <path className="loading-food-highlight" d="M61 39c-3 9-3 20 0 28" />
          </g>
        ) : shape === 9 ? (
          <g className="loading-food-motion">
            <path
              className="loading-food-shell"
              d="M40 38c0-14 12-23 35-23s35 9 35 23v36c0 12-13 19-35 19S40 86 40 74z"
            />
            <path
              className="loading-food-fill"
              fill="url(#loading-sunny)"
              d="M48 41c0-11 9-17 27-17s27 6 27 17v31c0 9-10 13-27 13s-27-4-27-13z"
            />
            <path className="loading-food-detail" d="M50 47h50M52 58h46M55 69h40" />
          </g>
        ) : shape === 10 ? (
          <g className="loading-food-motion">
            <path
              className="loading-food-shell"
              d="M38 48c0-15 16-27 37-27s37 12 37 27v23c0 14-15 22-37 22S38 85 38 71z"
            />
            <path
              className="loading-food-fill"
              fill="url(#loading-avocado)"
              d="M46 49c0-10 13-18 29-18s29 8 29 18v19c0 10-12 15-29 15S46 78 46 68z"
            />
            <path className="loading-food-detail" d="M43 48h64" />
            <circle className="loading-food-yolk" cx="75" cy="52" r="7" />
          </g>
        ) : shape === 11 ? (
          <g className="loading-food-motion">
            <path
              className="loading-food-shell"
              d="M75 16c10 0 16 10 16 20 16-9 29 4 25 19 12 4 13 20 0 25-1 14-17 17-25 8-9 12-27 12-34 0-12 9-27-3-22-17-12-7-5-22 8-22-4-14 8-24 21-17 0-8 4-16 11-16z"
            />
            <path
              className="loading-food-fill"
              fill="url(#loading-avocado)"
              d="M75 26c7 0 10 8 8 16 12-6 21 5 15 15 10 3 8 15-2 16-1 9-11 11-17 5-6 9-20 8-23-2-10 5-18-5-12-13-8-5-1-15 8-12-2-10 7-16 15-9 0-7 4-13 9-13z"
            />
            <path
              className="loading-food-detail"
              d="M75 35v42M54 51l12 8M96 51L84 59M54 72l12-7M96 72l-12-7"
            />
          </g>
        ) : (
          (() => {
            const food = LOADING_FOOD_ILLUSTRATIONS[shape - 12]!;
            return (
              <g
                className={`loading-food-motion ${food.growth ? "loading-growth-motion" : ""}`}
                style={{ color: food.color }}
              >
                <path className="loading-food-generic-shell" d={food.shell} />
                <path
                  className={`loading-food-generic-fill ${food.growth ? "loading-growth-fill" : ""}`}
                  d={food.shell}
                />
                <path
                  className="loading-food-generic-detail"
                  d="M58 35c-5 8-5 19-1 27M88 35c5 8 5 19 1 27"
                />
              </g>
            );
          })()
        )}
      </svg>
      <span className="loading-illustration-label">{illustrationLabel}</span>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    scripts: [{ async: true, src: "/boot-watchdog.js" }],
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1",
      },
      { title: "MY routine — אימונים ותזונה" },
      {
        name: "description",
        content: "מעקב אימונים, תזונה, תרגילים ושיאים אישיים בעברית.",
      },
      { name: "theme-color", content: "#f8f7f3" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "MY routine" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "MY routine — אימונים ותזונה" },
      { property: "og:site_name", content: "MY routine" },
      {
        property: "og:description",
        content: "האימונים, התזונה והשגרה שלך במקום אחד.",
      },
      { property: "og:image", content: "/myroutine-share.png" },
      { property: "og:image:alt", content: "MYroutine — אימונים ותזונה" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MY routine — אימונים ותזונה" },
      { name: "twitter:image", content: "/myroutine-share.png" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/brand-icon-180.png" },
      { rel: "icon", type: "image/png", href: "/brand-icon-192.png" },
    ],
  }),

  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/**
 * Reset window scroll position to the top after every navigation. Subscribes
 * to the router's `onResolved` event so the reset runs at the end of the
 * router's own pipeline (after matchers + loaders) rather than racing against
 * it the way an effect-on-pathname-change did. With `scrollRestoration: false`
 * on the router, this is the single source of truth for "scroll to top on
 * navigation", which is what fixes detail pages opening at the bottom when
 * the user was deep-scrolled on a list page.
 *
 * Note: `behavior: 'instant'` is non-standard; browsers may fall back to
 * smooth. A bare `scrollTo(0, 0)` is synchronous on every modern engine.
 */
function ScrollToTop() {
  const router = useRouter();

  useEffect(() => {
    const resetScroll = () => {
      const appScrollContainer = document.querySelector<HTMLElement>(
        '[data-app-scroll-container="true"]',
      );
      appScrollContainer?.scrollTo({ top: 0, behavior: "auto" });
      window.scrollTo(0, 0);
      // Keep the document fallback for loading and non-AppShell routes.
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();
    return router.subscribe("onResolved", resetScroll);
  }, [router]);

  return null;
}

function RootContent() {
  const { queryClient } = Route.useRouteContext();
  const authStatus = useAuthStatus();
  const { userProfile } = useGym();
  // Keep the first SSR and browser render identical. The persisted cycle is
  // applied after mount so loading media cannot trigger a hydration mismatch.
  const [openingCycleIndex, setOpeningCycleIndex] = useState(0);
  const [loadingRotationTick, setLoadingRotationTick] = useState(0);
  const [loadingGender, setLoadingGender] = useState<LoadingGender | undefined>(undefined);
  const openingCycleClaimedRef = useRef(false);
  const [loadingPresentationReady, setLoadingPresentationReady] = useState(false);
  const [loadingRecoveryTimedOut, setLoadingRecoveryTimedOut] = useState(false);
  const loadingIndexes = loadingCycleIndexes(
    openingCycleIndex + loadingRotationTick,
    SIMPLE_LOADING_ILLUSTRATIONS.length,
  );
  const loadingVariant = loadingIndexes.animationIndex;
  const loadingMessageIndex = loadingIndexes.messageIndex;
  const [minimumLoadingDone, setMinimumLoadingDone] = useState(false);
  const profileHydrationStatus = useProfileHydrationStatus();
  const profileHydrationError = useProfileHydrationError();
  const hasProfileHydrationError =
    authStatus === "authenticated" && profileHydrationStatus === "error";
  const isProfileHydrating =
    !hasProfileHydrationError &&
    authStatus === "authenticated" &&
    (profileHydrationStatus === "loading" || userProfile?.role === undefined);
  const needsFullName =
    authStatus === "authenticated" &&
    profileHydrationStatus === "ready" &&
    !userProfile?.fullName?.trim();
  const accountApprovalStatus = userProfile?.approvalStatus;
  const isAccountLocked =
    authStatus === "authenticated" &&
    profileHydrationStatus === "ready" &&
    userProfile?.role === "client" &&
    accountApprovalStatus !== "approved";
  const isLoadingScreen = authStatus === "loading" || isProfileHydrating || !minimumLoadingDone;
  const activeLoadingGender =
    authStatus === "unauthenticated" ? undefined : (userProfile?.gender ?? loadingGender);
  const showExpressiveLoading = loadingPresentationReady && activeLoadingGender === "female";
  const showPlainLoading = loadingPresentationReady && activeLoadingGender === "male";

  useLoadingCycleEffect(() => {
    // Keep SSR and the first browser render identical. The gender-specific
    // loading surface starts after hydration, avoiding a spinner flash for
    // women whose cached profile is already available in the browser.
    try {
      setLoadingGender(readLoadingGender(window.localStorage.getItem(LOADING_GENDER_STORAGE_KEY)));
    } catch {
      setLoadingGender(undefined);
    }
    (window as Window & { __MY_ROUTINE_BOOTED__?: boolean }).__MY_ROUTINE_BOOTED__ = true;
    setLoadingPresentationReady(true);
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const metadataGender = session?.user.user_metadata?.["gender"];
      const nextGender = readLoadingGender(
        typeof metadataGender === "string" ? metadataGender : null,
      );
      if (nextGender) {
        setLoadingGender(nextGender);
        try {
          window.localStorage.setItem(LOADING_GENDER_STORAGE_KEY, nextGender);
        } catch {
          // The current in-memory session still controls this opening.
        }
        return;
      }
      if (!session?.user) {
        setLoadingGender(undefined);
        try {
          window.localStorage.removeItem(LOADING_GENDER_STORAGE_KEY);
        } catch {
          // Private browsing can disable storage; auth state still resets.
        }
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      setLoadingGender(undefined);
      try {
        window.localStorage.removeItem(LOADING_GENDER_STORAGE_KEY);
      } catch {
        // Private browsing can disable storage; the in-memory state is enough.
      }
      return;
    }
    if (authStatus !== "authenticated" || !userProfile?.gender) return;

    setLoadingGender(userProfile.gender);
    try {
      window.localStorage.setItem(LOADING_GENDER_STORAGE_KEY, userProfile.gender);
    } catch {
      // The current in-memory account state still controls this opening.
    }
  }, [authStatus, userProfile?.gender]);

  useEffect(() => {
    if (!isLoadingScreen) {
      setLoadingRecoveryTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(
      () => setLoadingRecoveryTimedOut(true),
      LOADING_RECOVERY_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [isLoadingScreen]);

  useEffect(() => {
    if (!isLoadingScreen) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;

    document.documentElement.classList.add("loading-lock");
    body.classList.add("loading-lock");
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      document.documentElement.classList.remove("loading-lock");
      body.classList.remove("loading-lock");
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isLoadingScreen]);

  useEffect(() => {
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
    document.body.dir = "rtl";
    const claimOpeningCycle = () => {
      try {
        const cycleIndex = readLoadingCycle(window.localStorage.getItem(LOADING_CYCLE_STORAGE_KEY));
        const nextCycleIndex = cycleIndex === Number.MAX_SAFE_INTEGER ? 0 : cycleIndex + 1;
        window.localStorage.setItem(LOADING_CYCLE_STORAGE_KEY, String(nextCycleIndex));
        return cycleIndex;
      } catch {
        // Private browsing can disable storage. Keep the deterministic first
        // choice for this open rather than introducing a random fallback.
        return 0;
      }
    };

    if (!openingCycleClaimedRef.current) {
      openingCycleClaimedRef.current = true;
      setOpeningCycleIndex(claimOpeningCycle());
    }
    if ("serviceWorker" in navigator) {
      if (import.meta.env.DEV) {
        // A Service Worker is unsafe in Vite development: it can serve stale
        // source modules while HMR serves newer SSR output, which leaves
        // Safari on the server-rendered loading shell.
        void navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
          .then(() => caches.keys())
          .then((cacheKeys) =>
            Promise.all(
              cacheKeys
                .filter((key) => key.startsWith("myroutine-app-shell-"))
                .map((key) => caches.delete(key)),
            ),
          )
          .catch((error) => {
            console.warn("[Preview app shell cleanup unavailable]:", error);
          });
      } else {
        // Keep the offline app shell in production, where compiled asset URLs
        // remain stable for the lifetime of a deployed build.
        void navigator.serviceWorker
          .register("/sw.js?v=9", { updateViaCache: "none" })
          .then((registration) => registration.update())
          .catch((error) => {
            console.warn("[App shell cache unavailable]:", error);
          });
      }
    }
    const advanceForRestoredPage = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      setOpeningCycleIndex(claimOpeningCycle());
      setLoadingRotationTick(0);
    };
    window.addEventListener("pageshow", advanceForRestoredPage);
    const illustrationTimer = window.setInterval(() => {
      setLoadingRotationTick((current) => current + 1);
    }, 1_500);
    const minimumLoadingTimer = window.setTimeout(() => {
      setMinimumLoadingDone(true);
    }, 350);
    return () => {
      window.clearInterval(illustrationTimer);
      window.clearTimeout(minimumLoadingTimer);
      window.removeEventListener("pageshow", advanceForRestoredPage);
    };
  }, []);

  useEffect(() => {
    if (isLoadingScreen || !navigator.onLine) return;

    // Route modules are code-split by TanStack Start. Start warming them only
    // after the first useful screen is interactive, then load one module per
    // idle turn. This preserves the offline navigation guarantee without
    // competing with auth, hydration, or the first paint.
    const routeModules = import.meta.glob("./**/*.tsx", { eager: false });
    const modules = Object.entries(routeModules).filter(([path]) => !path.endsWith("/__root.tsx"));
    const requestIdle = (
      window as typeof window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    const cancelIdle = (window as typeof window & { cancelIdleCallback?: (handle: number) => void })
      .cancelIdleCallback;
    let nextModuleIndex = 0;
    let stopped = false;
    let idleHandle: number | null = null;
    let timerHandle: number | null = null;

    const scheduleNextModule = () => {
      if (stopped || !navigator.onLine || document.visibilityState === "hidden") return;
      const runModule = () => {
        idleHandle = null;
        timerHandle = null;
        if (stopped || !navigator.onLine) return;
        const entry = modules[nextModuleIndex++];
        if (!entry) return;
        void entry[1]()
          .catch(() => undefined)
          .finally(() => {
            if (nextModuleIndex < modules.length) scheduleNextModule();
          });
      };

      if (requestIdle) {
        idleHandle = requestIdle(runModule, { timeout: 5_000 });
      } else {
        timerHandle = window.setTimeout(runModule, 250);
      }
    };

    const warmRouteModules = () => {
      if (stopped || !navigator.onLine) return;
      nextModuleIndex = 0;
      scheduleNextModule();
    };

    const warmupTimer = window.setTimeout(warmRouteModules, 4_000);
    window.addEventListener("online", warmRouteModules);
    const cleanup = () => {
      stopped = true;
      window.clearTimeout(warmupTimer);
      if (timerHandle !== null) window.clearTimeout(timerHandle);
      if (idleHandle !== null) cancelIdle?.(idleHandle);
      window.removeEventListener("online", warmRouteModules);
    };
    return cleanup;
  }, [isLoadingScreen]);

  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <ScrollToTop />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <div
        data-app-boot-fallback
        hidden
        className="fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center bg-background px-4"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-3xl border border-primary/20 bg-white px-6 py-7 text-center shadow-sm">
          <img
            src="/myroutine-logo.png"
            alt="MY routine"
            className="mx-auto h-auto w-32 object-contain"
          />
          <h1 className="mt-5 text-lg font-bold text-foreground">האתר לא נטען</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            נסי לטעון מחדש כדי לנקות את גרסת האתר השמורה במכשיר.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            טעינה מחדש
          </button>
        </div>
      </div>
      {loadingRecoveryTimedOut ? (
        <div
          className="flex min-h-[100dvh] items-center justify-center bg-background px-4"
          dir="rtl"
        >
          <div className="w-full max-w-md rounded-3xl border border-primary/20 bg-white px-6 py-7 text-center shadow-sm">
            <img
              src="/myroutine-logo.png"
              alt="MY routine"
              className="mx-auto h-auto w-32 object-contain"
            />
            <h1 className="mt-5 text-lg font-bold text-foreground">הטעינה מתעכבת</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {genderText(
                userProfile?.gender,
                "לא הצלחנו להשלים את החיבור בזמן. בדקי את החיבור ונסי שוב.",
                "לא הצלחנו להשלים את החיבור בזמן. בדוק את החיבור ונסה שוב.",
              )}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {genderText(userProfile?.gender, "טעינה מחדש", "טען מחדש")}
            </button>
          </div>
        </div>
      ) : isLoadingScreen ? (
        <div
          className={`loading-screen flex min-h-[100dvh] items-center justify-center bg-background px-4 ${
            showExpressiveLoading ? "" : "loading-screen-plain"
          }`}
          dir="rtl"
        >
          <div
            className="loading-brand"
            role="status"
            aria-live="polite"
            aria-label="MY routine נטען"
          >
            {showExpressiveLoading ? (
              <>
                <SimpleLoadingIllustration
                  key={`illustration-${loadingVariant}`}
                  variant={loadingVariant}
                />
                <p key={`message-${loadingMessageIndex}`} className="loading-witty-message">
                  {loadingMessageForGender(loadingMessageIndex, activeLoadingGender)}
                </p>
                <img className="loading-wordmark" src="/myroutine-logo.png" alt="MY routine" />
              </>
            ) : showPlainLoading ? (
              <LoadingSpinner label="טוען" />
            ) : (
              <img className="loading-initial-wordmark" src="/myroutine-logo.png" alt="MY routine" />
            )}
          </div>
        </div>
      ) : hasProfileHydrationError ? (
        <div
          className="flex min-h-[100dvh] items-center justify-center bg-background px-4"
          dir="rtl"
        >
          <div className="max-w-md rounded-3xl border border-destructive/20 bg-white px-6 py-6 text-center shadow-sm">
            <h1 className="text-lg font-bold text-foreground">לא ניתן לטעון את הרשאות החשבון</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {profileHydrationError || "פרטי המשתמש לא נטענו מ-Supabase."}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                type="button"
                onClick={retryProfileHydration}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                {genderText(userProfile?.gender, "נסי שוב", "נסה שוב")}
              </button>
              <button
                type="button"
                onClick={() => void resetAuthSessionAndReload()}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground"
              >
                איפוס והתחברות מחדש
              </button>
            </div>
          </div>
        </div>
      ) : isAccountLocked ? (
        <div
          className="flex min-h-[100dvh] items-center justify-center bg-background px-4"
          dir="rtl"
        >
          <div className="w-full max-w-md rounded-3xl border border-primary/20 bg-white px-6 py-7 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <LockKeyhole className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-foreground">הגישה לאתר נעולה כרגע</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {accountApprovalStatus === "rejected"
                ? "ההרשמה נדחתה על ידי הבעלים. ניתן לפנות לבעלים לקבלת פרטים נוספים."
                : "ההרשמה ממתינה לאישור הבעלים. לאחר האישור אפשר יהיה להיכנס לכל אזורי האתר."}
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <button
                type="button"
                onClick={retryProfileHydration}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                בדיקת סטטוס מחדש
              </button>
              <button
                type="button"
                onClick={() => void resetAuthSessionAndReload()}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground"
              >
                התנתקות
              </button>
            </div>
          </div>
        </div>
      ) : needsFullName ? (
        <CompleteProfileName />
      ) : authStatus === "unauthenticated" ? (
        <AppShell
          title={genderText(userProfile?.gender, "ברוכה הבאה", "ברוך הבא")}
          subtitle={genderText(
            userProfile?.gender,
            "התחברי כדי להמשיך לאימונים ולתזונה",
            "התחבר כדי להמשיך לאימונים ולתזונה",
          )}
          pageClassName="auth-editorial-shell"
          authOnly
        >
          <></>
        </AppShell>
      ) : (
        <Outlet />
      )}
      <Scripts />
    </QueryClientProvider>
  );
}

function RootComponent() {
  return (
    <BrowserRuntimeGuard>
      <RuntimeErrorBoundary>
        <RootContent />
      </RuntimeErrorBoundary>
    </BrowserRuntimeGuard>
  );
}
