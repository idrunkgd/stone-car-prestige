import "server-only";
import type { CheckinRecord } from "./checkin-types";
import type { BookingRequest } from "./request-types";
import { listDocs, getDoc, putDoc, patchDoc, countDocs } from "./db";

/**
 * Persistance des check-ins / interventions dans PostgreSQL
 * (collection "checkins" de la table documents).
 */
const COL = "checkins";

export async function getCheckins(): Promise<CheckinRecord[]> {
  return listDocs<CheckinRecord>(COL);
}

export async function getCheckin(id: string): Promise<CheckinRecord | null> {
  return getDoc<CheckinRecord>(COL, id);
}

export async function addCheckin(record: CheckinRecord): Promise<void> {
  await putDoc(COL, record.id, record);
}

/** Crée une intervention (dossier) à partir d'une demande acceptée. */
export async function createInterventionFromRequest(r: BookingRequest): Promise<string> {
  const count = await countDocs(COL);
  const ref = `WO-2026-${String(count + 1).padStart(6, "0")}`;
  const id = crypto.randomUUID();
  const total = (r.servicesList ?? []).reduce((s, x) => s + x.price, 0);
  await addCheckin({
    id,
    ref,
    createdAt: new Date().toISOString(),
    vehicleTitle: r.vehicleTitle ?? r.vehicle ?? "",
    plate: r.plate ?? "",
    customer: r.name,
    service: r.service,
    mileage: "",
    damages: [],
    options: [],
    photos: [],
    signature: null,
    total,
    status: "PLANIFIE",
    checkinDone: false,
    sourceRequestId: r.id,
    slotDate: r.slotDate,
    slotStart: r.slotStart,
  });
  return id;
}

/** Met à jour un dossier existant (merge partiel). */
export async function updateCheckin(
  id: string,
  patch: Partial<CheckinRecord>,
): Promise<CheckinRecord | null> {
  return patchDoc<CheckinRecord>(COL, id, patch);
}
