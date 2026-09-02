import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // Manual scroll reset is done in __root.tsx (ScrollToTop via
    // router.subscribe('onResolved')). Disabling the built-in restoration here
    // avoids a race between the framework saving/restoring and our explicit
    // scroll-to-top — which is what was leaving the destination page at the
    // bottom when the user was deep-scrolled on the source list page.
    scrollRestoration: false,
    // Keep route chunks warm after the first intent. A zero stale time made
    // every hover/tap pay the module-loading cost again.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 60_000,
    defaultPendingMs: 120,
    // Use the browser View Transitions API when available so route changes
    // animate as a continuous slide instead of replacing the whole page.
    // TanStack Router falls back to its normal navigation automatically.
    defaultViewTransition: true,
  });

  return router;
};
