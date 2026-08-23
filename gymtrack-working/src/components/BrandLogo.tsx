import { Dumbbell } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="My Routine — דף הבית"
      className={`inline-flex items-center gap-2 text-start transition-opacity hover:opacity-80 ${
        compact ? "" : "group"
      }`}
    >
      {!compact ? (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[11px] rounded-bl-[4px] bg-primary text-primary-foreground shadow-[0_5px_12px_rgb(184_93_112_/_18%)]">
          <Dumbbell className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        </span>
      ) : null}
      <span className={`font-display font-extrabold tracking-tight text-ink ${compact ? "text-base" : "text-[17px]"}`}>
        My Routine
        {!compact ? (
          <small className="mt-0.5 block text-[9px] font-semibold tracking-[0.11em] text-muted-foreground">
            הגוף שלך. הקצב שלך.
          </small>
        ) : null}
      </span>
    </Link>
  );
}
