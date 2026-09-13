import { History, MessageSquareText } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/ui-app/primitives";
import { useGym } from "@/lib/gym-store";

export const Route = createFileRoute("/history/")({
  head: () => ({
    meta: [
      { title: "היסטוריית אימונים — MY routine" },
      { property: "og:title", content: "היסטוריית אימונים — MY routine" },
    ],
  }),
  component: HistoryPage,
});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "משך לא נשמר";
  const minutes = Math.round(seconds / 60);
  return minutes < 60 ? `${minutes} דקות` : `${Math.floor(minutes / 60)} ש׳ ${minutes % 60} ד׳`;
}

function HistoryPage() {
  const { history } = useGym();
  const sessions = [...history].sort((left, right) => right.date.localeCompare(left.date));

  return (
    <AppShell
      kicker="מעקב"
      title="היסטוריית האימונים"
      subtitle="כל האימונים שהשלמת, כולל משך, תרגילים ומשוב"
      pageClassName="history-page"
    >
      {sessions.length === 0 ? (
        <EmptyState
          icon={History}
          title="עדיין אין היסטוריה"
          description="אחרי שתסיימי אימון, הוא יופיע כאן כדי שתוכלי לראות את ההתקדמות לאורך זמן."
        />
      ) : (
        <section className="mt-4 space-y-2" aria-label="אימונים שהושלמו">
          {sessions.map((session) => (
            <article
              key={session.id}
              className="surface-card border-border/70 bg-background p-4 text-start"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-[15px] font-bold text-ink">
                    {session.workoutName || "אימון"}
                  </h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatDate(session.date)}
                    {session.programName ? ` · ${session.programName}` : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                  {formatDuration(session.durationSec)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span>{session.entries.length} תרגילים</span>
                {session.difficultyRating ? (
                  <span className="rounded-full bg-secondary px-2 py-1">
                    קושי:{" "}
                    {session.difficultyRating === "easy"
                      ? "קל"
                      : session.difficultyRating === "difficult"
                        ? "קשה"
                        : "מתאים"}
                  </span>
                ) : null}
              </div>

              {session.notes || session.discomfortNotes ? (
                <div className="mt-3 flex gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-xs text-ink">
                  <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="whitespace-pre-wrap">
                    {session.notes || session.discomfortNotes}
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      )}
    </AppShell>
  );
}