import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { CoachDashboardPage } from "./coach";

const COACH_PLAN_DEEP_LINK_KEY = "gymtrack-coach-plan-deep-link";

type ProgramSearch = {
  programId?: string;
  dayId?: string;
  dayName?: string;
  exerciseId?: string;
  exerciseName?: string;
};

type StoredPlanDeepLink = ProgramSearch & {
  clientId: string;
  createdAt: number;
};

export const Route = createFileRoute("/coach/clients/$clientId/program")({
  validateSearch: (search: Record<string, unknown>): ProgramSearch => ({
    ...(typeof search["programId"] === "string" ? { programId: search["programId"] } : {}),
    ...(typeof search["dayId"] === "string" ? { dayId: search["dayId"] } : {}),
    ...(typeof search["dayName"] === "string" ? { dayName: search["dayName"] } : {}),
    ...(typeof search["exerciseId"] === "string" ? { exerciseId: search["exerciseId"] } : {}),
    ...(typeof search["exerciseName"] === "string"
      ? { exerciseName: search["exerciseName"] }
      : {}),
  }),
  component: CoachClientProgramRoute,
});

function CoachClientProgramRoute() {
  const { clientId } = Route.useParams();
  const { programId, dayId, dayName, exerciseId, exerciseName } = Route.useSearch();
  const storedDeepLink = useMemo<StoredPlanDeepLink | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(COACH_PLAN_DEEP_LINK_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<StoredPlanDeepLink>;
      if (
        parsed.clientId !== clientId ||
        typeof parsed.createdAt !== "number" ||
        Date.now() - parsed.createdAt > 120_000
      ) {
        return null;
      }
      return parsed as StoredPlanDeepLink;
    } catch {
      return null;
    }
  }, [clientId]);

  useEffect(() => {
    if (typeof window !== "undefined" && storedDeepLink) {
      window.sessionStorage.removeItem(COACH_PLAN_DEEP_LINK_KEY);
    }
  }, [storedDeepLink]);

  const resolvedProgramId = programId ?? storedDeepLink?.programId;
  const resolvedDayId = dayId ?? storedDeepLink?.dayId;
  const resolvedDayName = dayName ?? storedDeepLink?.dayName;
  const resolvedExerciseId = exerciseId ?? storedDeepLink?.exerciseId;
  const resolvedExerciseName = exerciseName ?? storedDeepLink?.exerciseName;

  return (
    <CoachDashboardPage
      clientsOnly
      workspacePage
      workspaceMode="programs"
      clientId={clientId}
      {...(resolvedProgramId ? { initialProgramId: resolvedProgramId } : {})}
      {...(resolvedDayId ? { initialDayId: resolvedDayId } : {})}
      {...(resolvedDayName ? { initialDayName: resolvedDayName } : {})}
      {...(resolvedExerciseId ? { initialExerciseId: resolvedExerciseId } : {})}
      {...(resolvedExerciseName ? { initialExerciseName: resolvedExerciseName } : {})}
    />
  );
}
