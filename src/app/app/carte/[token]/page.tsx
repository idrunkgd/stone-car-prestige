import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { getCardByToken } from "@/lib/subscription-store";

export const dynamic = "force-dynamic";

/**
 * Résolution d'un QR code.
 *
 * Le QR contient un jeton opaque, pas l'identifiant de la carte : cette page
 * traduit le jeton en carte et redirige vers la fiche. Elle se trouve sous
 * /app, donc derrière l'authentification du personnel : scanner un QR ne
 * consomme jamais de lavage, il faut toujours une validation par un employé.
 */
export default async function CarteParTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const card = await getCardByToken(decodeURIComponent(token));

  if (card) redirect(`/app/abonnements/${card.id}?scan=1`);

  return (
    <>
      <TopBar title="Carte introuvable" />
      <Card className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-state-red/40 bg-state-red/10 text-[#e88]">
          <ShieldAlert size={26} />
        </div>
        <div>
          <div className="font-display text-xl uppercase">
            Ce QR code n&apos;est plus valable
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            La carte a peut-être été supprimée ou son QR code régénéré.
            Recherchez le client dans la liste des abonnements.
          </p>
        </div>
        <Link
          href="/app/abonnements"
          className="rounded-xl bg-gold-grad px-5 py-2.5 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold"
        >
          Rechercher une carte
        </Link>
      </Card>
    </>
  );
}
