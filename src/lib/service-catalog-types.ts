import type { SizeTier } from "./pricing";

/** Prix + durée pour une taille de véhicule. */
export type ServiceTier = { price: number; duration: number }; // duration en minutes

export type ManagedService = {
  id: string;
  name: string;
  active: boolean;
  order: number;
  tiers: Record<SizeTier, ServiceTier>;
  /** Description courte affichée sur le site (optionnel). */
  description?: string;
  /** Prestation vendue seule, en dehors des formules (ex. céramique). */
  horsFormule?: boolean;
};
