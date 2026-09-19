import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { CardDetail } from "@/components/abonnements/CardDetail";
import { getStaffRole } from "@/lib/admin-auth";
import { getCardView } from "@/lib/subscription-store";
import { getServices } from "@/lib/service-catalog-store";
import { qrSvg } from "@/lib/qrcode";
import { siteOrigin } from "@/lib/site-url";
import { toCardDTO, toUsageDTO } from "@/lib/subscription-types";

export const dynamic = "force-dynamic";

export default async function CartePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ scan?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const role = (await getStaffRole()) ?? "employe";

  const [view, services] = await Promise.all([getCardView(id), getServices()]);
  if (!view) notFound();

  const origin = await siteOrigin();
  const scanUrl = `${origin}/app/carte/${view.card.qrToken}`;
  const svg = qrSvg(scanUrl, {
    size: 108,
    dark: "#0C0C0E",
    light: "#FFFFFF",
    title: `Carte ${view.card.number}`,
  });

  const serviceLabels = view.card.plan.serviceIds
    .map((sid) => services.find((s) => s.id === sid)?.name)
    .filter((x): x is string => !!x);

  return (
    <>
      <TopBar title="Carte d'abonnement" />
      <div className="mb-4">
        <Link
          href="/app/abonnements"
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Abonnements
        </Link>
      </div>

      <CardDetail
        card={toCardDTO(view, serviceLabels)}
        usages={view.usages.map(toUsageDTO)}
        adjustments={view.adjustments}
        role={role}
        qrSvg={svg}
        scanUrl={scanUrl}
        holder={{
          email: view.card.holder.email,
          phone: view.card.holder.phone,
          plates: view.card.holder.plates ?? [],
          accountId: view.card.holder.accountId,
        }}
        notes={view.card.notes}
        services={services
          .filter(
            (s) =>
              view.card.plan.serviceIds.length === 0 ||
              view.card.plan.serviceIds.includes(s.id),
          )
          .map((s) => ({ id: s.id, name: s.name }))}
        fromScan={sp?.scan === "1"}
      />
    </>
  );
}
