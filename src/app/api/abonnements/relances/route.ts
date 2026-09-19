import { NextResponse } from "next/server";
import { notify } from "@/lib/notification-store";
import { getAllCardViews, lowBalanceCards } from "@/lib/subscription-store";
import { EXPIRY_WARNING_DAYS } from "@/lib/subscription-types";

export const dynamic = "force-dynamic";

/**
 * Relances automatiques des abonnements (expiration proche, solde faible).
 *
 * À appeler une fois par jour depuis une tâche planifiée (Coolify → Scheduled
 * task, cron système, ou tout service d'appel HTTP) :
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://…/api/abonnements/relances
 *
 * Sans CRON_SECRET défini, la route refuse toute requête : la fonctionnalité
 * est prête mais reste inactive tant qu'elle n'est pas configurée.
 *
 * La clé de déduplication empêche d'envoyer deux fois le même rappel, même si
 * la tâche est rejouée plusieurs fois dans la journée.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET non configuré." },
      { status: 503 },
    );
  }
  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const views = await getAllCardViews();
  let expiry = 0;
  let low = 0;

  for (const v of views) {
    if (v.status !== "active" || !v.card.holder.email) continue;
    if (v.daysLeft <= EXPIRY_WARNING_DAYS && v.daysLeft >= 0) {
      const sent = await notify({
        event: "abonnement.expiration_proche",
        // Un seul rappel par carte et par palier (30 j, puis 7 j, puis 1 j).
        dedupeKey: `expire:${v.card.id}:${bucket(v.daysLeft)}`,
        title: `Votre abonnement expire dans ${v.daysLeft} jour(s)`,
        body:
          `Bonjour ${v.card.holder.name},\n\n` +
          `Votre abonnement Stone Car Prestige (${v.card.plan.name}) expire le ` +
          `${v.card.expiresAt.slice(0, 10)}.` +
          (v.unlimited
            ? ""
            : ` Il vous reste ${v.remaining} prestation(s) à utiliser.`) +
          `\n\nStone Car Prestige`,
        accountId: v.card.holder.accountId,
        email: v.card.holder.email,
        href: "/compte/abonnements",
        cardId: v.card.id,
      });
      if (sent) expiry++;
    }
  }

  for (const v of lowBalanceCards(views)) {
    if (!v.card.holder.email) continue;
    const sent = await notify({
      event: "abonnement.bientot_epuise",
      dedupeKey: `bas:${v.card.id}:${v.remaining}`,
      title: `Plus que ${v.remaining} lavage(s) sur votre carte`,
      body:
        `Bonjour ${v.card.holder.name},\n\n` +
        `Il ne vous reste plus que ${v.remaining} prestation(s) sur votre carte ` +
        `${v.card.plan.name}.\n\nStone Car Prestige`,
      accountId: v.card.holder.accountId,
      email: v.card.holder.email,
      href: "/compte/abonnements",
      cardId: v.card.id,
    });
    if (sent) low++;
  }

  return NextResponse.json({ ok: true, expiry, low, scanned: views.length });
}

/** Paliers de relance : évite un email quotidien pendant un mois. */
function bucket(daysLeft: number): number {
  if (daysLeft <= 1) return 1;
  if (daysLeft <= 7) return 7;
  return 30;
}
