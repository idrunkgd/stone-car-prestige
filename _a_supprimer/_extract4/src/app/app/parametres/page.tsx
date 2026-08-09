import { PagePlaceholder } from "@/components/PagePlaceholder";
import { Settings } from "lucide-react";

export default function ParametresPage() {
  return (
    <PagePlaceholder
      title="Paramètres"
      icon={Settings}
      roadmap="MVP · Étape C"
      message="Entreprise (logo, TVA, coordonnées, IBAN), horaires, numérotation des documents, règles de réservation et d'acompte, rôles et utilisateurs. Onboarding en 6 étapes à la première connexion."
    />
  );
}
