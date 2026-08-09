"use server";

import { revalidatePath } from "next/cache";
import { getRequest, updateRequest } from "@/lib/request-store";
import { addCheckin, getCheckins } from "@/lib/checkin-store";
import type { RequestStatus } from "@/lib/request-types";

export async function setStatusAction(id: string, status: RequestStatus) {
  await updateRequest(id, { status });
  revalidatePath("/app/demandes");
  revalidatePath(`/app/demandes/${id}`);
  revalidatePath("/app/planning");
  return { ok: true };
}

export async function setNoteAction(id: string, note: string) {
  await updateRequest(id, { note: note.trim() || undefined });
  revalidatePath(`/app/demandes/${id}`);
  return { ok: true };
}

export async function rescheduleAction(id: string, slotDate: string, slotStart: string) {
  await updateRequest(id, {
    slotDate: slotDate || undefined,
    slotStart: slotStart || undefined,
  });
  revalidatePath("/app/demandes");
  revalidatePath(`/app/demandes/${id}`);
  revalidatePath("/app/planning");
  return { ok: true };
}

/** Acompte payé → valide la demande et crée l'intervention (check-in possible). */
export async function convertToInterventionAction(id: string) {
  const r = await getRequest(id);
  if (!r) return { error: "Demande introuvable." };
  if (r.interventionId) return { ok: true, interventionId: r.interventionId };

  const count = (await getCheckins()).length;
  const ref = `WO-2026-${String(count + 1).padStart(6, "0")}`;
  const interventionId = crypto.randomUUID();
  const total = (r.servicesList ?? []).reduce((s, x) => s + x.price, 0);

  await addCheckin({
    id: interventionId,
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

  await updateRequest(id, { status: "validee", interventionId });

  revalidatePath("/app/demandes");
  revalidatePath(`/app/demandes/${id}`);
  revalidatePath("/app/checkin");
  return { ok: true, interventionId };
}
