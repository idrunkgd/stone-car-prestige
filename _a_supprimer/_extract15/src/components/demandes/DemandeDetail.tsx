"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, Car, Clock, Calendar, Home, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { setStatusAction, rescheduleAction } from "@/app/app/demandes/actions";
import { REQUEST_STATUS, STATUS_ORDER } from "@/lib/request-status";
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

  const dur = request.durationMin ?? 60;
  const days = useMemo(() => nextOpenDays(14, opening), [opening]);
  const times = useMemo(
    () => (day ? availableStartTimes(day, dur, booked, opening) : []),
    [day, dur, booked, opening],
  );

  function setStatus(s: (typeof STATUS_ORDER)[number]) {
    start(async () => {
      await setStatusAction(request.id, s);
      router.refresh();
    });
  }
  function saveSlot() {
    start(async () => {
      await rescheduleAction(request.id, day, slot);
      setReplan(false);
      router.refresh();
    });
  }
  function clearSlot() {
    start(async () => {
      await rescheduleAction(request.id, "", "");
      setDay("");
      setSlot("");
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
            <span className={cn("rounded-full px-2.5 py-1 font-display text-[10px] uppercase tracking-wider", REQUEST_STATUS[request.status].className)}>
              {REQUEST_STATUS[request.status].label}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-ink-muted">
            <a href={`tel:${request.phone}`} className="flex items-center gap-1.5 hover:text-gold-1"><Phone size={14} /> {request.phone}</a>
            {request.email && <a href={`mailto:${request.email}`} className="flex items-center gap-1.5 hover:text-gold-1"><Mail size={14} /> {request.email}</a>}
            {request.plate && <span className="flex items-center gap-1.5"><Car size={14} /> {request.plate}</span>}
            {request.atHome && <span className="flex items-center gap-1.5 text-gold-1"><Home size={14} /> À domicile</span>}
          </div>
          {request.message && (
            <p className="mt-3 rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-sm text-ink">{request.message}</p>
          )}
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

        {/* Créneau + replanification */}
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <b className="font-display uppercase text-gold-1">Créneau</b>
            <button onClick={() => setReplan((v) => !v)} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-gold-1">
              <CalendarClock size={14} /> Replanifier
            </button>
          </div>
          <div className="text-sm">
            {request.slotDate ? (
              <span className="capitalize">{dayLabel(request.slotDate)} · {request.slotStart}</span>
            ) : (
              <span className="text-ink-muted">À convenir (aucun créneau fixé)</span>
            )}
          </div>

          {replan && (
            <div className="mt-4 border-t border-line-soft pt-4">
              <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-muted">Nouvelle date</div>
              <div className="flex flex-wrap gap-2">
                {days.map((d) => (
                  <button key={d} onClick={() => { setDay(d); setSlot(""); }}
                    className={cn("rounded-lg border px-2.5 py-1.5 text-xs capitalize", d === day ? "border-line-gold bg-gold/15 text-gold-1" : "border-line-soft hover:border-line-gold")}>
                    {dayLabel(d)}
                  </button>
                ))}
              </div>
              {day && (
                <div className="mt-3">
                  <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-muted">Créneaux ({humanMinutes(dur)})</div>
                  {times.length === 0 ? (
                    <p className="text-sm text-ink-muted">Aucun créneau ce jour-là.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {times.map((t) => (
                        <button key={t} onClick={() => setSlot(t)}
                          className={cn("rounded-lg border px-3 py-2 font-display text-sm", t === slot ? "bg-gold-grad text-[#1a1400]" : "border-line-soft hover:border-line-gold")}>
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button onClick={saveSlot} disabled={!day || !slot || pending}
                  className={cn("rounded-lg bg-gold-grad px-4 py-2 font-display text-sm uppercase tracking-wide text-[#1a1400]", (!day || !slot || pending) && "opacity-40")}>
                  Enregistrer le créneau
                </button>
                <button onClick={clearSlot} disabled={pending} className="px-3 text-sm text-ink-muted hover:text-state-red">Retirer le créneau</button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Statut */}
      <div>
        <Card gold className="sticky top-4">
          <b className="font-display uppercase text-gold-1">Statut de la demande</b>
          <p className="my-2 text-xs text-ink-muted">Cliquez pour changer l'état (utile au téléphone avec le client).</p>
          <div className="space-y-2">
            {STATUS_ORDER.map((s) => {
              const active = request.status === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  disabled={pending}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                    active ? "border-line-gold bg-gold/10" : "border-line-soft hover:border-line-gold",
                  )}
                >
                  <span className={cn("rounded-full px-2.5 py-1 font-display text-[10px] uppercase tracking-wider", REQUEST_STATUS[s].className)}>
                    {REQUEST_STATUS[s].label}
                  </span>
                  {active && <span className="text-[11px] uppercase tracking-wider text-gold-1">Actuel</span>}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
