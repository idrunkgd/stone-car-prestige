"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { saveSettingsAction } from "@/app/app/parametres/actions";
import type { BusinessSettings } from "@/lib/settings-types";
import { cn } from "@/lib/utils";

const fieldCls =
  "w-full rounded-[10px] border border-line-soft bg-night-2 px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none";
const labelCls = "mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted";

const FIELDS: { key: keyof BusinessSettings; label: string }[] = [
  { key: "name", label: "Nom de l'entreprise" },
  { key: "companyNumber", label: "Numéro d'entreprise" },
  { key: "vat", label: "Numéro de TVA" },
  { key: "iban", label: "IBAN" },
  { key: "address", label: "Adresse" },
  { key: "phone", label: "Téléphone" },
  { key: "email", label: "Email" },
];

const DAYS: [number, string][] = [
  [1, "Lundi"],
  [2, "Mardi"],
  [3, "Mercredi"],
  [4, "Jeudi"],
  [5, "Vendredi"],
  [6, "Samedi"],
  [0, "Dimanche"],
];

export function SettingsForm({ initial }: { initial: BusinessSettings }) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState<BusinessSettings>(initial);

  function setDay(wd: number, patch: { open?: string; close?: string } | null) {
    setF((s) => ({
      ...s,
      openingHours: {
        ...s.openingHours,
        [wd]: patch === null ? null : { ...(s.openingHours[wd] ?? { open: "09:00", close: "18:00" }), ...patch },
      },
    }));
  }

  function submit() {
    start(async () => {
      await saveSettingsAction(f);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <div className="mb-2 font-display text-sm uppercase tracking-wider text-gold-1">
          Coordonnées entreprise
        </div>
        <p className="mb-4 text-xs text-ink-muted">Apparaissent sur vos devis et factures.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key} className={field.key === "address" ? "sm:col-span-2" : ""}>
              <label className={labelCls}>{field.label}</label>
              <input
                className={fieldCls}
                value={String(f[field.key] ?? "")}
                onChange={(e) => setF((s) => ({ ...s, [field.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-2 font-display text-sm uppercase tracking-wider text-gold-1">
          Horaires d'ouverture
        </div>
        <p className="mb-4 text-xs text-ink-muted">
          Déterminent les créneaux proposés aux clients lors de la réservation.
        </p>
        <div className="space-y-2">
          {DAYS.map(([wd, label]) => {
            const op = f.openingHours[wd];
            const open = op !== null && op !== undefined;
            return (
              <div key={wd} className="flex items-center gap-3">
                <span className="w-24 text-sm">{label}</span>
                <button
                  onClick={() => setDay(wd, open ? null : { open: "09:00", close: "18:00" })}
                  className={cn(
                    "rounded-md border px-2.5 py-1 font-display text-[10px] uppercase tracking-wider",
                    open ? "border-line-gold text-gold-1" : "border-line-soft text-ink-faint",
                  )}
                >
                  {open ? "Ouvert" : "Fermé"}
                </button>
                {open && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <input
                      type="time"
                      value={op!.open}
                      onChange={(e) => setDay(wd, { open: e.target.value })}
                      className="rounded-md border border-line-soft bg-night-2 px-2 py-1 text-ink focus:border-gold focus:outline-none"
                    />
                    <span className="text-ink-faint">→</span>
                    <input
                      type="time"
                      value={op!.close}
                      onChange={(e) => setDay(wd, { close: e.target.value })}
                      className="rounded-md border border-line-soft bg-night-2 px-2 py-1 text-ink focus:border-gold focus:outline-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="lg:col-span-2">
        <button
          onClick={submit}
          disabled={pending}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl bg-gold-grad py-3.5 font-display text-base uppercase tracking-wide text-[#1a1400] shadow-gold",
            pending && "opacity-50",
          )}
        >
          <Check size={18} /> {saved ? "Enregistré ✓" : pending ? "Enregistrement…" : "Enregistrer les paramètres"}
        </button>
      </div>
    </div>
  );
}
