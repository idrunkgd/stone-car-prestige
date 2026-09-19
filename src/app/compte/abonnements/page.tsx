import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, CreditCard, Bell } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Card } from "@/components/ui/Card";
import { MesCartes, type ClientCard } from "@/components/compte/MesCartes";
import { getCurrentAccount } from "@/lib/auth-store";
import { getCardViewsForAccount } from "@/lib/subscription-store";
import { getNotificationsForAccount } from "@/lib/notification-store";
import { getServices } from "@/lib/service-catalog-store";
import { qrSvg } from "@/lib/qrcode";
import { siteOrigin } from "@/lib/site-url";
import { toCardDTO, toUsageDTO, dateTime } from "@/lib/subscription-types";

export const dynamic = "force-dynamic";

export default async function MesAbonnementsPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/compte");

  const [views, services, origin, notifications] = await Promise.all([
    getCardViewsForAccount(account.id),
    getServices(),
    siteOrigin(),
    getNotificationsForAccount(account.id),
  ]);

  const cards: ClientCard[] = views.map((v) => ({
    card: toCardDTO(
      v,
      v.card.plan.serviceIds
        .map((id) => services.find((s) => s.id === id)?.name)
        .filter((x): x is string => !!x),
    ),
    usages: v.usages.map(toUsageDTO),
    qrSvg: qrSvg(`${origin}/app/carte/${v.card.qrToken}`, {
      size: 104,
      title: `Carte ${v.card.number}`,
    }),
  }));

  return (
    <div id="top">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 pb-24 pt-32">
        <div className="mb-6">
          <Link
            href="/compte"
            className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
          >
            <ChevronLeft size={16} /> Mon espace
          </Link>
          <div className="mt-3 text-xs uppercase tracking-[0.3em] text-gold-2">
            Espace client
          </div>
          <h1 className="mt-2 font-display text-4xl uppercase">
            Mes abonnements
          </h1>
        </div>

        {cards.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line-gold bg-gold/[0.08] text-gold-1">
              <CreditCard size={26} />
            </div>
            <div>
              <div className="font-display text-xl uppercase">
                Aucune carte pour l&apos;instant
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                Nos cartes de lavages prépayées sont disponibles à l&apos;atelier.
                Parlez-en à l&apos;équipe lors de votre prochaine visite.
              </p>
            </div>
            <Link
              href="/reserver"
              className="rounded-xl border border-line-gold px-5 py-2.5 font-display text-sm uppercase tracking-wide text-gold-1 hover:bg-gold/[0.08]"
            >
              Prendre rendez-vous
            </Link>
          </Card>
        ) : (
          <MesCartes cards={cards} />
        )}

        {notifications.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 flex items-center gap-2 font-display text-sm uppercase tracking-[0.15em] text-gold-1">
              <Bell size={15} /> Notifications
            </h2>
            <Card>
              <ul className="space-y-3">
                {notifications.slice(0, 10).map((n) => (
                  <li
                    key={n.id}
                    className="border-b border-line-soft pb-3 last:border-0 last:pb-0"
                  >
                    <div className="font-display text-[13.5px] uppercase tracking-wide">
                      {n.title}
                    </div>
                    <p className="mt-0.5 whitespace-pre-line text-[12.5px] text-ink-muted">
                      {n.body.split("\n\n")[1] ?? n.body}
                    </p>
                    <div className="mt-1 text-[11px] text-ink-faint">
                      {dateTime(n.createdAt)}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
