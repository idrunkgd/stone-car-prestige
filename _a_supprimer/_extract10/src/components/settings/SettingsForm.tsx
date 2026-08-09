"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { saveSettingsAction } from "@/app/app/parametres/actions";
import type { BusinessSettings } from "@/lib/settings-types";

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
  { key: "hours", label: "Horaires" },
];

export function SettingsForm({ initial }: { initial: BusinessSettings }) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState<BusinessSettings>(initial);

  function submit() {
    start(async () => {
      await saveSettingsAction(f);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <Card className="max-w-2xl">
      <div className="mb-2 font-display text-sm uppercase tracking-wider text-gold-1">
        Coordonnées entreprise
      </div>
      <p className="mb-4 text-xs text-ink-muted">
        Ces informations apparaissent sur vos devis et factures.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key} className={field.key === "address" ? "sm:col-span-2" : ""}>
            <label className={labelCls}>{field.label}</label>
            <input
              className={fieldCls}
              value={f[field.key]}
              onChange={(e) => setF((s) => ({ ...s, [field.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <button
        onClick={submit}
        disabled={pending}
        className={
          "mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gold-grad py-3.5 font-display text-base uppercase tracking-wide text-[#1a1400] shadow-gold " +
          (pending ? "opacity-50" : "")
        }
      >
        <Check size={18} /> {saved ? "Enregistré ✓" : pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </Card>
  );
}
