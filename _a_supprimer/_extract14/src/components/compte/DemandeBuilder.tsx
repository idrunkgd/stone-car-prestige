"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Clock, Calendar, Car } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { submitDemandeAction } from "@/app/compte/actions";
import {
  SIZE_LABEL,
  VAT_RATE,
  sizeForCategory,
  humanMinutes,
} from "@/lib/pricing";
import {
  availableStartTimes,
  nextOpenDays,
  dayLabel,
  fromMin,
  fitsInAnyDay,
  type Booked,
  type OpeningHours,
} from "@/lib/availability";
import type { ClientVehicle } from "@/lib/auth-types";
import type { ManagedService } from "@/lib/service-catalog-types";
import { eur, cn } from "@/lib/utils";

export function DemandeBuilder({
  vehicles,
  services,
  booked,
  opening,
}: {
  vehicles: ClientVehicle[];
  services: ManagedService[];
  booked: Booked[];
  opening: OpeningHours;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState("");
  const [message, setMessage] = useState("");

  const vehicle = vehicles.find((v) => v.id === vehicleId)!;
  const size = sizeForCategory(vehicle.category);
  const chosen = useMemo(() => services.filter((s) => selected.has(s.id)), [services, selected]);
  const duration = chosen.reduce((s, x) => s + x.tiers[size].duration, 0);
  const ht = chosen.reduce((s, x) => s + x.tiers[size].price, 0);
  const ttc = Math.round(ht * (1 + VAT_RATE / 100));

  const days = useMemo(() => nextOpenDays(10, opening), [opening]);
  const times = useMemo(
    () => (day && duration ? availableStartTimes(day, duration, booked, opening) : []),
    [day, duration, booked, opening],
  );
  const tooLong = duration > 0 && !fitsInAnyDay(duration, opening);

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    setSlot("");
  }

  const endLabel =
    slot && duration
      ? fromMin(Number(slot.split(":")[0]) * 60 + Number(slot.split(":")[1]) + duration)
      : "";

  const canSubmit = chosen.length > 0 && !pending;

  function submit() {
    if (!canSubmit) return;
    setError("");
    start(async () => {
      const res = await submitDemandeAction({
        vehicleTitle: `${vehicle.make} ${vehicle.model}`,
        plate: vehicle.plate,
        size,
        services: chosen.map((s) => ({ name: s.name, price: s.tiers[size].price, duration: s.tiers[size].duration })),
        priceEstimate: ttc,
        durationMin: duration,
        slotDate: day || undefined,
        slotStart: slot || undefined,
        message,
      });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5">
        {/* Véhicule */}
        <Card>
          <div className="mb-2 flex items-center gap-2 text-gold-1">
            <Car size={18} /> <b className="font-display uppercase">Votre véhicule</b>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => { setVehicleId(v.id); setSlot(""); }}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-colors",
                  v.id === vehicleId ? "border-line-gold bg-gold/10" : "border-line-soft hover:border-line-gold",
                )}
              >
                <div className="font-display uppercase">{v.make} {v.model}</div>
                <div className="text-[12px] text-ink-muted">{v.plate}</div>
              </button>
            ))}
          </div>
          <div className="mt-3 text-sm text-ink-muted">
            Taille tarifaire :{" "}
            <span className="rounded-full bg-gold-grad px-2.5 py-0.5 font-display text-xs uppercase text-[#1a1400]">
              {SIZE_LABEL[size]}
            </span>
          </div>
        </Card>

        {/* Prestations */}
        <Card>
          <b className="font-display uppercase text-gold-1">Prestations souhaitées</b>
          <div className="mt-3 space-y-2">
            {services.map((s) => {
              const on = selected.has(s.id);
              const t = s.tiers[size];
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                    on ? "border-line-gold bg-gold/10" : "border-line-soft hover:border-line-gold",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-md border", on ? "border-gold bg-gold-grad text-[#1a1400]" : "border-line-soft")}>
                      {on && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span>{s.name}<span className="ml-2 text-[11px] text-ink-faint"><Clock size={11} className="mb-0.5 mr-0.5 inline" />{humanMinutes(t.duration)}</span></span>
                  </span>
                  <span className="font-display text-gold-1">{eur(t.price)}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Planning */}
        <Card>
          <div className="mb-2 flex items-center gap-2 text-gold-1">
            <Calendar size={18} /> <b className="font-display uppercase">Choisir un créneau</b>
          </div>
          {tooLong && (
            <p className="mb-3 rounded-lg border border-line-gold bg-gold/[0.06] px-3 py-2 text-[12px] text-gold-1">
              Cette prestation dépasse l'amplitude d'ouverture d'une journée : envoyez
              votre demande sans créneau, nous planifierons ensemble (éventuellement
              sur plusieurs jours).
            </p>
          )}
          {duration === 0 ? (
            <p className="text-sm text-ink-muted">Sélectionnez d'abord des prestations.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {days.map((d) => (
                  <button
                    key={d}
                    onClick={() => { setDay(d); setSlot(""); }}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs capitalize transition-colors",
                      d === day ? "border-line-gold bg-gold/15 text-gold-1" : "border-line-soft hover:border-line-gold",
                    )}
                  >
                    {dayLabel(d)}
                  </button>
                ))}
              </div>
              {day && (
                <div className="mt-4">
                  <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-muted">
                    Créneaux disponibles ({humanMinutes(duration)})
                  </div>
                  {times.length === 0 ? (
                    <p className="text-sm text-ink-muted">
                      Aucun créneau ce jour-là (déjà réservé ou durée trop longue) —
                      essayez une autre date, ou envoyez sans créneau.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {times.map((t) => (
                        <button
                          key={t}
                          onClick={() => setSlot(t)}
                          className={cn(
                            "rounded-lg border px-3 py-2 font-display text-sm transition-colors",
                            t === slot ? "bg-gold-grad text-[#1a1400]" : "border-line-soft hover:border-line-gold",
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Récapitulatif */}
      <div>
        <Card gold className="sticky top-24">
          <b className="font-display uppercase text-gold-1">Votre demande</b>
          {chosen.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">Choisissez des prestations pour voir le prix indicatif.</p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm">
              {chosen.map((s) => (
                <li key={s.id} className="flex justify-between"><span>{s.name}</span><span>{eur(s.tiers[size].price)}</span></li>
              ))}
            </ul>
          )}

          <div className="mt-4 space-y-2 border-t border-line-soft pt-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Durée estimée</span>
              <span className="font-display text-gold-1">{duration ? humanMinutes(duration) : "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Prix indicatif TTC</span>
              <span className="font-display text-lg text-gold-1">{ttc ? eur(ttc) : "—"}</span>
            </div>
            {slot && (
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Créneau</span>
                <span className="text-right text-[13px] capitalize">{dayLabel(day)} · {slot}{endLabel && `→${endLabel}`}</span>
              </div>
            )}
          </div>

          <p className="mt-3 rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-[11px] text-ink-muted">
            Prix indicatif. Le tarif définitif est confirmé après avoir vu le véhicule.
          </p>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Message (facultatif)"
            className="mt-3 w-full rounded-[10px] border border-line-soft bg-night-2 px-3 py-2 text-sm focus:border-gold focus:outline-none"
          />

          {error && <p className="mt-2 text-sm text-state-red">{error}</p>}

          <button
            onClick={submit}
            disabled={!canSubmit}
            className={cn(
              "mt-4 w-full rounded-xl bg-gold-grad py-3.5 font-display text-base uppercase tracking-wide text-[#1a1400] shadow-gold",
              !canSubmit && "cursor-not-allowed opacity-40",
            )}
          >
            {pending ? "Envoi…" : "Envoyer ma demande"}
          </button>
        </Card>
      </div>
    </div>
  );
}
