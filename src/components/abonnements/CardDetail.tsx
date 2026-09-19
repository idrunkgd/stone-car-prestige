"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  Check,
  X,
  Mail,
  Phone,
  QrCode,
  RotateCw,
  History,
  ShieldAlert,
  Undo2,
  Plus,
  Minus,
  CalendarClock,
  Wallet,
  ExternalLink,
} from "lucide-react";
import { Card, SectionHeader } from "@/components/ui/Card";
import { SubscriptionCardVisual } from "@/components/subscription/SubscriptionCardVisual";
import {
  adjustCreditsAction,
  cancelUsageAction,
  rotateQrTokenAction,
  setExpiryAction,
  setPaidAction,
  setStatusAction,
  useWashAction,
} from "@/app/app/abonnements/actions";
import {
  ADJUSTMENT_LABEL,
  dateTime,
  shortDate,
  type CardDTO,
  type StaffRole,
  type StoredCardStatus,
  type SubscriptionAdjustment,
  type UsageDTO,
} from "@/lib/subscription-types";
import { eur, cn } from "@/lib/utils";

const SOURCE_LABEL: Record<string, string> = {
  manuel: "Comptoir",
  qr: "QR code",
  checkout: "Check-out",
  reservation: "Réservation",
};

/**
 * Fiche carte côté back-office.
 *
 * Parcours employé volontairement court : la carte, le solde, un gros bouton,
 * une confirmation, c'est tout. Les corrections sont regroupées plus bas et
 * réservées à l'administrateur.
 */
