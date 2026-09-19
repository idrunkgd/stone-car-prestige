/**
 * Abonnements / cartes de lavages prépayées — types & règles pures.
 *
 * Ce fichier est volontairement SANS `server-only` : il est importé aussi bien
 * par les Server Components que par les composants client (carte virtuelle,
 * animations). Il ne contient que des types, des constantes et des fonctions
 * pures — aucune I/O.
 *
 * Principe clé : le solde n'est JAMAIS stocké dans un compteur.
 * Il est recalculé à partir du registre :
 *
 *     solde = créditsInitiaux + Σ(ajustements) − consommations non annulées
 *
 * Toute correction administrative crée une opération tracée : rien n'est
 * jamais supprimé de la base.
 */

/* ─────────────────────────── Apparence des cartes ─────────────────────── */

export type CardTheme =
  | "or"
  | "onyx"
  | "platine"
  | "saphir"
  | "emeraude"
  | "carbone"
  | "rubis";

export const CARD_THEMES: Record<
  CardTheme,
  { label: string; gradient: string; ink: string; accent: string; ring: string }
> = {
  or: {
    label: "Or signature",
    gradient: "linear-gradient(135deg,#2A2313 0%,#4A3C17 40%,#1A1710 100%)",
    ink: "#F6E9BE",
    accent: "#E9CE7B",
    ring: "rgba(233,206,123,0.35)",
  },
  onyx: {
    label: "Onyx",
    gradient: "linear-gradient(135deg,#18181C 0%,#26262E 45%,#101013 100%)",
    ink: "#F4F2EC",
    accent: "#C9A227",
    ring: "rgba(255,255,255,0.14)",
  },
  platine: {
    label: "Platine",
    gradient: "linear-gradient(135deg,#2E3136 0%,#585E67 45%,#1C1E22 100%)",
    ink: "#F7F8FA",
    accent: "#DCE3EC",
    ring: "rgba(220,227,236,0.32)",
  },
  saphir: {
    label: "Saphir",
    gradient: "linear-gradient(135deg,#0E1B2E 0%,#1D3A63 45%,#0A1220 100%)",
    ink: "#EAF2FF",
    accent: "#6FA8E8",
    ring: "rgba(111,168,232,0.35)",
  },
  emeraude: {
    label: "Émeraude",
    gradient: "linear-gradient(135deg,#0C1F19 0%,#164536 45%,#08130F 100%)",
    ink: "#E8FBF2",
    accent: "#57C99A",
    ring: "rgba(87,201,154,0.35)",
  },
  carbone: {
    label: "Carbone",
    gradient: "linear-gradient(135deg,#131316 0%,#1F1F24 45%,#0B0B0D 100%)",
    ink: "#EDEDEF",
    accent: "#8A8A93",
    ring: "rgba(255,255,255,0.1)",
  },
  rubis: {
    label: "Rubis",
    gradient: "linear-gradient(135deg,#250D0F 0%,#5A1A20 45%,#170809 100%)",
    ink: "#FFEDEE",
    accent: "#E8697A",
    ring: "rgba(232,105,122,0.35)",
  },
};

export const THEME_KEYS = Object.keys(CARD_THEMES) as CardTheme[];

/* ───────────────────────────── Formule d'abonnement ───────────────────── */

