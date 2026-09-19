/* eslint-disable */
/**
 * Scénarios critiques des abonnements, exécutés sur un vrai PostgreSQL.
 * Lancement : DATABASE_URL=… node .test-build/run.cjs
 */
const Module = require("module");
const path = require("path");

// `server-only` n'est pas exécutable hors Next : on le neutralise.
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === "server-only") return path.join(__dirname, "noop.cjs");
  return originalResolve.call(this, request, ...rest);
};

const store = require("./out/subscription-store.js");
const types = require("./out/subscription-types.js");
const notif = require("./out/notification-store.js");
const { Pool } = require("pg");

let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    failures.push(name);
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}
function section(t) {
  console.log(`\n── ${t}`);
}

const ADMIN = "stone@stone.be";
const EMP = "employe@stone.be";

async function reset() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(`DROP TABLE IF EXISTS documents`);
  await pool.end();
}

async function makePlan(over = {}) {
  return store.addPlan({
    name: "Carte Premium",
    description: "10 lavages",
    price: 250,
    credits: 10,
    validityDays: 365,
    ...over,
  });
}

async function makeCard(planId, over = {}) {
  const r = await store.assignCard({
    planId,
    holder: {
      accountId: "acc-1",
      name: "Gérald Devestele",
      email: "gerald@example.com",
      phone: "0470 12 34 56",
      plates: ["1-ABC-123"],
    },
    by: ADMIN,
    ...over,
  });
  if (!r.ok) throw new Error(r.error);
  return r.card;
}

const use = (cardId, key, extra = {}) =>
  store.consumeCredit({
    cardId,
    idempotencyKey: key,
    operator: EMP,
    operatorRole: "employe",
    source: "manuel",
    ...extra,
  });

