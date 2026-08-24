import { createFileRoute } from "@tanstack/react-router";
import { CoachDashboardPage } from "./coach";

export const Route = createFileRoute("/coach/clients/$clientId/nutrition")({
  component: CoachClientNutritionRoute,
});

function CoachClientNutritionRoute() {
  const { clientId } = Route.useParams();
  return (
    <CoachDashboardPage clientsOnly workspacePage workspaceMode="nutrition" clientId={clientId} />
  );
}
