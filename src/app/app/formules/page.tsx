import { TopBar } from "@/components/layout/TopBar";
import { FormuleManager } from "@/components/formules/FormuleManager";
import { getFormules } from "@/lib/formule-store";
import { getServices } from "@/lib/service-catalog-store";

export const dynamic = "force-dynamic";

export default async function FormulesPage() {
  const [formules, services] = await Promise.all([getFormules(), getServices()]);
  return (
    <>
      <TopBar title="Formules" />
      <FormuleManager formules={formules} services={services} />
    </>
  );
}
