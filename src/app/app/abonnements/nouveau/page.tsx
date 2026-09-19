import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import {
  AssignCardForm,
  type ClientOption,
} from "@/components/abonnements/AssignCardForm";
import { requireAdminPage } from "@/lib/admin-auth";
import { getActivePlans } from "@/lib/subscription-store";
import { getAccounts } from "@/lib/auth-store";
import { getCustomers, getVehicles } from "@/lib/crm-store";

export const dynamic = "force-dynamic";

export default async function NouvelleCartePage({
  searchParams,
}: {
  searchParams: Promise<{ compte?: string }>;
}) {
  await requireAdminPage();
  const sp = await searchParams;

  const [plans, accounts, customers, vehicles] = await Promise.all([
    getActivePlans(),
    getAccounts(),
    getCustomers(),
    getVehicles(),
  ]);

  const options: ClientOption[] = [
    ...accounts.map((a) => ({
      key: `acc:${a.id}`,
      accountId: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      plates: a.vehicles.map((v) => v.plate),
      source: "compte" as const,
    })),
    ...customers.map((c) => ({
      key: `cus:${c.id}`,
      customerId: c.id,
      name: `${c.firstName} ${c.lastName}`.trim(),
      email: c.email,
      phone: c.phone,
      plates: vehicles.filter((v) => v.ownerId === c.id).map((v) => v.plate),
      source: "fiche" as const,
    })),
  ].sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return (
    <>
      <TopBar title="Attribuer une carte" />
      <div className="mb-4">
        <Link
          href="/app/abonnements"
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Abonnements
        </Link>
      </div>

      {plans.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-ink-muted">
            Créez d&apos;abord une formule d&apos;abonnement.
          </p>
          <Link
            href="/app/abonnements/plans"
            className="mt-4 inline-block rounded-xl bg-gold-grad px-5 py-2.5 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold"
          >
            Créer une formule
          </Link>
        </Card>
      ) : (
        <AssignCardForm
          plans={plans}
          clients={options}
          preselectAccountId={sp?.compte}
        />
      )}
    </>
  );
}
