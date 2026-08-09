"use server";

import { revalidatePath } from "next/cache";
import { addCheckin, updateCheckin } from "@/lib/checkin-store";
import type { CheckinRecord } from "@/lib/checkin-types";

/** Server Action : enregistre un check-in terminé. */
export async function saveCheckinAction(record: CheckinRecord) {
  await addCheckin(record);
  revalidatePath("/app/checkin/historique");
  return { ok: true };
}

/** Server Action : met à jour un dossier (intervention, contrôle, paiement…). */
export async function updateCheckinAction(
  id: string,
  patch: Partial<CheckinRecord>,
) {
  await updateCheckin(id, patch);
  revalidatePath("/app/checkin/historique");
  revalidatePath(`/app/intervention/${id}`);
  revalidatePath(`/app/checkout/${id}`);
  return { ok: true };
}
