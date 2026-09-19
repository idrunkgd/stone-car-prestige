import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { QrScanner } from "@/components/abonnements/QrScanner";
import { getAllCardViews } from "@/lib/subscription-store";
import { siteOrigin } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  const [views, origin] = await Promise.all([getAllCardViews(), siteOrigin()]);

  // Repli manuel : recherche par numéro de carte, client, téléphone ou plaque.
  const index = views.map((v) => ({
    id: v.card.id,
    number: v.card.number,
    name: v.card.holder.name,
    plan: v.card.plan.name,
    phone: v.card.holder.phone ?? "",
    email: v.card.holder.email ?? "",
    plates: v.card.holder.plates ?? [],
    remaining: v.unlimited ? null : v.remaining,
    status: v.status,
  }));

  return (
    <>
      <TopBar title="Scanner une carte" />
      <div className="mb-4">
        <Link
          href="/app/abonnements"
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Abonnements
        </Link>
      </div>
      <QrScanner index={index} origin={origin} />
    </>
  );
}
