"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { acceptQuoteAction } from "@/app/compte/actions";
import { eur } from "@/lib/utils";

export function AcceptQuote({ quoteId, acompte }: { quoteId: string; acompte: number }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");

  return (
    <div>
      <button
        onClick={() => start(async () => { const r = await acceptQuoteAction(quoteId); if (r?.error) setErr(r.error); })}
        disabled={pending}
        className={"flex w-full items-center justify-center gap-2 rounded-xl bg-gold-grad py-4 font-display text-base uppercase tracking-wide text-[#1a1400] shadow-gold " + (pending ? "opacity-50" : "")}
      >
        <Check size={18} /> {pending ? "…" : `Accepter & payer l'acompte de ${eur(acompte)}`}
      </button>
      {err && <p className="mt-2 text-sm text-state-red">{err}</p>}
      <p className="mt-2 text-center text-[11px] text-ink-faint">
        Paiement de l'acompte simulé (prototype). Après acceptation, votre
        intervention est planifiée.
      </p>
    </div>
  );
}
