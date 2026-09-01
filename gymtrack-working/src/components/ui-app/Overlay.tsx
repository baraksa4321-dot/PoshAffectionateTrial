import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";

type OverlayVariant = "center" | "bottom" | "top" | "full";

let scrollLockCount = 0;
let previousBodyOverflow = "";
let previousBodyOverscrollBehavior = "";
let previousDocumentOverflow = "";
let previousDocumentOverscrollBehavior = "";
let activeOverlayToken = 0;
const openOverlayTokens: number[] = [];

function scrollFocusedFieldWithinPanel(field: HTMLElement, panel: HTMLElement) {
  const fieldRect = field.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  let scrollParent: HTMLElement | null = field.parentElement;
  while (scrollParent && scrollParent !== panel) {
    const overflowY = window.getComputedStyle(scrollParent).overflowY;
    if (
      /(auto|scroll)/.test(overflowY) &&
      scrollParent.scrollHeight > scrollParent.clientHeight + 1
    ) {
      const parentRect = scrollParent.getBoundingClientRect();
      const safeTop = Math.max(panelRect.top + 16, parentRect.top + 12);
      const safeBottom = Math.min(panelRect.bottom - 20, parentRect.bottom - 16);
      let delta = 0;
      if (fieldRect.top < safeTop) delta = fieldRect.top - safeTop;
      else if (fieldRect.bottom > safeBottom) delta = fieldRect.bottom - safeBottom;
      if (!delta) return;
      scrollParent.scrollTop += delta;
      return;
    }
    scrollParent = scrollParent.parentElement;
  }

  const safeTop = panelRect.top + 16;
  const safeBottom = panelRect.bottom - 20;
  let delta = 0;
  if (fieldRect.top < safeTop) delta = fieldRect.top - safeTop;
  else if (fieldRect.bottom > safeBottom) delta = fieldRect.bottom - safeBottom;
  if (!delta) return;
  panel.scrollTop += delta;
}

