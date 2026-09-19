import "server-only";
import { createHash } from "crypto";
import { listDocs, listDocsBy, patchDoc, withTransaction } from "./db";
import type {
  AppNotification,
  DeliveryStatus,
  NotificationChannel,
  NotificationEvent,
} from "./notification-types";

const COL = "notifications";

/* ───────────────────────────── Adaptateur email ───────────────────────────
 *
 * Aucune dépendance ajoutée : l'envoi passe par l'API HTTP de Resend si
 * RESEND_API_KEY est défini, sinon la notification est marquée « ignoré »
 * et reste disponible dans l'application. Brancher un autre fournisseur
 * revient à remplacer cette seule fonction.
 *
 * Variables d'environnement :
 *   RESEND_API_KEY   clé API (facultatif — sans elle, aucun email n'est envoyé)
 *   MAIL_FROM        expéditeur, ex. "Stone Car Prestige <no-reply@…>"
 * ──────────────────────────────────────────────────────────────────────── */

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ status: DeliveryStatus; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) return { status: "ignore" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    });
    if (!res.ok) {
      return { status: "echec", error: `HTTP ${res.status}` };
    }
    return { status: "envoye" };
  } catch (e) {
    return { status: "echec", error: (e as Error).message };
  }
}

/* ───────────────────────────────── API ───────────────────────────────── */

function idFor(dedupeKey: string): string {
  return createHash("sha256").update(dedupeKey).digest("hex").slice(0, 32);
}

/**
 * Enregistre une notification et tente l'envoi email.
 *
 * `dedupeKey` garantit qu'un même message (ex. « votre carte expire dans
 * 30 jours ») n'est jamais envoyé deux fois, même si la tâche qui le déclenche
 * est rejouée. L'échec d'envoi n'interrompt jamais l'action métier appelante.
 */
export async function notify(input: {
  event: NotificationEvent;
  dedupeKey: string;
  title: string;
  body: string;
  accountId?: string;
  email?: string;
  href?: string;
  cardId?: string;
  channels?: NotificationChannel[];
}): Promise<AppNotification | null> {
  const channels = input.channels ?? ["app", "email"];
  const id = idFor(input.dedupeKey);

  const notification: AppNotification = {
    id,
    createdAt: new Date().toISOString(),
    event: input.event,
    accountId: input.accountId,
    email: input.email,
    title: input.title,
    body: input.body,
    href: input.href,
    cardId: input.cardId,
    channels,
    emailStatus: "en_attente",
    dedupeKey: input.dedupeKey,
  };

  try {
    const inserted = await withTransaction((tx) =>
      tx.insertIfAbsent(COL, id, notification),
    );
    // inserted === null : pas de base configurée. false : déjà envoyé.
    if (inserted === false) return null;
  } catch {
    return null;
  }

  if (channels.includes("email") && input.email) {
    const r = await sendEmail({
      to: input.email,
      subject: input.title,
      text: input.body,
    });
    try {
      await patchDoc<AppNotification>(COL, id, {
        emailStatus: r.status,
        emailError: r.error,
      });
    } catch {
      /* best effort */
    }
    return { ...notification, emailStatus: r.status, emailError: r.error };
  }

  return notification;
}

export async function getNotificationsForAccount(
  accountId: string,
): Promise<AppNotification[]> {
  const list = await listDocsBy<AppNotification>(COL, "accountId", accountId);
  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getAllNotifications(): Promise<AppNotification[]> {
  return listDocs<AppNotification>(COL);
}

export async function markNotificationRead(id: string): Promise<void> {
  await patchDoc<AppNotification>(COL, id, { readAt: new Date().toISOString() });
}
