import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { CarSilhouette } from "@/components/CarSilhouette";
import { vehicles, customerName } from "@/lib/demo-data";

const CATEGORY_LABEL: Record<string, string> = {
  citadine: "Citadine",
  berline: "Berline",
  break: "Break",
  suv: "SUV",
  "grand-suv": "Grand SUV",
  utilitaire: "Utilitaire",
  sportive: "Sportive",
  exception: "Exceptionnel",
};

export default function VehiculesPage() {
  return (
    <>
      <TopBar title="Véhicules" cta="Véhicule" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v) => (
          <Card
            key={v.id}
            className="flex items-center gap-4 p-4 transition-colors hover:border-line-gold"
          >
            <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#26262c] to-night">
              <CarSilhouette width={52} />
            </div>
            <div className="min-w-0">
              <div className="font-display text-lg uppercase leading-tight">
                {v.make} {v.model}
              </div>
              <span className="my-1 inline-block rounded border border-line-soft bg-[#111] px-1.5 py-px font-display text-[11px] tracking-wider">
                {v.plate}
              </span>
              <div className="truncate text-[12px] text-ink-muted">
                {CATEGORY_LABEL[v.category]} · {customerName(v.ownerId)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
