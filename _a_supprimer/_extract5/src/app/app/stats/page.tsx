import { PagePlaceholder } from "@/components/PagePlaceholder";
import { BarChart3 } from "lucide-react";

export default function StatsPage() {
  return (
    <PagePlaceholder
      title="Statistiques"
      icon={BarChart3}
      roadmap="V1.5"
      message="KPIs lisibles : CA jour / semaine / mois, panier moyen, prestations les plus vendues, taux d'occupation, clients récurrents. Des graphiques simples, jamais un tableau de bord comptable."
    />
  );
}
