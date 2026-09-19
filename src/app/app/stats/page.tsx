import { requireAdminPage } from "@/lib/admin-auth";
import { TopBar } from "@/components/layout/TopBar";
import { Card, SectionHeader } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { getInvoices } from "@/lib/invoice-store";
import { getQuotes } from "@/lib/quote-store";
import { getCheckins } from "@/lib/checkin-store";
import { getRequests } from "@/lib/request-store";
import { getSubscriptionStats } from "@/lib/subscription-store";
import { shortDate } from "@/lib/subscription-types";
import Link from "next/link";
import { SIZE_LABEL, type SizeTier } from "@/lib/pricing";
import { eur } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  await requireAdminPage();

  const [invoices, quotes, checkins, requests, subs] = await Promise.all([
    getInvoices(),
    getQuotes(),
    getCheckins(),
    getRequests(),
    getSubscriptionStats(),
  ]);

  const paid = invoices.filter((i) => i.status === "payee");
  const revenue = paid.reduce((s, i) => s + i.total, 0);
  const pending = invoices
    .filter((i) => i.status === "impayee")
    .reduce((s, i) => s + i.total, 0);
  const basket = paid.length ? revenue / paid.length : 0;
  const newRequests = requests.filter((r) => r.status === "nouveau").length;

  // Top prestations par chiffre d'affaires (devis + factures)
  const svc = new Map<string, { count: number; revenue: number }>();
  for (const doc of [...invoices, ...quotes]) {
    for (const it of doc.items) {
      const cur = svc.get(it.label) ?? { count: 0, revenue: 0 };
      cur.count += 1;
      cur.revenue += it.price;
      svc.set(it.label, cur);
    }
  }
  const topServices = [...svc.entries()]
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);
  const maxRev = Math.max(1, ...topServices.map((s) => s.revenue));

  // Répartition par taille
  const sizes: Record<SizeTier, number> = { petite: 0, moyenne: 0, grande: 0 };
  for (const q of [...invoices, ...quotes]) sizes[q.size] = (sizes[q.size] ?? 0) + 1;
  const sizeTotal = Math.max(1, sizes.petite + sizes.moyenne + sizes.grande);

  const empty = invoices.length + quotes.length + checkins.length === 0;

  return (
    <>
      <TopBar title="Statistiques" />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile value={Math.round(revenue)} suffix=" €" label="CA encaissé" gold />
        <StatTile value={Math.round(pending)} suffix=" €" label="En attente" />
        <StatTile value={Math.round(basket)} suffix=" €" label="Panier moyen" gold />
        <StatTile value={checkins.length} label="Véhicules traités" />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile value={invoices.length} label="Factures" />
        <StatTile value={quotes.length} label="Devis" />
        <StatTile value={requests.length} label="Demandes" />
        <StatTile value={newRequests} label="Nouvelles" green />
      </div>

      {/* Abonnements */}
      <div className="mb-8">
        <SectionHeader title="Abonnements" />
        <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile value={subs.activeCards} label="Cartes actives" gold />
          <StatTile
            value={Math.round(subs.revenue)}
            suffix=" €"
            label="CA abonnements"
            gold
          />
          <StatTile value={subs.creditsOutstanding} label="Lavages à prester" />
          <StatTile value={subs.usedThisMonth} label="Consommés ce mois" green />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <b className="font-display text-sm uppercase tracking-wide text-gold-1">
              Abonnements les plus vendus
            </b>
            {subs.topPlans.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                Aucune carte vendue pour l&apos;instant.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {subs.topPlans.map((p) => {
                  const max = Math.max(1, ...subs.topPlans.map((x) => x.cards));
                  return (
                    <div key={p.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{p.name}</span>
                        <span className="font-display text-gold-1">
                          {p.cards}{" "}
                          <span className="text-[11px] text-ink-faint">
                            {eur(p.revenue)}
                          </span>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-night-panel2">
                        <div
                          className="h-full rounded-full bg-gold-grad"
                          style={{ width: `${(p.cards / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          <Card>
            <b className="font-display text-sm uppercase tracking-wide text-gold-1">
              Cartes à relancer
            </b>
            <div className="mt-3 space-y-2">
              {subs.expiringSoon.length === 0 && subs.exhausted.length === 0 ? (
                <p className="text-sm text-ink-muted">Rien à signaler.</p>
              ) : (
                <>
                  {subs.expiringSoon.slice(0, 4).map((v) => (
                    <Link
                      key={v.card.id}
                      href={`/app/abonnements/${v.card.id}`}
                      className="flex items-center justify-between rounded-lg border border-line-soft px-3 py-2 text-sm hover:border-line-gold"
                    >
                      <span>{v.card.holder.name}</span>
                      <span className="text-[12px] text-state-orange">
                        expire le {shortDate(v.card.expiresAt)}
                      </span>
                    </Link>
                  ))}
                  {subs.exhausted.slice(0, 4).map((v) => (
                    <Link
                      key={v.card.id}
                      href={`/app/abonnements/${v.card.id}`}
                      className="flex items-center justify-between rounded-lg border border-line-soft px-3 py-2 text-sm hover:border-line-gold"
                    >
                      <span>{v.card.holder.name}</span>
                      <span className="text-[12px] text-ink-muted">épuisée</span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {empty ? (
        <Card className="py-12 text-center text-sm text-ink-muted">
          Les statistiques s'enrichiront au fur et à mesure de votre activité
          (devis, factures, check-ins).
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <SectionHeader title="Prestations les plus vendues" />
            <Card>
              {topServices.length === 0 ? (
                <p className="text-sm text-ink-muted">Aucune donnée pour l'instant.</p>
              ) : (
                <div className="space-y-3">
                  {topServices.map((s) => (
                    <div key={s.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{s.label}</span>
                        <span className="font-display text-gold-1">
                          {eur(s.revenue)}{" "}
                          <span className="text-[11px] text-ink-faint">×{s.count}</span>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-night-panel2">
                        <div
                          className="h-full rounded-full bg-gold-grad"
                          style={{ width: `${(s.revenue / maxRev) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div>
            <SectionHeader title="Répartition par taille de véhicule" />
            <Card>
              <div className="space-y-3">
                {(["petite", "moyenne", "grande"] as SizeTier[]).map((t) => (
                  <div key={t}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{SIZE_LABEL[t]}</span>
                      <span className="text-ink-muted">
                        {sizes[t]} · {Math.round((sizes[t] / sizeTotal) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-night-panel2">
                      <div
                        className="h-full rounded-full bg-gold-grad"
                        style={{ width: `${(sizes[t] / sizeTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
