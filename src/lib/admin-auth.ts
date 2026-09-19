import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Accès à l'espace pro /app — deux rôles.
 *
 * Identifiants configurables par variables d'environnement :
 *   - ADMIN_EMAIL     (défaut : stone@stone.be)
 *   - ADMIN_PASSWORD  (défaut : Azerty12)
 *   - STAFF_EMAIL     (facultatif — compte employé)
 *   - STAFF_PASSWORD  (facultatif — compte employé)
 *
 * Rôles :
 *   admin    accès complet : formules d'abonnement, attribution, corrections,
 *            annulation d'un tampon, statistiques.
 *   employe  usage quotidien : consulter une carte, scanner un QR code et
 *            valider l'utilisation d'un lavage. Ne peut rien corriger.
 *
 * Sans STAFF_PASSWORD défini, le compte employé n'existe pas et rien ne
 * change par rapport au fonctionnement actuel.
 *
 * Change le mot de passe en production en définissant ADMIN_PASSWORD dans
 * Coolify (onglet Environment Variables), puis redéploie. Changer le mot de
 * passe invalide automatiquement les sessions ouvertes.
 */

import type { StaffRole } from "./subscription-types";

const COOKIE = "scp_admin";

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "stone@stone.be")
  .trim()
  .toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Azerty12";

export const STAFF_EMAIL = (process.env.STAFF_EMAIL ?? "")
  .trim()
  .toLowerCase();
const STAFF_PASSWORD = process.env.STAFF_PASSWORD ?? "";

/** Jeton de session déterministe (dépend du mot de passe courant). */
function sessionToken(role: StaffRole = "admin"): string {
  const secret = role === "admin" ? ADMIN_PASSWORD : STAFF_PASSWORD;
  const email = role === "admin" ? ADMIN_EMAIL : STAFF_EMAIL;
  return createHmac("sha256", secret).update(`${role}:${email}`).digest("hex");
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

/** Vérifie les identifiants employé (uniquement si STAFF_PASSWORD est défini). */
export function verifyStaffCredentials(email: string, password: string): boolean {
  if (!STAFF_EMAIL || !STAFF_PASSWORD) return false;
  return (
    safeEqual(email.trim().toLowerCase(), STAFF_EMAIL) &&
    safeEqual(password, STAFF_PASSWORD)
  );
}

/** Identifie le rôle correspondant à un couple email / mot de passe. */
export function roleForCredentials(
  email: string,
  password: string,
): StaffRole | null {
  if (verifyAdminCredentials(email, password)) return "admin";
  if (verifyStaffCredentials(email, password)) return "employe";
  return null;
}

export async function setAdminSession(role: StaffRole = "admin") {
  const jar = await cookies();
  jar.set(COOKIE, `${role}.${sessionToken(role)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}

/** Rôle de la session pro en cours, ou `null`. */
export async function getStaffRole(): Promise<StaffRole | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;

  // Format courant : "<role>.<token>".
  const dot = raw.indexOf(".");
  if (dot > 0) {
    const role = raw.slice(0, dot) as StaffRole;
    const token = raw.slice(dot + 1);
    if (role === "admin" && safeEqual(token, sessionToken("admin"))) return "admin";
    if (
      role === "employe" &&
      STAFF_PASSWORD &&
      safeEqual(token, sessionToken("employe"))
    ) {
      return "employe";
    }
    return null;
  }

  // Compatibilité : anciennes sessions admin (jeton brut, sans préfixe).
  const legacy = createHmac("sha256", ADMIN_PASSWORD)
    .update(`admin:${ADMIN_EMAIL}`)
    .digest("hex");
  return safeEqual(raw, legacy) ? "admin" : null;
}

/** Email affiché dans les journaux d'audit pour la session en cours. */
export async function getStaffEmail(): Promise<string> {
  const role = await getStaffRole();
  if (role === "admin") return ADMIN_EMAIL;
  if (role === "employe") return STAFF_EMAIL || "employe";
  return "inconnu";
}

/** Session pro valide (admin OU employé). */
export async function isStaff(): Promise<boolean> {
  return (await getStaffRole()) !== null;
}

/** Session administrateur (droits complets). */
export async function isAdmin(): Promise<boolean> {
  return (await getStaffRole()) === "admin";
}

/**
 * À appeler en tête d'une page réservée à l'administrateur.
 * Un employé connecté est renvoyé vers l'accueil de l'espace pro.
 */
export async function requireAdminPage(): Promise<void> {
  const role = await getStaffRole();
  if (role === "admin") return;
  const { redirect } = await import("next/navigation");
  redirect(role ? "/app?acces=admin" : "/connexion-pro");
}

/** À appeler dans une Server Action réservée à l'administrateur. */
export async function assertAdmin(): Promise<string> {
  if (!(await isAdmin())) throw new Error("Action réservée à l'administrateur.");
  return ADMIN_EMAIL;
}

/** À appeler dans une Server Action accessible à tout le personnel. */
export async function assertStaff(): Promise<{ email: string; role: StaffRole }> {
  const role = await getStaffRole();
  if (!role) throw new Error("Session expirée — reconnectez-vous.");
  return { email: await getStaffEmail(), role };
}
