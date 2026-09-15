import { createFileRoute } from "@tanstack/react-router";
import { CoachDashboardPage } from "./coach";

type ProgramSearch = {
  programId?: string;
  dayId?: string;
  dayName?: string;
  exerciseId?: string;
  exerciseName?: string;
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
  return (
    <CoachDashboardPage
      clientsOnly
      workspacePage
      workspaceMode="programs"
      clientId={clientId}
      {...(programId ? { initialProgramId: programId } : {})}
      {...(dayId ? { initialDayId: dayId } : {})}
      {...(dayName ? { initialDayName: dayName } : {})}
      {...(exerciseId ? { initialExerciseId: exerciseId } : {})}
      {...(exerciseName ? { initialExerciseName: exerciseName } : {})}
    />
  );
}
