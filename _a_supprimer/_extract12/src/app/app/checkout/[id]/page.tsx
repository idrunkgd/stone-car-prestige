import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { getCheckin } from "@/lib/checkin-store";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getCheckin(id);
  if (!record) notFound();

  return (
    <>
      <TopBar title="Check-out" />
      <div className="mb-4">
        <Link
          href={`/app/intervention/${id}`}
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Intervention
        </Link>
      </div>
      <CheckoutFlow record={record} />
    </>
  );
}
