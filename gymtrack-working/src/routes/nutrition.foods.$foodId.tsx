import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Apple, ArrowRight, Check, Shuffle, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
// useEffect is still used below for syncing the draft when the underlying
// food changes; the explicit scrollTo on foodId change has been removed in
// favour of the root-level ScrollToTop subscribed to router.subscribe('onResolved').
import { AppShell } from "@/components/AppShell";
import { Stepper } from "@/components/Stepper";
import { IconButton, PrimaryButton, SecondaryButton } from "@/components/ui-app/primitives";
import { deleteFood, emptyFood, findFoodReplacements, saveFood, useGym } from "@/lib/gym-store";
import type { FoodItem } from "@/lib/gym-types";

type FoodSearch = {
  mealDate?: string;
  mealId?: string;
  logFoodId?: string;
};

export const Route = createFileRoute("/nutrition/foods/$foodId")({
  head: () => ({
    meta: [{ title: "פרטי מאכל — הרוטינה שלי" }],
  }),
  validateSearch: (search: Record<string, unknown>): FoodSearch => ({
    mealDate: typeof search.mealDate === "string" ? search.mealDate : undefined,
    mealId: typeof search.mealId === "string" ? search.mealId : undefined,
    logFoodId: typeof search.logFoodId === "string" ? search.logFoodId : undefined,
  }),
  component: FoodDetail,
});

const field =
  "w-full rounded-2xl border border-border/60 bg-secondary px-4 py-3.5 text-[14px] outline-none focus:border-primary";
const labelCls =
  "mb-1.5 block text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase";

