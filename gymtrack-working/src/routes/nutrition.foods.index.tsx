import { createFileRoute, Link } from "@tanstack/react-router";
import { Apple, ArrowRight, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, Pill, SectionHeader } from "@/components/ui-app/primitives";
import { useGym } from "@/lib/gym-store";

export const Route = createFileRoute("/nutrition/foods/")({
  head: () => ({
    meta: [{ title: "ספריית מאכלים — הרוטינה שלי" }],
  }),
  component: FoodLibrary,
});

function FoodLibrary() {
  const { foods } = useGym();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return foods
      .filter(
        (f) =>
          !q ||
          f.name.toLocaleLowerCase().includes(q) ||
          (f.category ?? "").toLocaleLowerCase().includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "he"));
  }, [foods, query]);

  return (
    <AppShell
      kicker="תזונה"
      title="ספריית מאכלים"
      subtitle={`${foods.length} מוצרים זמינים`}
      action={
        <div className="flex gap-2">
          <Link
            to="/nutrition"
            aria-label="חזרה ליומן"
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-secondary"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/nutrition/foods/$foodId"
            params={{ foodId: "new" }}
            aria-label="הוסף מאכל"
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground"
          >
            <Plus className="h-5 w-5" strokeWidth={2.4} />
          </Link>
        </div>
      }
    >
      <div className="num-pill flex h-12 items-center gap-2 px-3.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפשי מאכל בספרייה..."
          className="w-full min-w-0 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <SectionHeader
        className="mt-5"
        title={`${filtered.length} תוצאות`}
        subtitle="לחצי על מאכל לעריכה או החלפה"
      />

      <div className="space-y-2">
        {filtered.slice(0, 80).map((food) => (
          <Link
            key={food.id}
            to="/nutrition/foods/$foodId"
            params={{ foodId: food.id }}
            className="surface-card press block p-3.5"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sage-soft text-primary">
                <Apple className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1 text-start">
                <p className="truncate font-display text-[14.5px] font-semibold text-ink">
                  {food.name}
                </p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {food.servingSize} · {food.calories} קלוריות · חלבון {food.protein}g · פחמימות{" "}
                  {food.carbs}g · שומן {food.fat}g
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Apple}
          title="לא נמצאו מאכלים"
          description="לחצי על + כדי ליצור מאכל חדש."
          action={
            <Link
              to="/nutrition/foods/$foodId"
              params={{ foodId: "new" }}
              className="press inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[13.5px] font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              מאכל חדש
            </Link>
          }
        />
      ) : null}

      <div className="mt-6 hidden">
        <Pill />
      </div>
    </AppShell>
  );
}
