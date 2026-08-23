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
      <span className={`font-display font-extrabold tracking-tight text-ink ${compact ? "text-base" : "text-[17px]"}`}>
        <span className="font-black">MY</span>{" "}
        <span className="font-extrabold">routine</span>
      </span>
    </Link>
  );
}
