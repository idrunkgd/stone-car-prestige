import { CarSilhouette } from "@/components/CarSilhouette";
import { StatusPill } from "@/components/ui/StatusPill";
import type { OperationalStatus } from "@/lib/status";

export function AppointmentRow({
  time,
  title,
  plate,
  service,
  status,
}: {
  time: string;
  title: string;
  plate: string;
  service: string;
  status: OperationalStatus;
}) {
  return (
    <button className="flex w-full items-center gap-3.5 rounded-xl border border-line-soft bg-night-panel px-4 py-3.5 text-left transition-colors hover:border-line-gold">
      <div className="w-[52px] shrink-0 font-display text-[17px]">{time}</div>
      <div className="flex w-[46px] shrink-0 items-center justify-center">
        <CarSilhouette width={46} />
      </div>
      <div className="min-w-0 flex-1">
        <b className="block text-[15px]">{title}</b>
        <span className="mr-2 rounded border border-line-soft bg-[#111] px-1.5 py-px font-display text-[11px] tracking-wider">
          {plate}
        </span>
        <span className="text-[12.5px] text-ink-muted">{service}</span>
      </div>
      <StatusPill status={status} />
    </button>
  );
}
