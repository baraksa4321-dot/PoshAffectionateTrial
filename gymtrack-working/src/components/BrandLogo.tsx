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
      <img
        src="/my-routine-share.png"
        alt=""
        className={`${compact ? "h-8 w-8 rounded-xl" : "h-10 w-10 rounded-2xl"} shrink-0 object-cover shadow-sm`}
      />
      <span
        className={`font-display font-extrabold tracking-tight text-ink ${compact ? "text-base" : "text-lg"}`}
      >
        My Routine
      </span>
    </Link>
  );
}
