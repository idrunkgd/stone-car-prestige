import type { SizeTier } from "./pricing";

export type RequestStatus =
  | "nouveau"
  | "reflexion"
  | "acompte"
  | "validee"
  | "planifie"
  | "refuse"
  | "traite";

/** Demande de réservation / devis (site public ou espace client). */
export type BookingRequest = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  vehicle?: string;
  service: string;
  preferredDate?: string;
  atHome: boolean;
  message?: string;
  status: RequestStatus;

  // ── Demande enrichie depuis l'espace client ──
  accountId?: string;
  vehicleTitle?: string;
  plate?: string;
  size?: SizeTier;
  servicesList?: { name: string; price: number; duration: number }[];
  priceEstimate?: number;
  durationMin?: number;
  slotDate?: string;
  slotStart?: string;
};
