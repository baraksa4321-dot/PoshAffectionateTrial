import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Apple, ArrowRight, Barcode, Camera, Check, LoaderCircle, Shuffle, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
// useEffect is still used below for syncing the draft when the underlying
// food changes; the explicit scrollTo on foodId change has been removed in
// favour of the root-level ScrollToTop subscribed to router.subscribe('onResolved').
import { AppShell } from "@/components/AppShell";
import { Stepper } from "@/components/Stepper";
import { IconButton, PrimaryButton, SecondaryButton } from "@/components/ui-app/primitives";
import { deleteFood, emptyFood, findFoodReplacements, saveFood, useGym } from "@/lib/gym-store";
import type { FoodItem } from "@/lib/gym-types";
import { supabase } from "@/lib/supabase";

type FoodSearch = {
  mealDate?: string | undefined;
  mealId?: string | undefined;
  logFoodId?: string | undefined;
};

export const Route = createFileRoute("/nutrition/foods/$foodId")({
  head: () => ({
    meta: [{ title: "פרטי מאכל — MY routine" }],
  }),
  validateSearch: (search: Record<string, unknown>): FoodSearch => ({
    mealDate: typeof search["mealDate"] === "string" ? search["mealDate"] : undefined,
    mealId: typeof search["mealId"] === "string" ? search["mealId"] : undefined,
    logFoodId: typeof search["logFoodId"] === "string" ? search["logFoodId"] : undefined,
  }),
  component: FoodDetail,
});

const field =
  "w-full rounded-2xl border border-border/60 bg-secondary px-4 py-3.5 text-[14px] outline-none focus:border-primary";
const labelCls =
  "mb-1.5 block text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase";

async function imageDataUrl(file: File) {
  if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
    throw new Error("אפשר להעלות צילום JPG או PNG בלבד.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("התמונה גדולה מדי. הגודל המרבי הוא 8MB.");
  }
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("לא ניתן לקרוא את התמונה."));
    reader.onerror = () => reject(new Error("לא ניתן לקרוא את התמונה."));
    reader.readAsDataURL(file);
  });
}

