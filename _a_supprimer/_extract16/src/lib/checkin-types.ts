import type { Damage } from "./inspection";

/** Statut du dossier (ordre de travail / intervention). */
export type WorkStatus =
  | "PLANIFIE" // intervention créée (acompte payé), check-in pas encore fait
  | "RECU"
  | "EN_COURS"
  | "TERMINE"
  | "PRET"
  | "LIVRE";

export type Task = { label: string; done: boolean };
export type ExtraWork = { id: string; label: string; price: number };
export type PaymentInfo = { method: string; amount: number; paidAt: string };

/** Enregistrement d'un dossier véhicule (persisté). Partagé client/serveur. */
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
  photos: string[]; // data URLs (check-in)
  signature: string | null; // data URL
  total: number;

  // ── Cycle de vie (intervention → check-out) ──
  status?: WorkStatus;
  checklist?: Task[];
  extraWork?: ExtraWork[];
  startedAt?: string | null;
  workedSeconds?: number;
  finishedAt?: string | null;
  quality?: Task[];
  afterPhotos?: string[];
  payment?: PaymentInfo | null;
  deliveredAt?: string | null;

  // ── Lien avec la demande d'origine + suivi du check-in ──
  sourceRequestId?: string;
  checkinDone?: boolean;
  slotDate?: string;
  slotStart?: string;
};
