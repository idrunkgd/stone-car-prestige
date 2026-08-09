import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { InterventionMode } from "@/components/intervention/InterventionMode";
import { getCheckin } from "@/lib/checkin-store";

export const dynamic = "force-dynamic";

export default async function InterventionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getCheckin(id);
  if (!record) notFound();

  return (
    <>
      <TopBar title="Mode intervention" />
      <div className="mb-4">
        <Link
          href="/app/checkin/historique"
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Historique
        </Link>
      </div>
      <InterventionMode record={record} />
    </>
  );
}
