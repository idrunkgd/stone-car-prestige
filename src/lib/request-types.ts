import type { SizeTier } from "./pricing";

export type RequestStatus =
  | "nouveau" // demande reçue, à confirmer (appel)
  | "devis_envoye" // devis officiel envoyé, en attente d'acceptation + acompte
  | "accepte" // accepté + acompte payé → intervention créée
  | "refuse";

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

  /** Remarque interne ajoutée par l'atelier (appel client…). */
  note?: string;
  /** Devis officiel envoyé au client (à accepter dans son compte). */
  devisId?: string;
  /** Intervention créée quand le client accepte + paie l'acompte. */
  interventionId?: string;
};
