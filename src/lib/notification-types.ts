/**
 * Notifications — types partagés client/serveur.
 *
 * L'architecture est volontairement générique (événement + destinataire +
 * canaux) pour accueillir plus tard d'autres sujets que les abonnements :
 * rappel de rendez-vous, devis à accepter, facture impayée…
 */

export type NotificationChannel = "app" | "email";

export type NotificationEvent =
  | "abonnement.attribue"
  | "abonnement.consommation"
  | "abonnement.bientot_epuise"
  | "abonnement.epuise"
  | "abonnement.expiration_proche"
  | "abonnement.annulation";

export type DeliveryStatus = "en_attente" | "envoye" | "ignore" | "echec";

export type AppNotification = {
  id: string;
  createdAt: string;
  event: NotificationEvent;
  /** Destinataire côté espace client (absent = notification hors compte). */
  accountId?: string;
  email?: string;
  title: string;
  body: string;
  /** Lien ouvert au clic depuis l'espace client. */
  href?: string;
  /** Rattachement métier (carte d'abonnement, dossier…). */
  cardId?: string;
  channels: NotificationChannel[];
  /** Résultat de l'envoi email (l'in-app est toujours immédiat). */
  emailStatus: DeliveryStatus;
  emailError?: string;
  readAt?: string;
  /** Empêche l'envoi deux fois du même message (ex. rappel d'expiration). */
  dedupeKey: string;
};
