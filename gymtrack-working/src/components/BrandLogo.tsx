import { Link } from "@tanstack/react-router";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="MY routine — דף הבית"
      className={`inline-flex items-center gap-2 text-start transition-opacity hover:opacity-80 ${
        compact ? "" : "group"
      }`}
    >
      <img
        src="/brand-logo.png"
        alt="MY routine"
        className={compact ? "h-5 w-[92px] object-contain" : "h-7 w-[128px] object-contain"}
      />
    </Link>
  );
}
