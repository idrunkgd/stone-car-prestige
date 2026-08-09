/** État des lieux — zones du véhicule et types de dommages (sections 17 & 20). */

export type Damage = {
  id: string;
  zoneId: string;
  zoneLabel: string;
  type: string;
  note?: string;
};

/** Zones cliquables, positionnées en % sur un schéma vue de dessus. */
export type Zone = {
  id: string;
  label: string;
  /** style de position : top/left/width/height en % */
  pos: { top: string; left: string; width: string; height: string };
  round?: boolean;
};

export const ZONES: Zone[] = [
  { id: "pare-choc-av", label: "Pare-chocs avant", pos: { top: "1%", left: "26%", width: "48%", height: "8%" } },
  { id: "capot", label: "Capot", pos: { top: "10%", left: "24%", width: "52%", height: "14%" } },
  { id: "pare-brise", label: "Pare-brise", pos: { top: "25%", left: "27%", width: "46%", height: "9%" } },
  { id: "toit", label: "Toit", pos: { top: "35%", left: "27%", width: "46%", height: "20%" } },
  { id: "lunette", label: "Lunette arrière", pos: { top: "56%", left: "27%", width: "46%", height: "9%" } },
  { id: "coffre", label: "Coffre", pos: { top: "66%", left: "24%", width: "52%", height: "14%" } },
  { id: "pare-choc-ar", label: "Pare-chocs arrière", pos: { top: "81%", left: "26%", width: "48%", height: "8%" } },
  { id: "porte-avg", label: "Portière AV gauche", pos: { top: "34%", left: "6%", width: "16%", height: "13%" } },
  { id: "porte-arg", label: "Portière AR gauche", pos: { top: "48%", left: "6%", width: "16%", height: "13%" } },
  { id: "porte-avd", label: "Portière AV droite", pos: { top: "34%", left: "78%", width: "16%", height: "13%" } },
  { id: "porte-ard", label: "Portière AR droite", pos: { top: "48%", left: "78%", width: "16%", height: "13%" } },
  { id: "jante-avg", label: "Jante AV gauche", pos: { top: "16%", left: "2%", width: "12%", height: "10%" }, round: true },
  { id: "jante-avd", label: "Jante AV droite", pos: { top: "16%", left: "86%", width: "12%", height: "10%" }, round: true },
  { id: "jante-arg", label: "Jante AR gauche", pos: { top: "66%", left: "2%", width: "12%", height: "10%" }, round: true },
  { id: "jante-ard", label: "Jante AR droite", pos: { top: "66%", left: "86%", width: "12%", height: "10%" }, round: true },
];

export const DAMAGE_TYPES = [
  "Rayure",
  "Bosse",
  "Impact",
  "Jante abîmée",
  "Pare-brise",
  "Peinture",
  "Élément cassé",
  "Saleté exceptionnelle",
  "Autre",
] as const;

/** Suppléments proposables au check-in (section 12 — upsell). */
export const UPSELLS = [
  { id: "sieges", label: "Nettoyage des sièges", price: 30 },
  { id: "jantes", label: "Traitement jantes", price: 20 },
  { id: "hydro", label: "Protection hydrophobe", price: 25 },
  { id: "cuir", label: "Traitement cuir", price: 35 },
] as const;
