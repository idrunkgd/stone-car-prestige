import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { CheckinFlow } from "@/components/checkin/CheckinFlow";
import { getCheckin } from "@/lib/checkin-store";

export const dynamic = "force-dynamic";

export default async function CheckinInterventionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rec = await getCheckin(id);
  if (!rec) notFound();
  // Déjà réceptionné → aller au dossier d'intervention.
  if (rec.checkinDone) redirect(`/app/intervention/${id}`);

  return (
    <>
      <TopBar title="Check-in" />
      <div className="mb-4">
        <Link href="/app/checkin" className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
          <ChevronLeft size={16} /> Interventions à réceptionner
        </Link>
      </div>
      <CheckinFlow
        record={{
          id: rec.id,
          ref: rec.ref,
          vehicleTitle: rec.vehicleTitle,
          plate: rec.plate,
          customer: rec.customer,
          service: rec.service,
          total: rec.total,
        }}
      />
    </>
  );
}
