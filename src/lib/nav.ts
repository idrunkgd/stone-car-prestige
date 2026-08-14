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
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  /** Affiché dans la barre inférieure tablette. */
  primary?: boolean;
};

export const NAV: NavItem[] = [
  { href: "/app", label: "Aujourd'hui", short: "Auj.", icon: LayoutGrid, primary: true },
  { href: "/app/planning", label: "Planning", short: "Plan.", icon: CalendarDays, primary: true },
  { href: "/app/checkin", label: "Check-in", short: "Check", icon: ClipboardCheck, primary: true },
  { href: "/app/clients", label: "Clients", short: "Clients", icon: Users, primary: true },
  { href: "/app/vehicules", label: "Véhicules", short: "Véhic.", icon: Car },
  { href: "/app/prestations", label: "Prestations", short: "Presta.", icon: Sparkles },
  { href: "/app/formules", label: "Formules", short: "Formules", icon: Package },
  { href: "/app/ventes", label: "Ventes", short: "Ventes", icon: Receipt },
  { href: "/app/demandes", label: "Demandes", short: "Demandes", icon: Inbox },
  { href: "/app/galerie", label: "Galerie", short: "Galerie", icon: Images },
  { href: "/app/stats", label: "Statistiques", short: "Stats", icon: BarChart3 },
  { href: "/app/parametres", label: "Paramètres", short: "Param.", icon: Settings },
];
