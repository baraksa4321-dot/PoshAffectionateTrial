import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CardioTracker } from "@/components/CardioTracker";
import { ChallengeLibrary } from "@/components/ChallengeLibrary";
import { EmptyState } from "@/components/ui-app/primitives";
import { useGym } from "@/lib/gym-store";
import { getCurrentWeekDates } from "@/lib/workout-session";

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
  const { workouts, challengeEnrollments, challenges, userProfile } = useGym();
  const weekDays = getCurrentWeekDates();
  const gender = userProfile?.gender;
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
                <Link
                  key={workout.id}
                  to="/session/$workoutId"
                  params={{ workoutId: workout.id }}
                  className="surface-card press flex items-center gap-3 border-border/70 bg-background p-3 text-start"
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
              );
            })}
          </div>
        ) : (
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
        )}
      </section>
    </AppShell>
  );
}
