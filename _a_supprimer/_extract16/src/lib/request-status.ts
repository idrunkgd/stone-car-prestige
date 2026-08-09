import type { RequestStatus } from "./request-types";

export const REQUEST_STATUS: Record<RequestStatus, { label: string; className: string }> = {
  nouveau: { label: "Nouveau", className: "text-[#1a1400] bg-gold-grad font-bold" },
  reflexion: { label: "En réflexion", className: "text-state-blue bg-state-blue/15" },
  acompte: { label: "Attente d'acompte", className: "text-state-orange bg-state-orange/15" },
  validee: { label: "Validée", className: "text-state-green bg-state-green/15" },
  planifie: { label: "Planifiée", className: "text-[#0d2e1e] bg-state-green font-bold" },
  refuse: { label: "Refusée", className: "text-[#e88] bg-state-red/15" },
  traite: { label: "Traité", className: "text-ink-muted bg-night-panel2 border border-line-soft" },
};

export const STATUS_ORDER: RequestStatus[] = [
  "nouveau",
  "reflexion",
  "acompte",
  "validee",
  "planifie",
  "refuse",
  "traite",
];
