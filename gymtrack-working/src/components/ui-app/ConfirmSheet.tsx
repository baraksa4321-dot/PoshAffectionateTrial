import { X } from "lucide-react";
import { useEffect } from "react";

import { IconButton } from "./primitives";

/**
 * Mobile-native confirmation sheet (replacement for `window.confirm`).
 * Renders a bottom-anchored card with a clear title, optional description,
 * and a destructive / neutral action pair. Honors iOS safe-area and 44px
 * touch targets.
 */
export function ConfirmSheet({
  open,
  title,
  description,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Lock scroll while open so the page behind doesn't drift
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on ESC for desktop dev convenience
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="scale-in w-full max-w-xl overflow-y-auto rounded-t-[2rem] border-t border-border/40 bg-card p-5 text-start shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />

        <div className="mb-4 flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-soft text-rose">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="font-display text-[19px] font-semibold leading-tight text-ink">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton aria-label="סגור" onClick={onCancel} variant="ghost">
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="press inline-flex h-12 w-full items-center justify-center rounded-2xl bg-secondary px-5 text-[14.5px] font-semibold text-secondary-foreground sm:w-auto sm:px-7"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`press inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-[14.5px] font-semibold text-white shadow-sm sm:w-auto sm:px-7 ${
              destructive ? "bg-destructive" : "bg-primary text-primary-foreground"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
