import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/coach/tracking")({
  component: () => <Outlet />,
});