/**
 * Numéros de TVA — normalisation, validation et affichage.
 *
 * Validation stricte pour la Belgique (structure + clé de contrôle modulo 97),
 * contrôle de forme seulement pour les autres pays de l'Union : un client
 * étranger reste possible sans que l'application prétende vérifier une clé
 * qu'elle ne connaît pas.
 *
 * Pure, sans I/O : utilisable côté serveur comme côté client.
 */

/** Préfixes TVA de l'Union européenne (+ Royaume-Uni, courant en Belgique). */
const PREFIXES = [
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "EL", "ES", "FI", "FR",
  "GB", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT",
  "RO", "SE", "SI", "SK", "XI",
];

/** Retire espaces, points et tirets, et passe en majuscules. */
export function normalizeVat(input: string): string {
  return String(input ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/**
 * Valide un numéro de TVA.
 *
 * Un numéro belge saisi sans préfixe (0123.456.749) est accepté et complété
 * en BE0123456749 : c'est la forme la plus courante au comptoir.
 */
export function validateVat(input: string): {
  ok: boolean;
  value?: string;
  error?: string;
} {
  let v = normalizeVat(input);
  if (!v) return { ok: false, error: "Numéro de TVA vide." };

  // Numéro belge sans préfixe : 10 chiffres (ou 9, ancien format).
  if (/^\d{9,10}$/.test(v)) v = `BE${v.padStart(10, "0")}`;

  const prefix = v.slice(0, 2);
  if (!PREFIXES.includes(prefix)) {
    return {
      ok: false,
      error: "Préfixe pays inconnu (ex. BE, FR, NL, DE…).",
    };
  }

  const body = v.slice(2);
  if (body.length < 2 || !/^[A-Z0-9]+$/.test(body)) {
    return { ok: false, error: "Format de numéro invalide." };
  }

  if (prefix === "BE") {
    if (!/^\d{10}$/.test(body)) {
      return {
        ok: false,
        error: "Un numéro belge compte 10 chiffres (ex. BE0123456749).",
      };
    }
    if (!/^[01]/.test(body)) {
      return { ok: false, error: "Un numéro belge commence par 0 ou 1." };
    }
    const base = Number(body.slice(0, 8));
    const cle = Number(body.slice(8, 10));
    if (97 - (base % 97) !== cle) {
      return {
        ok: false,
        error: "Clé de contrôle incorrecte — vérifie la saisie.",
      };
    }
  }

  return { ok: true, value: v };
}

/** Mise en forme lisible : BE0123456749 → BE 0123.456.749 */
export function formatVat(input: string): string {
  const v = normalizeVat(input);
  if (/^BE\d{10}$/.test(v)) {
    const d = v.slice(2);
    return `BE ${d.slice(0, 4)}.${d.slice(4, 7)}.${d.slice(7)}`;
  }
  return v.length > 2 ? `${v.slice(0, 2)} ${v.slice(2)}` : v;
}

/**
 * Autoliquidation : une prestation B2B facturée à un assujetti d'un autre
 * État membre relève de l'autoliquidation (TVA due par le preneur).
 * Fonction utilitaire prête pour cette évolution — non appliquée
 * automatiquement aujourd'hui, la prestation étant matériellement exécutée
 * en Belgique.
 */
export function isForeignEuVat(vat: string): boolean {
  const v = normalizeVat(vat);
  return v.length > 2 && v.slice(0, 2) !== "BE" && PREFIXES.includes(v.slice(0, 2));
}
