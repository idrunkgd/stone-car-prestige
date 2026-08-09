import { TopBar } from "@/components/layout/TopBar";
import { PlanningExplorer, type PlanEvent } from "@/components/planning/PlanningExplorer";
import { getRequests } from "@/lib/request-store";

export const dynamic = "force-dynamic";

export default async function PlanningPage() {
  const events: PlanEvent[] = (await getRequests())
    .filter((r) => r.slotDate && r.slotStart)
    .map((r) => ({
      id: r.id,
      date: r.slotDate!,
      start: r.slotStart!,
      durationMin: r.durationMin ?? 60,
      title: r.vehicleTitle ?? r.vehicle ?? r.name,
      plate: r.plate ?? "",
      service: r.service,
      status: r.status,
    }));

  return (
    <>
      <TopBar title="Planning" />
      <p className="mb-4 text-sm text-ink-muted">
        Vue année → cliquez un mois → un jour pour voir le détail des rendez-vous.
      </p>
      <PlanningExplorer events={events} />
    </>
  );
}
