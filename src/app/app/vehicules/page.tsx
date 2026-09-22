import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { CarSilhouette } from "@/components/CarSilhouette";
import { getVehicles } from "@/lib/crm-store";
import { getAccounts } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Véhicules — vue unifiée.
 *
 * Regroupe les véhicules créés au back-office (collection `vehicles`) et ceux
 * ajoutés par les clients depuis leur espace personnel (stockés dans leur
 * compte). Le doublon éventuel — même plaque des deux côtés — n'apparaît
 * qu'une fois.
 */

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

type Row = {
  id: string;
  make: string;
  model: string;
  plate: string;
  category: string;
  owner: string;
  source: "compte" | "fiche";
};

const plateKey = (p: string) => p.replace(/[^A-Z0-9]/gi, "").toUpperCase();

export default async function VehiculesPage() {
  const [stored, accounts] = await Promise.all([getVehicles(), getAccounts()]);

  const byPlate = new Map<string, Row>();

  for (const v of stored) {
    byPlate.set(plateKey(v.plate), {
      id: v.id,
      make: v.make,
      model: v.model,
      plate: v.plate,
      category: v.category,
      owner: v.ownerName,
      source: "fiche",
    });
  }

  for (const a of accounts) {
    for (const v of a.vehicles) {
      const k = plateKey(v.plate);
      if (byPlate.has(k)) continue; // déjà connu côté back-office
      byPlate.set(k, {
        id: v.id,
        make: v.make,
        model: v.model,
        plate: v.plate,
        category: v.category,
        owner: a.name,
        source: "compte",
      });
    }
  }

  const rows = [...byPlate.values()].sort((a, b) =>
    a.owner.localeCompare(b.owner, "fr"),
  );

  return (
    <>
      <TopBar title="Véhicules" cta="Véhicule" ctaHref="/app/vehicules/nouveau" />

      {rows.length === 0 ? (
        <Card className="py-12 text-center text-sm text-ink-muted">
          Aucun véhicule pour l&apos;instant. Ceux ajoutés par les clients
          depuis leur espace apparaîtront ici automatiquement.
        </Card>
      ) : (
        <>
          <p className="mb-3 text-[12px] text-ink-faint">
            {rows.length} véhicule{rows.length > 1 ? "s" : ""}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((v) => (
              <Card
                key={v.id}
                className="flex items-center gap-4 p-4 transition-colors hover:border-line-gold"
              >
                <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#26262c] to-night">
                  <CarSilhouette width={52} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg uppercase leading-tight">
                    {v.make} {v.model}
                  </div>
                  <span className="my-1 inline-block rounded border border-line-soft bg-[#111] px-1.5 py-px font-display text-[11px] tracking-wider">
                    {v.plate}
                  </span>
                  <div className="truncate text-[12px] text-ink-muted">
                    {CATEGORY_LABEL[v.category] ?? v.category} · {v.owner}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 self-start rounded-full px-2 py-0.5 font-display text-[9.5px] uppercase tracking-wider",
                    v.source === "compte"
                      ? "border border-line-gold bg-gold/[0.08] text-gold-1"
                      : "border border-line-soft text-ink-muted",
                  )}
                >
                  {v.source === "compte" ? "Compte" : "Fiche"}
                </span>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
