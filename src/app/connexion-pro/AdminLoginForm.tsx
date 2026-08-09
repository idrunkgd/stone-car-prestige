"use client";

import { useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { loginAdminAction } from "./actions";

const field =
  "w-full rounded-[10px] border border-line-soft bg-night-2 px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none";

export function AdminLoginForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [f, setF] = useState({ email: "", password: "" });

  function submit() {
    setError("");
    start(async () => {
      const res = await loginAdminAction(f);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <Card>
      <div className="space-y-3">
        <input
          className={field}
          type="email"
          placeholder="Email"
          autoComplete="username"
          value={f.email}
          onChange={(e) => setF((s) => ({ ...s, email: e.target.value }))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <input
          className={field}
          type="password"
          placeholder="Mot de passe"
          autoComplete="current-password"
          value={f.password}
          onChange={(e) => setF((s) => ({ ...s, password: e.target.value }))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
      </div>

      {error && <p className="mt-3 text-sm text-state-red">{error}</p>}

      <button
        onClick={submit}
        disabled={pending}
        className={
          "mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gold-grad py-3.5 font-display text-base uppercase tracking-wide text-[#1a1400] shadow-gold " +
          (pending ? "opacity-50" : "")
        }
      >
        <Lock size={16} /> {pending ? "…" : "Se connecter"}
      </button>
    </Card>
  );
}
