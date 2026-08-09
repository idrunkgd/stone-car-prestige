import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { PRICED_SERVICES, SIZE_LABEL, CATEGORY_TO_SIZE } from "@/lib/pricing";
import { eur } from "@/lib/utils";

const CAT_LABEL: Record<string, string> = {
  citadine: "Citadine",
  berline: "Berline",
  break: "Break",
  suv: "SUV",
  "grand-suv": "Grand SUV",
  utilitaire: "Utilitaire",
  sportive: "Sportive",
  exception: "Exceptionnel",
};

export default function PrestationsPage() {
  const bySize: Record<string, string[]> = { petite: [], moyenne: [], grande: [] };
  for (const [cat, size] of Object.entries(CATEGORY_TO_SIZE)) {
    bySize[size].push(CAT_LABEL[cat] ?? cat);
  }

  return (
    <>
      <TopBar title="Prestations & tarifs" />

      {/* Rappel du mapping tailles */}
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {(["petite", "moyenne", "grande"] as const).map((s) => (
          <Card key={s} className="p-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-gold-grad px-2.5 py-1 font-display text-[10px] uppercase tracking-wider text-[#1a1400]">
                {SIZE_LABEL[s]}
              </span>
            </div>
            <div className="text-[12px] text-ink-muted">{bySize[s].join(", ")}</div>
          </Card>
        ))}
      </div>

      {/* Grille de prix par taille */}
      <Card className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line-gold text-left font-display text-xs uppercase tracking-wider text-gold-2">
              <th className="py-2.5 pr-4">Prestation</th>
              <th className="py-2.5 px-3 text-right">Petite</th>
              <th className="py-2.5 px-3 text-right">Moyenne</th>
              <th className="py-2.5 pl-3 text-right">Grande</th>
            </tr>
          </thead>
          <tbody>
            {PRICED_SERVICES.map((s) => (
              <tr key={s.id} className="border-b border-line-soft">
                <td className="py-2.5 pr-4">{s.name}</td>
                <td className="py-2.5 px-3 text-right text-ink-muted">{eur(s.prices.petite)}</td>
                <td className="py-2.5 px-3 text-right text-ink-muted">{eur(s.prices.moyenne)}</td>
                <td className="py-2.5 pl-3 text-right font-display text-gold-1">{eur(s.prices.grande)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="mt-3 text-[11px] text-ink-faint">
        Ces tarifs alimentent automatiquement les devis selon la taille du véhicule sélectionné.
      </p>
    </>
  );
}
