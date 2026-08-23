import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/workouts/")({
  head: () => ({
    meta: [
      { title: "האימונים שלי — My Routine" },
      { property: "og:title", content: "האימונים שלי — My Routine" },
    ],
  }),
  component: Workouts,
});

function Workouts() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/programs", replace: true });
  }, [navigate]);
  return <AppShell title="" subtitle="" />;
}
