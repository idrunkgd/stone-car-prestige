#!/usr/bin/env node
/* eslint-disable */
/**
 * Nettoyage de la base — ne conserver que DASOLABS.
 *
 * Supprime tous les clients (comptes de l'espace client ET fiches créées au
 * back-office) sauf ceux rattachés à DASOLABS, ainsi que tout ce qui leur
 * appartient : véhicules, demandes, devis, factures, interventions, cartes
 * d'abonnement et leur historique, notifications.
 *
 * NE TOUCHE PAS à la configuration : catalogue de prestations, formules,
 * formules d'abonnement, paramètres, réalisations/galerie.
 *
 *   # 1. Inventaire — lecture seule, n'écrit rien
 *   DATABASE_URL=… node scripts/nettoyage-clients.cjs
 *
 *   # 2. Suppression — écrit d'abord une sauvegarde JSON à côté du script
 *   DATABASE_URL=… node scripts/nettoyage-clients.cjs --supprimer --je-confirme
 *
 * Le mot recherché peut être changé : --garder="autre nom".
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

/* ─────────────────────────────── Options ─────────────────────────────── */

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const valueOf = (name, def) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3).replace(/^["']|["']$/g, "") : def;
};

const GARDER = valueOf("garder", "dasolabs");
const SUPPRIMER = has("--supprimer") && has("--je-confirme");
const DEMANDE_SUPPRESSION = has("--supprimer");

/** Collections contenant des données client (candidates à la suppression). */
const COLLECTIONS_CLIENT = [
  "accounts",
  "customers",
  "vehicles",
  "requests",
  "quotes",
  "invoices",
  "checkins",
  "subscription_cards",
  "subscription_usages",
  "subscription_adjustments",
  "notifications",
];

/** Collections de configuration : jamais touchées. */
const COLLECTIONS_CONFIG = [
  "services",
  "formules",
  "subscription_plans",
  "settings",
  "realisations",
];

/* ────────────────────────────── Utilitaires ──────────────────────────── */

const norm = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

const digits = (s) => String(s ?? "").replace(/\D/g, "");
const cible = norm(GARDER);

/** Un enregistrement appartient-il à l'entité à conserver ? */
const estCible = (...champs) =>
  champs.some((c) => c && norm(c).includes(cible));

function tableau(lignes) {
  const l1 = Math.max(...lignes.map((l) => l[0].length));
  return lignes
    .map(
      ([a, b, c]) =>
        `  ${a.padEnd(l1)}  ${String(b).padStart(6)} supprimé(s)` +
        (c !== undefined ? `  ${String(c).padStart(6)} conservé(s)` : ""),
    )
    .join("\n");
}

/* ──────────────────────────────── Script ─────────────────────────────── */

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL n'est pas défini.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_SSL === "require"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  const { rows } = await pool.query(
    `SELECT collection, id, data FROM documents ORDER BY collection, seq`,
  );

  const parCollection = new Map();
  for (const r of rows) {
    if (!parCollection.has(r.collection)) parCollection.set(r.collection, []);
    parCollection.get(r.collection).push(r);
  }
  const get = (c) => parCollection.get(c) ?? [];

  /* ── 1. Identifier l'entité à conserver ── */

  const comptesGardes = get("accounts").filter((r) =>
    estCible(r.data.name, r.data.email),
  );
  const fichesGardees = get("customers").filter((r) =>
    estCible(r.data.firstName, r.data.lastName, r.data.company, r.data.email),
  );

  const idsComptes = new Set(comptesGardes.map((r) => r.id));
  const idsFiches = new Set(fichesGardees.map((r) => r.id));
  const nomsGardes = new Set();
  const emailsGardes = new Set();
  const telsGardes = new Set();

  for (const r of comptesGardes) {
    nomsGardes.add(norm(r.data.name));
    if (r.data.email) emailsGardes.add(norm(r.data.email));
    if (r.data.phone) telsGardes.add(digits(r.data.phone));
  }
  for (const r of fichesGardees) {
    nomsGardes.add(
      norm([r.data.firstName, r.data.lastName].filter(Boolean).join(" ")),
    );
    if (r.data.company) nomsGardes.add(norm(r.data.company));
    if (r.data.email) emailsGardes.add(norm(r.data.email));
    if (r.data.phone) telsGardes.add(digits(r.data.phone));
  }

  /** Un enregistrement se rattache-t-il à l'entité conservée ? */
  const rattache = (d) => {
    if (d.accountId && idsComptes.has(d.accountId)) return true;
    if (d.customerId && idsFiches.has(d.customerId)) return true;
    if (d.ownerId && idsFiches.has(d.ownerId)) return true;
    const noms = [d.name, d.customer, d.ownerName, d.holder?.name];
    if (noms.some((n) => n && nomsGardes.has(norm(n)))) return true;
    if (noms.some((n) => estCible(n))) return true;
    const emails = [d.email, d.holder?.email];
    if (emails.some((e) => e && emailsGardes.has(norm(e)))) return true;
    const tels = [d.phone, d.holder?.phone];
    if (tels.some((t) => t && telsGardes.has(digits(t)))) return true;
    if (d.holder?.accountId && idsComptes.has(d.holder.accountId)) return true;
    if (d.holder?.customerId && idsFiches.has(d.holder.customerId)) return true;
    return false;
  };

  console.log(`\nEntité conservée : « ${GARDER} »`);
  console.log(
    `  ${comptesGardes.length} compte(s) espace client, ${fichesGardees.length} fiche(s) back-office`,
  );
  for (const r of [...comptesGardes, ...fichesGardees]) {
    const d = r.data;
    const nom =
      d.name ?? [d.firstName, d.lastName].filter(Boolean).join(" ") ?? "—";
    console.log(`    · ${nom}${d.email ? ` <${d.email}>` : ""}`);
  }

  if (comptesGardes.length + fichesGardees.length === 0) {
    console.error(
      `\nAUCUN client ne correspond à « ${GARDER} ».\n` +
        `Tout serait supprimé — le script s'arrête par sécurité.\n` +
        `Vérifie l'orthographe, ou passe --garder="le bon nom".`,
    );
    await pool.end();
    process.exit(1);
  }

  /* ── 2. Décider, collection par collection ── */

  const aSupprimer = []; // { collection, id, data }
  const compte = {};

  // Les registres d'abonnement ne portent ni nom ni compte : leur sort est
  // entièrement déterminé par celui de leur carte. Ils sont traités à part.
  const REGISTRES = ["subscription_usages", "subscription_adjustments"];

  for (const col of COLLECTIONS_CLIENT) {
    if (REGISTRES.includes(col)) continue;
    const docs = get(col);
    if (docs.length === 0) continue;
    let sup = 0;
    for (const r of docs) {
      let garder;
      if (col === "accounts") garder = idsComptes.has(r.id);
      else if (col === "customers") garder = idsFiches.has(r.id);
      else garder = rattache(r.data);
      if (!garder) {
        aSupprimer.push(r);
        sup++;
      }
    }
    compte[col] = { supprime: sup, conserve: docs.length - sup };
  }

  // Historique des cartes : conservé si et seulement si sa carte l'est.
  const cartesConservees = new Set(
    get("subscription_cards")
      .filter((r) => !aSupprimer.some((x) => x.collection === "subscription_cards" && x.id === r.id))
      .map((r) => r.id),
  );
  for (const col of REGISTRES) {
    const docs = get(col);
    if (docs.length === 0) continue;
    let sup = 0;
    for (const r of docs) {
      if (!cartesConservees.has(r.data.cardId)) {
        aSupprimer.push(r);
        sup++;
      }
    }
    compte[col] = { supprime: sup, conserve: docs.length - sup };
  }

  /* ── 3. Rapport ── */

  console.log("\nDonnées client");
  console.log(
    tableau(
      COLLECTIONS_CLIENT.filter((c) => compte[c]).map((c) => [
        c,
        compte[c].supprime,
        compte[c].conserve,
      ]),
    ) || "  (rien)",
  );

  console.log("\nConfiguration — intacte");
  for (const c of COLLECTIONS_CONFIG) {
    const n = get(c).length;
    if (n) console.log(`  ${c.padEnd(20)}  ${String(n).padStart(6)} conservé(s)`);
  }

  const autres = [...parCollection.keys()].filter(
    (c) => !COLLECTIONS_CLIENT.includes(c) && !COLLECTIONS_CONFIG.includes(c),
  );
  if (autres.length) {
    console.log("\nCollections inconnues du script — laissées telles quelles :");
    for (const c of autres) console.log(`  ${c} (${get(c).length})`);
  }

  console.log(`\nTotal à supprimer : ${aSupprimer.length} enregistrement(s).`);

  /* ── 4. Exécution ── */

  if (!DEMANDE_SUPPRESSION) {
    console.log(
      "\nMode inventaire : rien n'a été modifié.\n" +
        "Pour supprimer réellement :\n" +
        "  node scripts/nettoyage-clients.cjs --supprimer --je-confirme\n",
    );
    await pool.end();
    return;
  }

  if (!SUPPRIMER) {
    console.log(
      "\n--supprimer seul ne suffit pas. Ajoute --je-confirme pour exécuter.\n",
    );
    await pool.end();
    return;
  }

  if (aSupprimer.length === 0) {
    console.log("\nRien à supprimer.\n");
    await pool.end();
    return;
  }

  // Sauvegarde intégrale avant toute écriture.
  const horodatage = new Date().toISOString().replace(/[:.]/g, "-");
  const fichier = path.join(
    __dirname,
    `sauvegarde-avant-nettoyage-${horodatage}.json`,
  );
  fs.writeFileSync(
    fichier,
    JSON.stringify(
      { date: new Date().toISOString(), garder: GARDER, documents: rows },
      null,
      2,
    ),
  );
  console.log(`\nSauvegarde complète de la base écrite : ${fichier}`);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const r of aSupprimer) {
      await client.query(
        `DELETE FROM documents WHERE collection = $1 AND id = $2`,
        [r.collection, r.id],
      );
    }
    await client.query("COMMIT");
    console.log(`${aSupprimer.length} enregistrement(s) supprimé(s).\n`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("\nÉchec — aucune suppression appliquée :", e.message, "\n");
    process.exitCode = 1;
  } finally {
    client.release();
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
