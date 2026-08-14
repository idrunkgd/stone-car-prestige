import "server-only";
import type { Formule } from "./formule-types";
import { listDocs, replaceCollection } from "./db";

const COL = "formules";

/** Formules par défaut (modifiables & supprimables par l'admin). */
export const SEED_FORMULES: Formule[] = [
  {
    id: "f-essential",
    name: "Essential",
    description: "L'entretien régulier, extérieur soigné.",
    order: 1,
    serviceIds: ["svc-ext", "svc-jantes"],
  },
  {
    id: "f-premium",
    name: "Premium",
    description: "Extérieur + intérieur complet.",
    highlight: true,
    order: 2,
    serviceIds: ["svc-ext", "svc-int", "svc-jantes"],
  },
  {
    id: "f-signature",
    name: "Signature",
    description: "Le grand jeu, finitions premium.",
    order: 3,
    serviceIds: ["svc-premium", "svc-int", "svc-moteur", "svc-jantes"],
  },
];

/**
 * Renvoie les formules. Tant que l'admin n'a rien personnalisé, on propose
 * les formules par défaut. Dès la première modification, la liste est persistée.
 */
export async function getFormules(): Promise<Formule[]> {
  const list = await listDocs<Formule>(COL);
  if (list.length === 0) return [...SEED_FORMULES].sort((a, b) => a.order - b.order);
  return list.sort((a, b) => a.order - b.order);
}

async function saveAll(list: Formule[]) {
  await replaceCollection(COL, list);
}

export async function addFormule(name: string): Promise<void> {
  const list = await getFormules();
  const order = Math.max(0, ...list.map((f) => f.order)) + 1;
  list.push({
    id: crypto.randomUUID(),
    name,
    description: "",
    order,
    serviceIds: [],
  });
  await saveAll(list);
}

export async function updateFormule(id: string, patch: Partial<Formule>): Promise<void> {
  const list = await getFormules();
  const idx = list.findIndex((f) => f.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...patch };
    await saveAll(list);
  }
}

export async function deleteFormule(id: string): Promise<void> {
  const list = (await getFormules()).filter((f) => f.id !== id);
  await saveAll(list);
}
