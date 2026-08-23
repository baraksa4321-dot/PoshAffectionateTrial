import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/workouts/")({
  head: () => ({
    meta: [
      { title: "האימונים שלי — MY routine" },
      { property: "og:title", content: "האימונים שלי — MY routine" },
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
