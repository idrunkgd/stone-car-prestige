import Link from "next/link";
import { QrCode, Settings2, TriangleAlert, CalendarClock } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, SectionHeader } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { CardBrowser, type CardListItem } from "@/components/abonnements/CardBrowser";
import { getStaffRole } from "@/lib/admin-auth";
import { getAllCardViews, getSubscriptionStats } from "@/lib/subscription-store";
import { getServices } from "@/lib/service-catalog-store";
import { toCardDTO, shortDate } from "@/lib/subscription-types";
import { eur } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AbonnementsPage() {
  const role = (await getStaffRole()) ?? "employe";
  const [views, stats, services] = await Promise.all([
    getAllCardViews(),
    getSubscriptionStats(),
    getServices(),
  ]);

  const labelOf = (ids: string[]) =>
    ids
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter((x): x is string => !!x);

  const items: CardListItem[] = views.map((v) => ({
    card: toCardDTO(v, labelOf(v.card.plan.serviceIds)),
    phone: v.card.holder.phone,
    email: v.card.holder.email,
    plates: v.card.holder.plates ?? [],
    linked: !!v.card.holder.accountId,
  }));

  return (
    <>
      <TopBar
        title="Abonnements"
        cta={role === "admin" ? "Attribuer une carte" : undefined}
        ctaHref={role === "admin" ? "/app/abonnements/nouveau" : undefined}
      />

      <div className="mb-6 flex flex-wrap gap-2.5">
        <Link
          href="/app/abonnements/scan"
          className="flex items-center gap-2 rounded-xl bg-gold-grad px-4 py-2.5 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold"
        >
          <QrCode size={16} /> Scanner une carte
        </Link>
        {role === "admin" && (
          <Link
            href="/app/abonnements/plans"
            className="flex items-center gap-2 rounded-xl border border-line-gold px-4 py-2.5 font-display text-sm uppercase tracking-wide text-gold-1 hover:bg-gold/[0.08]"
          >
            <Settings2 size={16} /> Formules d&apos;abonnement
          </Link>
        )}
      </div>

      {role === "admin" && (
        <>
          <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile value={stats.activeCards} label="Abonnements actifs" gold />
            <StatTile
              value={Math.round(stats.revenue)}
              suffix=" €"
              label="CA abonnements"
              gold
            />
            <StatTile
              value={stats.creditsOutstanding}
              label="Lavages à prester"
            />
            <StatTile
              value={stats.usedThisMonth}
              label="Consommés ce mois"
              green
            />
          </div>
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile value={stats.totalCards} label="Cartes émises" />
            <StatTile
              value={Math.round(stats.unpaid)}
              suffix=" €"
              label="Non payé"
            />
            <StatTile
              value={stats.expiringSoon.length}
              label="Expirent < 30 j"
            />
            <StatTile value={stats.exhausted.length} label="Cartes épuisées" />
          </div>

          {(stats.expiringSoon.length > 0 || stats.topPlans.length > 0) && (
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <div>
                <SectionHeader title="Abonnements les plus vendus" />
                <Card>
                  {stats.topPlans.length === 0 ? (
                    <p className="text-sm text-ink-muted">
                      Aucune carte vendue pour l&apos;instant.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {stats.topPlans.map((p) => {
                        const max = Math.max(
                          1,
                          ...stats.topPlans.map((x) => x.cards),
                        );
                        return (
                          <div key={p.name}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                              <span>{p.name}</span>
                              <span className="font-display text-gold-1">
                                {p.cards} carte{p.cards > 1 ? "s" : ""}{" "}
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
              </div>

              <div>
                <SectionHeader title="À surveiller" />
                <Card>
                  {stats.expiringSoon.length === 0 &&
                  stats.exhausted.length === 0 ? (
                    <p className="text-sm text-ink-muted">
                      Aucune carte proche de l&apos;expiration.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {stats.expiringSoon.slice(0, 5).map((v) => (
                        <Link
                          key={v.card.id}
                          href={`/app/abonnements/${v.card.id}`}
                          className="flex items-center justify-between rounded-lg border border-line-soft px-3 py-2 text-sm hover:border-line-gold"
                        >
                          <span className="flex items-center gap-2">
                            <CalendarClock size={14} className="text-state-orange" />
                            {v.card.holder.name}
                            <span className="text-[11px] text-ink-faint">
                              {v.card.plan.name}
                            </span>
                          </span>
                          <span className="text-[12px] text-state-orange">
                            {v.daysLeft} j · {shortDate(v.card.expiresAt)}
                          </span>
                        </Link>
                      ))}
                      {stats.exhausted.slice(0, 3).map((v) => (
                        <Link
                          key={v.card.id}
                          href={`/app/abonnements/${v.card.id}`}
                          className="flex items-center justify-between rounded-lg border border-line-soft px-3 py-2 text-sm hover:border-line-gold"
                        >
                          <span className="flex items-center gap-2">
                            <TriangleAlert size={14} className="text-ink-faint" />
                            {v.card.holder.name}
                            <span className="text-[11px] text-ink-faint">
                              {v.card.plan.name}
                            </span>
                          </span>
                          <span className="text-[12px] text-ink-muted">
                            Épuisée
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </>
      )}

      <SectionHeader title="Cartes clients" />
      <CardBrowser items={items} />
    </>
  );
}
