import { createFileRoute } from "@tanstack/react-router";
import { CoachDashboardPage } from "./coach";

export const Route = createFileRoute("/coach/tracking/$clientId")({
  component: TrackingClientRoute,
});

function TrackingClientRoute() {
  const { clientId } = Route.useParams();
  return (
    <CoachDashboardPage
      clientsOnly
      workspacePage
      trackingLanding
      clientId={clientId}
      workspaceMode="all"
    />
  );
}