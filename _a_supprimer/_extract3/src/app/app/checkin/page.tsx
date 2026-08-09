import Link from "next/link";
import { History } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { CheckinFlow, type Arrival } from "@/components/checkin/CheckinFlow";
import {
  todaysAppointments,
  getVehicle,
  customerName,
} from "@/lib/demo-data";

/** Statuts pour lesquels un check-in est encore à faire. */
const ARRIVABLE = ["PREVU", "CONFIRME", "CLIENT_ARRIVE", "RECU"];

export default function CheckinPage() {
  const arrivals: Arrival[] = todaysAppointments
    .filter((a) => ARRIVABLE.includes(a.status))
    .map((a) => {
      const v = getVehicle(a.vehicleId)!;
      return {
        id: a.id,
        time: a.time,
        title: `${v.make} ${v.model}`,
        plate: v.plate,
        customer: customerName(a.customerId),
        service: a.service,
        price: a.priceEstimate,
      };
    });

  return (
    <>
      <TopBar title="Check-in" />
      <div className="mb-4 flex justify-end">
        <Link
          href="/app/checkin/historique"
          className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-gold-1"
        >
          <History size={16} /> Historique des check-ins
        </Link>
      </div>
      <CheckinFlow arrivals={arrivals} />
    </>
  );
}
