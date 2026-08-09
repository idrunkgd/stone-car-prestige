import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { CheckinRecord } from "./checkin-types";

/**
 * Persistance légère des check-ins dans un fichier JSON local (.data/checkins.json).
 * Aucune base de données requise : idéal pour le prototype, remplaçable par
 * Prisma/PostgreSQL plus tard sans changer les écrans.
 */
const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "checkins.json");

export async function getCheckins(): Promise<CheckinRecord[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as CheckinRecord[];
  } catch {
    return [];
  }
}

export async function getCheckin(id: string): Promise<CheckinRecord | null> {
  const all = await getCheckins();
  return all.find((c) => c.id === id) ?? null;
}

export async function addCheckin(record: CheckinRecord): Promise<void> {
  const all = await getCheckins();
  all.unshift(record);
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
}
