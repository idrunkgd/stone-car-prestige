"use server";

import { revalidatePath } from "next/cache";
import { addFormule, updateFormule, deleteFormule } from "@/lib/formule-store";
import type { Formule } from "@/lib/formule-types";

export async function createFormuleAction(name: string) {
  await addFormule(name?.trim() || "Nouvelle formule");
  revalidatePath("/app/formules");
  revalidatePath("/");
  return { ok: true };
}

export async function updateFormuleAction(id: string, patch: Partial<Formule>) {
  await updateFormule(id, patch);
  revalidatePath("/app/formules");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteFormuleAction(id: string) {
  await deleteFormule(id);
  revalidatePath("/app/formules");
  revalidatePath("/");
  return { ok: true };
}
