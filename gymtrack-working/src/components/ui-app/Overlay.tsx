import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";

type OverlayVariant = "center" | "bottom" | "top" | "full";

let scrollLockCount = 0;
let previousBodyOverflow = "";
let activeOverlayToken = 0;
const openOverlayTokens: number[] = [];

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
    if (!open || inline || typeof document === "undefined") return;

    const overlayToken = ++activeOverlayToken;
    openOverlayTokens.push(overlayToken);
    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (scrollLockCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
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
        const panelRect = panel.getBoundingClientRect();
        const fieldRect = activeElement.getBoundingClientRect();
        const topGap = fieldRect.top - panelRect.top;
        const bottomGap = fieldRect.bottom - panelRect.bottom;
        if (topGap < 12) {
          panel.scrollTop += topGap - 12;
        } else if (bottomGap > -12) {
          panel.scrollTop += bottomGap + 12;
        }
      });
    };
    const updateKeyboardOffset = () => {
      const visibleHeight = visualViewport?.height ?? window.innerHeight;
      setViewportHeight(visibleHeight);
      setKeyboardOffset(Math.max(0, window.innerHeight - visibleHeight));
      if (visibleHeight < window.innerHeight) keepFocusedFieldVisible();
    };
    updateKeyboardOffset();
    visualViewport?.addEventListener("resize", updateKeyboardOffset);
    visualViewport?.addEventListener("scroll", updateKeyboardOffset);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("focusin", keepFocusedFieldVisible);
    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(focusableSelector);
      (firstFocusable ?? panelRef.current)?.focus();
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
      }
      previousActiveElement?.focus();
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
        <div className={`w-full overflow-x-hidden ${panelClassName}`}>{children}</div>
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
      style={viewportHeight !== null ? { height: `${viewportHeight}px` } : undefined}
      className={`overlay-root fixed inset-0 z-[100] flex overflow-x-hidden ${
        isFull
          ? "items-stretch justify-center"
          : isBottom
            ? "items-end justify-center"
            : isTop
              ? "items-start justify-center"
              : "items-center justify-center"
      } ${isFull ? "bg-background p-0" : backdrop ? "bg-foreground/40 p-4" : "bg-transparent p-4"} ${className}`}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        data-overlay-panel="true"
        style={{
          maxHeight: panelMaxHeight,
        }}
        className={`w-full ${
          isFull
            ? "h-full max-h-full max-w-none rounded-none"
            : isBottom
              ? "max-h-[calc(100dvh-1rem)] max-w-xl rounded-t-[2rem] pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              : isTop
                ? "max-h-[calc(100dvh-2rem)] max-w-lg rounded-3xl"
                : "max-h-[calc(100dvh-2rem)] max-w-lg rounded-3xl"
        } overflow-y-auto overscroll-contain bg-card shadow-2xl ${panelClassName}`}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
