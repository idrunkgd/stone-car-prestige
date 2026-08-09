import { PagePlaceholder } from "@/components/PagePlaceholder";
import { Images } from "lucide-react";

export default function GaleriePage() {
  return (
    <PagePlaceholder
      title="Galerie"
      icon={Images}
      roadmap="V1.5"
      message="Photos avant / après avec comparateur slider interactif, filtrables par véhicule et par prestation. Vos meilleurs visuels, prêts à être partagés."
    />
  );
}
