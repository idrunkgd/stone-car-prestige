import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { StoredCustomer, StoredVehicle } from "./crm-types";

/**
 * Persistance des clients & véhicules créés dans l'app (fichiers JSON locaux).
 * Aucune base de données requise. Remplaçable par Prisma plus tard.
 */
const DIR = path.join(process.cwd(), ".data");
const CUSTOMERS = path.join(DIR, "customers.json");
const VEHICLES = path.join(DIR, "vehicles.json");

async function read<T>(file: string): Promise<T[]> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T[];
  } catch {
    return [];
  }
}

async function write<T>(file: string, data: T[]) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

export async function getCustomers(): Promise<StoredCustomer[]> {
  return read<StoredCustomer>(CUSTOMERS);
}

export async function addCustomer(c: StoredCustomer): Promise<void> {
  const all = await getCustomers();
  all.unshift(c);
  await write(CUSTOMERS, all);
}

export async function getVehicles(): Promise<StoredVehicle[]> {
  return read<StoredVehicle>(VEHICLES);
}

export async function addVehicle(v: StoredVehicle): Promise<void> {
  const all = await getVehicles();
  all.unshift(v);
  await write(VEHICLES, all);
}
