import "server-only";
import type { ManagedService } from "./service-catalog-types";
import { listDocs, replaceCollection, countDocs } from "./db";

const COL = "services";

/** Services par défaut (modifiables & supprimables par l'admin). */
export const SEED_SERVICES: ManagedService[] = [
  { id: "svc-ext", name: "Lavage extérieur", active: true, order: 1, tiers: { petite: { price: 25, duration: 30 }, moyenne: { price: 35, duration: 40 }, grande: { price: 45, duration: 50 } } },
  { id: "svc-int", name: "Lavage intérieur", active: true, order: 2, tiers: { petite: { price: 45, duration: 45 }, moyenne: { price: 55, duration: 55 }, grande: { price: 70, duration: 70 } } },
  { id: "svc-premium", name: "Lavage Premium", active: true, order: 3, tiers: { petite: { price: 70, duration: 75 }, moyenne: { price: 90, duration: 90 }, grande: { price: 120, duration: 110 } } },
  { id: "svc-complet", name: "Nettoyage complet", active: true, order: 4, tiers: { petite: { price: 110, duration: 120 }, moyenne: { price: 140, duration: 150 }, grande: { price: 180, duration: 180 } } },
  { id: "svc-moteur", name: "Nettoyage moteur", active: true, order: 5, tiers: { petite: { price: 50, duration: 30 }, moyenne: { price: 60, duration: 40 }, grande: { price: 70, duration: 45 } } },
  { id: "svc-jantes", name: "Traitement jantes", active: true, order: 6, tiers: { petite: { price: 20, duration: 20 }, moyenne: { price: 25, duration: 25 }, grande: { price: 30, duration: 30 } } },
  { id: "svc-polissage", name: "Polissage 1 étape", active: true, order: 7, tiers: { petite: { price: 180, duration: 150 }, moyenne: { price: 230, duration: 180 }, grande: { price: 290, duration: 210 } } },
  { id: "svc-ceramique", name: "Protection céramique", active: true, order: 8, tiers: { petite: { price: 350, duration: 240 }, moyenne: { price: 450, duration: 300 }, grande: { price: 600, duration: 360 } } },
];

/**
 * Renvoie le catalogue. Tant que l'admin n'a rien personnalisé (collection vide),
 * on propose les services par défaut pour que l'app soit utilisable
 * immédiatement. Dès la première modification, la liste complète est persistée.
 */
export async function getServices(): Promise<ManagedService[]> {
  const list = await listDocs<ManagedService>(COL);
  if (list.length === 0) return [...SEED_SERVICES].sort((a, b) => a.order - b.order);
  return list.sort((a, b) => a.order - b.order);
}

async function saveAll(list: ManagedService[]) {
  await replaceCollection(COL, list);
}

export async function addService(name: string): Promise<void> {
  const list = await getServices();
  const order = Math.max(0, ...list.map((s) => s.order)) + 1;
  list.push({
    id: crypto.randomUUID(),
    name,
    active: true,
    order,
    tiers: {
      petite: { price: 0, duration: 30 },
      moyenne: { price: 0, duration: 40 },
      grande: { price: 0, duration: 50 },
    },
  });
  await saveAll(list);
}

export async function updateService(id: string, patch: Partial<ManagedService>): Promise<void> {
  const list = await getServices();
  const idx = list.findIndex((s) => s.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...patch };
    await saveAll(list);
  }
}

export async function deleteService(id: string): Promise<void> {
  const list = (await getServices()).filter((s) => s.id !== id);
  await saveAll(list);
}
