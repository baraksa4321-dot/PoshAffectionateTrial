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
        src="/myroutine-logo.png"
        alt="MY routine"
        width={compact ? 92 : 128}
        height={compact ? 35 : 48}
        decoding="async"
        draggable={false}
        className={compact ? "h-5 w-[92px] object-contain" : "h-7 w-[128px] object-contain"}
      />
    </Link>
  );
}
