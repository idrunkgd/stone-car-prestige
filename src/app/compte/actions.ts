"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAccount,
  getAccountByEmail,
  getCurrentAccount,
  verifyPassword,
  setSession,
  clearSession,
  addVehicle,
} from "@/lib/auth-store";
import { addRequest, getRequest, updateRequest } from "@/lib/request-store";
import { getQuote, updateQuote } from "@/lib/quote-store";
import { createInterventionFromRequest } from "@/lib/checkin-store";
import { getCardViewsForAccount } from "@/lib/subscription-store";
import type { VehicleCategory } from "@/lib/demo-data";
import type { SizeTier } from "@/lib/pricing";

export async function registerAction(input: {
  email: string;
  name: string;
  phone: string;
  password: string;
}) {
  if (!input.email || !input.name || !input.password) {
    return { error: "Merci de remplir tous les champs." };
  }
  if (await getAccountByEmail(input.email)) {
    return { error: "Un compte existe déjà avec cet email." };
  }
  const acc = await createAccount(input);
  await setSession(acc);
  redirect("/compte");
}

export async function loginAction(input: { email: string; password: string }) {
  const acc = await getAccountByEmail(input.email);
  if (!acc || !verifyPassword(acc, input.password)) {
    return { error: "Email ou mot de passe incorrect." };
  }
  await setSession(acc);
  redirect("/compte");
}

export async function logoutAction() {
  await clearSession();
  redirect("/compte");
}

export async function addVehicleAction(input: {
  make: string;
  model: string;
  plate: string;
  category: VehicleCategory;
}) {
  const acc = await getCurrentAccount();
  if (!acc) return { error: "Non connecté." };
  await addVehicle(acc.id, {
    make: input.make.trim(),
    model: input.model.trim(),
    plate: input.plate.trim().toUpperCase(),
    category: input.category,
  });
  revalidatePath("/compte");
  return { ok: true };
}

export async function submitDemandeAction(input: {
  vehicleTitle: string;
  plate: string;
  size: SizeTier;
  services: { name: string; price: number; duration: number }[];
  priceEstimate: number;
  durationMin: number;
  slotDate?: string;
  slotStart?: string;
  message?: string;
  /** Carte que le client souhaite utiliser (vérifiée côté serveur). */
  subscriptionCardId?: string;
}) {
  const acc = await getCurrentAccount();
  if (!acc) return { error: "Non connecté." };

  // La carte n'est retenue que si elle appartient bien au client et qu'elle
  // est utilisable. Aucun lavage n'est décompté ici : la consommation est
  // toujours validée par un employé au moment de la prestation.
  let subscriptionCardId: string | undefined;
  if (input.subscriptionCardId) {
    const mine = await getCardViewsForAccount(acc.id);
    const chosen = mine.find((v) => v.card.id === input.subscriptionCardId);
    if (chosen?.usable) subscriptionCardId = chosen.card.id;
  }

  await addRequest({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "nouveau",
    name: acc.name,
    phone: acc.phone,
    email: acc.email,
    accountId: acc.id,
    vehicle: `${input.vehicleTitle} (${input.plate})`,
    vehicleTitle: input.vehicleTitle,
    plate: input.plate,
    size: input.size,
    servicesList: input.services,
    service: input.services.map((s) => s.name).join(", "),
    priceEstimate: input.priceEstimate,
    durationMin: input.durationMin,
    slotDate: input.slotDate,
    slotStart: input.slotStart,
    atHome: false,
    message: input.message?.trim() || undefined,
    subscriptionCardId,
  });

  revalidatePath("/app/demandes");
  redirect("/compte?envoye=1");
}

/** Le client accepte le devis officiel et paie l'acompte → crée l'intervention. */
export async function acceptQuoteAction(quoteId: string) {
  const acc = await getCurrentAccount();
  if (!acc) return { error: "Non connecté." };
  const q = await getQuote(quoteId);
  if (!q || q.accountId !== acc.id) return { error: "Devis introuvable." };

  await updateQuote(quoteId, { status: "accepte", acomptePaid: true });

  if (q.requestId) {
    const r = await getRequest(q.requestId);
    if (r && !r.interventionId) {
      const interventionId = await createInterventionFromRequest(r);
      await updateRequest(r.id, { status: "accepte", interventionId });
    }
  }

  revalidatePath("/compte");
  revalidatePath("/app/demandes");
  revalidatePath("/app/checkin");
  redirect("/compte?accepte=1");
}
