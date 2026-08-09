import type { OperationalStatus } from "./status";

/**
 * Données de démonstration réalistes (section 67 du brief).
 * Permettent de faire tourner le back-office SANS base de données.
 * Elles seront remplacées par des requêtes Prisma une fois la DB branchée
 * (voir prisma/schema.prisma et prisma/seed.ts).
 */

export type VehicleCategory =
  | "citadine"
  | "berline"
  | "break"
  | "suv"
  | "grand-suv"
  | "utilitaire"
  | "sportive"
  | "exception";

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  visits: number;
  totalSpent: number;
  lastVisitDaysAgo: number | null;
  tag: "nouveau" | "regulier" | "vip" | "inactif";
};

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  plate: string;
  category: VehicleCategory;
  color: string;
  ownerId: string;
};

export type Appointment = {
  id: string;
  time: string; // HH:MM
  vehicleId: string;
  customerId: string;
  service: string;
  status: OperationalStatus;
  priceEstimate: number;
  /** minutes travaillées (si en cours) */
  workedMinutes?: number;
  progress?: number; // 0..1
};

// Démarrage à vide : aucune donnée d'exemple. Les vrais clients, véhicules et
// rendez-vous proviennent de la base de données (crm-store, request-store, …).
export const customers: Customer[] = [];

export const vehicles: Vehicle[] = [];

export const todaysAppointments: Appointment[] = [];

/* Helpers de lecture (imitent les futures requêtes Prisma) */

export function getVehicle(id: string): Vehicle | undefined {
  return vehicles.find((v) => v.id === id);
}

export function getCustomer(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}

export function customerName(id: string): string {
  const c = getCustomer(id);
  return c ? `${c.firstName} ${c.lastName}` : "—";
}

/** KPIs dérivés pour l'écran « Aujourd'hui ». */
export function todaysMetrics() {
  const planned = todaysAppointments.length;
  const inShop = todaysAppointments.filter((a) => a.status === "EN_COURS").length;
  const ready = todaysAppointments.filter((a) => a.status === "PRET").length;
  const revenueForecast = todaysAppointments.reduce((s, a) => s + a.priceEstimate, 0);
  const toCollect = todaysAppointments
    .filter((a) => a.status === "PRET")
    .reduce((s, a) => s + a.priceEstimate, 0);
  return { planned, inShop, ready, revenueForecast, toCollect };
}