/** Nature de l'abonnement. `illimite` est prévu pour une évolution future. */
export type PlanKind = "credits" | "illimite";

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  /** Prix de vente TTC. */
  price: number;
  /** Nombre de lavages / prestations inclus (ignoré si kind = "illimite"). */
  credits: number;
  kind: PlanKind;
  /**
   * Prestations couvertes (ids du catalogue). Liste vide = toutes les
   * prestations du catalogue sont acceptées.
   */
  serviceIds: string[];
  /** Durée de validité en jours à partir de la date de début. */
  validityDays: number;
  active: boolean;
  order: number;
  theme: CardTheme;
  /** Visuel optionnel (data URL ou URL absolue) affiché en fond de carte. */
  imageUrl?: string;
  /** Conditions particulières affichées au client. */
  conditions?: string;
  createdAt: string;
  updatedAt: string;

  /* ── Champs réservés aux évolutions (paiement en ligne, récurrence…) ── */
  /** Renouvellement : aucun pour l'instant. */
  renewal?: "aucun" | "auto";
  /** Limite d'utilisation par période (abonnement illimité encadré). */
  usageLimitPerMonth?: number;
  /** Abonnement restreint à N véhicules (0 / undefined = pas de limite). */
  maxVehicles?: number;
  /** Carte cadeau : transférable à un autre bénéficiaire. */
  giftable?: boolean;
};

/* ────────────────────────────── Carte client ──────────────────────────── */

/** Statuts explicitement décidés par l'administrateur. */
export type StoredCardStatus = "brouillon" | "active" | "suspendue" | "annulee";
/** Statuts affichés (les deux derniers sont déduits du solde et de la date). */
export type CardStatus = StoredCardStatus | "epuisee" | "expiree";

export const CARD_STATUS: Record<
  CardStatus,
  { label: string; className: string }
> = {
  brouillon: {
    label: "Brouillon",
    className: "text-ink-muted bg-night-panel2 border border-line-soft",
  },
  active: { label: "Active", className: "text-[#0d2e1e] bg-state-green font-bold" },
  epuisee: {
    label: "Épuisée",
    className: "text-state-orange bg-state-orange/15",
  },
  expiree: { label: "Expirée", className: "text-[#e88] bg-state-red/15" },
  suspendue: {
    label: "Suspendue",
    className: "text-state-orange bg-state-orange/15",
  },
  annulee: {
    label: "Annulée",
    className: "text-ink-muted bg-night-panel2 border border-line-soft",
  },
};

/** Bénéficiaire de la carte. */
export type CardHolder = {
  /** Compte de l'espace client — requis pour que la carte s'affiche côté client. */
  accountId?: string;
  /** Fiche client du CRM (client créé au comptoir, sans compte). */
  customerId?: string;
  name: string;
  email?: string;
  phone?: string;
  /** Plaques connues, dénormalisées pour la recherche rapide. */
  plates: string[];
};

/** Instantané commercial figé au moment de l'attribution. */
export type PlanSnapshot = {
  name: string;
  description: string;
  price: number;
  credits: number;
  kind: PlanKind;
  serviceIds: string[];
  validityDays: number;
  theme: CardTheme;
  imageUrl?: string;
  conditions?: string;
};

export type SubscriptionCard = {
  id: string;
  /** Numéro lisible communiqué au client : SCP-2026-0007. */
  number: string;
  planId: string;
  /** Copie des conditions commerciales : modifier la formule ne réécrit pas l'histoire. */
  plan: PlanSnapshot;
  holder: CardHolder;
  status: StoredCardStatus;
  /** Crédits attribués à l'origine (ajustables ensuite via le registre). */
  creditsInitial: number;
  startAt: string; // ISO
  expiresAt: string; // ISO
  paid: boolean;
  paidAt?: string;
  /** Montant réellement encaissé (peut différer du prix catalogue). */
  pricePaid: number;
  /** Jeton opaque encodé dans le QR code — jamais l'id de la carte. */
  qrToken: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
};

/* ──────────────────────── Registre : consommations ────────────────────── */

export type UsageSource = "manuel" | "qr" | "checkout" | "reservation";

export type SubscriptionUsage = {
  id: string;
  cardId: string;
  usedAt: string;
  /** Toujours 1 aujourd'hui ; le champ existe pour les packs multi-prestations. */
  amount: number;
  serviceId?: string;
  serviceLabel?: string;
  /** Qui a validé (email du compte pro). */
  operator: string;
  operatorRole: StaffRole;
  source: UsageSource;
  /** Dossier / intervention rattaché, si la consommation vient d'une réservation. */
  interventionId?: string;
  requestId?: string;
  /** Clé d'idempotence : garantit qu'un double-clic ne décompte qu'une fois. */
  idempotencyKey: string;
  /** Annulation : la ligne reste en base, elle est seulement neutralisée. */
  cancelled: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
};

