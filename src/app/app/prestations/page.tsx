import { requireAdminPage } from "@/lib/admin-auth";
import { TopBar } from "@/components/layout/TopBar";
import { ServiceManager } from "@/components/prestations/ServiceManager";
import { getServices } from "@/lib/service-catalog-store";

export const dynamic = "force-dynamic";

export default async function PrestationsPage() {
  await requireAdminPage();

  const services = await getServices();
  return (
    <>
      <TopBar title="Prestations & tarifs" />
      <ServiceManager services={services} />
    </>
  );
}
