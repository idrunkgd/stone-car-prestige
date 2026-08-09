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

export const customers: Customer[] = [
  { id: "c1", firstName: "Jean", lastName: "Dupont", phone: "0499 11 22 33", email: "jean.dupont@example.be", visits: 5, totalSpent: 1240, lastVisitDaysAgo: 42, tag: "regulier" },
  { id: "c2", firstName: "Sophie", lastName: "Lambert", phone: "0498 55 44 21", email: "sophie.lambert@example.be", visits: 12, totalSpent: 3980, lastVisitDaysAgo: 6, tag: "vip" },
  { id: "c3", firstName: "Marc", lastName: "Lefèvre", phone: "0472 88 90 10", email: "marc.lefevre@example.be", visits: 3, totalSpent: 720, lastVisitDaysAgo: 15, tag: "regulier" },
  { id: "c4", firstName: "Laura", lastName: "Moreau", phone: "0471 20 30 40", email: "laura.moreau@example.be", visits: 1, totalSpent: 125, lastVisitDaysAgo: 2, tag: "nouveau" },
  { id: "c5", firstName: "David", lastName: "Nguyen", phone: "0475 12 34 56", email: "david.nguyen@example.be", visits: 8, totalSpent: 2110, lastVisitDaysAgo: 120, tag: "inactif" },
];

export const vehicles: Vehicle[] = [
  { id: "v1", make: "BMW", model: "M340i", plate: "1-ABC-123", category: "berline", color: "Noir Saphir", ownerId: "c1" },
  { id: "v2", make: "Audi", model: "Q5", plate: "2-ABX-114", category: "suv", color: "Gris Daytona", ownerId: "c3" },
  { id: "v3", make: "Porsche", model: "Macan", plate: "1-QRP-552", category: "suv", color: "Blanc Carrara", ownerId: "c3" },
  { id: "v4", make: "Mercedes", model: "GLC", plate: "1-FDE-201", category: "suv", color: "Bleu Cavansite", ownerId: "c5" },
  { id: "v5", make: "Volkswagen", model: "Golf GTI", plate: "1-GTI-777", category: "sportive", color: "Rouge Tornado", ownerId: "c2" },
  { id: "v6", make: "Audi", model: "RS3", plate: "1-RS3-045", category: "sportive", color: "Vert Kyalami", ownerId: "c4" },
];

export const todaysAppointments: Appointment[] = [
  { id: "a1", time: "08:00", vehicleId: "v1", customerId: "c1", service: "Lavage Premium", status: "RECU", priceEstimate: 145 },
  { id: "a2", time: "09:30", vehicleId: "v2", customerId: "c3", service: "Intérieur complet", status: "CONFIRME", priceEstimate: 120 },
  { id: "a3", time: "10:00", vehicleId: "v3", customerId: "c3", service: "Detailing complet", status: "EN_COURS", priceEstimate: 240, workedMinutes: 92, progress: 0.62 },
  { id: "a4", time: "11:15", vehicleId: "v4", customerId: "c5", service: "Nettoyage moteur + Jantes", status: "EN_ATTENTE", priceEstimate: 95 },
  { id: "a5", time: "14:00", vehicleId: "v5", customerId: "c2", service: "Lavage extérieur", status: "PRET", priceEstimate: 125 },
  { id: "a6", time: "15:30", vehicleId: "v6", customerId: "c4", service: "Nettoyage complet", status: "CONFIRME", priceEstimate: 125 },
];

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
