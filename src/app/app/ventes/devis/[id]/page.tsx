import { formatVat } from "@/lib/vat";
import { requireAdminPage } from "@/lib/admin-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getQuote } from "@/lib/quote-store";
import { getSettings } from "@/lib/settings-store";
import { SIZE_LABEL } from "@/lib/pricing";
import { PrintButton } from "@/components/checkin/PrintButton";
import { createInvoiceFromQuoteAction } from "@/app/app/ventes/actions";
import { eur, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function longDate(iso: string) {
  return new Intl.DateTimeFormat("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function DevisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();

  const { id } = await params;
  const q = await getQuote(id);
  if (!q) notFound();
  const biz = await getSettings();

  /* Une facture doit tenir sur une page : au-delà d'une douzaine de lignes,
     la typographie et les interlignes se resserrent à l'impression. */
  const lignes = q.items.length;
  const dense = lignes > 12;
  const tresDense = lignes > 22;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/app/ventes"
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Ventes
        </Link>
        <div className="flex items-center gap-3">
          <form action={createInvoiceFromQuoteAction}>
            <input type="hidden" name="quoteId" value={q.id} />
            <button className="rounded-xl bg-gold-grad px-4 py-2.5 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold">
              Transformer en facture
            </button>
          </form>
          <PrintButton />
        </div>
      </div>

      <div className={cn(
          "sheet sheet--document mx-auto max-w-3xl rounded-xl bg-white p-8 text-neutral-900 shadow-premium print:p-0 print:leading-snug print:rounded-none print:shadow-none",
          tresDense
            ? "print:text-[8.5pt] print:leading-tight"
            : dense
              ? "print:text-[9.5pt]"
              : "print:text-[10.5pt]",
        )}>
        <div className="flex items-start justify-between border-b-2 border-[#C9A227] pb-4 print:pb-3">
          <div>
            <div className="text-2xl font-bold uppercase tracking-wide text-[#C9A227]">
              {biz.name}
            </div>
            <div className="text-xs uppercase tracking-widest text-neutral-500">
              {biz.address}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-bold">Devis</div>
            <div className="text-neutral-500">{q.ref}</div>
            <div className="text-neutral-500">{longDate(q.createdAt)}</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 text-sm print:mt-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400">Client</div>
            <div className="text-lg font-semibold">{q.customer}</div>
            {q.customerVat && (
              <div className="text-sm text-neutral-500">
                TVA {formatVat(q.customerVat)}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400">Véhicule</div>
            <div className="text-lg font-semibold">{q.vehicleTitle}</div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded border border-neutral-300 px-2 py-0.5 font-mono text-sm">
                {q.plate}
              </span>
              <span className="rounded-full bg-[#C9A227] px-2 py-0.5 text-xs font-bold uppercase text-white">
                Taille {SIZE_LABEL[q.size]}
              </span>
            </div>
          </div>
        </div>

        <table className="mt-6 w-full border-collapse text-sm print:mt-4">
          <thead>
            <tr className="border-b border-neutral-300 text-left text-xs uppercase text-neutral-500">
              <th className="py-2">Prestation</th>
              <th className="py-2 text-right">Prix ({SIZE_LABEL[q.size]})</th>
            </tr>
          </thead>
          <tbody>
            {q.items.map((i) => (
              <tr
                key={i.label}
                className={cn(
                  "border-b border-neutral-100",
                  tresDense ? "print:text-[8.5pt]" : "",
                )}
              >
                <td className={cn("py-2", tresDense ? "print:py-0" : "print:py-1")}>
                  {i.label}
                </td>
                <td
                  className={cn(
                    "py-2 text-right",
                    tresDense ? "print:py-0" : "print:py-1",
                  )}
                >
                  {eur(i.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="no-break mt-4 flex justify-end print:mt-3">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Sous-total HT</span>
              <span>{eur(q.subtotal)}</span>
            </div>
            {q.discount > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>Remise</span>
                <span>-{eur(q.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600">
              <span>TVA {q.vatRate}%</span>
              <span>{eur(q.vat)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-neutral-300 pt-1.5 text-base font-bold">
              <span>Total TTC</span>
              <span className="text-[#9C7B1E]">{eur(q.total)}</span>
            </div>
          </div>
        </div>

        <p className="no-break mt-8 border-t border-neutral-200 pt-3 text-[11px] text-neutral-500 print:mt-5">
          Devis valable 30 jours. Prix établis selon la taille du véhicule
          ({SIZE_LABEL[q.size]}). TVA {q.vatRate}% comprise. {biz.name} — {biz.address}.
        </p>
      </div>
    </div>
  );
}
