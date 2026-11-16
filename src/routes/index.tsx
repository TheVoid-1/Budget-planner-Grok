import { createFileRoute } from "@tanstack/react-router";
import { BudgetApp } from "@/components/budget-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <BudgetApp />;
}
