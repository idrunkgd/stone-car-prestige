import type { Damage } from "./inspection";

/** Enregistrement d'un check-in (persisté). Partagé client/serveur. */
export type CheckinRecord = {
  id: string;
  ref: string; // WO-2026-xxxxxx
  createdAt: string; // ISO
  vehicleTitle: string;
  plate: string;
  customer: string;
  service: string;
  mileage: string;
  damages: Damage[];
  options: { label: string; price: number }[];
  photos: string[]; // data URLs
  signature: string | null; // data URL
  total: number;
};
