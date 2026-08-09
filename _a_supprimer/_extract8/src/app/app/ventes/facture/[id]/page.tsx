import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getInvoice } from "@/lib/invoice-store";
import { SIZE_LABEL } from "@/lib/pricing";
import { PrintButton } from "@/components/checkin/PrintButton";
import { InvoicePayment } from "@/components/ventes/InvoicePayment";
import { eur } from "@/lib/utils";

export const dynamic = "force-dynamic";

function longDate(iso: string) {
  return new Intl.DateTimeFormat("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function FacturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inv = await getInvoice(id);
  if (!inv) notFound();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/app/ventes"
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Ventes
        </Link>
        <PrintButton />
      </div>

      <div className="mx-auto mb-4 max-w-3xl">
        <InvoicePayment
          id={inv.id}
          total={inv.total}
          paid={inv.status === "payee"}
          method={inv.payment?.method}
        />
      </div>

      <div className="sheet mx-auto max-w-3xl rounded-xl bg-white p-8 text-neutral-900 shadow-premium print:rounded-none print:shadow-none">
        <div className="flex items-start justify-between border-b-2 border-[#C9A227] pb-4">
          <div>
            <div className="text-2xl font-bold uppercase tracking-wide">
              Stone Car <span className="text-[#C9A227]">Prestige</span>
            </div>
            <div className="text-xs uppercase tracking-widest text-neutral-500">
              L'exigence à chaque détail · Thuin
            </div>
            <div className="mt-2 text-[11px] text-neutral-500">
              TVA BE0123.456.789 · IBAN BE00 0000 0000 0000
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-lg font-bold">Facture</div>
            <div className="text-neutral-500">{inv.ref}</div>
            <div className="text-neutral-500">{longDate(inv.createdAt)}</div>
            <div
              className={
                "mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-bold uppercase " +
                (inv.status === "payee"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700")
              }
            >
              {inv.status === "payee" ? "Payée" : "Impayée"}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400">Client</div>
            <div className="text-lg font-semibold">{inv.customer}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400">Véhicule</div>
            <div className="text-lg font-semibold">{inv.vehicleTitle}</div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded border border-neutral-300 px-2 py-0.5 font-mono text-sm">
                {inv.plate}
              </span>
              <span className="rounded-full bg-[#C9A227] px-2 py-0.5 text-xs font-bold uppercase text-white">
                Taille {SIZE_LABEL[inv.size]}
              </span>
            </div>
          </div>
        </div>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-300 text-left text-xs uppercase text-neutral-500">
              <th className="py-2">Prestation</th>
              <th className="py-2 text-right">Montant</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((i) => (
              <tr key={i.label} className="border-b border-neutral-100">
                <td className="py-2">{i.label}</td>
                <td className="py-2 text-right">{eur(i.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Sous-total HT</span>
              <span>{eur(inv.subtotal)}</span>
            </div>
            {inv.discount > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>Remise</span>
                <span>-{eur(inv.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600">
              <span>TVA {inv.vatRate}%</span>
              <span>{eur(inv.vat)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-neutral-300 pt-1.5 text-base font-bold">
              <span>Total TTC</span>
              <span className="text-[#9C7B1E]">{eur(inv.total)}</span>
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-neutral-200 pt-3 text-[11px] text-neutral-500">
          {inv.status === "payee"
            ? `Facture acquittée${inv.payment ? ` par ${inv.payment.method}` : ""}. Merci de votre confiance.`
            : "Paiement à réception. Merci de votre confiance."}
          {inv.quoteRef && ` · Établie d'après le devis ${inv.quoteRef}.`} Stone Car Prestige — Thuin.
        </p>
      </div>
    </div>
  );
}
