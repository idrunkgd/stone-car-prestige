"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { markInvoicePaidAction } from "@/app/app/ventes/actions";
import { eur, cn } from "@/lib/utils";

const METHODS = ["Espèces", "Carte", "Virement"];

export function InvoicePayment({
  id,
  total,
  paid,
  method,
}: {
  id: string;
  total: number;
  paid: boolean;
  method?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [sel, setSel] = useState("Carte");

  if (paid) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-line-gold bg-state-green/10 py-3 text-state-green print:hidden">
        <Check size={18} /> Facture payée · {eur(total)} · {method}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line-soft bg-night-panel p-4 print:hidden">
      <div className="mb-3 font-display text-sm uppercase tracking-wider text-gold-1">
        Encaisser {eur(total)}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {METHODS.map((m) => (
          <button
            key={m}
            onClick={() => setSel(m)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm transition-colors",
              sel === m
                ? "border-line-gold bg-gold/15 text-gold-1"
                : "border-line-soft hover:border-line-gold",
            )}
          >
            {m}
          </button>
        ))}
        <button
          disabled={pending}
          onClick={() =>
            start(async () => {
              await markInvoicePaidAction(id, sel);
              router.refresh();
            })
          }
          className={cn(
            "ml-auto rounded-xl bg-gold-grad px-5 py-2 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold",
            pending && "opacity-50",
          )}
        >
          {pending ? "…" : "Marquer payée"}
        </button>
      </div>
    </div>
  );
}
