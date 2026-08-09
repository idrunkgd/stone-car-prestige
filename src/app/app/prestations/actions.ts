"use server";

import { revalidatePath } from "next/cache";
import { addService, updateService, deleteService } from "@/lib/service-catalog-store";
import type { ManagedService } from "@/lib/service-catalog-types";

export async function createServiceAction(name: string) {
  await addService(name?.trim() || "Nouvelle prestation");
  revalidatePath("/app/prestations");
  return { ok: true };
}

export async function updateServiceAction(id: string, patch: Partial<ManagedService>) {
  await updateService(id, patch);
  revalidatePath("/app/prestations");
  revalidatePath("/app/ventes/nouveau");
  return { ok: true };
}

export async function deleteServiceAction(id: string) {
  await deleteService(id);
  revalidatePath("/app/prestations");
  return { ok: true };
}
