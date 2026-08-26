import { Link } from "@tanstack/react-router";

export function BrandLogo({
  compact = false,
  auth = false,
}: {
  compact?: boolean;
  auth?: boolean;
}) {
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
        width={auth ? 132 : compact ? 92 : 180}
        height={auth ? 48 : compact ? 35 : 64}
        decoding="async"
        draggable={false}
        className={
          compact
            ? auth
              ? "h-8 w-[132px] object-contain object-right"
              : "h-5 w-[92px] object-contain object-right"
            : "h-10 w-[180px] object-contain object-right"
        }
      />
    </Link>
  );
}
