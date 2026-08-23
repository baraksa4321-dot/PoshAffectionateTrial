import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Link,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from "react";
import {
  Activity,
  Apple,
  BadgeCheck,
  Cherry,
  Circle,
  CircleDot,
  Cloud,
  Coffee,
  Diamond,
  Dumbbell,
  Flower2,
  Footprints,
  Gem,
  Headphones,
  Heart,
  Hexagon,
  Leaf,
  Moon,
  Music2,
  Rainbow,
  Rocket,
  Smile,
  Sparkles,
  Sprout,
  Square,
  Star,
  Sun,
  Target,
  Triangle,
  Trophy,
  Waves,
  Zap,
} from "lucide-react";

import "../styles.css";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
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
            {saving
              ? genderText(userProfile?.gender, "שומרת...", "שומר...")
              : "שמירת השם והמשך"}
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
  useEffect(() => {
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
            נסה שוב
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

class RuntimeErrorBoundary extends Component<
  RuntimeErrorBoundaryProps,
  RuntimeErrorBoundaryState
> {
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
            <BrandLogo compact />
          </div>
          <h1 className="mt-5 text-lg font-bold text-foreground">העמוד לא נטען</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            משהו השתבש בטעינת המסך. אפשר לנסות לטעון מחדש בלי לאבד את הנתונים
            ששמורים במכשיר.
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

const LOADING_DRAWINGS = [
  Dumbbell,
  Apple,
  Coffee,
  Zap,
  Leaf,
  Headphones,
  Star,
  Heart,
  Sparkles,
  Music2,
  Activity,
  Rainbow,
  Rocket,
  Target,
  Flower2,
  Cherry,
  Sprout,
  Trophy,
  Moon,
  Sun,
  Cloud,
  Smile,
  CircleDot,
  Waves,
  Footprints,
  BadgeCheck,
  Gem,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Diamond,
] as const;
const LOADING_MOTIONS = [
  "loading-micro-float",
  "loading-micro-breathe",
  "loading-micro-wiggle",
  "loading-micro-orbit",
  "loading-micro-pop",
  "loading-micro-sway",
  "loading-micro-twirl",
  "loading-micro-hop",
  "loading-micro-shimmer",
] as const;
const LOADING_ANIMATIONS = LOADING_DRAWINGS.flatMap((drawing) =>
  LOADING_MOTIONS.map((motion) => ({ drawing, motion })),
);

function LoadingIllustration({ variant }: { variant: number }) {
  const animation = LOADING_ANIMATIONS[variant % LOADING_ANIMATIONS.length]!;
  const Drawing = animation.drawing;
  return (
    <div className="loading-micro-stage" aria-hidden="true">
      <Drawing className={`loading-drawing ${animation.motion}`} size={42} strokeWidth={1.6} />
      <span className="loading-fill-cup">
        <span />
      </span>
    </div>
  );
}

const LOADING_MESSAGES = [
  "מעמיסים משקלים, לא תירוצים",
  "האתר עולה. השרירים יכולים להירגע",
  "עוד רגע — גם המוט קיבל עדכון",
  "מחפשים את האימון. הוא לא ברח",
  "מסנכרנים נתונים, בלי להמציא חזרות",
  "נותנים לשרת להתאפס על עצמו",
  "מרימים את המסך, לא את הקול",
  "מסדרים את הסטים. בלי להפיל אותם",
] as const;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1",
      },
      { title: "My Routine — אימונים ותזונה" },
      {
        name: "description",
        content: "מעקב אימונים, תזונה, תרגילים ושיאים אישיים בעברית.",
      },
      { name: "theme-color", content: "#567765" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "My Routine" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "My Routine — אימונים ותזונה" },
      { property: "og:site_name", content: "My Routine" },
      {
        property: "og:description",
        content: "האימונים, התזונה והשגרה שלך במקום אחד.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "My Routine — אימונים ותזונה" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
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
      window.scrollTo(0, 0);
      // Belt-and-braces for engines where `window.scrollTo` doesn't reach
      // document scrolling element when the html/body set `overflow: clip`.
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
  const [loadingVariant, setLoadingVariant] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
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

  useEffect(() => {
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
    document.body.dir = "rtl";
    setLoadingVariant(Math.floor(Math.random() * LOADING_ANIMATIONS.length));
    const illustrationTimer = window.setInterval(() => {
      setLoadingVariant((current) => (current + 1) % LOADING_ANIMATIONS.length);
    }, 1250);
    const messageTimer = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => {
      window.clearInterval(illustrationTimer);
      window.clearInterval(messageTimer);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <ScrollToTop />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      {authStatus === "loading" || isProfileHydrating ? (
        <div className="loading-screen flex min-h-[100dvh] items-center justify-center bg-background px-4" dir="rtl">
          <div
            className="loading-brand"
            role="status"
            aria-live="polite"
            aria-label="My Routine נטען"
          >
            <LoadingIllustration variant={loadingVariant} />
            <p key={loadingMessageIndex} className="loading-witty-message">
              {LOADING_MESSAGES[loadingMessageIndex]}
            </p>
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
                נסי שוב
              </button>
              <button
                type="button"
                onClick={() => void supabase.auth.signOut()}
                className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground"
              >
                התנתקי
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
    <RuntimeErrorBoundary>
      <RootContent />
    </RuntimeErrorBoundary>
  );
}
