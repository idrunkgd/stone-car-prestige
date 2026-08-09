import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Accès administrateur (espace pro /app).
 *
 * Identifiants configurables par variables d'environnement :
 *   - ADMIN_EMAIL     (défaut : stone@stone.be)
 *   - ADMIN_PASSWORD  (défaut : Azerty12)
 *
 * Change le mot de passe en production en définissant ADMIN_PASSWORD dans
 * Coolify (onglet Environment Variables), puis redéploie. Changer le mot de
 * passe invalide automatiquement les sessions ouvertes.
 */

const COOKIE = "scp_admin";

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "stone@stone.be")
  .trim()
  .toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Azerty12";

/** Jeton de session déterministe (dépend du mot de passe courant). */
function sessionToken(): string {
  return createHmac("sha256", ADMIN_PASSWORD).update(`admin:${ADMIN_EMAIL}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const emailOk = safeEqual(email.trim().toLowerCase(), ADMIN_EMAIL);
  const passOk = safeEqual(password, ADMIN_PASSWORD);
  return emailOk && passOk;
}

export async function setAdminSession() {
  const jar = await cookies();
  jar.set(COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  return safeEqual(raw, sessionToken());
}
