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
        auth ? "justify-center" : ""
      } ${compact ? "" : "group"}`}
    >
      <img
        src="/myroutine-logo.png"
        alt="MY routine"
        width={auth ? 180 : compact ? 92 : 180}
        height={auth ? 68 : compact ? 35 : 64}
        decoding="async"
        draggable={false}
        className={
          compact
            ? auth
              ? "h-10 w-[180px] object-contain object-center"
              : "h-5 w-[92px] object-contain object-right"
            : "h-10 w-[180px] object-contain object-right"
        }
      />
    </Link>
  );
}