function FoodDetail() {
  const { foodId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { foods, userProfile } = useGym();
  const showCalories = userProfile?.showCalories !== false;
  const isNew = foodId === "new";
  const existing = foods.find((f) => f.id === foodId);
  const isLogEdit = Boolean(search.mealDate && search.mealId && search.logFoodId && !isNew);

  const [draft, setDraft] = useState<FoodItem>(existing ?? emptyFood());
  const [draftFoodId, setDraftFoodId] = useState(foodId);
  const [draftIsDirty, setDraftIsDirty] = useState(false);
  const [swapQuery, setSwapQuery] = useState("");
  const [showSwaps, setShowSwaps] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savingFood, setSavingFood] = useState(false);
  const [deletingFood, setDeletingFood] = useState(false);
  const [barcodeQuery, setBarcodeQuery] = useState(existing?.catalog?.barcode ?? "");
  const [barcodeState, setBarcodeState] = useState<"idle" | "loading" | "error">("idle");
  const [barcodeError, setBarcodeError] = useState("");
  const [labelScanState, setLabelScanState] = useState<"idle" | "loading" | "error">("idle");
  const [labelScanError, setLabelScanError] = useState("");

  // Scroll reset is handled centrally in __root.tsx (ScrollToTop subscribed to
  // router.subscribe('onResolved')); no per-page effect needed.

  useEffect(() => {
    if (draftFoodId !== foodId) {
      setDraftFoodId(foodId);
      setDraft(existing ?? emptyFood());
      setDraftIsDirty(false);
      setBarcodeQuery(existing?.catalog?.barcode ?? "");
      return;
    }
    // A realtime pull may replace `existing` while this form is open. Never
    // overwrite fields the user has already started editing.
    if (!draftIsDirty && existing) setDraft(existing);
  }, [draftFoodId, draftIsDirty, existing, foodId]);

  const lookupBarcode = async () => {
    const barcode = barcodeQuery.replace(/\D/g, "");
    if (!barcode) {
      setBarcodeError("יש להזין ברקוד לפני החיפוש.");
      setBarcodeState("error");
      return;
    }
    setBarcodeState("loading");
    setBarcodeError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(`/nutrition-lookup-barcode?barcode=${encodeURIComponent(barcode)}`, {
        headers: session?.access_token ? { authorization: `Bearer ${session.access_token}` } : {},
      });
      const result = (await response.json()) as { food?: FoodItem; error?: string };
      if (!response.ok || !result.food) throw new Error(result.error || "לא נמצאה התאמה.");
      setDraft({ ...result.food, id: draft.id, approvalStatus: "pending" });
      setDraftIsDirty(true);
      setBarcodeQuery(barcode);
      setBarcodeState("idle");
    } catch (error) {
      setBarcodeError(error instanceof Error ? error.message : "חיפוש הברקוד נכשל.");
      setBarcodeState("error");
    }
  };

  const scanLabel = async (file: File) => {
    setLabelScanState("loading");
    setLabelScanError("");
    try {
      const image = await imageDataUrl(file);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("יש להתחבר כדי לנתח תווית.");
      const response = await fetch("/nutrition-scan-label", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ image }),
      });
      const result = (await response.json()) as { food?: Partial<FoodItem>; error?: string };
      if (!response.ok || !result.food) throw new Error(result.error || "לא ניתן לקרוא את התווית.");
      setDraft((current) => ({
        ...current,
        ...result.food,
        id: current.id,
        approvalStatus: "pending",
        nutritionReview: {
          status: "unreviewed",
          origin: "label",
          checkedAt: new Date().toISOString().slice(0, 10),
          confidence: "medium",
          sources: [
            {
              name: "צילום תווית שהועלה על ידי המשתמש",
              kind: "label-photo",
              match: "same-food",
              valuesPer: "serving",
            },
          ],
          notes: "נוצר כמועמד לעריכה. אין לראות בערכים אימות עד להשוואה לתווית.",
        },
      }));
      setDraftIsDirty(true);
      setLabelScanState("idle");
    } catch (error) {
      setLabelScanError(error instanceof Error ? error.message : "ניתוח התווית נכשל.");
      setLabelScanState("error");
    }
  };

  const replacements = useMemo(() => {
    if (!existing) return [];
    return findFoodReplacements(foods, { ...existing, quantity: 1 }, swapQuery).slice(0, 10);
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

  const set = (patch: Partial<FoodItem>) => {
    setDraftIsDirty(true);
    setDraft((current) => ({ ...current, ...patch }));
  };

  const onSave = () => {
    if (savingFood) return;
    if (!draft.name.trim()) {
      setSaveError("יש להזין שם מאכל לפני השמירה.");
      return;
    }
    setSavingFood(true);
    if (!draft.servingSize.trim()) {
      setSaveError("יש להזין גודל מנת ייחוס ברור.");
      setSavingFood(false);
      return;
    }
    try {
      saveFood({
        ...draft,
        name: draft.name.trim(),
        ...(isNew ? { approvalStatus: "pending" as const } : {}),
      });
      setSaveError("");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "לא ניתן לשמור את המאכל.");
      setSavingFood(false);
      return;
    }
    if (isNew) {
      navigate({
        to: "/nutrition/foods/$foodId",
        params: { foodId: draft.id },
        replace: true,
      });
    } else {
      navigate({ to: "/nutrition/foods" });
    }
    setSavingFood(false);
  };

  const onDelete = () => {
    if (!existing || deletingFood) return;
    setDeletingFood(true);
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
          <IconButton
            variant="primary"
            aria-label="שמור"
            onClick={onSave}
            disabled={savingFood}
            aria-busy={savingFood}
          >
            {savingFood ? <span className="text-xs">...</span> : <Check className="h-5 w-5" strokeWidth={2.4} />}
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
          {showCalories ? (
            <>
              <p className="text-[10.5px] font-semibold tracking-[0.16em] text-rose uppercase">
                קלוריות למנה
              </p>
              <p className="mt-1 font-display text-[34px] font-semibold leading-none text-ink tabular-nums">
                {Math.round(draft.calories)}
              </p>
            </>
          ) : (
            <p className="text-[12px] font-semibold text-muted-foreground">
              ערכי קלוריות מוסתרים לפי הגדרת הפרופיל
            </p>
          )}
          <p className="mt-1 text-[12.5px] text-muted-foreground">{draft.servingSize || "מנה 1"}</p>
        </div>
      </div>

      {draft.catalog ? (
        <div className="surface-card mt-3 space-y-2 p-4 text-start">
          <p className="text-[10.5px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            פרטי מוצר מדף
          </p>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <p>
              <span className="text-muted-foreground">מותג: </span>
              <span className="font-semibold text-ink">{draft.brand || "לא צוין"}</span>
            </p>
            <p>
              <span className="text-muted-foreground">סוג: </span>
              <span className="font-semibold text-ink">
                {{
                  powder: "אבקה",
                  bar: "חטיף",
                  drink: "משקה",
                  pudding: "מעדן",
                  yogurt: "יוגורט",
                  other: "אחר",
                }[draft.catalog.productType] ?? "אחר"}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">אריזה: </span>
              <span className="font-semibold text-ink">
                {draft.catalog.packageSize || draft.servingSize}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">מזהה: </span>
              <span className="font-mono text-[11px] text-ink">
                {draft.catalog.barcode || draft.catalog.sourceProductId}
              </span>
            </p>
          </div>
          {draft.catalog.sourceUrl ? (
            <a
              href={draft.catalog.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-[11px] font-semibold text-primary underline-offset-2 hover:underline"
            >
              צפייה במקור הנתונים
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="surface-card mt-3 space-y-2 p-4 text-start">
        <label className={labelCls}>חיפוש מהיר לפי ברקוד</label>
        <div className="flex gap-2">
          <input
            className={`${field} min-w-0 flex-1`}
            value={barcodeQuery}
            onChange={(event) => setBarcodeQuery(event.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="8–14 ספרות"
            aria-label="ברקוד מוצר"
          />
          <button
            type="button"
            onClick={() => void lookupBarcode()}
            disabled={barcodeState === "loading"}
            className="press inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-3 text-[12px] font-bold text-primary-foreground disabled:opacity-60"
          >
            {barcodeState === "loading" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Barcode className="h-4 w-4" />
            )}
            חיפוש
          </button>
        </div>
        {barcodeError ? <p className="text-[11px] font-semibold text-destructive">{barcodeError}</p> : null}
      </div>

      <div className="surface-card mt-3 space-y-2 p-4 text-start">
        <label className={labelCls}>יצירת מועמד מצילום תווית</label>
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3">
          {labelScanState === "loading" ? (
            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Camera className="h-5 w-5 text-primary" />
          )}
          <span className="text-[12px] font-semibold text-ink">
            {labelScanState === "loading" ? "קורא את התווית…" : "צלמי או העלי תווית ערכים"}
            <span className="mt-0.5 block text-[10.5px] font-normal text-muted-foreground">
              התוצאה תיפתח כאן כטיוטה לעריכה ולא תישמר בלי אישור.
            </span>
          </span>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            capture="environment"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void scanLabel(file);
            }}
          />
        </label>
        {labelScanError ? (
          <p className="text-[11px] font-semibold text-destructive">{labelScanError}</p>
        ) : null}
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
          <label className={labelCls}>מותג (אופציונלי)</label>
          <input
            className={field}
            value={draft.brand ?? ""}
            onChange={(e) => set({ brand: e.target.value })}
            placeholder="למשל: תנובה GO, דנונה PRO..."
          />
        </div>

        <div className="surface-card p-4">
          <label className={labelCls}>גודל מנת ייחוס</label>
          <select
            className={`${field} mb-2`}
            value={draft.servingSize}
            onChange={(e) => set({ servingSize: e.target.value })}
          >
            <option value="100 גרם">100 גרם — מזון שנמדד במשקל</option>
            <option value="כף">כף — שמנים, ממרחים ורטבים</option>
            <option value="כוס (200 מ״ל)">כוס — משקאות ומרקים</option>
            <option value="יחידה">יחידה — פירות, ירקות ומאפים</option>
            <option value="פרוסה">פרוסה — לחם וגבינות פרוסות</option>
          </select>
          <input
            className={field}
            value={draft.servingSize}
            onChange={(e) => set({ servingSize: e.target.value })}
            placeholder="למשל: ביצה M (53 גרם), חצי אבוקדו (75 גרם)"
          />
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            בחרי יחידה שמתאימה לאוכל: גרמים למזון שנשקל, כפות לממרחים ושמנים, כוסות לנוזלים ויחידות
            לפירות, ביצים ומאפים.
          </p>
        </div>

        <div className="surface-card grid grid-cols-2 gap-3 p-4">
          {showCalories ? (
            <Stepper
              label="קלוריות"
              value={draft.calories}
              min={0}
              onChange={(calories) => set({ calories })}
            />
          ) : null}
          <Stepper
            label="חלבון"
            value={draft.protein}
            step={0.1}
            min={0}
            suffix="g"
            onChange={(protein) => set({ protein })}
          />
          <Stepper
            label="פחמימות"
            value={draft.carbs}
            step={0.1}
            min={0}
            suffix="g"
            onChange={(carbs) => set({ carbs })}
          />
          <Stepper
            label="שומן"
            value={draft.fat}
            step={0.1}
            min={0}
            suffix="g"
            onChange={(fat) => set({ fat })}
          />
          <div className="col-span-2">
            <Stepper
              label="סיבים תזונתיים"
              value={draft.fiber ?? 0}
              step={0.1}
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
          {saveError ? (
            <p
              role="alert"
              className="border-s-2 border-destructive bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive"
            >
              {saveError}
            </p>
          ) : null}
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
