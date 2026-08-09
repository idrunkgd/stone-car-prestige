import { CarSilhouette } from "@/components/CarSilhouette";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { eur } from "@/lib/utils";
import { NEXT_ACTION, type OperationalStatus } from "@/lib/status";

/**
 * Carte véhicule contextuelle (section 78 du brief) :
 * on ne montre pas un tableau, mais une belle carte avec la
 * « prochaine action logique » mise en avant.
 */
export function VehicleCard({
  title,
  plate,
  customer,
  service,
  status,
  price,
  subtitle,
}: {
  title: string;
  plate: string;
  customer: string;
  service: string;
  status: OperationalStatus;
  price: number;
  subtitle?: string;
}) {
  const action = NEXT_ACTION[status];
  return (
    <div className="overflow-hidden rounded-xl border border-line-gold bg-night-panel shadow-premium">
      <div className="flex">
        <div className="flex w-[130px] items-center justify-center bg-gradient-to-br from-[#26262c] to-night">
          <CarSilhouette width={88} />
        </div>
        <div className="flex-1 p-4">
          <h4 className="font-display text-lg uppercase">{title}</h4>
          <span className="my-2 inline-block rounded border border-line-soft bg-[#111] px-2 py-0.5 font-display text-xs tracking-widest">
            {plate}
          </span>
          <div className="text-[13px] text-ink-muted">
            {customer} · {service}
          </div>
          {subtitle && (
            <div className="mt-0.5 text-xs text-ink-faint">{subtitle}</div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <StatusPill status={status} />
            <span className="font-display text-lg text-gold-1">{eur(price)}</span>
          </div>
          {action && (
            <Button fullWidth className="mt-3">
              {action} →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
