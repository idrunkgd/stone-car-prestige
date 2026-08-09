import { redirect } from "next/navigation";

/**
 * Racine : pour ce jalon (Étape A), on redirige vers le back-office.
 * Le site public vitrine sera construit à l'Étape D (voir README).
 */
export default function Home() {
  redirect("/app");
}
