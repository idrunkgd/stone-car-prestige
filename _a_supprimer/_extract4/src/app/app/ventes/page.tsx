import { PagePlaceholder } from "@/components/PagePlaceholder";
import { Receipt } from "lucide-react";

export default function VentesPage() {
  return (
    <PagePlaceholder
      title="Ventes"
      icon={Receipt}
      roadmap="MVP · Étape B/C"
      message="Devis, factures et paiements : création guidée, statuts clairs, génération PDF, transformation d'un devis accepté en intervention en un clic. Numérotation DEV-/FAC- conforme."
    />
  );
}
