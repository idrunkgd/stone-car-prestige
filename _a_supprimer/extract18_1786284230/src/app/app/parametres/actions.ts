"use server";

import { revalidatePath } from "next/cache";
import { saveSettings } from "@/lib/settings-store";
import type { BusinessSettings } from "@/lib/settings-types";

export async function saveSettingsAction(s: BusinessSettings) {
  await saveSettings(s);
  revalidatePath("/app/parametres");
  return { ok: true };
}
