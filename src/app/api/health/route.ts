import { NextResponse } from "next/server";

// Endpoint de santé pour Coolify (ne dépend pas de la base : la conteneur
// est « healthy » même si la DB redémarre brièvement).
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true });
}
