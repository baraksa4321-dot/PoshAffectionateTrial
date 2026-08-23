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
import { LOADING_MESSAGES } from "../lib/loading-copy";

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

function LoadingIllustration({ variant }: { variant: number }) {
  const shape = variant % 12;
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
              <rect className="loading-dumbbell-fill" x="108" y="19" width="25" height="54" rx="6" />
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
            <path className="loading-object-shell" d="M48 31c0-13 9-20 27-20s27 7 27 20v37c0 7-6 11-13 11H61c-7 0-13-4-13-11z" />
            <path className="loading-object-fill" d="M48 74h54V31c0-13-9-20-27-20S48 18 48 31z" />
            <path className="loading-object-lip" d="M53 19h44v8H53z" />
            <path className="loading-object-highlight" d="M60 34v32" />
          </g>
        ) : shape === 4 ? (
          <g className="loading-food-motion">
            <path className="loading-food-shell" d="M74 13c26 0 40 27 36 49-4 22-19 35-36 35S42 84 38 62C34 40 48 13 74 13z" />
            <path className="loading-food-fill" fill="url(#loading-avocado)" d="M74 21c20 0 30 21 27 39-3 18-14 28-27 28S50 78 47 60c-3-18 7-39 27-39z" />
            <circle className="loading-food-pit" cx="74" cy="67" r="12" />
            <path className="loading-food-highlight" d="M59 36c-5 8-6 16-5 22" />
          </g>
        ) : shape === 5 ? (
          <g className="loading-food-motion">
            <path className="loading-food-shell" d="M77 16c24 0 37 20 32 46-4 21-18 33-37 33-21 0-35-13-38-33-4-26 16-46 43-46z" />
            <path className="loading-food-fill" fill="url(#loading-sunny)" d="M77 25c16 0 24 14 21 31-3 15-12 25-24 25-14 0-23-10-25-25-2-17 11-31 28-31z" />
            <circle className="loading-food-yolk" cx="75" cy="57" r="12" />
            <path className="loading-food-highlight" d="M57 39c-4 8-4 15-2 20" />
          </g>
        ) : shape === 6 ? (
          <g className="loading-food-motion">
            <path className="loading-food-shell" d="M75 24c24-15 47 5 41 33-4 22-20 34-41 34S38 79 34 57c-5-28 17-48 41-33z" />
            <path className="loading-food-fill" fill="url(#loading-tomato)" d="M75 31c18-11 34 4 29 26-3 17-15 26-29 26S50 74 47 57c-4-22 10-37 28-26z" />
            <path className="loading-food-leaf" d="M75 28c-7-8-2-14 6-17-1 8 2 11 9 12-5 6-10 7-15 5z" />
            <path className="loading-food-highlight" d="M56 46c-4 7-3 13-1 18" />
          </g>
        ) : shape === 7 ? (
          <g className="loading-food-motion">
            <path className="loading-food-shell" d="M53 23c7 0 10 5 9 11 15-9 37 1 34 21-3 20-20 40-40 40-14 0-19-12-10-22 7-8 9-18 5-27-4-8-3-16 2-23z" />
            <path className="loading-food-fill" fill="url(#loading-sunny)" d="M58 35c13-7 28 1 25 16-3 16-16 31-28 31-8 0-11-7-5-15 9-12 11-25 8-32z" />
            <path className="loading-food-leaf" d="M53 24c-5-6 1-13 9-15 0 8-2 12-9 15z" />
            <path className="loading-food-highlight" d="M60 48c3 9 1 17-3 23" />
          </g>
        ) : shape === 8 ? (
          <g className="loading-food-motion">
            <path className="loading-food-shell" d="M46 47c0-21 13-35 29-35s29 14 29 35c0 26-12 44-29 44S46 73 46 47z" />
            <path className="loading-food-fill" fill="url(#loading-violet)" d="M54 47c0-16 9-27 21-27s21 11 21 27c0 20-9 35-21 35S54 67 54 47z" />
            <path className="loading-food-leaf" d="M72 16c-6-7-2-12 5-15 0 8 5 10 9 12-4 5-9 6-14 3z" />
            <path className="loading-food-highlight" d="M61 39c-3 9-3 20 0 28" />
          </g>
        ) : shape === 9 ? (
          <g className="loading-food-motion">
            <path className="loading-food-shell" d="M40 38c0-14 12-23 35-23s35 9 35 23v36c0 12-13 19-35 19S40 86 40 74z" />
            <path className="loading-food-fill" fill="url(#loading-sunny)" d="M48 41c0-11 9-17 27-17s27 6 27 17v31c0 9-10 13-27 13s-27-4-27-13z" />
            <path className="loading-food-detail" d="M50 47h50M52 58h46M55 69h40" />
          </g>
        ) : shape === 10 ? (
          <g className="loading-food-motion">
            <path className="loading-food-shell" d="M38 48c0-15 16-27 37-27s37 12 37 27v23c0 14-15 22-37 22S38 85 38 71z" />
            <path className="loading-food-fill" fill="url(#loading-avocado)" d="M46 49c0-10 13-18 29-18s29 8 29 18v19c0 10-12 15-29 15S46 78 46 68z" />
            <path className="loading-food-detail" d="M43 48h64" />
            <circle className="loading-food-yolk" cx="75" cy="52" r="7" />
          </g>
        ) : (
          <g className="loading-food-motion">
            <path className="loading-food-shell" d="M75 16c10 0 16 10 16 20 16-9 29 4 25 19 12 4 13 20 0 25-1 14-17 17-25 8-9 12-27 12-34 0-12 9-27-3-22-17-12-7-5-22 8-22-4-14 8-24 21-17 0-8 4-16 11-16z" />
            <path className="loading-food-fill" fill="url(#loading-avocado)" d="M75 26c7 0 10 8 8 16 12-6 21 5 15 15 10 3 8 15-2 16-1 9-11 11-17 5-6 9-20 8-23-2-10 5-18-5-12-13-8-5-1-15 8-12-2-10 7-16 15-9 0-7 4-13 9-13z" />
            <path className="loading-food-detail" d="M75 35v42M54 51l12 8M96 51L84 59M54 72l12-7M96 72l-12-7" />
          </g>
        )}
      </svg>
    </div>
  );
}

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
    setLoadingVariant(Math.floor(Math.random() * 12));
    setLoadingMessageIndex(Math.floor(Math.random() * LOADING_MESSAGES.length));
    const illustrationTimer = window.setInterval(() => {
      setLoadingVariant((current) => (current + 1) % 12);
    }, 2400);
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
