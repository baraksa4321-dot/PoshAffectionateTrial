import { createFileRoute } from "@tanstack/react-router";
import { CoachDashboardPage } from "./coach";

export const Route = createFileRoute("/coach/clients/$clientId")({
  component: CoachClientWorkspaceRoute,
});

function CoachClientWorkspaceRoute() {
  const { clientId } = Route.useParams();
  return <CoachDashboardPage clientsOnly clientId={clientId} />;
}