/* ──────────────────────── Registre : corrections ──────────────────────── */

export type AdjustmentKind =
  | "creation"
  | "annulation_consommation"
  | "credits"
  | "expiration"
  | "statut"
  | "paiement"
  | "beneficiaire";

export const ADJUSTMENT_LABEL: Record<AdjustmentKind, string> = {
  creation: "Création de la carte",
  annulation_consommation: "Annulation d'un tampon",
  credits: "Correction du nombre de prestations",
  expiration: "Modification de la date d'expiration",
  statut: "Changement de statut",
  paiement: "Statut de paiement",
  beneficiaire: "Modification du bénéficiaire",
};

export type SubscriptionAdjustment = {
  id: string;
  cardId: string;
  at: string;
  /** Administrateur ayant effectué la correction. */
  by: string;
  kind: AdjustmentKind;
  reason: string;
  /** Variation de crédits (+ / −) appliquée au solde. 0 pour les autres cas. */
  delta: number;
  /** Consommation neutralisée, le cas échéant. */
  usageId?: string;
  before?: string;
  after?: string;
};

/* ─────────────────────────────── Rôles ────────────────────────────────── */

export type StaffRole = "admin" | "employe";

/* ─────────────────────── Vue consolidée d'une carte ───────────────────── */

export type CardLedger = {
  card: SubscriptionCard;
  usages: SubscriptionUsage[];
  adjustments: SubscriptionAdjustment[];
};

export type CardView = {
  card: SubscriptionCard;
  usages: SubscriptionUsage[];
  adjustments: SubscriptionAdjustment[];
  /** Consommations valides (non annulées), les plus récentes d'abord. */
  activeUsages: SubscriptionUsage[];
  creditsTotal: number;
  used: number;
  remaining: number;
  status: CardStatus;
  expired: boolean;
  unlimited: boolean;
  /** Jours restants avant expiration (négatif si dépassé). */
  daysLeft: number;
  usable: boolean;
  /** Raison lisible quand la carte n'est pas utilisable. */
  blockedReason?: string;
};

const DAY = 24 * 60 * 60 * 1000;

/** Recalcule intégralement l'état d'une carte à partir de son registre. */
export function computeCardView(
  ledger: CardLedger,
  now: Date = new Date(),
): CardView {
  const { card } = ledger;
  const usages = [...ledger.usages].sort((a, b) =>
    a.usedAt < b.usedAt ? 1 : -1,
  );
  const adjustments = [...ledger.adjustments].sort((a, b) =>
    a.at < b.at ? 1 : -1,
  );
  const activeUsages = usages.filter((u) => !u.cancelled);

  const unlimited = card.plan.kind === "illimite";
  const bonus = adjustments.reduce((s, a) => s + (a.delta || 0), 0);
  const creditsTotal = Math.max(0, card.creditsInitial + bonus);
  const used = activeUsages.reduce((s, u) => s + (u.amount || 1), 0);
  const remaining = unlimited
    ? Number.POSITIVE_INFINITY
    : Math.max(0, creditsTotal - used);

  const expiresAt = new Date(card.expiresAt).getTime();
  const expired = Number.isFinite(expiresAt) && expiresAt <= now.getTime();
  const daysLeft = Math.ceil((expiresAt - now.getTime()) / DAY);
  const notStarted = new Date(card.startAt).getTime() > now.getTime();

  let status: CardStatus = card.status;
  let blockedReason: string | undefined;

  if (card.status === "annulee") {
    blockedReason = "Cette carte a été annulée.";
  } else if (card.status === "suspendue") {
    blockedReason = "Cette carte est suspendue.";
  } else if (card.status === "brouillon") {
    blockedReason = "Cette carte est encore en brouillon : activez-la d'abord.";
  } else if (expired) {
    status = "expiree";
    blockedReason = "Cette carte est expirée.";
  } else if (!unlimited && remaining <= 0) {
    status = "epuisee";
    blockedReason = "Cette carte ne contient plus de prestation disponible.";
  } else if (notStarted) {
    blockedReason = "Cette carte n'est pas encore valable.";
  }

  return {
    card,
    usages,
    adjustments,
    activeUsages,
    creditsTotal,
    used,
    remaining,
    status,
    expired,
    unlimited,
    daysLeft,
    usable: !blockedReason,
    blockedReason,
  };
}

