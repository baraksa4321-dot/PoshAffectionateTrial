import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/workouts/")({
  head: () => ({
    meta: [
      { title: "האימונים שלי — הרוטינה שלי" },
      { property: "og:title", content: "האימונים שלי — הרוטינה שלי" },
    ],
  }),
  component: Workouts,
});

function Workouts() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/programs", replace: true });
  }, [navigate]);
  return (
    <AppShell title="תוכניות אימון" subtitle="מעביר אותך למתחם התוכניות...">
      <div className="surface-card animate-pulse p-5 text-sm text-muted-foreground text-start">
        טוען תוכניות אימון…
      </div>
    </AppShell>
  );
}
