"use client";

import { useState, useTransition } from "react";
import { Check, Phone } from "lucide-react";
import { createRequestAction } from "@/app/reserver/actions";

const INTERESTS = [
  "Essential — Extérieur + aspirateur",
  "Premium — Extérieur + intérieur complet",
  "Signature — Premium + protection + finitions",
  "Detailing / Polissage",
  "Reconditionnement",
  "Protection céramique",
  "Autre / sur devis",
];

const field =
  "w-full rounded-[10px] border border-line-soft bg-night-2 px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none";
const label = "mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted";

export function ReservationForm() {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [f, setF] = useState({
    name: "",
    phone: "",
    email: "",
    vehicle: "",
    service: INTERESTS[0],
    preferredDate: "",
    atHome: false,
    message: "",
  });

  const valid = f.name.trim() && f.phone.trim();

  function submit() {
    if (!valid || pending) return;
    start(async () => {
      await createRequestAction({
        name: f.name.trim(),
        phone: f.phone.trim(),
        email: f.email.trim() || undefined,
        vehicle: f.vehicle.trim() || undefined,
        service: f.service,
        preferredDate: f.preferredDate || undefined,
        atHome: f.atHome,
        message: f.message.trim() || undefined,
      });
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-line-gold bg-gradient-to-b from-gold/10 to-transparent p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-grad text-[#1a1400]">
          <Check size={32} strokeWidth={3} />
        </div>
        <h3 className="font-display text-2xl uppercase">Demande envoyée</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          Merci {f.name.split(" ")[0]} ! Nous vous recontactons très vite pour
          confirmer votre rendez-vous.
        </p>
        <a
          href="tel:0499912932"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-line-gold px-6 py-3 font-display text-sm uppercase tracking-wide text-gold-1 hover:bg-gold/[0.08]"
        >
          <Phone size={16} /> Ou appelez-nous : 0499 91 29 32
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line-soft bg-night-panel p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Nom *</label>
          <input
            className={field}
            value={f.name}
            onChange={(e) => setF((s) => ({ ...s, name: e.target.value }))}
            placeholder="Votre nom"
          />
        </div>
        <div>
          <label className={label}>Téléphone *</label>
          <input
            className={field}
            value={f.phone}
            onChange={(e) => setF((s) => ({ ...s, phone: e.target.value }))}
            placeholder="0499 12 34 56"
          />
        </div>
        <div>
          <label className={label}>Email</label>
          <input
            className={field}
            type="email"
            value={f.email}
            onChange={(e) => setF((s) => ({ ...s, email: e.target.value }))}
            placeholder="vous@email.be"
          />
        </div>
        <div>
          <label className={label}>Véhicule</label>
          <input
            className={field}
            value={f.vehicle}
            onChange={(e) => setF((s) => ({ ...s, vehicle: e.target.value }))}
            placeholder="ex : BMW Série 3"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Prestation souhaitée</label>
          <select
            className={field}
            value={f.service}
            onChange={(e) => setF((s) => ({ ...s, service: e.target.value }))}
          >
            {INTERESTS.map((i) => (
              <option key={i} value={i} className="bg-night-2">
                {i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Date souhaitée</label>
          <input
            className={field}
            type="date"
            value={f.preferredDate}
            onChange={(e) => setF((s) => ({ ...s, preferredDate: e.target.value }))}
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setF((s) => ({ ...s, atHome: !s.atHome }))}
            className="flex items-center gap-3 rounded-[10px] border border-line-soft px-3.5 py-3 text-sm"
          >
            <span
              className={
                "flex h-6 w-6 items-center justify-center rounded-md border " +
                (f.atHome ? "border-gold bg-gold-grad text-[#1a1400]" : "border-line-soft")
              }
            >
              {f.atHome && <Check size={14} strokeWidth={3} />}
            </span>
            Prestation à domicile
          </button>
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Message (facultatif)</label>
          <textarea
            className={field}
            rows={3}
            value={f.message}
            onChange={(e) => setF((s) => ({ ...s, message: e.target.value }))}
            placeholder="Précisez votre besoin…"
          />
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!valid || pending}
        className={
          "mt-5 w-full rounded-xl bg-gold-grad py-4 font-display text-base uppercase tracking-wide text-[#1a1400] shadow-gold " +
          (!valid || pending ? "cursor-not-allowed opacity-40" : "")
        }
      >
        {pending ? "Envoi…" : "Envoyer ma demande"}
      </button>
      <p className="mt-2 text-center text-[11px] text-ink-faint">
        * champs obligatoires · Devis gratuit et sans engagement
      </p>
    </div>
  );
}
