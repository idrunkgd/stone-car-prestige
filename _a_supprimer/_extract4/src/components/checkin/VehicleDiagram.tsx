"use client";

import { ZONES, type Damage } from "@/lib/inspection";
import { cn } from "@/lib/utils";

/** Schéma véhicule vue de dessus — on tape une zone pour signaler un dommage. */
export function VehicleDiagram({
  damages,
  activeZone,
  onZoneClick,
}: {
  damages: Damage[];
  activeZone: string | null;
  onZoneClick: (zoneId: string, label: string) => void;
}) {
  function count(zoneId: string) {
    return damages.filter((d) => d.zoneId === zoneId).length;
  }

  return (
    <div className="relative mx-auto aspect-[2/3.4] w-full max-w-[280px] rounded-2xl border border-line-soft bg-gradient-to-b from-night-panel to-night p-2">
      {/* Carrosserie schématique */}
      <div className="absolute inset-x-[16%] inset-y-[3%] rounded-[40px] border-2 border-line-soft bg-night-panel2/60" />
      {ZONES.map((z) => {
        const n = count(z.id);
        const active = activeZone === z.id;
        return (
          <button
            key={z.id}
            type="button"
            title={z.label}
            onClick={() => onZoneClick(z.id, z.label)}
            style={z.pos}
            className={cn(
              "absolute flex items-center justify-center border text-[9px] transition-colors",
              z.round ? "rounded-full" : "rounded-md",
              active
                ? "border-gold bg-gold/25"
                : n > 0
                  ? "border-state-red bg-state-red/25"
                  : "border-line-soft bg-white/[0.02] hover:border-line-gold hover:bg-gold/10",
            )}
          >
            {n > 0 && (
              <span className="font-display text-[11px] font-bold text-ink">
                {n}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
