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
    defaultPreloadStaleTime: 0,
  });

  return router;
};
