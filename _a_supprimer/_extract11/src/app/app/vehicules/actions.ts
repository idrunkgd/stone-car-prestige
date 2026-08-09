"use server";

import { revalidatePath } from "next/cache";
import { addVehicle } from "@/lib/crm-store";
import type { VehicleCategory } from "@/lib/demo-data";

export async function createVehicleAction(input: {
  make: string;
  model: string;
  plate: string;
  category: VehicleCategory;
  color?: string;
  ownerId: string;
  ownerName: string;
}) {
  const id = crypto.randomUUID();
  await addVehicle({ id, ...input, createdAt: new Date().toISOString() });
  revalidatePath("/app/vehicules");
  return { ok: true, id };
}
