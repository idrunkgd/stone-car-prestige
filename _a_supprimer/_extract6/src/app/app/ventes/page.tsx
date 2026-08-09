import Link from "next/link";
import { FileText } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getQuotes } from "@/lib/quote-store";
import { SIZE_LABEL } from "@/lib/pricing";
import { eur } from "@/lib/utils";

export const dynamic = "force-dynamic";

function fmt(iso: string) {
  return new Intl.DateTimeFormat("fr-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function VentesPage() {
  const quotes = await getQuotes();

  return (
    <>
      <TopBar title="Ventes — Devis" cta="Devis" ctaHref="/app/ventes/nouveau" />
      {quotes.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line-gold bg-gold/[0.08] text-gold-1">
            <FileText size={26} strokeWidth={1.6} />
          </div>
          <div className="font-display text-lg uppercase">Aucun devis</div>
          <p className="max-w-md text-sm text-ink-muted">
            Créez un devis : le prix des prestations s'ajuste automatiquement à la
            taille du véhicule.
          </p>
          <Link href="/app/ventes/nouveau">
            <Button className="mt-1">+ Nouveau devis</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {quotes.map((q) => (
            <Link key={q.id} href={`/app/ventes/devis/${q.id}`}>
              <Card className="p-4 transition-colors hover:border-line-gold">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-lg uppercase leading-tight">
                      {q.vehicleTitle}
                    </div>
                    <div className="text-[13px] text-ink-muted">
                      {q.customer} · {q.plate}
                    </div>
                  </div>
                  <span className="rounded-full bg-gold-grad px-2.5 py-1 font-display text-[10px] uppercase tracking-wider text-[#1a1400]">
                    {SIZE_LABEL[q.size]}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3">
                  <span className="text-[11px] text-ink-muted">
                    {q.ref} · {fmt(q.createdAt)}
                  </span>
                  <span className="font-display text-gold-1">{eur(q.total)} TTC</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
