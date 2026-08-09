"use server";

import { revalidatePath } from "next/cache";
import { addCustomer } from "@/lib/crm-store";

export async function createCustomerAction(input: {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  company?: string;
}) {
  const id = crypto.randomUUID();
  await addCustomer({ id, ...input, createdAt: new Date().toISOString() });
  revalidatePath("/app/clients");
  return { ok: true, id };
}