export function Overlay({
  open,
  onClose,
  children,
  variant = "center",
  backdrop = true,
  panelClassName = "",
  className = "",
  ariaLabel,
  inline = false,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: OverlayVariant;
  backdrop?: boolean;
  panelClassName?: string;
  className?: string;
  ariaLabel?: string;
  inline?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !inline || typeof window === "undefined") return;

    const visualViewport = window.visualViewport;
    const keepFocusedFieldVisible = () => {
      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLElement)) return;

      window.requestAnimationFrame(() => {
        if (document.activeElement !== activeElement) return;
        const inlinePanel = activeElement.closest<HTMLElement>(
          '[data-overlay-inline-panel="true"]',
        );
        if (inlinePanel) scrollFocusedFieldWithinPanel(activeElement, inlinePanel);
        else activeElement.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
      });
    };

    visualViewport?.addEventListener("resize", keepFocusedFieldVisible);
    visualViewport?.addEventListener("scroll", keepFocusedFieldVisible);
    window.addEventListener("focusin", keepFocusedFieldVisible);

    return () => {
      visualViewport?.removeEventListener("resize", keepFocusedFieldVisible);
      visualViewport?.removeEventListener("scroll", keepFocusedFieldVisible);
      window.removeEventListener("focusin", keepFocusedFieldVisible);
    };
  }, [inline, open]);

  useEffect(() => {
    if (!open || inline || typeof document === "undefined") return;

    const overlayToken = ++activeOverlayToken;
    openOverlayTokens.push(overlayToken);
    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (scrollLockCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      previousBodyOverscrollBehavior = document.body.style.overscrollBehavior;
      previousDocumentOverflow = document.documentElement.style.overflow;
      previousDocumentOverscrollBehavior = document.documentElement.style.overscrollBehavior;
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.overscrollBehavior = "none";
    }
    scrollLockCount += 1;

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Only the topmost sheet should react. Without this guard, every
        // mounted overlay receives the window event and nested pickers close
        // their parent in the same keypress.
        if (overlayToken !== activeOverlayToken) return;
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true",
      );
      if (!focusable.length) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const visualViewport = window.visualViewport;
    const keepFocusedFieldVisible = () => {
      const activeElement = document.activeElement;
      const panel = panelRef.current;
      if (!(activeElement instanceof HTMLElement) || !panel?.contains(activeElement)) {
        return;
      }
      window.requestAnimationFrame(() => {
        if (document.activeElement !== activeElement) return;
        scrollFocusedFieldWithinPanel(activeElement, panel);
      });
    };
    const updateKeyboardOffset = () => {
      const visibleHeight = visualViewport?.height ?? window.innerHeight;
      const viewportTop = visualViewport?.offsetTop ?? 0;
      const rawKeyboardOffset = Math.max(0, window.innerHeight - visibleHeight - viewportTop);
      const nextKeyboardOffset = rawKeyboardOffset > 80 ? rawKeyboardOffset : 0;
      setViewportHeight(visibleHeight);
      setKeyboardOffset(nextKeyboardOffset);
      if (visibleHeight < window.innerHeight) keepFocusedFieldVisible();
    };
    updateKeyboardOffset();
    visualViewport?.addEventListener("resize", updateKeyboardOffset);
    visualViewport?.addEventListener("scroll", updateKeyboardOffset);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("focusin", keepFocusedFieldVisible);
    const focusFrame = window.requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("focusin", keepFocusedFieldVisible);
      visualViewport?.removeEventListener("resize", updateKeyboardOffset);
      visualViewport?.removeEventListener("scroll", updateKeyboardOffset);
      window.cancelAnimationFrame(focusFrame);
      setKeyboardOffset(0);
      setViewportHeight(null);
      scrollLockCount = Math.max(0, scrollLockCount - 1);
      const tokenIndex = openOverlayTokens.indexOf(overlayToken);
      if (tokenIndex !== -1) openOverlayTokens.splice(tokenIndex, 1);
      activeOverlayToken = openOverlayTokens.at(-1) ?? 0;
      if (scrollLockCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
        document.body.style.overscrollBehavior = previousBodyOverscrollBehavior;
        document.documentElement.style.overflow = previousDocumentOverflow;
        document.documentElement.style.overscrollBehavior = previousDocumentOverscrollBehavior;
      }
      if (previousActiveElement?.isConnected) previousActiveElement.focus({ preventScroll: true });
    };
  }, [inline, open]);

  if (!open || !mounted || typeof document === "undefined") return null;

  const isBottom = variant === "bottom";
  const isTop = variant === "top";
  const isFull = variant === "full";
  const panelBottomGap = isFull ? 0 : isBottom ? 16 : 32;
  const panelMaxHeight =
    viewportHeight === null
      ? `calc(100dvh - ${panelBottomGap}px)`
      : `${Math.max(0, viewportHeight - panelBottomGap)}px`;

  if (inline) {
    return (
      <div className={`w-full ${className}`}>
        <div
          data-overlay-inline-panel="true"
          className={`overlay-inline-panel w-full overflow-x-hidden ${panelClassName}`}
        >
          {children}
        </div>
      </div>
    );
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      data-overlay-root="true"
      data-overlay-variant={variant}
      data-keyboard-open={keyboardOffset > 0 ? "true" : undefined}
      // Keep centered dialogs anchored to the layout viewport when the
      // keyboard opens. Re-centering against the shorter visual viewport
      // makes profile/edit cards jump upward as soon as an input is focused.
      style={viewportHeight !== null && isFull ? { height: `${viewportHeight}px` } : undefined}
      className={`overlay-root fixed inset-0 z-[100] flex touch-pan-y overflow-x-hidden ${
        isFull
          ? "items-stretch justify-center"
          : isBottom
            ? "items-end justify-center"
            : isTop
              ? "items-start justify-center"
              : "items-center justify-center"
      } ${isFull ? "bg-background p-0" : backdrop ? "bg-foreground/40 p-4" : "bg-transparent p-4"} ${className}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        data-overlay-panel="true"
        style={{
          maxHeight: panelMaxHeight,
          ...(isBottom && keyboardOffset > 0 ? { marginBottom: `${keyboardOffset}px` } : {}),
        }}
        className={`overlay-panel w-full touch-pan-y ${
          isFull
            ? "h-full max-h-full max-w-none rounded-none"
            : isBottom
              ? "max-h-[calc(100dvh-1rem)] max-w-xl rounded-t-[2rem] pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              : isTop
                ? "max-h-[calc(100dvh-2rem)] max-w-lg rounded-3xl"
                : "max-h-[calc(100dvh-2rem)] max-w-lg rounded-3xl"
        } overflow-y-auto overscroll-contain bg-card shadow-2xl ${panelClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
