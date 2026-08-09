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
import { addRequest } from "@/lib/request-store";
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
}) {
  const acc = await getCurrentAccount();
  if (!acc) return { error: "Non connecté." };

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
  });

  revalidatePath("/app/demandes");
  redirect("/compte?envoye=1");
}
