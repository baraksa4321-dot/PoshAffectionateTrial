import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/coach/clients/$clientId")({
  component: CoachClientWorkspaceLayout,
});

function CoachClientWorkspaceLayout() {
  return <Outlet />;
}
