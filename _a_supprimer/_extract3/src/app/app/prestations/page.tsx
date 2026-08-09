import { PagePlaceholder } from "@/components/PagePlaceholder";
import { Sparkles } from "lucide-react";

export default function PrestationsPage() {
  return (
    <PagePlaceholder
      title="Prestations"
      icon={Sparkles}
      roadmap="MVP · Étape C"
      message="Moteur de prestations entièrement configurable : créer, dupliquer, réordonner ; prix fixe / par taille de véhicule / à partir de / sur devis ; options, packages et checklists internes."
    />
  );
}
