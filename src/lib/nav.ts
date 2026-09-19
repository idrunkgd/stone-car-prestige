import {
  LayoutGrid,
  CalendarDays,
  ClipboardCheck,
  Users,
  Car,
  Sparkles,
  Package,
  Receipt,
  Images,
  BarChart3,
  Settings,
  Inbox,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

import type { StaffRole } from "./subscription-types";

export type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  /** Affiché dans la barre inférieure tablette. */
  primary?: boolean;
  /** Réservé à l'administrateur (masqué pour le rôle employé). */
  adminOnly?: boolean;
};

export const NAV: NavItem[] = [
  { href: "/app", label: "Aujourd'hui", short: "Auj.", icon: LayoutGrid, primary: true },
  { href: "/app/planning", label: "Planning", short: "Plan.", icon: CalendarDays, primary: true },
  { href: "/app/checkin", label: "Check-in", short: "Check", icon: ClipboardCheck, primary: true },
  { href: "/app/clients", label: "Clients", short: "Clients", icon: Users, primary: true },
  { href: "/app/vehicules", label: "Véhicules", short: "Véhic.", icon: Car },
  { href: "/app/abonnements", label: "Abonnements", short: "Abos", icon: CreditCard },
  { href: "/app/prestations", label: "Prestations", short: "Presta.", icon: Sparkles, adminOnly: true },
  { href: "/app/formules", label: "Formules", short: "Formules", icon: Package, adminOnly: true },
  { href: "/app/ventes", label: "Ventes", short: "Ventes", icon: Receipt, adminOnly: true },
  { href: "/app/demandes", label: "Demandes", short: "Demandes", icon: Inbox },
  { href: "/app/galerie", label: "Galerie", short: "Galerie", icon: Images, adminOnly: true },
  { href: "/app/stats", label: "Statistiques", short: "Stats", icon: BarChart3, adminOnly: true },
  { href: "/app/parametres", label: "Paramètres", short: "Param.", icon: Settings, adminOnly: true },
];

/** Entrées visibles pour un rôle donné. */
export function navFor(role: StaffRole): NavItem[] {
  return role === "admin" ? NAV : NAV.filter((i) => !i.adminOnly);
}
