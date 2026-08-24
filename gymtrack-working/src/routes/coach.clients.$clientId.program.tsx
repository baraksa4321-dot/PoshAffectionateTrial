import { createFileRoute } from "@tanstack/react-router";
import { CoachDashboardPage } from "./coach";

export const Route = createFileRoute("/coach/clients/$clientId/program")({
  component: CoachClientProgramRoute,
});

function CoachClientProgramRoute() {
  const { clientId } = Route.useParams();
  return (
    <CoachDashboardPage clientsOnly workspacePage workspaceMode="programs" clientId={clientId} />
  );
}
