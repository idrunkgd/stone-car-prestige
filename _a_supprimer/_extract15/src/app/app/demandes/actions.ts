"use server";

import { revalidatePath } from "next/cache";
import { updateRequest } from "@/lib/request-store";
import type { RequestStatus } from "@/lib/request-types";

export async function setStatusAction(id: string, status: RequestStatus) {
  await updateRequest(id, { status });
  revalidatePath("/app/demandes");
  revalidatePath(`/app/demandes/${id}`);
  revalidatePath("/app/planning");
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
