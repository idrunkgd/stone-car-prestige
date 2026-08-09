import type { RequestStatus } from "./request-types";

export const REQUEST_STATUS: Record<RequestStatus, { label: string; className: string }> = {
  nouveau: { label: "Nouveau", className: "text-[#1a1400] bg-gold-grad font-bold" },
  devis_envoye: { label: "Devis envoyé", className: "text-state-orange bg-state-orange/15" },
  accepte: { label: "Accepté", className: "text-[#0d2e1e] bg-state-green font-bold" },
  refuse: { label: "Refusé", className: "text-[#e88] bg-state-red/15" },
};

export const STATUS_ORDER: RequestStatus[] = ["nouveau", "devis_envoye", "accepte", "refuse"];

const FALLBACK = { label: "Nouveau", className: "text-[#1a1400] bg-gold-grad font-bold" };

/** Lookup tolérant aux anciens statuts présents dans d'anciennes données. */
export function requestStatusMeta(status: string) {
  return REQUEST_STATUS[status as RequestStatus] ?? FALLBACK;
}
