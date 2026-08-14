"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from "@/app/app/prestations/actions";
import { SIZE_LABEL, type SizeTier } from "@/lib/pricing";
import type { ManagedService } from "@/lib/service-catalog-types";
import { cn } from "@/lib/utils";

const SIZES: SizeTier[] = ["petite", "moyenne", "grande"];
const cell =
  "w-full rounded-lg border border-line-soft bg-night-2 px-2 py-1.5 text-sm text-ink focus:border-gold focus:outline-none";

function ServiceCard({ svc }: { svc: ManagedService }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState(svc.name);
  const [tiers, setTiers] = useState(svc.tiers);
  const [description, setDescription] = useState(svc.description ?? "");
  const [hors, setHors] = useState(!!svc.horsFormule);
  const [saved, setSaved] = useState(false);

  function setTier(size: SizeTier, key: "price" | "duration", val: string) {
    const n = parseInt(val.replace(/\D/g, ""), 10) || 0;
    setTiers((t) => ({ ...t, [size]: { ...t[size], [key]: n } }));
  }

  function save() {
    start(async () => {
      await updateServiceAction(svc.id, {
        name: name.trim() || svc.name,
        tiers,
        description: description.trim(),
        horsFormule: hors,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }

  function remove() {
    start(async () => {
      await deleteServiceAction(svc.id);
      router.refresh();
    });
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-line-soft bg-night-2 px-3 py-2 font-display text-base uppercase tracking-wide text-ink focus:border-gold focus:outline-none"
        />
        <button
          onClick={remove}
          disabled={pending}
          title="Supprimer"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-soft text-ink-faint hover:border-state-red hover:text-state-red"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {SIZES.map((sz) => (
          <div key={sz} className="rounded-lg border border-line-soft p-2.5">
            <div className="mb-2 text-center font-display text-[11px] uppercase tracking-wider text-gold-1">
              {SIZE_LABEL[sz]}
            </div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-ink-faint">Prix €</label>
            <input
              inputMode="numeric"
              value={tiers[sz].price}
              onChange={(e) => setTier(sz, "price", e.target.value)}
              className={cell}
            />
            <label className="mb-1 mt-2 block text-[10px] uppercase tracking-wider text-ink-faint">
              <Clock size={10} className="mb-0.5 mr-0.5 inline" />Durée min
            </label>
            <input
              inputMode="numeric"
              value={tiers[sz].duration}
              onChange={(e) => setTier(sz, "duration", e.target.value)}
              className={cell}
            />
          </div>
        ))}
      </div>

      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (affichée sur le site, optionnel)"
        className="mt-3 w-full rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
      />
      <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-sm">
        <input type="checkbox" checked={hors} onChange={(e) => setHors(e.target.checked)} className="accent-gold-1" />
        Hors formule <span className="text-[12px] text-ink-faint">— vendue seule, affichée à part sur le site</span>
      </label>

      <button
        onClick={save}
        disabled={pending}
        className={cn(
          "mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-line-gold py-2.5 font-display text-sm uppercase tracking-wide text-gold-1 hover:bg-gold/[0.08]",
          pending && "opacity-50",
        )}
      >
        <Check size={16} /> {saved ? "Enregistré ✓" : "Enregistrer"}
      </button>
    </Card>
  );
}

export function ServiceManager({ services }: { services: ManagedService[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [newName, setNewName] = useState("");

  function add() {
    start(async () => {
      await createServiceAction(newName);
      setNewName("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nom de la nouvelle prestation"
          className="flex-1 rounded-lg border border-line-soft bg-night-2 px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
        />
        <Button onClick={add} disabled={pending} className="whitespace-nowrap">
          <Plus size={16} /> Ajouter une prestation
        </Button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {services.map((s) => (
          <ServiceCard key={s.id} svc={s} />
        ))}
      </div>
      <p className="text-[11px] text-ink-faint">
        Les prix et durées définis ici alimentent automatiquement les devis et
        (bientôt) la réservation en ligne.
      </p>
    </div>
  );
}
