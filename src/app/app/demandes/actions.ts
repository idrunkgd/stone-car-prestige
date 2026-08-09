"use server";

import { revalidatePath } from "next/cache";
import { getRequest, updateRequest } from "@/lib/request-store";
import { addQuote, getQuotes } from "@/lib/quote-store";
import { VAT_RATE } from "@/lib/pricing";

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

export async function refuseRequestAction(id: string) {
  await updateRequest(id, { status: "refuse" });
  revalidatePath("/app/demandes");
  revalidatePath(`/app/demandes/${id}`);
  return { ok: true };
}

/** Envoie un devis officiel au client (visible et à accepter dans son compte). */
export async function sendOfficialQuoteAction(requestId: string, acompte: number) {
  const r = await getRequest(requestId);
  if (!r) return { error: "Demande introuvable." };

  const items = (r.servicesList ?? []).map((s) => ({ label: s.name, price: s.price }));
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const vat = Math.round(subtotal * (VAT_RATE / 100) * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;

  const count = (await getQuotes()).length;
  const ref = `DEV-2026-${String(count + 1).padStart(4, "0")}`;
  const id = crypto.randomUUID();

  await addQuote({
    id,
    ref,
    createdAt: new Date().toISOString(),
    customer: r.name,
    vehicleTitle: r.vehicleTitle ?? r.vehicle ?? "",
    plate: r.plate ?? "",
    size: r.size ?? "moyenne",
    items,
    discount: 0,
    subtotal,
    taxable: subtotal,
    vat,
    total,
    vatRate: VAT_RATE,
    accountId: r.accountId,
    requestId: r.id,
    status: "envoye",
    acompte: Math.max(0, Math.round(acompte)),
    acomptePaid: false,
    slotDate: r.slotDate,
    slotStart: r.slotStart,
    durationMin: r.durationMin,
  });

  await updateRequest(requestId, { status: "devis_envoye", devisId: id });

  revalidatePath("/app/demandes");
  revalidatePath(`/app/demandes/${requestId}`);
  return { ok: true, devisId: id };
}
