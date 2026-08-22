import { ChevronLeft } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Flat card with sharp padding + crisp corners. */
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
    <div className="flex items-center gap-4">
      {leading ? (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary text-primary border border-border/50">
          {leading}
        </div>
      ) : null}
      <div className="min-w-0 flex-1 text-start">
        <p className="truncate text-[15px] font-bold leading-snug text-ink">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{subtitle}</p>
        ) : null}
        {meta ? <div className="mt-2 flex flex-wrap gap-2">{meta}</div> : null}
      </div>
      {trailing ?? <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground/40" />}
    </div>
  );

  if (asChild) return <div className={className}>{asChild}</div>;
  if (href) {
    return (
      <a
        href={href}
        className={cn(
          "surface-card press block px-4 py-3.5 sm:px-5 border-r-2 border-r-transparent hover:border-r-primary transition-all",
          className,
        )}
      >
        {inner}
      </a>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "surface-card press block w-full px-4 py-3.5 text-start sm:px-5 border-r-2 border-r-transparent hover:border-r-primary transition-all",
          className,
        )}
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
    neutral: "bg-secondary text-secondary-foreground border border-border/50",
    sage: "bg-rose-soft text-primary border border-primary/10",
    rose: "bg-rose-soft text-rose border border-rose/10",
    ink: "bg-ink text-primary-foreground border border-ink",
    cream: "bg-secondary text-ink-soft border border-border/50",
  } as const;
  const interactive = Boolean(onClick);
  return (
    <button
      type={interactive ? "button" : undefined}
      onClick={onClick}
      data-active={active ? "true" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-3 py-1 text-[12px] font-bold transition-all",
        active ? "bg-primary text-primary-foreground border border-primary" : styles[variant],
        interactive &&
          "hover:bg-primary/10 hover:text-primary press active:scale-95 cursor-pointer",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Compact icon-only square button — used in headers. */
export function IconButton({
  className,
  children,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost";
}) {
  const styles = {
    default: "bg-surface border border-border text-ink hover:bg-surface-2",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "bg-transparent text-ink hover:bg-secondary border border-transparent",
  } as const;
  return (
    <button
      type="button"
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-md transition-all active:scale-95 cursor-pointer",
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
    <div
      className={cn(
        "mb-4 flex items-end justify-between gap-4 border-b border-border/50 pb-2",
        className,
      )}
    >
      <div className="min-w-0 text-start">
        <h2 className="font-display text-[16px] font-bold tracking-tight text-ink uppercase">
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p> : null}
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
    sage: "text-primary",
    rose: "text-rose",
    cream: "text-ink-soft",
    ink: "text-ink",
  } as const;
  return (
    <div className="surface-card flex flex-col gap-2 px-4 py-4 text-start border-t-2 border-t-primary/20">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-bold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        {Icon ? <Icon className={cn("h-4 w-4", tones[tone])} strokeWidth={2} /> : null}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="font-display text-[24px] font-bold leading-none tabular-nums text-ink">
          {value}
        </p>
        {hint ? (
          <p className="text-[11px] font-medium leading-tight text-muted-foreground/80">{hint}</p>
        ) : null}
      </div>
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
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-12 text-center border border-dashed border-border/60 rounded-md bg-surface/50">
      {Icon ? (
        <div className="grid h-12 w-12 place-items-center rounded-sm bg-secondary text-primary mb-4 border border-border/50">
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </div>
      ) : null}
      <h3 className="font-display text-[16px] font-bold text-ink uppercase tracking-wide">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6 w-full">{action}</div> : null}
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
        "press inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 text-[14px] font-bold tracking-wide text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer",
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
        "press inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-secondary px-6 text-[14px] font-bold tracking-wide text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors border border-border/50 cursor-pointer",
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
        "inline-flex items-center gap-1.5 rounded-sm bg-transparent px-2 py-1 text-[13px] font-bold text-primary hover:bg-primary/5 transition-colors cursor-pointer",
        className,
      )}
    >
      {children}
      {trailing}
    </Comp>
  );
}
