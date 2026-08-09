"use server";

import { revalidatePath } from "next/cache";
import { addRequest } from "@/lib/request-store";

export async function createRequestAction(input: {
  name: string;
  phone: string;
  email?: string;
  vehicle?: string;
  service: string;
  preferredDate?: string;
  atHome: boolean;
  message?: string;
}) {
  const id = crypto.randomUUID();
  await addRequest({
    id,
    createdAt: new Date().toISOString(),
    status: "nouveau",
    ...input,
  });
  revalidatePath("/app/demandes");
  return { ok: true };
}
