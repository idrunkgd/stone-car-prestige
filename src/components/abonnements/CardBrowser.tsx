"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, CreditCard, ChevronRight, UserX } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  CARD_STATUS,
  shortDate,
  type CardDTO,
  type CardStatus,
} from "@/lib/subscription-types";
import { cn } from "@/lib/utils";

export type CardListItem = {
  card: CardDTO;
  phone?: string;
  email?: string;
  plates: string[];
  /** La carte est rattachée à un compte de l'espace client. */
  linked: boolean;
};

const FILTERS: { key: "toutes" | CardStatus; label: string }[] = [
  { key: "toutes", label: "Toutes" },
  { key: "active", label: "Actives" },
  { key: "epuisee", label: "Épuisées" },
  { key: "expiree", label: "Expirées" },
  { key: "suspendue", label: "Suspendues" },
  { key: "brouillon", label: "Brouillons" },
  { key: "annulee", label: "Annulées" },
];

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[\s.-]/g, "");
}

/** Recherche par client, téléphone, email, plaque ou numéro de carte. */
export function CardBrowser({ items }: { items: CardListItem[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"toutes" | CardStatus>("toutes");

  const results = useMemo(() => {
    const needle = norm(q);
    return items.filter((it) => {
      if (filter !== "toutes" && it.card.status !== filter) return false;
      if (!needle) return true;
      const hay = norm(
        [
          it.card.number,
          it.card.holderName,
          it.phone ?? "",
          it.email ?? "",
          it.card.planName,
          ...it.plates,
        ].join("|"),
      );
      return hay.includes(needle);
    });
  }, [items, q, filter]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of items)
      m.set(it.card.status, (m.get(it.card.status) ?? 0) + 1);
    return m;
  }, [items]);

  return (
    <div>
      <label className="flex items-center gap-2.5 rounded-xl border border-line-soft bg-night-panel px-4 py-3 text-[14px] text-ink focus-within:border-gold">
        <Search size={17} className="shrink-0 text-ink-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full bg-transparent placeholder:text-ink-faint focus:outline-none"
          placeholder="Client, téléphone, email, plaque, n° de carte…"
          aria-label="Rechercher une carte"
          autoComplete="off"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="text-[11px] uppercase tracking-wider text-ink-faint hover:text-ink"
          >
            Effacer
          </button>
        )}
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const n = f.key === "toutes" ? items.length : (counts.get(f.key) ?? 0);
          if (f.key !== "toutes" && n === 0) return null;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-lg border px-3 py-1.5 font-display text-[11px] uppercase tracking-wider transition-colors",
                filter === f.key
                  ? "border-line-gold bg-gold/15 text-gold-1"
                  : "border-line-soft text-ink-muted hover:border-line-gold",
              )}
            >
              {f.label}
              <span className="ml-1.5 text-ink-faint">{n}</span>
            </button>
          );
        })}
      </div>

      {results.length === 0 ? (
        <Card className="mt-4 py-12 text-center text-sm text-ink-muted">
          {items.length === 0
            ? "Aucune carte attribuée pour l'instant."
            : "Aucune carte ne correspond à cette recherche."}
        </Card>
      ) : (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {results.map((it) => (
            <Link key={it.card.id} href={`/app/abonnements/${it.card.id}`}>
              <Card className="flex items-center gap-3 p-4 transition-colors hover:border-line-gold">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line-gold bg-gold/[0.08] text-gold-1">
                  <CreditCard size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-display text-[15px] uppercase">
                      {it.card.holderName}
                    </span>
                    {!it.linked && (
                      <span
                        title="Carte non rattachée à un compte client"
                        className="text-ink-faint"
                      >
                        <UserX size={13} />
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[12px] text-ink-muted">
                    {it.card.planName} · {it.card.number}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-ink-faint">
                    <span className="text-gold-1">
                      {it.card.remaining === null
                        ? "Illimité"
                        : `${it.card.remaining} / ${it.card.creditsTotal} restants`}
                    </span>
                    <span>exp. {shortDate(it.card.expiresAt)}</span>
                    {!it.card.paid && (
                      <span className="text-state-orange">Non payé</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-display text-[9.5px] uppercase tracking-wider",
                      CARD_STATUS[it.card.status].className,
                    )}
                  >
                    {CARD_STATUS[it.card.status].label}
                  </span>
                  <ChevronRight size={16} className="text-ink-faint" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
