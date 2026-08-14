"use server";

import { revalidatePath } from "next/cache";
import {
  addRealisation,
  updateRealisation,
  deleteRealisation,
  addPhotoSet,
  deletePhotoSet,
} from "@/lib/realisation-store";
import type { Realisation } from "@/lib/realisation-types";

function revalidate() {
  revalidatePath("/app/galerie");
  revalidatePath("/realisations");
  revalidatePath("/");
}

export async function createRealisationAction(input: {
  title: string;
  vehicle?: string;
  description?: string;
  tag?: string;
}) {
  const r = await addRealisation(input);
  revalidate();
  return { ok: true, id: r.id };
}

export async function updateRealisationAction(
  id: string,
  patch: Partial<Omit<Realisation, "id" | "sets">>,
) {
  await updateRealisation(id, patch);
  revalidate();
  return { ok: true };
}

export async function deleteRealisationAction(id: string) {
  await deleteRealisation(id);
  revalidate();
  return { ok: true };
}

export async function addPhotoSetAction(
  id: string,
  set: { label?: string; before: string; after: string },
) {
  await addPhotoSet(id, set);
  revalidate();
  return { ok: true };
}

export async function deletePhotoSetAction(id: string, setId: string) {
  await deletePhotoSet(id, setId);
  revalidate();
  return { ok: true };
}
