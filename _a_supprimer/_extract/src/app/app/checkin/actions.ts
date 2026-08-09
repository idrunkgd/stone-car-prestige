"use server";

import { revalidatePath } from "next/cache";
import { addCheckin } from "@/lib/checkin-store";
import type { CheckinRecord } from "@/lib/checkin-types";

/** Server Action : enregistre un check-in terminé. */
export async function saveCheckinAction(record: CheckinRecord) {
  await addCheckin(record);
  revalidatePath("/app/checkin/historique");
  return { ok: true };
}
