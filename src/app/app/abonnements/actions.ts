"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin, assertStaff } from "@/lib/admin-auth";
import { notify } from "@/lib/notification-store";
import {
  addPlan,
  adjustCredits,
  assignCard,
  cancelUsage,
  consumeCredit,
  deletePlan,
  getCard,
  getCardView,
  rotateQrToken,
  setCardPaid,
  setCardStatus,
  setExpiry,
  updateHolder,
  updatePlan,
} from "@/lib/subscription-store";
import {
  LOW_BALANCE_THRESHOLD,
  type CardHolder,
  type StoredCardStatus,
  type SubscriptionPlan,
  type UsageSource,
} from "@/lib/subscription-types";

/**
 * Server Actions des abonnements.
 *
 * Règle de sécurité : toute vérification (droits, solde, expiration, statut)
 * est faite ici, côté serveur. Les composants client ne font qu'afficher et
 * envoyer une intention ; ils ne peuvent jamais modifier une carte.
 */

function refreshCard(cardId?: string) {
  revalidatePath("/app/abonnements");
  revalidatePath("/app/abonnements/plans");
  if (cardId) revalidatePath(`/app/abonnements/${cardId}`);
  revalidatePath("/compte");
  revalidatePath("/compte/abonnements");
}

function fail(e: unknown) {
  return { error: e instanceof Error ? e.message : "Action impossible." };
}

/* ─────────────────────────── Formules (admin) ─────────────────────────── */

export async function createPlanAction(name: string) {
  try {
    await assertAdmin();
    const plan = await addPlan({ name: name?.trim() || "Nouvelle carte" });
    refreshCard();
    return { ok: true as const, id: plan.id };
  } catch (e) {
    return fail(e);
  }
}

export async function updatePlanAction(
  id: string,
  patch: Partial<SubscriptionPlan>,
) {
  try {
    await assertAdmin();
    await updatePlan(id, patch);
    refreshCard();
    return { ok: true as const };
  } catch (e) {
    return fail(e);
  }
}

export async function deletePlanAction(id: string) {
  try {
    await assertAdmin();
    const r = await deletePlan(id);
    refreshCard();
    return { ok: true as const, ...r };
  } catch (e) {
    return fail(e);
  }
}

/* ────────────────────────── Attribution (admin) ───────────────────────── */

export async function assignCardAction(input: {
  planId: string;
  holder: CardHolder;
  startAt?: string;
  expiresAt?: string;
  credits?: number;
  paid?: boolean;
  pricePaid?: number;
  status?: StoredCardStatus;
  notes?: string;
}) {
  try {
    const by = await assertAdmin();
    const r = await assignCard({ ...input, by });
    if (!r.ok) return { error: r.error };

    const view = await getCardView(r.card.id);
    if (view && r.card.holder.email) {
      await notify({
        event: "abonnement.attribue",
        dedupeKey: `attribue:${r.card.id}`,
        title: `Votre carte ${r.card.plan.name} est active`,
        body:
          `Bonjour ${r.card.holder.name},\n\n` +
          `Votre carte ${r.card.plan.name} (${r.card.number}) vous donne droit à ` +
          `${r.card.creditsInitial} prestation(s), valables jusqu'au ` +
          `${r.card.expiresAt.slice(0, 10)}.\n\n` +
          `Retrouvez-la à tout moment dans votre espace client.\n\n` +
          `Stone Car Prestige`,
        accountId: r.card.holder.accountId,
        email: r.card.holder.email,
        href: "/compte/abonnements",
        cardId: r.card.id,
      });
    }

    refreshCard(r.card.id);
    return { ok: true as const, id: r.card.id };
  } catch (e) {
    return fail(e);
  }
}

/* ─────────────────── Utilisation d'un lavage (personnel) ──────────────── */

