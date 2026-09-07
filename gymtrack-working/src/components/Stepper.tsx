import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export function Stepper({
  label,
  value,
  step = 1,
  min = 0,
  max,
  suffix,
  compact = false,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  min?: number;
  /** Optional upper bound. Omit to allow any large number (e.g. warm-up reps > 9). */
  max?: number;
  suffix?: string;
  compact?: boolean;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => {
    let n = Math.max(min, Math.round(v * 100) / 100);
    if (max != null) n = Math.min(max, n);
    return n;
  };
  const displayValue = Number.isFinite(value) && value !== 0 ? String(value) : "";
  const [draftValue, setDraftValue] = useState(displayValue);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setDraftValue(displayValue);
  }, [displayValue, editing]);

  const commitDraft = () => {
    const normalized = draftValue.replace(",", ".").trim();
    if (!normalized || normalized === "-") {
      setDraftValue(displayValue);
      return;
    }
    const nextValue = Number(normalized);
    if (Number.isNaN(nextValue)) {
      setDraftValue(displayValue);
      return;
    }
    const next = clamp(nextValue);
    onChange(next);
    setDraftValue(next === 0 ? "" : String(next));
  };

  return (
    <div className="min-w-0">
      <p
        className={`${compact ? "mb-0.5 text-[10px]" : "mb-1 text-[11px]"} font-semibold uppercase tracking-wide text-muted-foreground`}
      >
        {label}
      </p>
      <div className={`flex items-center ${compact ? "gap-1" : "gap-1.5"}`} dir="ltr">
        <button
          type="button"
          aria-label={`הורד ${label}`}
          onClick={() => onChange(clamp(value - step))}
          className={`grid shrink-0 place-items-center bg-secondary text-secondary-foreground transition-transform active:scale-95 ${
            compact ? "h-10 w-9 rounded-lg" : "h-11 w-10 rounded-xl"
          }`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <div
          className={`num-pill flex min-w-0 flex-1 items-center justify-center px-1 ${
            compact ? "h-10" : "h-11"
          }`}
        >
          <input
            inputMode="decimal"
            enterKeyHint="done"
            value={editing ? draftValue : displayValue}
            onFocus={(event) => {
              setEditing(true);
              setDraftValue(displayValue);
              const input = event.currentTarget;
              window.requestAnimationFrame(() => input.select());
            }}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={() => {
              commitDraft();
              setEditing(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitDraft();
              }
            }}
            className={`w-full min-w-0 bg-transparent text-center font-semibold outline-none ${
              compact ? "text-sm" : "text-base"
            }`}
          />
          {suffix ? (
            <span className={`pe-1.5 font-medium text-muted-foreground ${compact ? "text-[11px]" : "text-xs"}`}>
              {suffix}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={`הגדל ${label}`}
          onClick={() => onChange(clamp(value + step))}
          className={`grid shrink-0 place-items-center bg-secondary text-secondary-foreground transition-transform active:scale-95 ${
            compact ? "h-10 w-9 rounded-lg" : "h-11 w-10 rounded-xl"
          }`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
