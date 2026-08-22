import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Link,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";

import "../styles.css";
import { reportLovableError } from "../lib/lovable-error-reporting";

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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1",
      },
      { title: "הרוטינה שלי — אימונים ותזונה" },
      {
        name: "description",
        content: "מעקב אימונים, תזונה, תרגילים ושיאים אישיים בעברית.",
      },
      { name: "theme-color", content: "#567765" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "הרוטינה שלי" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "הרוטינה שלי — אימונים ותזונה" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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

  useEffect(() => {
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
    document.body.dir = "rtl";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <ScrollToTop />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Scripts />
    </QueryClientProvider>
  );
}