function FoodDetail() {
  const { foodId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { foods } = useGym();
  const isNew = foodId === "new";
  const existing = foods.find((f) => f.id === foodId);
  const isLogEdit = Boolean(search.mealDate && search.mealId && search.logFoodId && !isNew);

  const [draft, setDraft] = useState<FoodItem>(existing ?? emptyFood());
  const [swapQuery, setSwapQuery] = useState("");
  const [showSwaps, setShowSwaps] = useState(false);

  // Scroll reset is handled centrally in __root.tsx (ScrollToTop subscribed to
  // router.subscribe('onResolved')); no per-page effect needed.

  useEffect(() => {
    if (existing) setDraft(existing);
    else if (isNew) setDraft(emptyFood());
  }, [existing, isNew]);

  const replacements = useMemo(() => {
    if (!existing) return [];
    return findFoodReplacements(foods, existing, swapQuery).slice(0, 10);
  }, [foods, existing, swapQuery]);

  if (!isNew && !existing && foodId !== "custom") {
    return (
      <AppShell title="מאכל לא נמצא">
        <p className="surface-card p-5 text-muted-foreground text-start">
          מאכל זה אינו קיים עוד בספרייה.
        </p>
        <Link
          to="/nutrition/foods"
          className="mt-4 inline-block text-primary font-semibold text-start"
        >
          חזרה לספריית המאכלים
        </Link>
      </AppShell>
    );
  }

  if (foodId === "custom" && isLogEdit) {
    return (
      <AppShell title="מאכל יומן">
        <p className="surface-card p-5 text-muted-foreground text-start">
          מאכל זה מופיע ביומן ולא מקושר ישירות לספרייה.
        </p>
        <Link to="/nutrition" className="mt-4 inline-block text-primary font-semibold text-start">
          חזרה ליומן התזונה
        </Link>
      </AppShell>
    );
  }

  const set = (patch: Partial<FoodItem>) => setDraft({ ...draft, ...patch });

  const onSave = () => {
    if (!draft.name.trim()) return;
    saveFood({ ...draft, name: draft.name.trim() });
    if (isNew) {
      navigate({
        to: "/nutrition/foods/$foodId",
        params: { foodId: draft.id },
        replace: true,
      });
    } else {
      navigate({ to: "/nutrition/foods" });
    }
  };

  const onDelete = () => {
    if (!existing) return;
    deleteFood(existing.id);
    navigate({ to: "/nutrition/foods" });
  };

  return (
    <AppShell
      kicker={isNew ? "מאכל חדש" : "ספריית מאכלים"}
      title={isNew ? "מאכל חדש" : draft.name || "מאכל"}
      subtitle={!isNew ? draft.servingSize : undefined}
      action={
        <div className="flex gap-2">
          <Link
            to="/nutrition/foods"
            aria-label="חזרה"
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-secondary"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <IconButton variant="primary" aria-label="שמור" onClick={onSave}>
            <Check className="h-5 w-5" strokeWidth={2.4} />
          </IconButton>
        </div>
      }
    >
      {/* Hero card with macros */}
      <div className="rose-card flex items-center gap-4 p-5">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/70 text-rose">
          <Apple className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1 text-start">
          <p className="text-[10.5px] font-semibold tracking-[0.16em] text-rose uppercase">
            קלוריות למנה
          </p>
          <p className="mt-1 font-display text-[34px] font-semibold leading-none text-ink tabular-nums">
            {Math.round(draft.calories)}
          </p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">{draft.servingSize || "מנה 1"}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-start">
        <div className="surface-card p-4">
          <label className={labelCls}>שם המאכל</label>
          <input
            className={field}
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="שם המאכל..."
          />
        </div>

        <div className="surface-card p-4">
          <label className={labelCls}>גודל מנת ייחוס</label>
          <input
            className={field}
            value={draft.servingSize}
            onChange={(e) => set({ servingSize: e.target.value })}
            placeholder="100 גרם, יחידה 1, פרוסה 1..."
          />
        </div>

        <div className="surface-card grid grid-cols-2 gap-3 p-4">
          <Stepper
            label="קלוריות"
            value={draft.calories}
            min={0}
            onChange={(calories) => set({ calories })}
          />
          <Stepper
            label="חלבון"
            value={draft.protein}
            step={0.5}
            min={0}
            suffix="g"
            onChange={(protein) => set({ protein })}
          />
          <Stepper
            label="פחמימות"
            value={draft.carbs}
            step={0.5}
            min={0}
            suffix="g"
            onChange={(carbs) => set({ carbs })}
          />
          <Stepper
            label="שומן"
            value={draft.fat}
            step={0.5}
            min={0}
            suffix="g"
            onChange={(fat) => set({ fat })}
          />
          <div className="col-span-2">
            <Stepper
              label="סיבים תזונתיים"
              value={draft.fiber ?? 0}
              step={0.5}
              min={0}
              suffix="g"
              onChange={(fiber) => set({ fiber })}
            />
          </div>
        </div>

        <div className="surface-card p-4">
          <label className={labelCls}>הערות ומידע נוסף</label>
          <textarea
            rows={2}
            className={field}
            value={draft.notes ?? ""}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="מידע על המותג או הערות..."
          />
        </div>

        <div className="space-y-3 pt-2">
          <PrimaryButton onClick={onSave} leading={<Check className="h-4 w-4" />}>
            שמור מאכל בספרייה
          </PrimaryButton>
          {!isNew && existing ? (
            <SecondaryButton
              onClick={() => setShowSwaps((v) => !v)}
              leading={<Shuffle className="h-4 w-4" />}
            >
              {showSwaps ? "הסתרי הצעות להחלפה" : "הציגי מאכלים דומים"}
            </SecondaryButton>
          ) : null}
        </div>

        {showSwaps && existing ? (
          <div className="surface-card p-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              מאכלים דומים להחלפה
            </p>
            <div className="num-pill mt-2 flex h-11 items-center gap-2 px-3.5">
              <input
                value={swapQuery}
                onChange={(e) => setSwapQuery(e.target.value)}
                placeholder="סינון מועמדים להחלפה..."
                className="w-full bg-transparent text-[13px] outline-none"
              />
            </div>
            <div className="mt-3 space-y-2">
              {replacements.map((item) => (
                <Link
                  key={item.food.id}
                  to="/nutrition/foods/$foodId"
                  params={{ foodId: item.food.id }}
                  className="press flex w-full items-center justify-between gap-3 rounded-2xl bg-secondary px-3.5 py-3 text-start"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-ink">{item.food.name}</p>
                    <p className="text-[11.5px] text-muted-foreground">
                      {item.food.calories} קלוריות · חלבון {item.food.protein}g · Δ
                      {Math.abs(item.food.calories - existing.calories)} קלוריות
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {!isNew && existing ? (
          <button
            type="button"
            onClick={onDelete}
            className="press flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-[14.5px] font-semibold text-destructive"
          >
            <Trash2 className="h-4 w-4" /> מחק מאכל מהספרייה
          </button>
        ) : null}
      </div>
    </AppShell>
  );
}
