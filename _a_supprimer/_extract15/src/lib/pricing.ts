import type { VehicleCategory } from "./demo-data";

/**
 * Tarification par taille de véhicule (section 10 du brief).
 * 3 tailles, déduites automatiquement du type de véhicule.
 */
export type SizeTier = "petite" | "moyenne" | "grande";

export const SIZE_LABEL: Record<SizeTier, string> = {
  petite: "Petite",
  moyenne: "Moyenne",
  grande: "Grande",
};

/** Mapping type de véhicule → taille tarifaire (ajustable). */
export const CATEGORY_TO_SIZE: Record<VehicleCategory, SizeTier> = {
  citadine: "petite",
  berline: "moyenne",
  break: "moyenne",
  sportive: "moyenne",
  suv: "grande",
  "grand-suv": "grande",
  utilitaire: "grande",
  exception: "grande",
};

export function sizeForCategory(cat: VehicleCategory): SizeTier {
  return CATEGORY_TO_SIZE[cat] ?? "moyenne";
}

/** Taux de TVA par défaut (Belgique). */
export const VAT_RATE = 21;

/** Durée lisible à partir de minutes (ex : 95 → "1 h 35"). */
export function humanMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}
