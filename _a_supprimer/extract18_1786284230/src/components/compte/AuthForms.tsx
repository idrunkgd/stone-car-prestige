"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { registerAction, loginAction } from "@/app/compte/actions";

const field =
  "w-full rounded-[10px] border border-line-soft bg-night-2 px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none";

export function AuthForms() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [f, setF] = useState({ email: "", name: "", phone: "", password: "" });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  function submit() {
    setError("");
    start(async () => {
      const res =
        mode === "login"
          ? await loginAction({ email: f.email, password: f.password })
          : await registerAction(f);
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

      <div className="space-y-3">
        {mode === "register" && (
          <>
            <input className={field} placeholder="Nom complet" value={f.name} onChange={set("name")} />
            <input className={field} placeholder="Téléphone" value={f.phone} onChange={set("phone")} />
          </>
        )}
        <input className={field} type="email" placeholder="Email" value={f.email} onChange={set("email")} />
        <input className={field} type="password" placeholder="Mot de passe" value={f.password} onChange={set("password")} />
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
        Un compte est nécessaire pour demander un prix et suivre vos rendez-vous.
      </p>
    </Card>
  );
}
