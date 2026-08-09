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

export type PricedService = {
  id: string;
  name: string;
  prices: Record<SizeTier, number>;
};

/** Catalogue de prestations avec prix par taille (modifiable). */
export const PRICED_SERVICES: PricedService[] = [
  { id: "ext", name: "Lavage extérieur", prices: { petite: 25, moyenne: 35, grande: 45 } },
  { id: "int", name: "Lavage intérieur", prices: { petite: 45, moyenne: 55, grande: 70 } },
  { id: "premium", name: "Lavage Premium", prices: { petite: 70, moyenne: 90, grande: 120 } },
  { id: "complet", name: "Nettoyage complet", prices: { petite: 110, moyenne: 140, grande: 180 } },
  { id: "moteur", name: "Nettoyage moteur", prices: { petite: 50, moyenne: 60, grande: 70 } },
  { id: "jantes", name: "Traitement jantes", prices: { petite: 20, moyenne: 25, grande: 30 } },
  { id: "polissage", name: "Polissage 1 étape", prices: { petite: 180, moyenne: 230, grande: 290 } },
  { id: "ceramique", name: "Protection céramique", prices: { petite: 350, moyenne: 450, grande: 600 } },
];

/** Taux de TVA par défaut (Belgique). */
export const VAT_RATE = 21;