export async function useWashAction(input: {
  cardId: string;
  /** Clé générée par le client au moment d'ouvrir la confirmation. */
  idempotencyKey: string;
  serviceId?: string;
  serviceLabel?: string;
  interventionId?: string;
  requestId?: string;
  source?: UsageSource;
}) {
  try {
    const { email, role } = await assertStaff();

    const result = await consumeCredit({
      cardId: input.cardId,
      idempotencyKey: input.idempotencyKey,
      operator: email,
      operatorRole: role,
      source: input.source ?? "manuel",
      serviceId: input.serviceId,
      serviceLabel: input.serviceLabel,
      interventionId: input.interventionId,
      requestId: input.requestId,
    });

    if (!result.ok) return { error: result.error };

    const card = await getCard(input.cardId);
    if (card?.holder.email && !result.duplicate) {
      const left = result.after;
      await notify({
        event: "abonnement.consommation",
        dedupeKey: `usage:${result.usage.id}`,
        title: "Votre lavage a bien été décompté",
        body:
          `Bonjour ${card.holder.name},\n\n` +
          `Votre lavage a bien été décompté. Il vous reste ${left} ` +
          `prestation(s) sur votre carte ${card.plan.name}.\n\n` +
          `Stone Car Prestige`,
        accountId: card.holder.accountId,
        email: card.holder.email,
        href: "/compte/abonnements",
        cardId: card.id,
      });

      if (left === 0) {
        await notify({
          event: "abonnement.epuise",
          dedupeKey: `epuise:${card.id}:${result.usage.id}`,
          title: `Votre carte ${card.plan.name} est épuisée`,
          body:
            `Bonjour ${card.holder.name},\n\n` +
            `Vous venez d'utiliser la dernière prestation de votre carte ` +
            `${card.plan.name}. Nous serions ravis de vous en proposer une nouvelle.\n\n` +
            `Stone Car Prestige`,
          accountId: card.holder.accountId,
          email: card.holder.email,
          cardId: card.id,
        });
      } else if (left > 0 && left <= LOW_BALANCE_THRESHOLD) {
        await notify({
          event: "abonnement.bientot_epuise",
          dedupeKey: `bas:${card.id}:${left}`,
          title: `Plus que ${left} lavage(s) sur votre carte`,
          body:
            `Bonjour ${card.holder.name},\n\n` +
            `Il ne vous reste plus que ${left} prestation(s) sur votre carte ` +
            `${card.plan.name}.\n\n` +
            `Stone Car Prestige`,
          accountId: card.holder.accountId,
          email: card.holder.email,
          cardId: card.id,
        });
      }
    }

    refreshCard(input.cardId);
    if (input.interventionId) {
      revalidatePath(`/app/checkout/${input.interventionId}`);
      revalidatePath(`/app/intervention/${input.interventionId}`);
    }

    return {
      ok: true as const,
      duplicate: result.duplicate,
      before: result.before,
      after: result.after,
    };
  } catch (e) {
    return fail(e);
  }
}

/* ──────────────────────── Corrections (admin) ─────────────────────────── */

export async function cancelUsageAction(input: {
  cardId: string;
  usageId: string;
  reason: string;
}) {
  try {
    const by = await assertAdmin();
    const r = await cancelUsage({ ...input, by });
    if (!r.ok) return { error: r.error };
    refreshCard(input.cardId);
    return { ok: true as const };
  } catch (e) {
    return fail(e);
  }
}

export async function adjustCreditsAction(input: {
  cardId: string;
  delta: number;
  reason: string;
}) {
  try {
    const by = await assertAdmin();
    const r = await adjustCredits({ ...input, by });
    if (!r.ok) return { error: r.error };
    refreshCard(input.cardId);
    return { ok: true as const };
  } catch (e) {
    return fail(e);
  }
}

export async function setExpiryAction(input: {
  cardId: string;
  expiresAt: string;
  reason: string;
}) {
  try {
    const by = await assertAdmin();
    const r = await setExpiry({ ...input, by });
    if (!r.ok) return { error: r.error };
    refreshCard(input.cardId);
    return { ok: true as const };
  } catch (e) {
    return fail(e);
  }
}

export async function setStatusAction(input: {
  cardId: string;
  status: StoredCardStatus;
  reason: string;
}) {
  try {
    const by = await assertAdmin();
    const r = await setCardStatus({ ...input, by });
    if (!r.ok) return { error: r.error };
    refreshCard(input.cardId);
    return { ok: true as const };
  } catch (e) {
    return fail(e);
  }
}

export async function setPaidAction(input: {
  cardId: string;
  paid: boolean;
  pricePaid?: number;
}) {
  try {
    const by = await assertAdmin();
    const r = await setCardPaid({ ...input, by });
    if (!r.ok) return { error: r.error };
    refreshCard(input.cardId);
    return { ok: true as const };
  } catch (e) {
    return fail(e);
  }
}

export async function updateHolderAction(input: {
  cardId: string;
  holder: Partial<CardHolder>;
  reason?: string;
}) {
  try {
    const by = await assertAdmin();
    const r = await updateHolder({ ...input, by });
    if (!r.ok) return { error: r.error };
    refreshCard(input.cardId);
    return { ok: true as const };
  } catch (e) {
    return fail(e);
  }
}

export async function rotateQrTokenAction(cardId: string) {
  try {
    const by = await assertAdmin();
    const r = await rotateQrToken({ cardId, by });
    if (!r.ok) return { error: r.error };
    refreshCard(cardId);
    return { ok: true as const };
  } catch (e) {
    return fail(e);
  }
}
