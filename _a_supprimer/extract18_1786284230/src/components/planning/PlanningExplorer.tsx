"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { requestStatusMeta } from "@/lib/request-status";
import { humanMinutes } from "@/lib/pricing";
import type { RequestStatus } from "@/lib/request-types";
import { cn } from "@/lib/utils";

export type PlanEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  durationMin: number;
  title: string;
  plate: string;
  service: string;
  status: RequestStatus;
};

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const WD = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function PlanningExplorer({ events }: { events: PlanEvent[] }) {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState<"year" | "month" | "day">("year");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [day, setDay] = useState<string>("");

  const byDate = useMemo(() => {
    const m = new Map<string, PlanEvent[]>();
    for (const e of events) {
      const arr = m.get(e.date) ?? [];
      arr.push(e);
      m.set(e.date, arr);
    }
    for (const arr of m.values()) arr.sort((a, b) => a.start.localeCompare(b.start));
    return m;
  }, [events]);

  function monthCount(y: number, mo: number) {
    const prefix = `${y}-${pad(mo + 1)}`;
    return events.filter((e) => e.date.startsWith(prefix)).length;
  }

  // ───────── Vue ANNÉE ─────────
  if (view === "year") {
    return (
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => setYear((y) => y - 1)} className="rounded-lg border border-line-soft p-2 hover:border-line-gold"><ChevronLeft size={18} /></button>
          <div className="font-display text-2xl">{year}</div>
          <button onClick={() => setYear((y) => y + 1)} className="rounded-lg border border-line-soft p-2 hover:border-line-gold"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {MONTHS.map((mo, i) => {
            const c = monthCount(year, i);
            const isCur = i === today.getMonth() && year === today.getFullYear();
            return (
              <button
                key={mo}
                onClick={() => { setMonth(i); setView("month"); }}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors hover:border-line-gold",
                  isCur ? "border-line-gold bg-gold/[0.06]" : "border-line-soft",
                )}
              >
                <div className="font-display text-lg uppercase">{mo}</div>
                <div className="mt-1 text-sm text-ink-muted">
                  {c > 0 ? <span className="text-gold-1">{c} rendez-vous</span> : "—"}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    );
  }

  // ───────── Vue MOIS ─────────
  if (view === "month") {
    const firstWd = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < firstWd; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(`${year}-${pad(month + 1)}-${pad(d)}`);

    return (
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => setView("year")} className="flex items-center gap-1 text-sm text-ink-muted hover:text-gold-1"><ChevronLeft size={16} /> {year}</button>
          <div className="font-display text-xl uppercase">{MONTHS[month]} {year}</div>
          <div className="flex gap-1">
            <button onClick={() => setMonth((m) => (m === 0 ? 11 : m - 1))} className="rounded-lg border border-line-soft p-1.5 hover:border-line-gold"><ChevronLeft size={16} /></button>
            <button onClick={() => setMonth((m) => (m === 11 ? 0 : m + 1))} className="rounded-lg border border-line-soft p-1.5 hover:border-line-gold"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {WD.map((w) => <div key={w} className="pb-1 text-center text-[11px] uppercase tracking-wider text-ink-faint">{w}</div>)}
          {cells.map((c, i) => {
            if (!c) return <div key={i} />;
            const dayNum = Number(c.slice(-2));
            const evs = byDate.get(c) ?? [];
            const isToday = c === `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
            return (
              <button
                key={c}
                onClick={() => { setDay(c); setView("day"); }}
                className={cn(
                  "flex min-h-[64px] flex-col rounded-lg border p-1.5 text-left transition-colors hover:border-line-gold",
                  evs.length ? "border-line-gold bg-gold/[0.05]" : "border-line-soft",
                  isToday && "ring-1 ring-gold",
                )}
              >
                <span className={cn("font-display text-sm", isToday && "text-gold-1")}>{dayNum}</span>
                {evs.length > 0 && (
                  <span className="mt-auto rounded bg-gold-grad px-1.5 py-0.5 text-center text-[10px] font-bold text-[#1a1400]">
                    {evs.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>
    );
  }

  // ───────── Vue JOUR ─────────
  const dayEvents = byDate.get(day) ?? [];
  const dLabel = new Date(`${day}T00:00:00`).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => setView("month")} className="flex items-center gap-1 text-sm text-ink-muted hover:text-gold-1"><ChevronLeft size={16} /> {MONTHS[month]} {year}</button>
        <div className="font-display text-lg capitalize">{dLabel}</div>
        <span className="w-16" />
      </div>
      {dayEvents.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">Aucun rendez-vous ce jour-là.</p>
      ) : (
        <div className="space-y-2.5">
          {dayEvents.map((e) => (
            <Link key={e.id} href={`/app/demandes/${e.id}`}>
              <div className="flex items-center gap-4 rounded-xl border border-line-soft bg-night-panel px-4 py-3 transition-colors hover:border-line-gold">
                <div className="w-14 font-display text-lg text-gold-1">{e.start}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-display uppercase">{e.title} <span className="ml-1 text-[11px] text-ink-faint">{e.plate}</span></div>
                  <div className="truncate text-[12px] text-ink-muted">{e.service}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn("rounded-full px-2 py-0.5 font-display text-[9px] uppercase tracking-wider", requestStatusMeta(e.status).className)}>{requestStatusMeta(e.status).label}</span>
                  <span className="flex items-center gap-1 text-[11px] text-ink-faint"><Clock size={11} /> {humanMinutes(e.durationMin)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
