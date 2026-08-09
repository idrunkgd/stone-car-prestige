import type { WorkStatus } from "./checkin-types";

/** Checklist d'intervention par défaut (section 22). */
export const DEFAULT_TASKS = [
  "Prélavage",
  "Jantes",
  "Lavage carrosserie",
  "Séchage",
  "Aspirateur",
  "Vitres",
  "Finitions",
];

/** Checklist de contrôle qualité avant restitution (section 26). */
export const DEFAULT_QUALITY = [
  "Carrosserie contrôlée",
  "Jantes contrôlées",
  "Vitres contrôlées",
  "Intérieur contrôlé",
  "Coffre contrôlé",
  "Aucun objet oublié",
  "Photos finales réalisées",
];

export const WORK_STATUS: Record<WorkStatus, { label: string; className: string }> = {
  PLANIFIE: { label: "À réceptionner", className: "text-state-blue bg-state-blue/15" },
  RECU: { label: "Reçu", className: "text-gold-1 border border-line-gold bg-gold/[0.08]" },
  EN_COURS: { label: "En cours", className: "text-[#1a1400] bg-gold-grad font-bold" },
  TERMINE: { label: "Terminé", className: "text-state-green bg-state-green/15" },
  PRET: { label: "Prêt à livrer", className: "text-state-green bg-state-green/15" },
  LIVRE: { label: "Livré", className: "text-ink-muted bg-night-panel2 border border-line-soft" },
};

/** Prochaine action logique selon le statut (Next Best Action, section 62). */
export function nextStep(id: string, status: WorkStatus | undefined) {
  switch (status) {
    case "PLANIFIE":
      return { label: "Faire le check-in", href: `/app/checkin/${id}` };
    case "EN_COURS":
      return { label: "Continuer l'intervention", href: `/app/intervention/${id}` };
    case "TERMINE":
    case "PRET":
      return { label: "Contrôle qualité & check-out", href: `/app/checkout/${id}` };
    case "LIVRE":
      return { label: "Voir le rapport", href: `/app/checkin/rapport/${id}` };
    case "RECU":
    default:
      return { label: "Démarrer l'intervention", href: `/app/intervention/${id}` };
  }
}
