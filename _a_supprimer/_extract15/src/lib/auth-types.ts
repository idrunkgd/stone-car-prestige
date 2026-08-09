import type { VehicleCategory } from "./demo-data";

export type ClientVehicle = {
  id: string;
  make: string;
  model: string;
  plate: string;
  category: VehicleCategory;
};

export type Account = {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  salt: string;
  token: string;
  createdAt: string;
  vehicles: ClientVehicle[];
};

/** Version sûre exposée au client (sans secrets). */
export type PublicAccount = {
  id: string;
  email: string;
  name: string;
  phone: string;
  vehicles: ClientVehicle[];
};

export function toPublic(a: Account): PublicAccount {
  return { id: a.id, email: a.email, name: a.name, phone: a.phone, vehicles: a.vehicles };
}
