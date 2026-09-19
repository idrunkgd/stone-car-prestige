"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Car, ChevronDown, Archive, QrCode, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SubscriptionCardVisual } from "@/components/subscription/SubscriptionCardVisual";
import {
  dateTime,
  shortDate,
  type CardDTO,
  type UsageDTO,
} from "@/lib/subscription-types";
import { cn } from "@/lib/utils";

export type ClientCard = {
  card: CardDTO;
  usages: UsageDTO[];
  qrSvg: string;
};

/**
 * « Mes abonnements » côté client : cartes actives, cartes archivées,
 * historique des utilisations. Lecture seule — un client ne peut jamais
 * ajouter ni retirer un tampon.
 */
export function MesCartes({ cards }: { cards: ClientCard[] }) {
  const { active, archived } = useMemo(() => {
    const isLive = (c: ClientCard) =>
      c.card.status === "active" || c.card.status === "suspendue";
    return {
      active: cards.filter(isLive),
      archived: cards.filter((c) => !isLive(c)),
    };
  }, [cards]);

  const [showArchived, setShowArchived] = useState(false);

  return (
    <div className="space-y-6">
      {active.length === 0 && (
        <Card className="py-8 text-center text-sm text-ink-muted">
          Vous n&apos;avez plus de carte active. Vos anciennes cartes restent
          consultables ci-dessous.
        </Card>
      )}

      {active.map((c) => (
        <CardBlock key={c.card.id} entry={c} />
      ))}

      {archived.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="flex w-full items-center gap-2 rounded-xl border border-line-soft bg-night-panel px-4 py-3 text-left text-sm text-ink-muted hover:border-line-gold"
          >
            <Archive size={16} />
            <span className="flex-1">
              Mes anciennes cartes ({archived.length})
            </span>
            <ChevronDown
              size={16}
              className={cn("transition-transform", showArchived && "rotate-180")}
            />
          </button>
          {showArchived && (
            <div className="mt-4 space-y-6">
              {archived.map((c) => (
                <CardBlock key={c.card.id} entry={c} archived />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CardBlock({
  entry,
  archived,
}: {
  entry: ClientCard;
  archived?: boolean;
}) {
  const reduce = useReducedMotion();
  const [openHistory, setOpenHistory] = useState(false);
  const [openQr, setOpenQr] = useState(false);
  const { card, usages, qrSvg } = entry;
  const valid = usages.filter((u) => !u.cancelled);

  return (
    <div className={cn(archived && "opacity-80")}>
      <SubscriptionCardVisual card={card} qrSvg={qrSvg} />

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Tile
          label="Disponibles"
          value={card.remaining === null ? "∞" : String(card.remaining)}
          gold
        />
        <Tile label="Utilisés" value={String(card.used)} />
        <Tile label="Expiration" value={shortDate(card.expiresAt)} />
        <Tile
          label="Statut"
          value={card.statusLabel}
          warn={card.status !== "active"}
        />
      </div>

      {card.serviceLabels.length > 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-line-soft bg-night-panel px-3.5 py-2.5 text-[12.5px] text-ink-muted">
          <Info size={14} className="mt-0.5 shrink-0 text-gold-2" />
          <span>
            Prestations couvertes :{" "}
            <b className="text-ink">{card.serviceLabels.join(", ")}</b>
          </span>
        </p>
      )}

      {card.conditions && (
        <p className="mt-2 rounded-xl border border-line-soft bg-night-panel px-3.5 py-2.5 text-[12.5px] text-ink-muted">
          {card.conditions}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setOpenQr((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-line-gold px-4 py-2.5 font-display text-[12px] uppercase tracking-wider text-gold-1 hover:bg-gold/[0.08]"
        >
          <QrCode size={15} /> {openQr ? "Masquer" : "Afficher"} mon QR code
        </button>
        <button
          onClick={() => setOpenHistory((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-line-soft px-4 py-2.5 font-display text-[12px] uppercase tracking-wider text-ink-muted hover:border-line-gold"
        >
          Historique ({valid.length})
          <ChevronDown
            size={14}
            className={cn("transition-transform", openHistory && "rotate-180")}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {openQr && (
          <motion.div
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col items-center gap-3 rounded-xl border border-line-soft bg-night-panel px-4 py-5">
              <div
                className="rounded-xl bg-white p-3"
                style={{ width: 200 }}
                dangerouslySetInnerHTML={{
                  __html: qrSvg.replace(
                    /width="\d+" height="\d+"/,
                    'width="176" height="176"',
                  ),
                }}
              />
              <p className="text-center text-[12.5px] text-ink-muted">
                Présentez ce code à l&apos;accueil. Seul un membre de
                l&apos;équipe peut valider l&apos;utilisation d&apos;un lavage.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {openHistory && (
          <motion.div
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="mt-3">
              {usages.length === 0 ? (
                <p className="text-sm text-ink-muted">
                  Aucune prestation utilisée pour l&apos;instant.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {usages.map((u) => (
                    <li key={u.id} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                          u.cancelled
                            ? "border border-line-soft text-ink-faint"
                            : "bg-gold-grad text-[#1a1400]",
                        )}
                      >
                        <Car size={14} strokeWidth={2.4} />
                      </span>
                      <div className="min-w-0">
                        <div
                          className={cn(
                            "text-[13px]",
                            u.cancelled && "text-ink-faint line-through",
                          )}
                        >
                          {u.serviceLabel ?? "Prestation"}
                        </div>
                        <div className="text-[11.5px] text-ink-faint">
                          {dateTime(u.usedAt)}
                        </div>
                        {u.cancelled && (
                          <div className="text-[11.5px] text-state-orange">
                            Annulé — {u.cancelReason}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tile({
  label,
  value,
  gold,
  warn,
}: {
  label: string;
  value: string;
  gold?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line-soft bg-night-panel px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-ink-faint">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 font-display text-[17px]",
          gold && "text-gold-1",
          warn && "text-state-orange",
        )}
      >
        {value}
      </div>
    </div>
  );
}