async function main() {
  await reset();

  /* ── 1. Attribution ── */
  section("Attribution d'une carte");
  const plan = await makePlan();
  const card = await makeCard(plan.id);
  let v = await store.getCardView(card.id);
  check("numéro de carte séquentiel", /^SCP-\d{4}-0001$/.test(card.number), card.number);
  check("jeton QR opaque ≠ id", card.qrToken !== card.id && card.qrToken.length >= 30);
  check("solde initial = crédits de la formule", v.remaining === 10, `= ${v.remaining}`);
  check("statut actif", v.status === "active" && v.usable);
  check("instantané commercial figé", v.card.plan.name === "Carte Premium");
  check("création tracée dans le journal", v.adjustments.length === 1 && v.adjustments[0].kind === "creation");

  /* ── 2. Consommation ── */
  section("Consommation d'un lavage");
  const r1 = await use(card.id, "k1");
  v = await store.getCardView(card.id);
  check("consommation acceptée", r1.ok && !r1.duplicate);
  check("solde avant/après renvoyés", r1.before === 10 && r1.after === 9);
  check("solde recalculé = 9", v.remaining === 9);
  check("consommation tracée (opérateur, source)", v.usages[0].operator === EMP && v.usages[0].source === "manuel");

  /* ── 3. Double-clic ── */
  section("Protection contre la double consommation");
  const r2 = await use(card.id, "k1");
  v = await store.getCardView(card.id);
  check("même clé → aucune nouvelle consommation", r2.ok && r2.duplicate === true);
  check("solde inchangé après rejeu", v.remaining === 9, `= ${v.remaining}`);
  check("une seule ligne au registre", v.usages.length === 1);

  /* ── 4. Concurrence ── */
  section("Concurrence — 12 appels simultanés sur 3 lavages restants");
  const plan2 = await makePlan({ name: "Carte Test", credits: 3 });
  const card2 = await makeCard(plan2.id, { holder: { accountId: "acc-2", name: "Test Concurrence", plates: [] } });
  const results = await Promise.all(
    Array.from({ length: 12 }, (_, i) => use(card2.id, `c${i}`)),
  );
  const ok = results.filter((r) => r.ok).length;
  const refus = results.filter((r) => !r.ok).length;
  v = await store.getCardView(card2.id);
  check("exactement 3 consommations acceptées", ok === 3, `ok=${ok} refus=${refus}`);
  check("solde à 0 (jamais négatif)", v.remaining === 0, `= ${v.remaining}`);
  check("registre cohérent (3 lignes)", v.usages.length === 3, `= ${v.usages.length}`);
  check("statut épuisée déduit", v.status === "epuisee");

  /* ── 5. Carte épuisée ── */
  section("Carte épuisée");
  const rEpuise = await use(card2.id, "apres-epuisement");
  check("utilisation refusée", !rEpuise.ok);
  check("message explicite", !rEpuise.ok && /plus de prestation/i.test(rEpuise.error), rEpuise.error);

  /* ── 6. Carte expirée ── */
  section("Carte expirée");
  const plan3 = await makePlan({ name: "Carte Expirée" });
  const hier = new Date(Date.now() - 86400000).toISOString();
  const card3 = await makeCard(plan3.id, {
    holder: { accountId: "acc-3", name: "Client Expiré", plates: [] },
    startAt: new Date(Date.now() - 400 * 86400000).toISOString(),
    expiresAt: hier,
  });
  v = await store.getCardView(card3.id);
  check("statut expirée", v.status === "expiree");
  const rExp = await use(card3.id, "exp");
  check("utilisation refusée", !rExp.ok && /expirée/i.test(rExp.error), rExp.error);

  // Prolongation par l'admin → redevient utilisable
  const demain = new Date(Date.now() + 30 * 86400000).toISOString();
  await store.setExpiry({ cardId: card3.id, expiresAt: demain, by: ADMIN, reason: "Geste commercial" });
  v = await store.getCardView(card3.id);
  check("prolongation → carte réutilisable", v.usable && v.status === "active");
  check("prolongation tracée", v.adjustments.some((a) => a.kind === "expiration"));

  /* ── 7. Statuts ── */
  section("Statuts suspendue / annulée / brouillon");
  for (const st of ["suspendue", "annulee", "brouillon"]) {
    await store.setCardStatus({ cardId: card3.id, status: st, by: ADMIN, reason: "Test" });
    const res = await use(card3.id, `st-${st}`);
    check(`statut ${st} → utilisation refusée`, !res.ok, res.ok ? "acceptée !" : res.error);
  }
  await store.setCardStatus({ cardId: card3.id, status: "active", by: ADMIN, reason: "Réactivation" });
  check("réactivation possible", (await store.getCardView(card3.id)).usable);

  /* ── 8. Annulation d'un tampon ── */
  section("Annulation d'un tampon");
  const usageId = (await store.getCardView(card.id)).usages[0].id;
  const badReason = await store.cancelUsage({ cardId: card.id, usageId, by: ADMIN, reason: "  " });
  check("raison obligatoire", !badReason.ok);
  const cancelled = await store.cancelUsage({ cardId: card.id, usageId, by: ADMIN, reason: "Erreur de manipulation" });
  v = await store.getCardView(card.id);
  check("annulation acceptée", cancelled.ok);
  check("solde remonté à 10", v.remaining === 10, `= ${v.remaining}`);
  check("consommation conservée en base", v.usages.length === 1 && v.usages[0].cancelled === true);
  check("auteur et raison enregistrés", v.usages[0].cancelledBy === ADMIN && v.usages[0].cancelReason === "Erreur de manipulation");
  check("opération d'annulation au journal", v.adjustments.some((a) => a.kind === "annulation_consommation" && a.usageId === usageId));
  const twice = await store.cancelUsage({ cardId: card.id, usageId, by: ADMIN, reason: "Encore" });
  check("double annulation refusée", !twice.ok);

  /* ── 9. Correction de crédits ── */
  section("Correction du nombre de prestations");
  await store.adjustCredits({ cardId: card.id, delta: 2, by: ADMIN, reason: "Bonus fidélité" });
  v = await store.getCardView(card.id);
  check("+2 prestations", v.creditsTotal === 12 && v.remaining === 12, `total=${v.creditsTotal} reste=${v.remaining}`);
  await store.adjustCredits({ cardId: card.id, delta: -3, by: ADMIN, reason: "Correction saisie" });
  v = await store.getCardView(card.id);
  check("-3 prestations", v.creditsTotal === 9 && v.remaining === 9, `total=${v.creditsTotal}`);
  const noReason = await store.adjustCredits({ cardId: card.id, delta: 1, by: ADMIN, reason: "" });
  check("raison obligatoire", !noReason.ok);
  const zero = await store.adjustCredits({ cardId: card.id, delta: 0, by: ADMIN, reason: "x" });
  check("delta nul refusé", !zero.ok);

  /* ── 10. Recalcul auditable ── */
  section("Le solde est recalculable depuis le registre");
  await use(card.id, "audit-1");
  await use(card.id, "audit-2");
  v = await store.getCardView(card.id);
  const recompute =
    v.card.creditsInitial +
    v.adjustments.reduce((s, a) => s + a.delta, 0) -
    v.usages.filter((u) => !u.cancelled).length;
  check("solde = initial + Σ ajustements − consommations actives", recompute === v.remaining, `${recompute} vs ${v.remaining}`);
  check("aucune ligne supprimée", v.usages.length === 3);

  /* ── 11. Prestation couverte ── */
  section("Prestations couvertes");
  const planSvc = await makePlan({ name: "Carte Extérieur", serviceIds: ["svc-ext"] });
  const cardSvc = await makeCard(planSvc.id, { holder: { accountId: "acc-4", name: "Client Svc", plates: [] } });
  const bad = await use(cardSvc.id, "svc-bad", { serviceId: "svc-polissage" });
  check("prestation hors abonnement refusée", !bad.ok, bad.error);
  const good = await use(cardSvc.id, "svc-ok", { serviceId: "svc-ext" });
  check("prestation couverte acceptée", good.ok);

  /* ── 12. QR code ── */
  section("QR code");
  const byToken = await store.getCardByToken(card.qrToken);
  check("résolution par jeton", byToken && byToken.id === card.id);
  const rot = await store.rotateQrToken({ cardId: card.id, by: ADMIN });
  check("régénération du jeton", rot.ok && rot.token !== card.qrToken);
  const oldToken = await store.getCardByToken(card.qrToken);
  check("ancien jeton invalide", oldToken === null);
  check("jeton inconnu → null", (await store.getCardByToken("nimporte-quoi")) === null);

  /* ── 13. Recherche ── */
  section("Recherche");
  const all = await store.getAllCardViews();
  check("recherche par plaque", store.searchCardViews(all, "1-abc-123").length === 1);
  check("recherche par téléphone (espaces ignorés)", store.searchCardViews(all, "0470123456").length === 1);
  check("recherche par numéro de carte", store.searchCardViews(all, card.number).length === 1);
  check("recherche par nom (accents ignorés)", store.searchCardViews(all, "gerald").length === 1);
  check("recherche vide → tout", store.searchCardViews(all, "").length === all.length);

  /* ── 14. Statistiques ── */
  section("Statistiques");
  const stats = await store.getSubscriptionStats();
  check("cartes actives comptées", stats.activeCards >= 1);
  check("CA calculé sur les cartes payées", typeof stats.revenue === "number");
  check("lavages consommés ce mois", stats.usedThisMonth >= 3, `= ${stats.usedThisMonth}`);
  check("cartes épuisées listées", stats.exhausted.length >= 1);
  check("classement des formules", stats.topPlans.length >= 1);

  /* ── 15. Notifications ── */
  section("Notifications (dédoublonnage)");
  const n1 = await notif.notify({
    event: "abonnement.consommation",
    dedupeKey: "test-notif-1",
    title: "Test",
    body: "Corps",
    accountId: "acc-1",
  });
  const n2 = await notif.notify({
    event: "abonnement.consommation",
    dedupeKey: "test-notif-1",
    title: "Test",
    body: "Corps",
    accountId: "acc-1",
  });
  check("première notification créée", !!n1);
  check("doublon ignoré", n2 === null);
  const list = await notif.getNotificationsForAccount("acc-1");
  check("notification visible dans l'espace client", list.length === 1);

  /* ── 16. Formules ── */
  section("Formules d'abonnement");
  const del = await store.deletePlan(plan.id);
  check("formule utilisée → désactivée, pas supprimée", del.deactivated === true && del.deleted === false);
  const orphan = await store.addPlan({ name: "Sans carte" });
  const del2 = await store.deletePlan(orphan.id);
  check("formule sans carte → supprimée", del2.deleted === true);
  const plansLeft = await store.getPlans();
  check("cartes existantes toujours lisibles", (await store.getCardView(card.id)) !== null);
  check("formule désactivée conservée", plansLeft.some((p) => p.id === plan.id && p.active === false));

  /* ── Résultat ── */
  console.log(
    `\n${failed === 0 ? "✓" : "✗"} ${passed} réussis, ${failed} échoués` +
      (failed ? `\n   ${failures.join("\n   ")}` : ""),
  );
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("ERREUR", e);
  process.exit(1);
});
