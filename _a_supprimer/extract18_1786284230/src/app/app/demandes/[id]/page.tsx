import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { DemandeDetail } from "@/components/demandes/DemandeDetail";
import { getRequest, getRequests } from "@/lib/request-store";
import { getSettings } from "@/lib/settings-store";
import type { Booked } from "@/lib/availability";

export const dynamic = "force-dynamic";

export default async function DemandePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getRequest(id);
  if (!request) notFound();

  const settings = await getSettings();
  const booked: Booked[] = (await getRequests())
    .filter((r) => r.id !== id && r.slotDate && r.slotStart && r.durationMin && r.status !== "refuse")
    .map((r) => ({ date: r.slotDate!, start: r.slotStart!, duration: r.durationMin! }));

  return (
    <>
      <TopBar title="Demande" />
      <div className="mb-4">
        <Link href="/app/demandes" className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
          <ChevronLeft size={16} /> Demandes
        </Link>
      </div>
      <DemandeDetail request={request} booked={booked} opening={settings.openingHours} />
    </>
  );
}
