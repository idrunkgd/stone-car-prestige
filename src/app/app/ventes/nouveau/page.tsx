import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { QuoteBuilder } from "@/components/ventes/QuoteBuilder";
import { getVehicles } from "@/lib/crm-store";
import { getServices } from "@/lib/service-catalog-store";
import { getAccounts } from "@/lib/auth-store";

export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const [services, stored, accounts] = await Promise.all([
    getServices(),
    getVehicles(),
    getAccounts(),
  ]);

  // Véhicules des comptes clients (enregistrés par les clients eux-mêmes)
  const clientVehicles = accounts.flatMap((a) =>
    (a.vehicles ?? []).map((v) => ({
      id: v.id,
      title: `${v.make} ${v.model}`,
      plate: v.plate,
      category: v.category,
      owner: a.name,
    })),
  );

  // Véhicules créés côté admin (CRM)
  const adminVehicles = stored.map((v) => ({
    id: v.id,
    title: `${v.make} ${v.model}`,
    plate: v.plate,
    category: v.category,
    owner: v.ownerName,
  }));

  const vehicles = [...clientVehicles, ...adminVehicles];

  return (
    <>
      <TopBar title="Nouveau devis" />
      <div className="mb-4">
        <Link
          href="/app/ventes"
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Ventes
        </Link>
      </div>
      <QuoteBuilder vehicles={vehicles} services={services} />
    </>
  );
}
