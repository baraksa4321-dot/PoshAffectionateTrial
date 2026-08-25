import { createFileRoute } from "@tanstack/react-router";
import { CoachDashboardPage } from "./coach";

export const Route = createFileRoute("/coach/tracking/")({
  component: () => <CoachDashboardPage clientsOnly trackingLanding />,
});