import type { VehicleCategory } from "./demo-data";

/** Client créé par l'utilisateur (persisté). */
export type StoredCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone: string;
  email?: string;
  createdAt: string;
};

/** Véhicule créé par l'utilisateur (persisté). */
export type StoredVehicle = {
  id: string;
  make: string;
  model: string;
  plate: string;
  category: VehicleCategory;
  color?: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
};
