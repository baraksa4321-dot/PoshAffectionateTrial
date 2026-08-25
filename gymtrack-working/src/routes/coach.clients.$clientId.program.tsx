import { createFileRoute } from "@tanstack/react-router";
import { CoachDashboardPage } from "./coach";

type ProgramSearch = {
  programId?: string;
  dayId?: string;
};

export const Route = createFileRoute("/coach/clients/$clientId/program")({
  validateSearch: (search: Record<string, unknown>): ProgramSearch => ({
    ...(typeof search["programId"] === "string" ? { programId: search["programId"] } : {}),
    ...(typeof search["dayId"] === "string" ? { dayId: search["dayId"] } : {}),
  }),
  component: CoachClientProgramRoute,
});

function CoachClientProgramRoute() {
  const { clientId } = Route.useParams();
  const { programId, dayId } = Route.useSearch();
  return (
    <CoachDashboardPage
      clientsOnly
      workspacePage
      workspaceMode="programs"
      clientId={clientId}
      {...(programId ? { initialProgramId: programId } : {})}
      {...(dayId ? { initialDayId: dayId } : {})}
    />
  );
}
