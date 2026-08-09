import "server-only";
import type { BookingRequest } from "./request-types";
import { listDocs, getDoc, putDoc, patchDoc, countDocs } from "./db";

const COL = "requests";

// Compatibilité : d'anciennes données peuvent contenir des statuts supprimés.
const LEGACY_STATUS: Record<string, BookingRequest["status"]> = {
  traite: "nouveau",
  reflexion: "nouveau",
  attente_acompte: "devis_envoye",
  acompte: "devis_envoye",
  validee: "accepte",
  planifie: "accepte",
  refusee: "refuse",
};

function normalize(r: BookingRequest): BookingRequest {
  const mapped = LEGACY_STATUS[r.status as string];
  return mapped ? { ...r, status: mapped } : r;
}

export async function getRequests(): Promise<BookingRequest[]> {
  return (await listDocs<BookingRequest>(COL)).map(normalize);
}

export async function getRequest(id: string): Promise<BookingRequest | null> {
  const r = await getDoc<BookingRequest>(COL, id);
  return r ? normalize(r) : null;
}

export async function addRequest(r: BookingRequest): Promise<void> {
  await putDoc(COL, r.id, r);
}

export async function updateRequest(
  id: string,
  patch: Partial<BookingRequest>,
): Promise<void> {
  await patchDoc<BookingRequest>(COL, id, patch);
}

export async function setRequestStatus(
  id: string,
  status: BookingRequest["status"],
): Promise<void> {
  await patchDoc<BookingRequest>(COL, id, { status });
}

export async function countNewRequests(): Promise<number> {
  return (await getRequests()).filter((r) => r.status === "nouveau").length;
}
