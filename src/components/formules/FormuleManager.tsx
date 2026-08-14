"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  createFormuleAction,
  updateFormuleAction,
  deleteFormuleAction,
} from "@/app/app/formules/actions";
import { startingPrice } from "@/lib/pricing";
import type { Formule } from "@/lib/formule-types";
import type { ManagedService } from "@/lib/service-catalog-types";
import { eur } from "@/lib/utils";
import { cn } from "@/lib/utils";

function FormuleCard({
  formule,
  services,
}: {
  formule: Formule;
  services: ManagedService[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState(formule.name);
  const [description, setDescription] = useState(formule.description ?? "");
  const [highlight, setHighlight] = useState(!!formule.highlight);
  const [ids, setIds] = useState<string[]>(formule.serviceIds ?? []);
  const [saved, setSaved] = useState(false);

  const svcMap = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);
  const price = useMemo(
    () =>
      ids.reduce((sum, id) => {
        const s = svcMap.get(id);
        return sum + (s ? startingPrice(s) : 0);
      }, 0),
    [ids, svcMap],
  );

  function toggle(id: string) {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    start(async () => {
      await updateFormuleAction(formule.id, {
        name: name.trim() || formule.name,
        description: description.trim(),
        highlight,
        serviceIds: ids,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  }

  function remove() {
    start(async () => {
      await deleteFormuleAction(formule.id);
      router.refresh();
    });
  }

  const includable = services.filter((s) => !s.horsFormule);

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-line-soft bg-night-2 px-3 py-2 font-display text-lg uppercase tracking-wide text-ink focus:border-gold focus:outline-none"
        />
        <button
          onClick={remove}
          disabled={pending}
          title="Supprimer la formule"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-soft text-ink-faint hover:border-state-red hover:text-state-red"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (affichée sur le site)"
        className="mb-3 w-full rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
      />

      <div className="mb-4 flex items-center justify-between rounded-lg border border-line-soft bg-night-2 px-3 py-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={highlight} onChange={(e) => setHighlight(e.target.checked)} className="accent-gold-1" />
          <Star size={14} className={highlight ? "fill-gold-1 text-gold-1" : "text-ink-faint"} /> Mettre en avant
        </label>
        <div className="flex items-end gap-1">
          <span className="text-[11px] text-ink-faint">dès</span>
          <span className="font-display text-2xl text-gold-1">{eur(price)}</span>
        </div>
      </div>

      <div className="mb-1 text-[11px] uppercase tracking-wider text-ink-faint">Prestations incluses</div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {includable.map((s) => {
          const on = ids.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                on ? "border-line-gold bg-gold/10 text-ink" : "border-line-soft text-ink-muted hover:border-line-gold",
              )}
            >
              <span className="flex items-center gap-2">
                <span className={cn("flex h-4 w-4 items-center justify-center rounded border", on ? "border-gold bg-gold-grad text-[#1a1400]" : "border-line-soft")}>
                  {on && <Check size={11} strokeWidth={3} />}
                </span>
                {s.name}
              </span>
              <span className="text-[12px] text-ink-faint">dès {eur(startingPrice(s))}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={save}
        disabled={pending}
        className={cn(
          "mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-line-gold py-2.5 font-display text-sm uppercase tracking-wide text-gold-1 hover:bg-gold/[0.08]",
          pending && "opacity-50",
        )}
      >
        <Check size={16} /> {saved ? "Enregistré ✓" : "Enregistrer la formule"}
      </button>
    </Card>
  );
}

export function FormuleManager({
  formules,
  services,
}: {
  formules: Formule[];
  services: ManagedService[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [newName, setNewName] = useState("");

  const horsFormule = services.filter((s) => s.horsFormule);

  function add() {
    start(async () => {
      await createFormuleAction(newName);
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
          placeholder="Nom de la nouvelle formule"
          className="flex-1 rounded-lg border border-line-soft bg-night-2 px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
        />
        <Button onClick={add} disabled={pending} className="whitespace-nowrap">
          <Plus size={16} /> Ajouter une formule
        </Button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {formules.map((f) => (
          <FormuleCard key={f.id} formule={f} services={services} />
        ))}
      </div>

      <Card className="text-sm text-ink-muted">
        <b className="font-display uppercase text-gold-1">Prestations hors formule</b>
        <p className="mt-1 text-[13px]">
          Ces prestations sont vendues seules (affichées à part sur le site, prix « dès »).
          Le réglage « hors formule » se fait dans{" "}
          <a href="/app/prestations" className="text-gold-1 underline">Prestations</a>.
        </p>
        {horsFormule.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {horsFormule.map((s) => (
              <li key={s.id} className="flex justify-between border-t border-line-soft pt-1.5">
                <span>{s.name}</span>
                <span className="text-gold-1">dès {eur(startingPrice(s))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[13px] text-ink-faint">Aucune pour l'instant.</p>
        )}
      </Card>

      <p className="text-[11px] text-ink-faint">
        Le prix affiché sur le site est calculé automatiquement : « dès » = somme du plus
        petit tarif des prestations incluses. Les modifications sont visibles immédiatement sur la page d'accueil.
      </p>
    </div>
  );
}
