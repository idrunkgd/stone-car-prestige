"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { addVehicleAction } from "@/app/compte/actions";
import type { VehicleCategory } from "@/lib/demo-data";

const CATS: [VehicleCategory, string][] = [
  ["citadine", "Citadine"],
  ["berline", "Berline"],
  ["break", "Break"],
  ["suv", "SUV"],
  ["grand-suv", "Grand SUV"],
  ["utilitaire", "Utilitaire"],
  ["sportive", "Sportive"],
  ["exception", "Véhicule exceptionnel"],
];

const field =
  "w-full rounded-[10px] border border-line-soft bg-night-2 px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none";

export function AddVehicleForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ make: "", model: "", plate: "", category: "berline" as VehicleCategory });

  const valid = f.make.trim() && f.model.trim() && f.plate.trim();

  function submit() {
    if (!valid) return;
    start(async () => {
      await addVehicleAction(f);
      setF({ make: "", model: "", plate: "", category: "berline" });
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-line-gold px-4 py-2.5 font-display text-sm uppercase tracking-wide text-gold-1 hover:bg-gold/[0.08]"
      >
        <Plus size={16} /> Ajouter un véhicule
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-line-soft bg-night-panel p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={field} placeholder="Marque" value={f.make} onChange={(e) => setF((s) => ({ ...s, make: e.target.value }))} />
        <input className={field} placeholder="Modèle" value={f.model} onChange={(e) => setF((s) => ({ ...s, model: e.target.value }))} />
        <input className={field} placeholder="Plaque" value={f.plate} onChange={(e) => setF((s) => ({ ...s, plate: e.target.value }))} />
        <select className={field} value={f.category} onChange={(e) => setF((s) => ({ ...s, category: e.target.value as VehicleCategory }))}>
          {CATS.map(([v, l]) => (
            <option key={v} value={v} className="bg-night-2">{l}</option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={submit}
          disabled={!valid || pending}
          className={"rounded-lg bg-gold-grad px-4 py-2 font-display text-sm uppercase tracking-wide text-[#1a1400] " + (!valid || pending ? "opacity-40" : "")}
        >
          Enregistrer
        </button>
        <button onClick={() => setOpen(false)} className="px-3 text-sm text-ink-muted">Annuler</button>
      </div>
    </div>
  );
}