/** Date d'expiration par défaut à partir d'une date de début. */
export function defaultExpiry(startISO: string, validityDays: number): string {
  const d = new Date(startISO);
  d.setDate(d.getDate() + Math.max(1, validityDays));
  return d.toISOString();
}

/** Seuil « bientôt épuisée » utilisé par les notifications et l'affichage. */
export const LOW_BALANCE_THRESHOLD = 2;
/** Fenêtre « bientôt expirée ». */
export const EXPIRY_WARNING_DAYS = 30;

/** Format court d'une date ISO (15/09/2027). */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Format date + heure (15/09/2026 à 14:32). */
export function dateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Valeur d'affichage du solde (gère le cas illimité). */
export function remainingLabel(view: CardView): string {
  return view.unlimited ? "∞" : String(view.remaining);
}

/* ──────────────── Projection sérialisable pour les composants client ──────
 *
 * Les composants client reçoivent une structure plate et strictement
 * sérialisable (pas d'Infinity : `remaining === null` signifie « illimité »).
 * ──────────────────────────────────────────────────────────────────────── */

export type CardDTO = {
  id: string;
  number: string;
  planName: string;
  planDescription: string;
  theme: CardTheme;
  imageUrl?: string;
  conditions?: string;
  holderName: string;
  status: CardStatus;
  statusLabel: string;
  creditsTotal: number;
  used: number;
  /** `null` = abonnement illimité. */
  remaining: number | null;
  startAt: string;
  expiresAt: string;
  daysLeft: number;
  usable: boolean;
  blockedReason?: string;
  paid: boolean;
  pricePaid: number;
  /** Prestations couvertes (libellés). Vide = toutes. */
  serviceLabels: string[];
};

export type UsageDTO = {
  id: string;
  usedAt: string;
  serviceLabel?: string;
  operator: string;
  source: string;
  cancelled: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  interventionId?: string;
};

export function toCardDTO(view: CardView, serviceLabels: string[] = []): CardDTO {
  return {
    id: view.card.id,
    number: view.card.number,
    planName: view.card.plan.name,
    planDescription: view.card.plan.description,
    theme: view.card.plan.theme,
    imageUrl: view.card.plan.imageUrl,
    conditions: view.card.plan.conditions,
    holderName: view.card.holder.name,
    status: view.status,
    statusLabel: CARD_STATUS[view.status].label,
    creditsTotal: view.creditsTotal,
    used: view.used,
    remaining: view.unlimited ? null : view.remaining,
    startAt: view.card.startAt,
    expiresAt: view.card.expiresAt,
    daysLeft: view.daysLeft,
    usable: view.usable,
    blockedReason: view.blockedReason,
    paid: view.card.paid,
    pricePaid: view.card.pricePaid,
    serviceLabels,
  };
}

export function toUsageDTO(u: SubscriptionUsage): UsageDTO {
  return {
    id: u.id,
    usedAt: u.usedAt,
    serviceLabel: u.serviceLabel,
    operator: u.operator,
    source: u.source,
    cancelled: u.cancelled,
    cancelledAt: u.cancelledAt,
    cancelledBy: u.cancelledBy,
    cancelReason: u.cancelReason,
    interventionId: u.interventionId,
  };
}
