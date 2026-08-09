"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, Car, Home, CalendarClock, Check, ArrowRight, StickyNote, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  setNoteAction,
  rescheduleAction,
  refuseRequestAction,
  sendOfficialQuoteAction,
} from "@/app/app/demandes/actions";
import { requestStatusMeta } from "@/lib/request-status";
import { humanMinutes } from "@/lib/pricing";
import {
  availableStartTimes,
  nextOpenDays,
  dayLabel,
  type Booked,
  type OpeningHours,
} from "@/lib/availability";
import type { BookingRequest } from "@/lib/request-types";
import { eur, cn } from "@/lib/utils";

export function DemandeDetail({
  request,
  booked,
  opening,
}: {
  request: BookingRequest;
  booked: Booked[];
  opening: OpeningHours;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [replan, setReplan] = useState(false);
  const [day, setDay] = useState(request.slotDate ?? "");
  const [slot, setSlot] = useState(request.slotStart ?? "");
  const [note, setNote] = useState(request.note ?? "");
  const [noteSaved, setNoteSaved] = useState(false);
  const [acompte, setAcompte] = useState(String(Math.round((request.priceEstimate ?? 0) * 0.2)));

  const dur = request.durationMin ?? 60;
  const days = useMemo(() => nextOpenDays(14, opening), [opening]);
  const times = useMemo(
    () => (day ? availableStartTimes(day, dur, booked, opening) : []),
    [day, dur, booked, opening],
  );

  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  function saveSlot() { run(async () => { await rescheduleAction(request.id, day, slot); setReplan(false); }); }
  function saveNote() {
    start(async () => {
      await setNoteAction(request.id, note);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5">
        {/* Infos */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <div className="font-display text-xl uppercase">{request.name}</div>
              <div className="text-sm text-ink-muted">{request.vehicleTitle ?? request.vehicle}</div>
            </div>
            <span className={cn("rounded-full px-2.5 py-1 font-display text-[10px] uppercase tracking-wider", requestStatusMeta(request.status).className)}>
              {requestStatusMeta(request.status).label}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-ink-muted">
            <a href={`tel:${request.phone}`} className="flex items-center gap-1.5 hover:text-gold-1"><Phone size={14} /> {request.phone}</a>
            {request.email && <a href={`mailto:${request.email}`} className="flex items-center gap-1.5 hover:text-gold-1"><Mail size={14} /> {request.email}</a>}
            {request.plate && <span className="flex items-center gap-1.5"><Car size={14} /> {request.plate}</span>}
            {request.atHome && <span className="flex items-center gap-1.5 text-gold-1"><Home size={14} /> À domicile</span>}
          </div>
          {request.message && <p className="mt-3 rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-sm text-ink">« {request.message} »</p>}
        </Card>

        {/* Prestations */}
        <Card>
          <b className="font-display uppercase text-gold-1">Prestations demandées</b>
          {request.servicesList && request.servicesList.length > 0 ? (
            <ul className="mt-3 space-y-1.5 text-sm">
              {request.servicesList.map((s, i) => (
                <li key={i} className="flex justify-between">
                  <span>{s.name} <span className="text-[11px] text-ink-faint">· {humanMinutes(s.duration)}</span></span>
                  <span>{eur(s.price)}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-line-soft pt-2 font-display">
                <span>Prix indicatif TTC · {humanMinutes(dur)}</span>
                <span className="text-gold-1">{request.priceEstimate != null ? eur(request.priceEstimate) : "—"}</span>
              </li>
            </ul>
          ) : (
            <p className="mt-2 text-sm text-ink-muted">{request.service}</p>
          )}
        </Card>

        {/* Remarque interne */}
        <Card>
          <div className="mb-2 flex items-center gap-2 text-gold-1"><StickyNote size={16} /> <b className="font-display uppercase">Remarque interne</b></div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Ex : appelé le client, confirme le RDV et les prestations…" className="w-full rounded-[10px] border border-line-soft bg-night-2 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
          <button onClick={saveNote} disabled={pending} className="mt-2 rounded-lg border border-line-gold px-3 py-1.5 font-display text-xs uppercase tracking-wider text-gold-1 hover:bg-gold/[0.08]">{noteSaved ? "Enregistré ✓" : "Enregistrer la remarque"}</button>
        </Card>

        {/* Créneau + replanification */}
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <b className="font-display uppercase text-gold-1">Créneau</b>
            <button onClick={() => setReplan((v) => !v)} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-gold-1"><CalendarClock size={14} /> Replanifier</button>
          </div>
          <div className="text-sm">{request.slotDate ? <span className="capitalize">{dayLabel(request.slotDate)} · {request.slotStart}</span> : <span className="text-ink-muted">À convenir</span>}</div>
          {replan && (
            <div className="mt-4 border-t border-line-soft pt-4">
              <div className="flex flex-wrap gap-2">
                {days.map((d) => (<button key={d} onClick={() => { setDay(d); setSlot(""); }} className={cn("rounded-lg border px-2.5 py-1.5 text-xs capitalize", d === day ? "border-line-gold bg-gold/15 text-gold-1" : "border-line-soft hover:border-line-gold")}>{dayLabel(d)}</button>))}
              </div>
              {day && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {times.length === 0 ? <p className="text-sm text-ink-muted">Aucun créneau ce jour-là.</p> : times.map((t) => (<button key={t} onClick={() => setSlot(t)} className={cn("rounded-lg border px-3 py-2 font-display text-sm", t === slot ? "bg-gold-grad text-[#1a1400]" : "border-line-soft hover:border-line-gold")}>{t}</button>))}
                </div>
              )}
              <button onClick={saveSlot} disabled={!day || !slot || pending} className={cn("mt-4 rounded-lg bg-gold-grad px-4 py-2 font-display text-sm uppercase tracking-wide text-[#1a1400]", (!day || !slot || pending) && "opacity-40")}>Enregistrer le créneau</button>
            </div>
          )}
        </Card>
      </div>

      {/* Colonne action */}
      <div>
        <Card gold className="sticky top-4">
          <b className="font-display uppercase text-gold-1">Prochaine action</b>

          {request.status === "nouveau" && (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-ink-muted">Après avoir confirmé date et prestations avec le client par téléphone, envoyez le devis officiel.</p>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted">Acompte demandé (€)</label>
                <input value={acompte} onChange={(e) => setAcompte(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" className="w-28 rounded-[10px] border border-line-soft bg-night-2 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <button onClick={() => run(() => sendOfficialQuoteAction(request.id, Number(acompte) || 0))} disabled={pending || !(request.servicesList && request.servicesList.length)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-grad py-3 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold">
                <FileText size={16} /> Envoyer le devis officiel
              </button>
              <button onClick={() => run(() => refuseRequestAction(request.id))} disabled={pending} className="w-full text-center text-xs text-ink-muted hover:text-state-red">Refuser la demande</button>
            </div>
          )}

          {request.status === "devis_envoye" && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-line-gold bg-state-orange/10 px-3 py-2 text-state-orange">
                <FileText size={16} /> Devis envoyé — en attente
              </div>
              <p className="text-xs text-ink-muted">Le client accepte et paie l'acompte depuis son espace. L'intervention se créera automatiquement.</p>
              {request.devisId && (
                <Link href={`/app/ventes/devis/${request.devisId}`} className="block rounded-xl border border-line-gold py-2.5 text-center font-display text-sm uppercase tracking-wide text-gold-1 hover:bg-gold/[0.08]">Voir le devis</Link>
              )}
              <button onClick={() => run(() => refuseRequestAction(request.id))} disabled={pending} className="w-full text-center text-xs text-ink-muted hover:text-state-red">Marquer refusé</button>
            </div>
          )}

          {request.status === "accepte" && request.interventionId && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-line-gold bg-state-green/10 px-3 py-2 text-state-green"><Check size={16} /> Accepté · acompte payé · intervention créée</div>
              <Link href={`/app/checkin/${request.interventionId}`}>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-grad py-3 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold">Faire le check-in <ArrowRight size={16} /></button>
              </Link>
              <Link href={`/app/intervention/${request.interventionId}`} className="block text-center text-xs text-ink-muted hover:text-gold-1">Voir l'intervention</Link>
            </div>
          )}

          {request.status === "refuse" && (
            <p className="mt-3 text-sm text-ink-muted">Demande refusée.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
