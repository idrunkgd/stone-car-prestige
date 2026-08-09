import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { NewVehicleForm } from "@/components/crm/NewVehicleForm";
import { getCustomers } from "@/lib/crm-store";
import { customers as demoCustomers } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function NewVehiclePage() {
  const stored = await getCustomers();
  const owners = [
    ...stored.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}` })),
    ...demoCustomers.map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}` })),
  ];

  return (
    <>
      <TopBar title="Nouveau véhicule" />
      <div className="mb-4">
        <Link
          href="/app/vehicules"
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Véhicules
        </Link>
      </div>
      <NewVehicleForm customers={owners} />
    </>
  );
}
