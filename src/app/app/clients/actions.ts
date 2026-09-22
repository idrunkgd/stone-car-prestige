"use server";

import { revalidatePath } from "next/cache";
import { addCustomer } from "@/lib/crm-store";
import { validateVat } from "@/lib/vat";

export async function createCustomerAction(input: {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  company?: string;
  vatNumber?: string;
}) {
  let vatNumber: string | undefined;
  if (input.vatNumber?.trim()) {
    const v = validateVat(input.vatNumber);
    if (!v.ok) return { error: v.error ?? "Numéro de TVA invalide." };
    vatNumber = v.value;
  }
  const id = crypto.randomUUID();
  await addCustomer({
    id,
    ...input,
    vatNumber,
    createdAt: new Date().toISOString(),
  });
  revalidatePath("/app/clients");
  return { ok: true, id };
}
