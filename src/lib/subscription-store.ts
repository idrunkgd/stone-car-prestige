import "server-only";
import { createHash, randomBytes } from "crypto";
import {
  countDocs,
  getDoc,
  listDocs,
  listDocsBy,
  putDoc,
  replaceCollection,
  withTransaction,
} from "./db";
import {
  computeCardView,
  defaultExpiry,
  EXPIRY_WARNING_DAYS,
  LOW_BALANCE_THRESHOLD,
  type AdjustmentKind,
  type CardHolder,
  type CardView,
  type PlanSnapshot,
  type StaffRole,
  type StoredCardStatus,
  type SubscriptionAdjustment,
  type SubscriptionCard,
  type SubscriptionPlan,
  type SubscriptionUsage,
  type UsageSource,
} from "./subscription-types";

/**
 * Abonnements — accès aux données et règles métier.
 *
 * Quatre collections dans la table `documents` :
 *   subscription_plans        définition commerciale des abonnements
 *   subscription_cards        carte réellement attribuée à un client
 *   subscription_usages       historique des consommations (registre)
 *   subscription_adjustments  corrections administratives (registre)
 *
 * Rien n'est jamais supprimé des deux registres : une annulation neutralise
 * la consommation et crée une opération d'annulation datée et signée.
 * Le solde est toujours recalculé depuis ces registres (voir computeCardView).
 */

const PLANS = "subscription_plans";
const CARDS = "subscription_cards";
const USAGES = "subscription_usages";
const ADJUSTMENTS = "subscription_adjustments";

/* ══════════════════════════════ Formules ══════════════════════════════ */

export async function getPlans(): Promise<SubscriptionPlan[]> {
  const list = await listDocs<SubscriptionPlan>(PLANS);
  return list.sort((a, b) => a.order - b.order);
}

export async function getActivePlans(): Promise<SubscriptionPlan[]> {
  return (await getPlans()).filter((p) => p.active);
}

export async function getPlan(id: string): Promise<SubscriptionPlan | null> {
  return getDoc<SubscriptionPlan>(PLANS, id);
}

export async function addPlan(
  input: Partial<SubscriptionPlan> & { name: string },
): Promise<SubscriptionPlan> {
  const list = await getPlans();
  const now = new Date().toISOString();
  const plan: SubscriptionPlan = {
    id: crypto.randomUUID(),
    name: input.name.trim() || "Nouvelle carte",
    description: input.description ?? "",
    price: input.price ?? 0,
    credits: input.credits ?? 10,
    kind: input.kind ?? "credits",
    serviceIds: input.serviceIds ?? [],
    validityDays: input.validityDays ?? 365,
    active: input.active ?? true,
    order: Math.max(0, ...list.map((p) => p.order)) + 1,
    theme: input.theme ?? "or",
    imageUrl: input.imageUrl,
    conditions: input.conditions,
    renewal: input.renewal ?? "aucun",
    createdAt: now,
    updatedAt: now,
  };
  await putDoc(PLANS, plan.id, plan);
  return plan;
}

