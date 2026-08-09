"use server";

import { revalidatePath } from "next/cache";
import { setRequestStatus } from "@/lib/request-store";

export async function markHandledAction(formData: FormData) {
  const id = String(formData.get("id"));
  await setRequestStatus(id, "traite");
  revalidatePath("/app/demandes");
}
