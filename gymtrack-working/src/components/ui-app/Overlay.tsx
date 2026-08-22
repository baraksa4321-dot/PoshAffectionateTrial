import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";

type OverlayVariant = "center" | "bottom";

let scrollLockCount = 0;
let previousBodyOverflow = "";

export function Overlay({
  open,
  onClose,
  children,
  variant = "center",
  panelClassName = "",
  className = "",
  ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: OverlayVariant;
  panelClassName?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;

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
    window.addEventListener("keydown", onKeyDown);
    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(focusableSelector);
      (firstFocusable ?? panelRef.current)?.focus();
    });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.cancelAnimationFrame(focusFrame);
      scrollLockCount = Math.max(0, scrollLockCount - 1);
      if (scrollLockCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
      }
      previousActiveElement?.focus();
    };
  }, [open]);

  if (!open || !mounted || typeof document === "undefined") return null;

  const isBottom = variant === "bottom";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className={`fixed inset-0 z-[100] flex ${
        isBottom ? "items-end justify-center" : "items-center justify-center"
      } bg-foreground/40 p-4 backdrop-blur-sm ${className}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onTouchStart={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`w-full ${
          isBottom
            ? "max-h-[calc(100dvh-1rem)] max-w-xl rounded-t-[2rem] pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            : "max-h-[calc(100dvh-2rem)] max-w-lg rounded-3xl"
        } overflow-y-auto overscroll-contain bg-card shadow-2xl ${panelClassName}`}
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
