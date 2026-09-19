import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PlanManager } from "@/components/abonnements/PlanManager";
import { requireAdminPage } from "@/lib/admin-auth";
import { getPlans } from "@/lib/subscription-store";
import { getServices } from "@/lib/service-catalog-store";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  await requireAdminPage();
  const [plans, services] = await Promise.all([getPlans(), getServices()]);

  return (
    <>
      <TopBar title="Formules d'abonnement" />
      <div className="mb-4">
        <Link
          href="/app/abonnements"
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Abonnements
        </Link>
      </div>
      <PlanManager plans={plans} services={services} />
    </>
  );
}
