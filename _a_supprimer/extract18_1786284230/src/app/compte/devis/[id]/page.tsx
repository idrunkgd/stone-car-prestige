import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ChevronLeft, Check, Calendar, Clock } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Card } from "@/components/ui/Card";
import { AcceptQuote } from "@/components/compte/AcceptQuote";
import { getCurrentAccount } from "@/lib/auth-store";
import { getQuote } from "@/lib/quote-store";
import { SIZE_LABEL, humanMinutes } from "@/lib/pricing";
import { dayLabel } from "@/lib/availability";
import { eur } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientDevisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await getCurrentAccount();
  if (!account) redirect("/compte");
  const q = await getQuote(id);
  if (!q) notFound();
  if (q.accountId !== account.id) redirect("/compte");

  const accepted = q.status === "accepte";

  return (
    <div id="top">
      <SiteHeader />
      <section className="mx-auto max-w-2xl px-5 pb-24 pt-32">
        <div className="mb-4">
          <Link href="/compte" className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"><ChevronLeft size={16} /> Mon compte</Link>
        </div>

        <Card gold className="p-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-gold-2">Devis officiel</div>
              <div className="font-display text-2xl uppercase">{q.vehicleTitle}</div>
              <div className="text-sm text-ink-muted">{q.plate} · Taille {SIZE_LABEL[q.size]}</div>
            </div>
            <span className="rounded-full border border-line-soft px-3 py-1 font-display text-[11px] uppercase tracking-wider text-ink-muted">{q.ref}</span>
          </div>

          <ul className="mt-5 space-y-1.5 border-t border-line-soft pt-4 text-sm">
            {q.items.map((i) => (<li key={i.label} className="flex justify-between"><span>{i.label}</span><span>{eur(i.price)}</span></li>))}
          </ul>
          <div className="mt-3 space-y-1 border-t border-line-soft pt-3 text-sm">
            <div className="flex justify-between text-ink-muted"><span>Sous-total HT</span><span>{eur(q.subtotal)}</span></div>
            <div className="flex justify-between text-ink-muted"><span>TVA {q.vatRate}%</span><span>{eur(q.vat)}</span></div>
            <div className="flex justify-between font-display text-lg"><span>Total TTC</span><span className="text-gold-1">{eur(q.total)}</span></div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-[13px] text-ink-muted">
            {q.durationMin != null && <span className="flex items-center gap-1.5"><Clock size={14} /> {humanMinutes(q.durationMin)}</span>}
            {q.slotDate && <span className="flex items-center gap-1.5 capitalize"><Calendar size={14} /> {dayLabel(q.slotDate)} · {q.slotStart}</span>}
          </div>

          <div className="mt-5 rounded-xl border border-line-gold bg-gold/[0.06] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">Acompte à régler</span>
              <span className="font-display text-lg text-gold-1">{eur(q.acompte ?? 0)}</span>
            </div>
          </div>

          <div className="mt-6">
            {accepted ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-line-gold bg-state-green/10 py-3 text-state-green">
                <Check size={18} /> Devis accepté · acompte payé
              </div>
            ) : (
              <AcceptQuote quoteId={q.id} acompte={q.acompte ?? 0} />
            )}
          </div>
        </Card>
      </section>
      <SiteFooter />
    </div>
  );
}
