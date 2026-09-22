import type { VehicleCategory } from "./demo-data";

export type ClientVehicle = {
  id: string;
  make: string;
  model: string;
  plate: string;
  category: VehicleCategory;
};

/** Type de client : particulier ou société assujettie à la TVA. */
export type AccountKind = "particulier" | "societe";

export type Account = {
  id: string;
  email: string;
  name: string;
  phone: string;
  kind?: AccountKind;
  /** Raison sociale (sociétés uniquement). */
  company?: string;
  /** Numéro de TVA normalisé, ex. BE0123456749. */
  vatNumber?: string;
  /** Adresse de facturation (facultative). */
  address?: string;
  passwordHash: string;
  salt: string;
  token: string;
  createdAt: string;
  vehicles: ClientVehicle[];
};

/** Nom à faire figurer sur les documents commerciaux. */
export function billingName(a: {
  name: string;
  company?: string;
  kind?: AccountKind;
}): string {
  return a.kind === "societe" && a.company?.trim() ? a.company.trim() : a.name;
}

/** Version sûre exposée au client (sans secrets). */
export type PublicAccount = {
  id: string;
  email: string;
  name: string;
  phone: string;
  kind?: AccountKind;
  company?: string;
  vatNumber?: string;
  address?: string;
  vehicles: ClientVehicle[];
};

export function toPublic(a: Account): PublicAccount {
  return {
    id: a.id,
    email: a.email,
    name: a.name,
    phone: a.phone,
    kind: a.kind,
    company: a.company,
    vatNumber: a.vatNumber,
    address: a.address,
    vehicles: a.vehicles,
  };
}
