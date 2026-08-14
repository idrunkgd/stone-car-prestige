import "server-only";
import type { Realisation, PhotoSet } from "./realisation-types";
import { listDocs, getDoc, putDoc, deleteDoc } from "./db";

const COL = "realisations";

/** Toutes les réalisations, plus récentes / mises en avant d'abord. */
export async function getRealisations(): Promise<Realisation[]> {
  const list = await listDocs<Realisation>(COL);
  return list.sort((a, b) => {
    if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
    if (a.order !== b.order) return a.order - b.order;
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });
}

/** Réalisations publiées (pour le site public). */
export async function getPublishedRealisations(): Promise<Realisation[]> {
  return (await getRealisations()).filter((r) => r.published && r.sets.length > 0);
}

export async function getRealisation(id: string): Promise<Realisation | null> {
  return getDoc<Realisation>(COL, id);
}

export async function addRealisation(input: {
  title: string;
  vehicle?: string;
  description?: string;
  tag?: string;
}): Promise<Realisation> {
  const list = await getRealisations();
  const order = Math.max(0, ...list.map((r) => r.order ?? 0)) + 1;
  const r: Realisation = {
    id: crypto.randomUUID(),
    title: input.title.trim() || "Réalisation",
    vehicle: input.vehicle?.trim() || undefined,
    description: input.description?.trim() || undefined,
    tag: input.tag?.trim() || undefined,
    featured: false,
    published: false,
    createdAt: new Date().toISOString(),
    order,
    sets: [],
  };
  await putDoc(COL, r.id, r);
  return r;
}

export async function updateRealisation(
  id: string,
  patch: Partial<Omit<Realisation, "id" | "sets">>,
): Promise<void> {
  const r = await getRealisation(id);
  if (!r) return;
  await putDoc(COL, id, { ...r, ...patch });
}

export async function deleteRealisation(id: string): Promise<void> {
  await deleteDoc(COL, id);
}

export async function addPhotoSet(
  id: string,
  set: { label?: string; before: string; after: string },
): Promise<void> {
  const r = await getRealisation(id);
  if (!r) return;
  const newSet: PhotoSet = {
    id: crypto.randomUUID(),
    label: set.label?.trim() || undefined,
    before: set.before,
    after: set.after,
  };
  await putDoc(COL, id, { ...r, sets: [...r.sets, newSet] });
}

export async function deletePhotoSet(id: string, setId: string): Promise<void> {
  const r = await getRealisation(id);
  if (!r) return;
  await putDoc(COL, id, { ...r, sets: r.sets.filter((s) => s.id !== setId) });
}
