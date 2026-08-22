import { ChevronLeft } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Soft card with consistent padding + rounded corners. */
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("surface-card px-4 py-4 text-foreground sm:px-5", className)} {...props}>
      {children}
    </div>
  );
}

/** A row of an item — used in lists (exercises, programs, history). */
export function ListRow({
  className,
  leading,
  title,
  subtitle,
  meta,
  trailing,
  onClick,
  href,
  asChild,
  children,
}: {
  className?: string;
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  href?: string;
  asChild?: ReactNode;
  children?: ReactNode;
}) {
  const inner = (
    <div className="flex items-center gap-3.5">
      {leading ? (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
          {leading}
        </div>
      ) : null}
      <div className="min-w-0 flex-1 text-start">
        <p className="truncate text-[15px] font-semibold leading-snug text-ink">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">{subtitle}</p>
        ) : null}
        {meta ? <div className="mt-1.5 flex flex-wrap gap-1.5">{meta}</div> : null}
      </div>
      {trailing ?? <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground/60" />}
    </div>
  );

  if (asChild) return <div className={className}>{asChild}</div>;
  if (href) {
    return (
      <a href={href} className={cn("surface-card press block px-4 py-3.5 sm:px-5", className)}>
        {inner}
      </a>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn("surface-card press block w-full px-4 py-3.5 text-start sm:px-5", className)}
      >
        {inner}
      </button>
    );
  }
  return <div className={cn("surface-card px-4 py-3.5 sm:px-5", className)}>{inner}</div>;
}

/** Pill / chip — used for tags, filters, status. */
export function Pill({
  children,
  variant = "neutral",
  className,
  onClick,
  active,
}: {
  children: ReactNode;
  variant?: "neutral" | "sage" | "rose" | "ink" | "cream";
  className?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const styles = {
    neutral: "bg-secondary text-secondary-foreground",
    sage: "bg-rose-soft text-primary",
    rose: "bg-rose-soft text-rose",
    ink: "bg-ink text-primary-foreground",
    cream: "bg-secondary text-ink-soft",
  } as const;
  const interactive = Boolean(onClick);
  return (
    <button
      type={interactive ? "button" : undefined}
      onClick={onClick}
      data-active={active ? "true" : undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11.5px] font-bold transition-colors",
        active ? "bg-primary text-primary-foreground shadow-sm" : styles[variant],
        interactive && "press active:scale-95",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Compact icon-only round button — used in headers. */
export function IconButton({
  className,
  children,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost";
}) {
  const styles = {
    default: "bg-white/90 border border-border/60 text-ink hover:bg-white shadow-sm",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    ghost: "bg-transparent text-ink hover:bg-secondary",
  } as const;
  return (
    <button
      type="button"
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-transparent transition-all active:scale-95",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Section header — title + optional action link. */
export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0 text-start">
        <h2 className="font-display text-[18px] font-bold tracking-tight text-ink">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-[12.5px] text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Statistic tile — label + value + icon. */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "sage",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ComponentType<{ className?: string }>;
  tone?: "sage" | "rose" | "cream" | "ink";
}) {
  const tones = {
    sage: "bg-rose-soft text-primary",
    rose: "bg-rose-soft text-rose",
    cream: "bg-secondary text-ink-soft",
    ink: "bg-ink text-primary-foreground",
  } as const;
  return (
    <div className="surface-card flex flex-col gap-1 px-3.5 py-3.5 text-start">
      <div className={cn("grid h-9 w-9 place-items-center rounded-xl", tones[tone])}>
        {Icon ? <Icon className="h-4 w-4" strokeWidth={2.2} /> : null}
      </div>
      <p className="mt-1 font-display text-[22px] font-bold leading-none tabular-nums text-ink">
        {value}
      </p>
      <p className="text-[11.5px] font-medium leading-tight text-muted-foreground">{label}</p>
      {hint ? (
        <p className="mt-0.5 text-[10.5px] leading-tight text-muted-foreground/80">{hint}</p>
      ) : null}
    </div>
  );
}

/** "Empty state" component. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card mx-auto flex max-w-sm flex-col items-center px-6 py-10 text-center">
      {Icon ? (
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-rose-soft text-primary">
          <Icon className="h-7 w-7" strokeWidth={1.8} />
        </div>
      ) : null}
      <h3 className="mt-4 font-display text-[19px] font-bold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Big primary CTA button — full-width mobile. */
export function PrimaryButton({
  className,
  children,
  leading,
  trailing,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "press inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[14.5px] font-bold text-primary-foreground shadow-[0_8px_20px_oklch(0.55_0.16_350/0.25)] hover:bg-primary/90 disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
}

/** Soft secondary button — full-width mobile. */
export function SecondaryButton({
  className,
  children,
  leading,
  trailing,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "press inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-5 text-[14.5px] font-bold text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
}

/** Inline primary text link — for "see all" type buttons. */
export function LinkPill({
  children,
  className,
  href,
  trailing,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  trailing?: ReactNode;
}) {
  const Comp: React.ElementType = href ? "a" : "button";
  return (
    <Comp
      href={href}
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-secondary/80 px-3 py-1.5 text-[12px] font-bold text-primary",
        className,
      )}
    >
      {children}
      {trailing}
    </Comp>
  );
}
