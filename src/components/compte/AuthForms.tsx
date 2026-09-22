"use client";

import { useState, useTransition } from "react";
import { Building2, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { registerAction, loginAction } from "@/app/compte/actions";
import { formatVat, validateVat } from "@/lib/vat";
import type { AccountKind } from "@/lib/auth-types";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-[10px] border border-line-soft bg-night-2 px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none";

export function AuthForms() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [kind, setKind] = useState<AccountKind>("particulier");
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [vatError, setVatError] = useState("");
  const [f, setF] = useState({
    email: "",
    name: "",
    phone: "",
    password: "",
    company: "",
    vatNumber: "",
    address: "",
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const societe = kind === "societe";

  function checkVat() {
    if (!societe || !f.vatNumber.trim()) {
      setVatError("");
      return;
    }
    const v = validateVat(f.vatNumber);
    setVatError(v.ok ? "" : (v.error ?? ""));
    if (v.ok && v.value) setF((s) => ({ ...s, vatNumber: formatVat(v.value!) }));
  }

  function submit() {
    setError("");
    start(async () => {
      const res =
        mode === "login"
          ? await loginAction({ email: f.email, password: f.password })
          : await registerAction({
              email: f.email,
              name: f.name,
              phone: f.phone,
              password: f.password,
              kind,
              company: societe ? f.company : undefined,
              vatNumber: societe ? f.vatNumber : undefined,
              address: societe ? f.address : undefined,
            });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <Card className="mx-auto max-w-md">
      <div className="mb-5 flex rounded-xl border border-line-soft p-1">
        {(["register", "login"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={
              "flex-1 rounded-lg py-2 font-display text-sm uppercase tracking-wide transition-colors " +
              (mode === m ? "bg-gold-grad text-[#1a1400]" : "text-ink-muted")
            }
          >
            {m === "register" ? "Créer un compte" : "Se connecter"}
          </button>
        ))}
      </div>

      {mode === "register" && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(
            [
              { k: "particulier" as const, label: "Particulier", Icon: User },
              { k: "societe" as const, label: "Société", Icon: Building2 },
            ]
          ).map(({ k, label, Icon }) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border py-2.5 font-display text-[12px] uppercase tracking-wider transition-colors",
                kind === k
                  ? "border-line-gold bg-gold/[0.12] text-gold-1"
                  : "border-line-soft text-ink-muted hover:border-line-gold",
              )}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {mode === "register" && (
          <>
            {societe && (
              <>
                <input
                  className={field}
                  placeholder="Raison sociale *"
                  value={f.company}
                  onChange={set("company")}
                />
                <div>
                  <input
                    className={cn(field, vatError && "border-state-red")}
                    placeholder="Numéro de TVA * (BE 0123.456.749)"
                    value={f.vatNumber}
                    onChange={set("vatNumber")}
                    onBlur={checkVat}
                    autoCapitalize="characters"
                  />
                  {vatError && (
                    <p className="mt-1 text-[12px] text-state-red">{vatError}</p>
                  )}
                </div>
                <input
                  className={field}
                  placeholder="Adresse de facturation"
                  value={f.address}
                  onChange={set("address")}
                />
              </>
            )}
            <input
              className={field}
              placeholder={societe ? "Personne de contact *" : "Nom complet *"}
              value={f.name}
              onChange={set("name")}
            />
            <input
              className={field}
              placeholder="Téléphone"
              value={f.phone}
              onChange={set("phone")}
            />
          </>
        )}
        <input
          className={field}
          type="email"
          placeholder="Email"
          value={f.email}
          onChange={set("email")}
        />
        <input
          className={field}
          type="password"
          placeholder="Mot de passe"
          value={f.password}
          onChange={set("password")}
        />
      </div>

      {error && <p className="mt-3 text-sm text-state-red">{error}</p>}

      <button
        onClick={submit}
        disabled={pending}
        className={
          "mt-5 w-full rounded-xl bg-gold-grad py-3.5 font-display text-base uppercase tracking-wide text-[#1a1400] shadow-gold " +
          (pending ? "opacity-50" : "")
        }
      >
        {pending ? "…" : mode === "register" ? "Créer mon compte" : "Se connecter"}
      </button>
      <p className="mt-3 text-center text-[11px] text-ink-faint">
        {mode === "register" && societe
          ? "Votre numéro de TVA figurera sur vos devis et factures."
          : "Un compte est nécessaire pour demander un prix et suivre vos rendez-vous."}
      </p>
    </Card>
  );
}
