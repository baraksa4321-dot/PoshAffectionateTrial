import { createFileRoute } from "@tanstack/react-router";
import { CoachDashboardPage } from "./coach";

export const Route = createFileRoute("/coach/clients/$clientId/nutrition")({
  validateSearch: (search: Record<string, unknown>) => ({
    ...(typeof search["date"] === "string" ? { date: search["date"] } : {}),
    ...(typeof search["mealId"] === "string" ? { mealId: search["mealId"] } : {}),
    ...(typeof search["foodId"] === "string" ? { foodId: search["foodId"] } : {}),
  }),
  component: CoachClientNutritionRoute,
});

function CoachClientNutritionRoute() {
  const { clientId } = Route.useParams();
  const { date, mealId, foodId } = Route.useSearch();
  return (
    <CoachDashboardPage
      clientsOnly
      workspacePage
      workspaceMode="nutrition"
      clientId={clientId}
      {...(date ? { initialNutritionDate: date } : {})}
      {...(mealId ? { initialNutritionMealId: mealId } : {})}
      {...(foodId ? { initialNutritionFoodId: foodId } : {})}
    />
  );
}
