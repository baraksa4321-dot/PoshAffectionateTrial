import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, CheckCircle2, Dumbbell } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CardioTracker } from "@/components/CardioTracker";
import { ChallengeLibrary } from "@/components/ChallengeLibrary";
import { MusicAtmosphereButton } from "@/components/MusicAtmosphereButton";
import { ProgressTrendsModal } from "@/components/ProgressTrendsModal";
import { EmptyState } from "@/components/ui-app/primitives";
import { useGym } from "@/lib/gym-store";
import type { Workout } from "@/lib/gym-types";
import { getCurrentWeekDates, localDateKey } from "@/lib/workout-session";

export const Route = createFileRoute("/workouts/")({
  head: () => ({
    meta: [
      { title: "האימונים שלי — MY routine" },
      { property: "og:title", content: "האימונים שלי — MY routine" },
    ],
  }),
  component: Workouts,
});

function Workouts() {
  const { workouts, exercises, history, cardioLogs, challengeEnrollments, challenges, userProfile } = useGym();
  const navigate = useNavigate();
  const weekDays = getCurrentWeekDates();
  const weekStartDate = weekDays[0]?.date ?? "";
  const weekEndDate = weekDays[weekDays.length - 1]?.date ?? weekStartDate;
  const gender = userProfile?.gender;
  const [progressWorkout, setProgressWorkout] = useState<Workout | null>(null);
  const activeEnrollments = (challengeEnrollments ?? []).filter((enrollment) => enrollment.active);
  const activeChallengeWorkoutIds = new Set(activeEnrollments.flatMap((enrollment) => enrollment.workoutIds));
  const activeChallengeNames = activeEnrollments
    .map((enrollment) => challenges.find((challenge) => challenge.id === enrollment.challengeId)?.title)
    .filter((title): title is string => Boolean(title));
  const weeklyWorkouts = [
    ...workouts.filter((workout) => !activeChallengeWorkoutIds.has(workout.id)),
    ...workouts.filter((workout) => activeChallengeWorkoutIds.has(workout.id)),
  ].sort((a, b) => {
    if (a.weekday === undefined && b.weekday === undefined) return 0;
    if (a.weekday === undefined) return 1;
    if (b.weekday === undefined) return -1;
    return a.weekday - b.weekday;
  });
  const isLegacyWeekdaySchedule = weeklyWorkouts.every((workout) => workout.weekday === undefined);
  const completedCardioLogs = (cardioLogs ?? [])
    .filter((log) => {
      const date = localDateKey(`${log.date}T12:00:00`);
      return (
        date >= weekStartDate &&
        date <= weekEndDate
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <AppShell
      kicker="אימונים"
      title="האימונים שלי"
      subtitle="רשימה פשוטה של כל האימונים שלך"
      pageClassName="workouts-page"
    >
      <section className="mt-4 text-start">
          <div className="flex items-center justify-end gap-1.5">
          <ChallengeLibrary compact />
          <CardioTracker />
            <MusicAtmosphereButton gender={gender} />
        </div>
        {activeChallengeNames.length > 0 ? (
            <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 px-3.5 py-3 text-start">
              <p className="text-[10px] font-bold tracking-[0.12em] text-primary uppercase">אתגרים פעילים</p>
              <p className="mt-1 text-xs font-extrabold text-ink">
                {activeChallengeNames.join(" · ")}
              </p>
            </div>
          ) : null}
        {weeklyWorkouts.length > 0 ? (
          <div className="mt-2 space-y-2">
            {weeklyWorkouts.map((workout, index) => {
              const day = workout.weekday === undefined
                ? isLegacyWeekdaySchedule
                  ? weekDays[index]
                  : undefined
                : weekDays[workout.weekday];
              return (
                <div key={workout.id} className="surface-card flex items-center gap-2 border-border/70 bg-background p-3 text-start">
                  <Link
                    to="/session/$workoutId"
                    params={{ workoutId: workout.id }}
                    className="press flex min-w-0 flex-1 items-center gap-3"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Dumbbell className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-primary">
                          {day?.label ?? "ללא יום קבוע"}
                        </span>
                        {day?.isToday ? (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                            היום
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-[14px] font-bold text-ink">{workout.name}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {workout.items.length} תרגילים
                      </p>
                    </div>
                    <ArrowLeft className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setProgressWorkout(workout)}
                    className="press inline-flex shrink-0 items-center gap-1 rounded-xl border border-primary/25 bg-primary/5 px-2 py-2 text-[10px] font-bold text-primary"
                    aria-label={`פתיחת מגמות עבור ${workout.name}`}
                  >
                    <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                    מגמות
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}
        {completedCardioLogs.length > 0 ? (
          <div className="mt-3 space-y-2">
            <p className="px-1 text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
              אימונים שבוצעו השבוע
            </p>
            {completedCardioLogs.map((log) => (
              <div
                key={log.id}
                className="surface-card flex items-center gap-3 border-primary/20 bg-primary/5 p-3 text-start"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-primary">בוצע</span>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {log.date === weekDays.find((day) => day.isToday)?.date
                        ? "היום"
                        : log.date}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[14px] font-bold text-ink">
                    אירובי · {log.type}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {log.durationMin} דקות
                    {log.distanceKm ? ` · ${log.distanceKm} ק״מ` : ""}
                    {log.calories > 0 ? ` · ${log.calories} קלוריות` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {weeklyWorkouts.length === 0 && completedCardioLogs.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="עדיין אין אימונים"
            description={
              userProfile?.role === "coach" || userProfile?.role === "owner"
                ? "אפשר ליצור את האימון הראשון שלך במסך התוכניות."
                : gender === "female"
                  ? "האימונים שלך יופיעו כאן לאחר שהמאמן יוסיף אותם."
                  : "האימונים שלך יופיעו כאן לאחר שהמאמן יוסיף אותם."
            }
          />
        ) : null}
      </section>
      <ProgressTrendsModal
        open={progressWorkout !== null}
        workout={progressWorkout}
        exercises={exercises}
        history={history}
        onClose={() => setProgressWorkout(null)}
        onStartWorkout={(workoutId) => {
          setProgressWorkout(null);
          void navigate({ to: "/session/$workoutId", params: { workoutId } });
        }}
      />
    </AppShell>
  );
}
