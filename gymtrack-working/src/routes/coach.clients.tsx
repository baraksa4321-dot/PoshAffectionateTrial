import { createFileRoute } from "@tanstack/react-router";
import { CoachDashboardPage } from "./coach";

export const Route = createFileRoute("/coach/clients")({
  component: () => <CoachDashboardPage clientsOnly />,
});
