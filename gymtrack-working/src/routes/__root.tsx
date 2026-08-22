import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Link,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

import "../styles.css";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import {
  retryProfileHydration,
  useAuthStatus,
  useGym,
  useProfileHydrationError,
  useProfileHydrationStatus,
} from "../lib/gym-store";
import { supabase } from "../lib/supabase";
import { genderText } from "../lib/gender-copy";

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

function LoadingIllustration({ variant }: { variant: number }) {
  if (variant === 1) {
    return (
      <div className="loading-dumbbell" aria-hidden="true">
        <div className="loading-weight loading-weight-left" />
        <div className="loading-weight loading-weight-left-small" />
        <div className="loading-bar" />
        <div className="loading-grip" />
        <div className="loading-weight loading-weight-right-small" />
        <div className="loading-weight loading-weight-right" />
      </div>
    );
  }

  if (variant === 2) {
    return (
      <div className="loading-apple" aria-hidden="true">
        <div className="loading-apple-leaf" />
        <div className="loading-apple-stem" />
        <div className="loading-apple-body" />
        <div className="loading-apple-shine" />
      </div>
    );
  }

  if (variant === 3) {
    return (
      <div className="loading-bowl-wrap" aria-hidden="true">
        <div className="loading-food loading-food-one" />
        <div className="loading-food loading-food-two" />
        <div className="loading-food loading-food-three" />
        <div className="loading-spoon" />
        <div className="loading-bowl">
          <div className="loading-bowl-fill" />
        </div>
      </div>
    );
  }

  return (
    <div className="loading-cup-wrap" aria-hidden="true">
      <div className="loading-bubble loading-bubble-one" />
      <div className="loading-bubble loading-bubble-two" />
      <div className="loading-bubble loading-bubble-three" />
      <div className="loading-cup">
        <div className="loading-cup-fill" />
      </div>
      <div className="loading-cup-handle" />
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const authStatus = useAuthStatus();
  const { userProfile } = useGym();
  const [loadingVariant, setLoadingVariant] = useState(0);
  const profileHydrationStatus = useProfileHydrationStatus();
  const profileHydrationError = useProfileHydrationError();
  const hasProfileHydrationError =
    authStatus === "authenticated" && profileHydrationStatus === "error";
  const isProfileHydrating =
    !hasProfileHydrationError &&
    authStatus === "authenticated" &&
    (profileHydrationStatus === "loading" || userProfile?.role === undefined);

  useEffect(() => {
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
    document.body.dir = "rtl";
    setLoadingVariant(Math.floor(Math.random() * 4));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <ScrollToTop />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      {authStatus === "loading" || isProfileHydrating ? (
        <div
          className="flex min-h-[100dvh] items-center justify-center bg-background px-4"
          dir="rtl"
        >
          <div
            className="loading-brand rounded-3xl border border-border/60 bg-white px-8 py-8 text-center shadow-sm"
            role="status"
            aria-live="polite"
            aria-label="My Routine נטען"
          >
            <LoadingIllustration variant={loadingVariant} />
            <div className="mt-5 flex justify-center">
              <BrandLogo compact />
            </div>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {loadingVariant === 1
                ? "מתכוננים לסט הבא"
                : loadingVariant === 2
                  ? "מכינים משהו טעים"
                  : loadingVariant === 3
                    ? "מערבבים את השגרה שלך"
                    : "ממלאים לך אנרגיה"}
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
