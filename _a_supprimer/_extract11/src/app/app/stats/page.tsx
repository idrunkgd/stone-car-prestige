import { TopBar } from "@/components/layout/TopBar";
import { Card, SectionHeader } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { getInvoices } from "@/lib/invoice-store";
import { getQuotes } from "@/lib/quote-store";
import { getCheckins } from "@/lib/checkin-store";
import { getRequests } from "@/lib/request-store";
import { SIZE_LABEL, type SizeTier } from "@/lib/pricing";
import { eur } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [invoices, quotes, checkins, requests] = await Promise.all([
    getInvoices(),
    getQuotes(),
    getCheckins(),
    getRequests(),
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