export function CardDetail({
  card,
  usages,
  adjustments,
  role,
  qrSvg,
  scanUrl,
  holder,
  notes,
  services,
  fromScan,
}: {
  card: CardDTO;
  usages: UsageDTO[];
  adjustments: SubscriptionAdjustment[];
  role: StaffRole;
  qrSvg: string;
  scanUrl: string;
  holder: {
    email?: string;
    phone?: string;
    plates: string[];
    accountId?: string;
  };
  notes?: string;
  services: { id: string; name: string }[];
  fromScan?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const [idemKey, setIdemKey] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = role === "admin";

  const remaining = card.remaining;
  const after = remaining === null ? null : Math.max(0, remaining - 1);

  function openConfirm() {
    setError(null);
    // Une clé par ouverture de la confirmation : valider deux fois le même
    // écran (double-clic, retour arrière) ne décompte qu'un seul lavage.
    setIdemKey(
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    );
    setConfirm(true);
  }

  function validate() {
    if (!idemKey || pending) return;
    start(async () => {
      const svc = services.find((s) => s.id === serviceId);
      const r = await useWashAction({
        cardId: card.id,
        idempotencyKey: idemKey,
        serviceId: svc?.id,
        serviceLabel: svc?.name,
        source: fromScan ? "qr" : "manuel",
      });
      if ("error" in r && r.error) {
        setError(r.error);
        setConfirm(false);
        return;
      }
      setConfirm(false);
      setDone(true);
      router.refresh();
    });
  }

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 6000);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
      {/* ── Colonne carte + action ── */}
      <div className="space-y-4">
        <SubscriptionCardVisual card={card} qrSvg={qrSvg} justStamped={done} />

        {done && (
          <div className="flex items-center gap-2 rounded-xl border border-line-gold bg-state-green/10 px-4 py-3 text-state-green">
            <Check size={18} /> Lavage décompté.
            {card.remaining !== null && (
              <b className="font-display">
                {card.remaining} restant{card.remaining > 1 ? "s" : ""}
              </b>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-state-red/40 bg-state-red/10 px-4 py-3 text-sm text-[#e88]">
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        {card.usable ? (
          <button
            onClick={openConfirm}
            disabled={pending}
            className={cn(
              "flex w-full items-center justify-center gap-3 rounded-2xl bg-gold-grad py-6 font-display text-lg uppercase tracking-wide text-[#1a1400] shadow-gold transition-transform active:scale-[0.98]",
              pending && "opacity-60",
            )}
          >
            <Car size={26} strokeWidth={2.2} /> Utiliser 1 lavage
          </button>
        ) : (
          <div className="rounded-2xl border border-line-soft bg-night-panel px-4 py-5 text-center">
            <div className="font-display uppercase tracking-wide text-ink-muted">
              Utilisation impossible
            </div>
            <p className="mt-1 text-sm text-ink-faint">{card.blockedReason}</p>
          </div>
        )}

        {/* Coordonnées */}
        <Card>
          <div className="mb-2 font-display uppercase text-gold-1">
            {card.holderName}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-ink-muted">
            {holder.phone && (
              <a
                href={`tel:${holder.phone}`}
                className="flex items-center gap-1.5 hover:text-gold-1"
              >
                <Phone size={14} /> {holder.phone}
              </a>
            )}
            {holder.email && (
              <a
                href={`mailto:${holder.email}`}
                className="flex items-center gap-1.5 hover:text-gold-1"
              >
                <Mail size={14} /> {holder.email}
              </a>
            )}
            {holder.plates.map((p) => (
              <span
                key={p}
                className="rounded border border-line-soft bg-[#111] px-1.5 py-px font-display text-[11px] tracking-wider"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line-soft pt-3 text-[12px] text-ink-muted sm:grid-cols-3">
            <Info label="Formule" value={card.planName} />
            <Info label="N° de carte" value={card.number} />
            <Info
              label="Paiement"
              value={
                card.paid ? `Payé · ${eur(card.pricePaid)}` : "Non payé"
              }
              warn={!card.paid}
            />
            <Info label="Début" value={shortDate(card.startAt)} />
            <Info label="Expiration" value={shortDate(card.expiresAt)} />
            <Info
              label="Compte client"
              value={holder.accountId ? "Rattachée" : "Non rattachée"}
              warn={!holder.accountId}
            />
          </div>
          {card.serviceLabels.length > 0 && (
            <div className="mt-3 border-t border-line-soft pt-3 text-[12px] text-ink-muted">
              <span className="text-ink-faint">Prestations couvertes : </span>
              {card.serviceLabels.join(", ")}
            </div>
          )}
          {card.conditions && (
            <p className="mt-3 rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-[12px] text-ink-muted">
              {card.conditions}
            </p>
          )}
          {notes && (
            <p className="mt-2 text-[12px] text-ink-faint">Note : {notes}</p>
          )}
        </Card>

        {isAdmin && (
          <Card>
            <div className="mb-2 flex items-center gap-2 text-gold-1">
              <QrCode size={16} />{" "}
              <b className="font-display uppercase">QR code</b>
            </div>
            <p className="break-all text-[11.5px] text-ink-faint">{scanUrl}</p>
            <p className="mt-2 text-[12px] text-ink-muted">
              Le QR contient un jeton aléatoire, jamais l&apos;identifiant de la
              carte. Le scanner ouvre la fiche : la consommation reste toujours
              validée par un employé.
            </p>
            <button
              onClick={() => {
                if (confirmDialog("Régénérer le QR code ? L'ancien ne fonctionnera plus."))
                  start(async () => {
                    await rotateQrTokenAction(card.id);
                    router.refresh();
                  });
              }}
              className="mt-3 flex items-center gap-1.5 rounded-lg border border-line-soft px-3 py-1.5 text-xs text-ink-muted hover:border-line-gold hover:text-gold-1"
            >
              <RotateCw size={13} /> Régénérer le QR code
            </button>
          </Card>
        )}
      </div>

      {/* ── Colonne historique + corrections ── */}
      <div className="space-y-5">
        <div>
          <SectionHeader title="Historique des utilisations" />
          <Card>
            {usages.length === 0 ? (
              <p className="text-sm text-ink-muted">
                Aucune prestation utilisée pour l&apos;instant.
              </p>
            ) : (
              <ul className="space-y-2">
                {usages.map((u) => (
                  <UsageRow
                    key={u.id}
                    usage={u}
                    cardId={card.id}
                    isAdmin={isAdmin}
                    pending={pending}
                    onCancel={(reason) =>
                      start(async () => {
                        const r = await cancelUsageAction({
                          cardId: card.id,
                          usageId: u.id,
                          reason,
                        });
                        if ("error" in r && r.error) setError(r.error);
                        router.refresh();
                      })
                    }
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>

        {isAdmin && (
          <AdminPanel card={card} pending={pending} start={start} setError={setError} />
        )}

        <div>
          <SectionHeader title="Journal des corrections" />
          <Card>
            {adjustments.length === 0 ? (
              <p className="text-sm text-ink-muted">Aucune correction.</p>
            ) : (
              <ul className="space-y-2.5">
                {adjustments.map((a) => (
                  <li
                    key={a.id}
                    className="flex gap-3 border-b border-line-soft pb-2.5 last:border-0 last:pb-0"
                  >
                    <History size={14} className="mt-0.5 shrink-0 text-ink-faint" />
                    <div className="min-w-0 text-[12.5px]">
                      <div className="font-display uppercase tracking-wide text-ink">
                        {ADJUSTMENT_LABEL[a.kind]}
                        {a.delta !== 0 && (
                          <span
                            className={cn(
                              "ml-2",
                              a.delta > 0 ? "text-state-green" : "text-state-orange",
                            )}
                          >
                            {a.delta > 0 ? "+" : ""}
                            {a.delta}
                          </span>
                        )}
                      </div>
                      <div className="text-ink-muted">{a.reason}</div>
                      {(a.before || a.after) && (
                        <div className="text-[11.5px] text-ink-faint">
                          {a.before} → {a.after}
                        </div>
                      )}
                      <div className="text-[11px] text-ink-faint">
                        {dateTime(a.at)} · {a.by}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* ── Confirmation ── */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => !pending && setConfirm(false)}
        >
          <div
            className="w-full max-w-md animate-fade-up rounded-2xl border border-line-gold bg-night-panel p-5 shadow-premium"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-display text-xl uppercase leading-tight">
                Confirmer l&apos;utilisation d&apos;un lavage pour{" "}
                {card.holderName.split(" ")[0]} ?
              </h3>
              <button
                onClick={() => setConfirm(false)}
                disabled={pending}
                className="shrink-0 text-ink-faint hover:text-ink"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {services.length > 1 && (
              <div className="mt-4">
                <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted">
                  Prestation concernée
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full rounded-[10px] border border-line-soft bg-night-2 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {services.length === 1 && (
              <div className="mt-4 text-sm text-ink-muted">
                Prestation :{" "}
                <b className="text-ink">{services[0].name}</b>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line-soft bg-night-2 p-3 text-center">
                <div className="text-[10.5px] uppercase tracking-wider text-ink-faint">
                  Solde avant
                </div>
                <div className="font-display text-2xl">
                  {remaining === null ? "∞" : remaining}
                </div>
              </div>
              <div className="rounded-xl border border-line-gold bg-gold/[0.08] p-3 text-center">
                <div className="text-[10.5px] uppercase tracking-wider text-gold-2">
                  Solde après
                </div>
                <div className="font-display text-2xl text-gold-1">
                  {after === null ? "∞" : after}
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirm(false)}
                disabled={pending}
                className="flex-1 rounded-xl border border-line-soft py-3 font-display text-sm uppercase tracking-wide text-ink-muted hover:border-line-gold hover:text-ink"
              >
                Annuler
              </button>
              <button
                onClick={validate}
                disabled={pending}
                className={cn(
                  "flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gold-grad py-3 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold",
                  pending && "opacity-60",
                )}
              >
                <Check size={17} /> {pending ? "Validation…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────── Sous-vues ────────────────────────────── */

function Info({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider text-ink-faint">
        {label}
      </div>
      <div className={cn("text-[12.5px]", warn ? "text-state-orange" : "text-ink")}>
        {value}
      </div>
    </div>
  );
}

function UsageRow({
  usage,
  isAdmin,
  pending,
  onCancel,
}: {
  usage: UsageDTO;
  cardId: string;
  isAdmin: boolean;
  pending: boolean;
  onCancel: (reason: string) => void;
}) {
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <li className="rounded-lg border border-line-soft px-3 py-2.5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            usage.cancelled
              ? "border border-line-soft text-ink-faint"
              : "bg-gold-grad text-[#1a1400]",
          )}
        >
          <Car size={14} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "text-[13px]",
              usage.cancelled && "text-ink-faint line-through",
            )}
          >
            {usage.serviceLabel ?? "Prestation"}
          </div>
          <div className="text-[11.5px] text-ink-faint">
            {dateTime(usage.usedAt)} · {usage.operator} ·{" "}
            {SOURCE_LABEL[usage.source] ?? usage.source}
          </div>
          {usage.cancelled && (
            <div className="mt-1 text-[11.5px] text-state-orange">
              Annulé le {usage.cancelledAt ? dateTime(usage.cancelledAt) : "—"}{" "}
              par {usage.cancelledBy} — {usage.cancelReason}
            </div>
          )}
          {usage.interventionId && (
            <a
              href={`/app/intervention/${usage.interventionId}`}
              className="mt-1 flex items-center gap-1 text-[11.5px] text-gold-1 hover:underline"
            >
              <ExternalLink size={11} /> Voir l&apos;intervention
            </a>
          )}
        </div>
        {isAdmin && !usage.cancelled && !asking && (
          <button
            onClick={() => setAsking(true)}
            className="shrink-0 text-[11px] text-ink-faint hover:text-state-orange"
            title="Annuler ce tampon"
          >
            <Undo2 size={15} />
          </button>
        )}
      </div>

      {asking && (
        <div className="mt-2.5 border-t border-line-soft pt-2.5">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Raison de l'annulation (obligatoire)"
            className="w-full rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-[13px] focus:border-gold focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setAsking(false)}
              className="rounded-lg border border-line-soft px-3 py-1.5 text-[11px] uppercase tracking-wider text-ink-muted"
            >
              Renoncer
            </button>
            <button
              disabled={pending || !reason.trim()}
              onClick={() => {
                onCancel(reason.trim());
                setAsking(false);
                setReason("");
              }}
              className={cn(
                "rounded-lg border border-line-gold px-3 py-1.5 font-display text-[11px] uppercase tracking-wider text-gold-1",
                (!reason.trim() || pending) && "opacity-40",
              )}
            >
              Annuler le tampon
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function AdminPanel({
  card,
  pending,
  start,
  setError,
}: {
  card: CardDTO;
  pending: boolean;
  start: (fn: () => void) => void;
  setError: (s: string | null) => void;
}) {
  const router = useRouter();
  const [delta, setDelta] = useState("1");
  const [reason, setReason] = useState("");
  const [expiry, setExpiry] = useState(card.expiresAt.slice(0, 10));

  const run = (fn: () => Promise<{ error?: string } | unknown>) =>
    start(async () => {
      const r = (await fn()) as { error?: string } | undefined;
      if (r && "error" in r && r.error) setError(r.error);
      else setError(null);
      router.refresh();
    });

  const STATUSES: { key: StoredCardStatus; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "suspendue", label: "Suspendue" },
    { key: "brouillon", label: "Brouillon" },
    { key: "annulee", label: "Annulée" },
  ];

  return (
    <div>
      <SectionHeader title="Corrections administratives" />
      <Card className="space-y-4">
        <p className="text-[12px] text-ink-faint">
          Chaque correction est enregistrée dans le journal ci-dessous : date,
          administrateur, raison. Rien n&apos;est supprimé de la base.
        </p>

        {/* Crédits */}
        <div>
          <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted">
            Ajouter / retirer des prestations
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center overflow-hidden rounded-lg border border-line-soft">
              <button
                onClick={() =>
                  setDelta(String((Number(delta) || 0) - 1))
                }
                className="px-2.5 py-2 text-ink-muted hover:text-gold-1"
                aria-label="Diminuer"
              >
                <Minus size={14} />
              </button>
              <input
                value={delta}
                onChange={(e) =>
                  setDelta(e.target.value.replace(/[^\d-]/g, ""))
                }
                className="w-14 bg-night-2 py-2 text-center text-sm focus:outline-none"
              />
              <button
                onClick={() => setDelta(String((Number(delta) || 0) + 1))}
                className="px-2.5 py-2 text-ink-muted hover:text-gold-1"
                aria-label="Augmenter"
              >
                <Plus size={14} />
              </button>
            </div>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Raison (obligatoire)"
              className="min-w-[160px] flex-1 rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-[13px] focus:border-gold focus:outline-none"
            />
            <button
              disabled={pending || !reason.trim() || !Number(delta)}
              onClick={() =>
                run(async () => {
                  const r = await adjustCreditsAction({
                    cardId: card.id,
                    delta: Number(delta) || 0,
                    reason: reason.trim(),
                  });
                  setReason("");
                  return r;
                })
              }
              className={cn(
                "rounded-lg border border-line-gold px-3 py-2 font-display text-[11px] uppercase tracking-wider text-gold-1",
                (!reason.trim() || !Number(delta) || pending) && "opacity-40",
              )}
            >
              Appliquer
            </button>
          </div>
        </div>

        {/* Expiration */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ink-muted">
            <CalendarClock size={13} /> Date d&apos;expiration
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-[13px] focus:border-gold focus:outline-none"
            />
            <button
              disabled={pending || expiry === card.expiresAt.slice(0, 10)}
              onClick={() =>
                run(() =>
                  setExpiryAction({
                    cardId: card.id,
                    expiresAt: new Date(expiry).toISOString(),
                    reason: "Modification manuelle",
                  }),
                )
              }
              className={cn(
                "rounded-lg border border-line-gold px-3 py-2 font-display text-[11px] uppercase tracking-wider text-gold-1",
                (pending || expiry === card.expiresAt.slice(0, 10)) &&
                  "opacity-40",
              )}
            >
              Enregistrer
            </button>
          </div>
        </div>

        {/* Statut */}
        <div>
          <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted">
            Statut
          </label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.key}
                disabled={pending}
                onClick={() =>
                  run(() =>
                    setStatusAction({
                      cardId: card.id,
                      status: s.key,
                      reason: `Passage en ${s.label.toLowerCase()}`,
                    }),
                  )
                }
                className={cn(
                  "rounded-lg border px-3 py-1.5 font-display text-[11px] uppercase tracking-wider transition-colors",
                  card.status === s.key
                    ? "border-line-gold bg-gold/15 text-gold-1"
                    : "border-line-soft text-ink-muted hover:border-line-gold",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-ink-faint">
            « Épuisée » et « Expirée » sont calculés automatiquement.
          </p>
        </div>

        {/* Paiement */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ink-muted">
            <Wallet size={13} /> Paiement
          </label>
          <button
            disabled={pending}
            onClick={() =>
              run(() => setPaidAction({ cardId: card.id, paid: !card.paid }))
            }
            className={cn(
              "rounded-lg border px-3.5 py-2 font-display text-[11px] uppercase tracking-wider",
              card.paid
                ? "border-state-green/40 bg-state-green/10 text-state-green"
                : "border-state-orange/40 bg-state-orange/10 text-state-orange",
            )}
          >
            {card.paid ? `Payé · ${eur(card.pricePaid)}` : "Marquer payé"}
          </button>
        </div>
      </Card>
    </div>
  );
}

/** confirm() encapsulé pour rester testable et éviter les erreurs SSR. */
function confirmDialog(message: string): boolean {
  if (typeof window === "undefined") return false;
  return window.confirm(message);
}
