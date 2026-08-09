/**
 * Statuts opérationnels d'un rendez-vous / ordre de travail.
 * L'ordre reflète le cycle de vie réel d'un véhicule dans l'atelier.
 */
export type OperationalStatus =
  | "PREVU"
  | "CONFIRME"
  | "CLIENT_ARRIVE"
  | "CHECKIN"
  | "RECU"
  | "EN_COURS"
  | "EN_ATTENTE"
  | "TERMINE"
  | "PRET"
  | "PAYE"
  | "LIVRE"
  | "ANNULE"
  | "ABSENT";

type StatusStyle = {
  label: string;
  /** Classes Tailwind pour le badge. */
  className: string;
};

export const STATUS: Record<OperationalStatus, StatusStyle> = {
  PREVU: { label: "Prévu", className: "text-gold-1 border border-line-gold bg-gold/[0.08]" },
  CONFIRME: { label: "Confirmé", className: "text-state-blue bg-state-blue/15" },
  CLIENT_ARRIVE: { label: "Client arrivé", className: "text-state-blue bg-state-blue/15" },
  CHECKIN: { label: "Check-in", className: "text-state-orange bg-state-orange/15" },
  RECU: { label: "À recevoir", className: "text-gold-1 border border-line-gold bg-gold/[0.08]" },
  EN_COURS: { label: "En cours", className: "text-[#1a1400] bg-gold-grad font-bold" },
  EN_ATTENTE: { label: "Validation", className: "text-state-orange bg-state-orange/15" },
  TERMINE: { label: "Terminé", className: "text-state-green bg-state-green/15" },
  PRET: { label: "Prêt", className: "text-state-green bg-state-green/15" },
  PAYE: { label: "Payé", className: "text-[#0d2e1e] bg-state-green font-bold" },
  LIVRE: { label: "Livré", className: "text-ink-muted bg-night-panel2 border border-line-soft" },
  ANNULE: { label: "Annulé", className: "text-[#e88] bg-state-red/15" },
  ABSENT: { label: "Absent", className: "text-[#e88] bg-state-red/15" },
};

/** La « prochaine meilleure action » selon le statut (section 62 du brief). */
export const NEXT_ACTION: Partial<Record<OperationalStatus, string>> = {
  PREVU: "Faire le check-in",
  CONFIRME: "Faire le check-in",
  RECU: "Faire le check-in",
  CLIENT_ARRIVE: "Faire le check-in",
  CHECKIN: "Terminer le check-in",
  EN_COURS: "Continuer l'intervention",
  EN_ATTENTE: "Valider le supplément",
  TERMINE: "Effectuer le contrôle qualité",
  PRET: "Encaisser & livrer",
  PAYE: "Livrer le véhicule",
};