export async function updatePlan(
  id: string,
  patch: Partial<SubscriptionPlan>,
): Promise<void> {
  const current = await getPlan(id);
  if (!current) return;
  await putDoc(PLANS, id, {
    ...current,
    ...patch,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Supprime une formule. Si des cartes y font référence, elle est seulement
 * désactivée : les cartes déjà attribuées conservent leur instantané
 * commercial et doivent rester consultables.
 */
export async function deletePlan(
  id: string,
): Promise<{ deleted: boolean; deactivated: boolean }> {
  const cards = await listDocsBy<SubscriptionCard>(CARDS, "planId", id);
  if (cards.length > 0) {
    await updatePlan(id, { active: false });
    return { deleted: false, deactivated: true };
  }
  const list = (await getPlans()).filter((p) => p.id !== id);
  await replaceCollection(PLANS, list);
  return { deleted: true, deactivated: false };
}

export async function reorderPlans(ids: string[]): Promise<void> {
  const list = await getPlans();
  const next = list.map((p) => {
    const i = ids.indexOf(p.id);
    return i === -1 ? p : { ...p, order: i + 1 };
  });
  await replaceCollection(PLANS, next);
}

/* ═══════════════════════════════ Cartes ═══════════════════════════════ */

function snapshotOf(plan: SubscriptionPlan): PlanSnapshot {
  return {
    name: plan.name,
    description: plan.description,
    price: plan.price,
    credits: plan.credits,
    kind: plan.kind,
    serviceIds: [...plan.serviceIds],
    validityDays: plan.validityDays,
    theme: plan.theme,
    imageUrl: plan.imageUrl,
    conditions: plan.conditions,
  };
}

async function nextCardNumber(): Promise<string> {
  const n = await countDocs(CARDS);
  const year = new Date().getFullYear();
  return `SCP-${year}-${String(n + 1).padStart(4, "0")}`;
}

/** Jeton du QR code : aléatoire, opaque, sans lien avec l'id de la carte. */
function newQrToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function getCards(): Promise<SubscriptionCard[]> {
  return listDocs<SubscriptionCard>(CARDS);
}

export async function getCard(id: string): Promise<SubscriptionCard | null> {
  return getDoc<SubscriptionCard>(CARDS, id);
}

export async function getCardByToken(
  token: string,
): Promise<SubscriptionCard | null> {
  if (!token) return null;
  const found = await listDocsBy<SubscriptionCard>(CARDS, "qrToken", token);
  return found[0] ?? null;
}

async function ledgerFor(cardId: string) {
  const [usages, adjustments] = await Promise.all([
    listDocsBy<SubscriptionUsage>(USAGES, "cardId", cardId),
    listDocsBy<SubscriptionAdjustment>(ADJUSTMENTS, "cardId", cardId),
  ]);
  return { usages, adjustments };
}

/** Vue complète (solde recalculé, statut réel, historique) d'une carte. */
export async function getCardView(id: string): Promise<CardView | null> {
  const card = await getCard(id);
  if (!card) return null;
  const { usages, adjustments } = await ledgerFor(id);
  return computeCardView({ card, usages, adjustments });
}

export async function getCardViewByToken(
  token: string,
): Promise<CardView | null> {
  const card = await getCardByToken(token);
  return card ? getCardView(card.id) : null;
}

/** Toutes les cartes avec leur solde — une seule lecture par collection. */
export async function getAllCardViews(): Promise<CardView[]> {
  const [cards, usages, adjustments] = await Promise.all([
    getCards(),
    listDocs<SubscriptionUsage>(USAGES),
    listDocs<SubscriptionAdjustment>(ADJUSTMENTS),
  ]);
  const byCardU = new Map<string, SubscriptionUsage[]>();
  for (const u of usages) {
    const arr = byCardU.get(u.cardId) ?? [];
    arr.push(u);
    byCardU.set(u.cardId, arr);
  }
  const byCardA = new Map<string, SubscriptionAdjustment[]>();
  for (const a of adjustments) {
    const arr = byCardA.get(a.cardId) ?? [];
    arr.push(a);
    byCardA.set(a.cardId, arr);
  }
  return cards
    .map((card) =>
      computeCardView({
        card,
        usages: byCardU.get(card.id) ?? [],
        adjustments: byCardA.get(card.id) ?? [],
      }),
    )
    .sort((a, b) => (a.card.createdAt < b.card.createdAt ? 1 : -1));
}

/** Cartes d'un client de l'espace personnel. */
export async function getCardViewsForAccount(
  accountId: string,
): Promise<CardView[]> {
  const all = await getAllCardViews();
  return all.filter((v) => v.card.holder.accountId === accountId);
}

/** Carte utilisable la plus pertinente pour un compte (solde le plus proche de l'expiration). */
export async function getUsableCardForAccount(
  accountId: string,
  serviceIds: string[] = [],
): Promise<CardView | null> {
  const mine = (await getCardViewsForAccount(accountId)).filter(
    (v) => v.usable && coversServices(v, serviceIds),
  );
  mine.sort((a, b) => a.daysLeft - b.daysLeft);
  return mine[0] ?? null;
}

/** La carte couvre-t-elle les prestations demandées ? (liste vide = toutes). */
export function coversServices(view: CardView, serviceIds: string[]): boolean {
  const allowed = view.card.plan.serviceIds;
  if (allowed.length === 0) return true;
  if (serviceIds.length === 0) return true;
  return serviceIds.some((id) => allowed.includes(id));
}

/* ───────────────────────────── Attribution ───────────────────────────── */

export type AssignInput = {
  planId: string;
  holder: CardHolder;
  /** Date de début (ISO). Défaut : maintenant. */
  startAt?: string;
  /** Expiration (ISO). Défaut : début + durée de validité de la formule. */
  expiresAt?: string;
  /** Crédits attribués si différent de la formule (cas exceptionnel). */
  credits?: number;
  paid?: boolean;
  pricePaid?: number;
  status?: StoredCardStatus;
  notes?: string;
  by: string;
};

export async function assignCard(
  input: AssignInput,
): Promise<{ ok: true; card: SubscriptionCard } | { ok: false; error: string }> {
  const plan = await getPlan(input.planId);
  if (!plan) return { ok: false, error: "Formule d'abonnement introuvable." };
  if (!input.holder.name?.trim())
    return { ok: false, error: "Sélectionnez un client." };

  const now = new Date().toISOString();
  const startAt = input.startAt || now;
  const snapshot = snapshotOf(plan);
  const credits =
    input.credits != null && input.credits >= 0 ? input.credits : plan.credits;

  const card: SubscriptionCard = {
    id: crypto.randomUUID(),
    number: await nextCardNumber(),
    planId: plan.id,
    plan: snapshot,
    holder: {
      ...input.holder,
      name: input.holder.name.trim(),
      plates: (input.holder.plates ?? []).map((p) => p.toUpperCase()),
    },
    status: input.status ?? "active",
    creditsInitial: credits,
    startAt,
    expiresAt: input.expiresAt || defaultExpiry(startAt, plan.validityDays),
    paid: input.paid ?? false,
    paidAt: input.paid ? now : undefined,
    pricePaid: input.pricePaid ?? plan.price,
    qrToken: newQrToken(),
    notes: input.notes,
    createdAt: now,
    createdBy: input.by,
    updatedAt: now,
  };

  await putDoc(CARDS, card.id, card);
  await writeAdjustment({
    cardId: card.id,
    by: input.by,
    kind: "creation",
    reason: `Carte ${snapshot.name} attribuée à ${card.holder.name}`,
    delta: 0,
    after: `${credits} prestation(s), valable jusqu'au ${card.expiresAt.slice(0, 10)}`,
  });

  return { ok: true, card };
}

/* ─────────────────────────── Registre : écriture ─────────────────────── */

async function writeAdjustment(input: {
  cardId: string;
  by: string;
  kind: AdjustmentKind;
  reason: string;
  delta: number;
  usageId?: string;
  before?: string;
  after?: string;
}): Promise<SubscriptionAdjustment> {
  const adj: SubscriptionAdjustment = {
    id: crypto.randomUUID(),
    cardId: input.cardId,
    at: new Date().toISOString(),
    by: input.by,
    kind: input.kind,
    reason: input.reason,
    delta: input.delta,
    usageId: input.usageId,
    before: input.before,
    after: input.after,
  };
  await putDoc(ADJUSTMENTS, adj.id, adj);
  return adj;
}

/* ══════════════════════ Consommation d'un lavage ══════════════════════ */

export type ConsumeInput = {
  cardId: string;
  /**
   * Clé d'idempotence : deux appels avec la même clé ne décomptent qu'une
   * seule prestation (double-clic, rafraîchissement de page, retour arrière).
   */
  idempotencyKey: string;
  operator: string;
  operatorRole: StaffRole;
  source: UsageSource;
  serviceId?: string;
  serviceLabel?: string;
  interventionId?: string;
  requestId?: string;
};

export type ConsumeResult =
  | {
      ok: true;
      duplicate: boolean;
      usage: SubscriptionUsage;
      before: number;
      after: number;
    }
  | { ok: false; error: string };

/** Identifiant déterministe : la clé d'idempotence EST la clé primaire. */
function usageIdFor(cardId: string, key: string): string {
  return createHash("sha256").update(`${cardId}::${key}`).digest("hex").slice(0, 32);
}

/**
 * Décompte une prestation. Entièrement transactionnel :
 *   1. verrou exclusif sur la carte (sérialise les appels concurrents) ;
 *   2. relecture du registre et recalcul du solde DANS la transaction ;
 *   3. contrôles serveur (statut, expiration, solde, prestation couverte) ;
 *   4. insertion idempotente de la consommation.
 *
 * Aucun contrôle n'est fait côté navigateur : le client ne peut jamais
 * ajouter ni retirer un tampon lui-même.
 */
export async function consumeCredit(
  input: ConsumeInput,
): Promise<ConsumeResult> {
  const usageId = usageIdFor(input.cardId, input.idempotencyKey);

  const result = await withTransaction<ConsumeResult>(async (tx) => {
    await tx.lock(`scp:subscription:${input.cardId}`);

    const card = await tx.get<SubscriptionCard>(CARDS, input.cardId);
    if (!card) return { ok: false, error: "Carte introuvable." };

    const usages = await tx.listBy<SubscriptionUsage>(
      USAGES,
      "cardId",
      input.cardId,
    );
    const adjustments = await tx.listBy<SubscriptionAdjustment>(
      ADJUSTMENTS,
      "cardId",
      input.cardId,
    );
    const view = computeCardView({ card, usages, adjustments });

    // Rejoue d'un appel déjà traité → on renvoie le même résultat.
    const already = usages.find(
      (u) => u.id === usageId || u.idempotencyKey === input.idempotencyKey,
    );
    if (already) {
      return {
        ok: true,
        duplicate: true,
        usage: already,
        before: view.remaining,
        after: view.remaining,
      };
    }

    if (!view.usable) {
      return { ok: false, error: view.blockedReason ?? "Carte inutilisable." };
    }
    if (
      input.serviceId &&
      card.plan.serviceIds.length > 0 &&
      !card.plan.serviceIds.includes(input.serviceId)
    ) {
      return {
        ok: false,
        error: "Cette prestation n'est pas couverte par l'abonnement.",
      };
    }

    const usage: SubscriptionUsage = {
      id: usageId,
      cardId: card.id,
      usedAt: new Date().toISOString(),
      amount: 1,
      serviceId: input.serviceId,
      serviceLabel: input.serviceLabel,
      operator: input.operator,
      operatorRole: input.operatorRole,
      source: input.source,
      interventionId: input.interventionId,
      requestId: input.requestId,
      idempotencyKey: input.idempotencyKey,
      cancelled: false,
    };

    const inserted = await tx.insertIfAbsent(USAGES, usage.id, usage);
    if (!inserted) {
      const existing = await tx.get<SubscriptionUsage>(USAGES, usage.id);
      return {
        ok: true,
        duplicate: true,
        usage: existing ?? usage,
        before: view.remaining,
        after: view.remaining,
      };
    }

    await tx.patch<SubscriptionCard>(CARDS, card.id, {
      updatedAt: usage.usedAt,
    });

    return {
      ok: true,
      duplicate: false,
      usage,
      before: view.remaining,
      after: view.remaining - 1,
    };
  });

  if (result === null) {
    return { ok: false, error: "Base de données indisponible." };
  }
  return result;
}

/* ═══════════════════ Annulation / corrections (admin) ═════════════════ */

/**
 * Annule un tampon. La consommation n'est jamais supprimée : elle est marquée
 * annulée et une opération d'annulation est écrite (date, administrateur,
 * raison, consommation concernée).
 */
export async function cancelUsage(input: {
  cardId: string;
  usageId: string;
  by: string;
  reason: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.reason.trim())
    return { ok: false, error: "Indiquez la raison de l'annulation." };

  const result = await withTransaction<{ ok: true } | { ok: false; error: string }>(
    async (tx) => {
      await tx.lock(`scp:subscription:${input.cardId}`);
      const usage = await tx.get<SubscriptionUsage>(USAGES, input.usageId);
      if (!usage || usage.cardId !== input.cardId)
        return { ok: false, error: "Consommation introuvable." };
      if (usage.cancelled)
        return { ok: false, error: "Cette consommation est déjà annulée." };

      const at = new Date().toISOString();
      await tx.patch<SubscriptionUsage>(USAGES, usage.id, {
        cancelled: true,
        cancelledAt: at,
        cancelledBy: input.by,
        cancelReason: input.reason.trim(),
      });

      const adj: SubscriptionAdjustment = {
        id: crypto.randomUUID(),
        cardId: input.cardId,
        at,
        by: input.by,
        kind: "annulation_consommation",
        reason: input.reason.trim(),
        delta: 0, // le solde remonte car la consommation n'est plus comptée
        usageId: usage.id,
        before: `Consommé le ${usage.usedAt.slice(0, 10)} par ${usage.operator}`,
        after: "Tampon annulé",
      };
      await tx.put(ADJUSTMENTS, adj.id, adj);
      return { ok: true };
    },
  );

  return result ?? { ok: false, error: "Base de données indisponible." };
}

/** Ajoute ou retire des prestations (bonus, geste commercial, correction). */
export async function adjustCredits(input: {
  cardId: string;
  delta: number;
  by: string;
  reason: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!Number.isFinite(input.delta) || input.delta === 0)
    return { ok: false, error: "Indiquez un nombre différent de zéro." };
  if (!input.reason.trim())
    return { ok: false, error: "Indiquez la raison de la correction." };

  const view = await getCardView(input.cardId);
  if (!view) return { ok: false, error: "Carte introuvable." };

  await writeAdjustment({
    cardId: input.cardId,
    by: input.by,
    kind: "credits",
    reason: input.reason.trim(),
    delta: Math.trunc(input.delta),
    before: `${view.creditsTotal} prestation(s) au total`,
    after: `${view.creditsTotal + Math.trunc(input.delta)} prestation(s) au total`,
  });
  return { ok: true };
}

export async function setExpiry(input: {
  cardId: string;
  expiresAt: string;
  by: string;
  reason: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const card = await getCard(input.cardId);
  if (!card) return { ok: false, error: "Carte introuvable." };
  const d = new Date(input.expiresAt);
  if (Number.isNaN(d.getTime())) return { ok: false, error: "Date invalide." };

  await putDoc(CARDS, card.id, {
    ...card,
    expiresAt: d.toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await writeAdjustment({
    cardId: card.id,
    by: input.by,
    kind: "expiration",
    reason: input.reason.trim() || "Modification de la date d'expiration",
    delta: 0,
    before: card.expiresAt.slice(0, 10),
    after: d.toISOString().slice(0, 10),
  });
  return { ok: true };
}

export async function setCardStatus(input: {
  cardId: string;
  status: StoredCardStatus;
  by: string;
  reason: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const card = await getCard(input.cardId);
  if (!card) return { ok: false, error: "Carte introuvable." };
  if (card.status === input.status) return { ok: true };

  await putDoc(CARDS, card.id, {
    ...card,
    status: input.status,
    updatedAt: new Date().toISOString(),
  });
  await writeAdjustment({
    cardId: card.id,
    by: input.by,
    kind: "statut",
    reason: input.reason.trim() || "Changement de statut",
    delta: 0,
    before: card.status,
    after: input.status,
  });
  return { ok: true };
}

export async function setCardPaid(input: {
  cardId: string;
  paid: boolean;
  pricePaid?: number;
  by: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const card = await getCard(input.cardId);
  if (!card) return { ok: false, error: "Carte introuvable." };
  const now = new Date().toISOString();

  await putDoc(CARDS, card.id, {
    ...card,
    paid: input.paid,
    paidAt: input.paid ? (card.paidAt ?? now) : undefined,
    pricePaid: input.pricePaid ?? card.pricePaid,
    updatedAt: now,
  });
  await writeAdjustment({
    cardId: card.id,
    by: input.by,
    kind: "paiement",
    reason: input.paid ? "Carte marquée payée" : "Carte marquée impayée",
    delta: 0,
    before: card.paid ? "payée" : "impayée",
    after: input.paid ? "payée" : "impayée",
  });
  return { ok: true };
}

/** Rattache la carte à un compte de l'espace client (ou met à jour le bénéficiaire). */
export async function updateHolder(input: {
  cardId: string;
  holder: Partial<CardHolder>;
  by: string;
  reason?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const card = await getCard(input.cardId);
  if (!card) return { ok: false, error: "Carte introuvable." };
  const holder: CardHolder = {
    ...card.holder,
    ...input.holder,
    plates: (input.holder.plates ?? card.holder.plates).map((p) =>
      p.toUpperCase(),
    ),
  };
  await putDoc(CARDS, card.id, {
    ...card,
    holder,
    updatedAt: new Date().toISOString(),
  });
  await writeAdjustment({
    cardId: card.id,
    by: input.by,
    kind: "beneficiaire",
    reason: input.reason?.trim() || "Mise à jour du bénéficiaire",
    delta: 0,
    before: card.holder.name,
    after: holder.name,
  });
  return { ok: true };
}

/** Régénère le jeton du QR code (carte perdue, QR diffusé par erreur). */
export async function rotateQrToken(input: {
  cardId: string;
  by: string;
}): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const card = await getCard(input.cardId);
  if (!card) return { ok: false, error: "Carte introuvable." };
  const token = newQrToken();
  await putDoc(CARDS, card.id, {
    ...card,
    qrToken: token,
    updatedAt: new Date().toISOString(),
  });
  await writeAdjustment({
    cardId: card.id,
    by: input.by,
    kind: "statut",
    reason: "Régénération du QR code",
    delta: 0,
  });
  return { ok: true, token };
}

/* ══════════════════════════ Recherche & stats ═════════════════════════ */

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[\s.-]/g, "");
}

/** Recherche par client, téléphone, email, plaque ou numéro de carte. */
export function searchCardViews(views: CardView[], query: string): CardView[] {
  const q = norm(query);
  if (!q) return views;
  return views.filter((v) => {
    const h = v.card.holder;
    const hay = [
      v.card.number,
      h.name,
      h.phone ?? "",
      h.email ?? "",
      ...(h.plates ?? []),
      v.card.plan.name,
    ]
      .map(norm)
      .join("|");
    return hay.includes(q);
  });
}

export type SubscriptionStats = {
  activeCards: number;
  totalCards: number;
  revenue: number;
  unpaid: number;
  creditsOutstanding: number;
  usedThisMonth: number;
  expiringSoon: CardView[];
  exhausted: CardView[];
  topPlans: { name: string; cards: number; revenue: number }[];
};

export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  const [views, usages] = await Promise.all([
    getAllCardViews(),
    listDocs<SubscriptionUsage>(USAGES),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const live = views.filter((v) => v.status === "active");
  const revenue = views
    .filter((v) => v.card.paid && v.card.status !== "annulee")
    .reduce((s, v) => s + (v.card.pricePaid || 0), 0);
  const unpaid = views
    .filter((v) => !v.card.paid && v.card.status !== "annulee")
    .reduce((s, v) => s + (v.card.pricePaid || 0), 0);

  const creditsOutstanding = live.reduce(
    (s, v) => s + (v.unlimited ? 0 : v.remaining),
    0,
  );
  const usedThisMonth = usages.filter(
    (u) => !u.cancelled && u.usedAt >= monthStart,
  ).length;

  const expiringSoon = live
    .filter((v) => v.daysLeft <= EXPIRY_WARNING_DAYS && v.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const exhausted = views.filter((v) => v.status === "epuisee");

  const byPlan = new Map<string, { cards: number; revenue: number }>();
  for (const v of views) {
    if (v.card.status === "annulee") continue;
    const cur = byPlan.get(v.card.plan.name) ?? { cards: 0, revenue: 0 };
    cur.cards += 1;
    cur.revenue += v.card.paid ? v.card.pricePaid || 0 : 0;
    byPlan.set(v.card.plan.name, cur);
  }
  const topPlans = [...byPlan.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.cards - a.cards || b.revenue - a.revenue)
    .slice(0, 6);

  return {
    activeCards: live.length,
    totalCards: views.filter((v) => v.card.status !== "annulee").length,
    revenue,
    unpaid,
    creditsOutstanding,
    usedThisMonth,
    expiringSoon,
    exhausted,
    topPlans,
  };
}

/** Cartes dont le solde est faible (pour les relances). */
export function lowBalanceCards(views: CardView[]): CardView[] {
  return views.filter(
    (v) =>
      v.status === "active" &&
      !v.unlimited &&
      v.remaining > 0 &&
      v.remaining <= LOW_BALANCE_THRESHOLD,
  );
}
