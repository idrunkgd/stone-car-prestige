import { PagePlaceholder } from "@/components/PagePlaceholder";
import { CalendarDays } from "lucide-react";

export default function PlanningPage() {
  return (
    <PagePlaceholder
      title="Planning"
      icon={CalendarDays}
      roadmap="MVP · Étape C"
      message="Agenda visuel jour / semaine avec glisser-déposer des rendez-vous, ajustement des durées, blocages et vue de la charge réelle. Prochaine grande brique après la verticale opérationnelle."
      cta="Aperçu dans le dossier de conception"
    />
  );
}
