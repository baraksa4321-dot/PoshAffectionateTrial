export function LoadingSpinner({ className = "", label }: { className?: string; label?: string }) {
  return (
    <span
      className={`loading-spinner ${className}`.trim()}
      {...(label ? { role: "status", "aria-label": label } : { "aria-hidden": true })}
    />
  );
}
