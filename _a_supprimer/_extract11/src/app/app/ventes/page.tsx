import Link from "next/link";
import { FileText } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getQuotes } from "@/lib/quote-store";
import { getInvoices } from "@/lib/invoice-store";
import { SIZE_LABEL } from "@/lib/pricing";
import { eur, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function fmt(iso: string) {
  return new Intl.DateTimeFormat("fr-BE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function VentesPage() {
  const [quotes, invoices] = await Promise.all([getQuotes(), getInvoices()]);

  if (quotes.length === 0 && invoices.length === 0) {
    return (
      <>
        <TopBar title="Ventes" cta="Devis" ctaHref="/app/ventes/nouveau" />
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line-gold bg-gold/[0.08] text-gold-1">
            <FileText size={26} strokeWidth={1.6} />
          </div>
          <div className="font-display text-lg uppercase">Aucun devis</div>
          <p className="max-w-md text-sm text-ink-muted">
            Créez un devis : le prix s'ajuste à la taille du véhicule, puis
            transformez-le en facture en un clic.
          </p>
          <Link href="/app/ventes/nouveau">
            <Button className="mt-1">+ Nouveau devis</Button>
          </Link>
        </Card>
      </>
    );
  }

  return (
    <>
      <TopBar title="Ventes" cta="Devis" ctaHref="/app/ventes/nouveau" />

      {invoices.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Factures" />
          <div className="grid gap-3 sm:grid-cols-2">
            {invoices.map((inv) => (
              <Link key={inv.id} href={`/app/ventes/facture/${inv.id}`}>
                <Card className="p-4 transition-colors hover:border-line-gold">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display text-lg uppercase leading-tight">
                        {inv.vehicleTitle}
                      </div>
                      <div className="text-[13px] text-ink-muted">
                        {inv.customer} · {inv.plate}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 font-display text-[10px] uppercase tracking-wider",
                        inv.status === "payee"
                          ? "bg-state-green text-[#0d2e1e] font-bold"
                          : "border border-state-red/40 bg-state-red/15 text-[#e88]",
                      )}
                    >
                      {inv.status === "payee" ? "Payée" : "Impayée"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3">
                    <span className="text-[11px] text-ink-muted">
                      {inv.ref} · {fmt(inv.createdAt)}
                    </span>
                    <span className="font-display text-gold-1">{eur(inv.total)} TTC</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {quotes.length > 0 && (
        <section>
          <SectionHeader title="Devis" />
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
        </section>
      )}
    </>
  );
}
