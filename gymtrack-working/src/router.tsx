import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

type SafeViewTransition = {
  ready: Promise<unknown>;
  finished: Promise<unknown>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void>) => SafeViewTransition;
};

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
    // Keep the previous route visible until the next route is ready, then use
    // the shared slide transition. This is the route-level equivalent of the
    // coach report drawer's transform/transition pair.
    defaultViewTransition: true,
  });

  /*
   * Safari can reject startViewTransition while a PWA is being backgrounded or
   * restored from the app switcher. TanStack Router intentionally does not
   * await the browser transition, so an unhandled `finished` rejection can
   * leave iOS with a stuck transition even though the route has loaded.
   *
   * Keep the router's normal "load first, then snapshot" behavior, but make
   * the final browser call fail open. A hidden document should commit the
   * already-loaded route immediately; a visible document still gets the same
   * shared transition as every other route.
   */
  router.startViewTransition = (update) => {
    const shouldTransition = router.shouldViewTransition ?? router.options.defaultViewTransition;
    delete router.shouldViewTransition;

    const viewDocument =
      typeof document === "undefined" ? undefined : (document as ViewTransitionDocument);
    const startViewTransition = viewDocument?.startViewTransition;

    if (
      !shouldTransition ||
      !viewDocument ||
      typeof startViewTransition !== "function" ||
      viewDocument.visibilityState !== "visible"
    ) {
      void update();
      return;
    }

    let updateStarted = false;
    const guardedUpdate = async () => {
      updateStarted = true;
      await update();
    };

    try {
      const transition = startViewTransition.call(viewDocument, guardedUpdate);
      // WebKit may reject either promise when the page is backgrounded during
      // the animation. The route update has already happened; consume those
      // browser-level rejections so they cannot poison the next navigation.
      void transition.ready.catch(() => undefined);
      void transition.finished.catch(() => undefined);
    } catch {
      // The document can become hidden between the visibility check and the
      // native call. Commit exactly once and let the route stay usable.
      if (!updateStarted) void update();
    }
  };

  return router;
};
