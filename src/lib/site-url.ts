import "server-only";
import { headers } from "next/headers";

/**
 * URL publique du site.
 *
 * Utilisée pour construire le contenu des QR codes : l'URL doit être
 * absolue puisqu'elle est scannée depuis un téléphone.
 * Définir NEXT_PUBLIC_SITE_URL en production (Coolify) donne un résultat
 * stable ; sinon on déduit l'origine des en-têtes de la requête.
 */
export async function siteOrigin(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}
