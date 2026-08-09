import "server-only";
import type { StoredCustomer, StoredVehicle } from "./crm-types";
import { listDocs, putDoc } from "./db";

/** Clients & véhicules créés dans l'app (collections "customers" / "vehicles"). */

export async function getCustomers(): Promise<StoredCustomer[]> {
  return listDocs<StoredCustomer>("customers");
}

export async function addCustomer(c: StoredCustomer): Promise<void> {
  await putDoc("customers", c.id, c);
}

export async function getVehicles(): Promise<StoredVehicle[]> {
  return listDocs<StoredVehicle>("vehicles");
}

export async function addVehicle(v: StoredVehicle): Promise<void> {
  await putDoc("vehicles", v.id, v);
}
