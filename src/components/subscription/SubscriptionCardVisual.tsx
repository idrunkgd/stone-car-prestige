"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Car, Check, Infinity as InfinityIcon } from "lucide-react";
import {
  CARD_THEMES,
  CARD_STATUS,
  shortDate,
  type CardDTO,
} from "@/lib/subscription-types";
import { cn } from "@/lib/utils";

/**
 * Carte virtuelle à tampons — élément visuel central de la fonctionnalité.
 *
 * Rendu type carte physique dématérialisée : dégradé signature, filet
 * métallisé, guillochis discret, tampons « voiture ». Utilisée telle quelle
 * dans l'espace client et dans le back-office.
 *
 * Micro-animations : apparition des tampons en cascade, tampon fraîchement
 * ajouté qui se pose (scale + rotation), barre de progression et solde animés.
 * Tout est désactivé si l'utilisateur a demandé moins d'animations.
 */

/** Au-delà de ce nombre de prestations, on passe en affichage compact. */
const MAX_STAMPS = 24;

export function SubscriptionCardVisual({
  card,
  qrSvg,
  justStamped = false,
  compact = false,
  className,
}: {
  card: CardDTO;
  /** SVG du QR code (chaîne) — généré côté serveur. */
  qrSvg?: string;
  /** Anime le dernier tampon comme s'il venait d'être apposé. */
  justStamped?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const theme = CARD_THEMES[card.theme] ?? CARD_THEMES.or;
  const unlimited = card.remaining === null;
  const remaining = card.remaining ?? 0;

  const stamps = useMemo(() => {
    if (unlimited) return [];
    const total = Math.max(card.creditsTotal, card.used);
    return Array.from({ length: Math.min(total, MAX_STAMPS) }, (_, i) => ({
      index: i,
      done: i < card.used,
      last: i === card.used - 1,
    }));
  }, [card.creditsTotal, card.used, unlimited]);

  const overflow = !unlimited && card.creditsTotal > MAX_STAMPS;
  const progress = unlimited
    ? 1
    : card.creditsTotal === 0
      ? 0
      : Math.min(1, card.used / card.creditsTotal);

  const [display, setDisplay] = useState(reduce ? remaining : remaining);
  useEffect(() => setDisplay(remaining), [remaining]);

  const statusStyle = CARD_STATUS[card.status];
  const dimmed = card.status !== "active";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border shadow-premium",
        dimmed && "opacity-[0.82]",
        className,
      )}
      style={{
        background: theme.gradient,
        borderColor: theme.ring,
        color: theme.ink,
      }}
    >
      {/* Visuel personnalisé éventuel */}
      {card.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.imageUrl}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
        />
      )}

      {/* Guillochis + reflet métallisé */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(115deg, ${theme.ring} 0 1px, transparent 1px 14px)`,
          opacity: 0.35,
          maskImage: "radial-gradient(120% 90% at 85% 0%, #000 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 85% 0%, #000 20%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full blur-2xl"
        style={{ background: theme.accent, opacity: 0.16 }}
      />

      <div className="relative p-5 sm:p-6">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className="font-display text-[10px] uppercase tracking-[0.28em]"
              style={{ color: theme.accent }}
            >
              Stone Car Prestige
            </div>
            <h3 className="mt-1 truncate font-display text-2xl uppercase leading-none sm:text-[28px]">
              {card.planName}
            </h3>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 font-display text-[10px] uppercase tracking-wider",
              statusStyle.className,
            )}
          >
            {statusStyle.label}
          </span>
        </div>

        {/* Solde */}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              {unlimited ? (
                <InfinityIcon size={30} style={{ color: theme.accent }} />
              ) : (
                <motion.span
                  key={card.used}
                  initial={reduce ? false : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-[34px] leading-none"
                  style={{ color: theme.accent }}
                >
                  {card.used}
                </motion.span>
              )}
              {!unlimited && (
                <span className="font-display text-lg opacity-70">
                  / {card.creditsTotal}
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[10.5px] uppercase tracking-[0.12em] opacity-70">
              {unlimited ? "illimité" : "prestations utilisées"}
            </div>
            <div className="mt-1 text-[13px] opacity-85">
              {unlimited ? (
                "Prestations sans limite de nombre"
              ) : (
                <>
                  <b className="font-display" style={{ color: theme.accent }}>
                    {display}
                  </b>{" "}
                  {display > 1 ? "lavages disponibles" : "lavage disponible"}
                </>
              )}
            </div>
          </div>

          {qrSvg && !compact && (
            <div
              className="w-[84px] shrink-0 rounded-lg bg-white p-1.5 shadow-lg sm:w-[108px] [&>svg]:h-auto [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          )}
        </div>

        {/* Barre de progression */}
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full"
          style={{ background: "rgba(0,0,0,0.35)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: theme.accent }}
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Tampons */}
        {!unlimited && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {stamps.map((s) => (
                <Stamp
                  key={s.index}
                  index={s.index}
                  done={s.done}
                  pop={justStamped && s.last}
                  accent={theme.accent}
                  ring={theme.ring}
                  reduce={!!reduce}
                />
              ))}
              {overflow && (
                <span className="self-center pl-1 font-display text-xs uppercase tracking-wider opacity-70">
                  +{card.creditsTotal - MAX_STAMPS}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pied de carte */}
        <div
          className="mt-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-t pt-3 text-[11px]"
          style={{ borderColor: theme.ring }}
        >
          <div className="min-w-0">
            <div className="truncate font-display text-sm uppercase tracking-wide">
              {card.holderName}
            </div>
            <div className="font-display tracking-[0.18em] opacity-70">
              {card.number}
            </div>
          </div>
          <div className="text-right">
            <div className="uppercase tracking-wider opacity-60">
              Valable jusqu&apos;au
            </div>
            <div className="font-display text-sm tracking-wide">
              {shortDate(card.expiresAt)}
            </div>
          </div>
        </div>

        {!card.usable && card.blockedReason && (
          <div
            className="mt-3 rounded-lg px-3 py-2 text-[12px]"
            style={{ background: "rgba(0,0,0,0.35)" }}
          >
            {card.blockedReason}
          </div>
        )}
      </div>
    </div>
  );
}

function Stamp({
  index,
  done,
  pop,
  accent,
  ring,
  reduce,
}: {
  index: number;
  done: boolean;
  pop: boolean;
  accent: string;
  ring: string;
  reduce: boolean;
}) {
  const base =
    "relative flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10";

  if (!done) {
    return (
      <span
        className={base}
        style={{
          border: `1px dashed ${ring}`,
          background: "rgba(0,0,0,0.18)",
        }}
        aria-label={`Emplacement ${index + 1} libre`}
      >
        <Car size={16} className="opacity-25" />
      </span>
    );
  }

  return (
    <motion.span
      className={base}
      style={{ background: accent, color: "#12100A" }}
      initial={
        reduce
          ? false
          : pop
            ? { scale: 2.1, rotate: -22, opacity: 0 }
            : { scale: 0.7, opacity: 0 }
      }
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={
        pop
          ? { type: "spring", stiffness: 420, damping: 16 }
          : { duration: 0.3, delay: Math.min(index * 0.035, 0.4) }
      }
      aria-label={`Prestation ${index + 1} utilisée`}
    >
      <Car size={17} strokeWidth={2.4} />
      <span
        className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full"
        style={{ background: "#12100A", color: accent }}
      >
        <Check size={10} strokeWidth={4} />
      </span>
    </motion.span>
  );
}
