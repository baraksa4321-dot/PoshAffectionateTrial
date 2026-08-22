import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;

    if (scrollLockCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    scrollLockCount += 1;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      scrollLockCount = Math.max(0, scrollLockCount - 1);
      if (scrollLockCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
      }
    };
  }, [onClose, open]);

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
