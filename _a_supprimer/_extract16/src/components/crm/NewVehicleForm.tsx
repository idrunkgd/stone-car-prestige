"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createVehicleAction } from "@/app/app/vehicules/actions";
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

const selectClass =
  "w-full rounded-[10px] border border-line-soft bg-night-2 px-3.5 py-3 text-[15px] text-ink focus:border-gold focus:outline-none";

export function NewVehicleForm({
  customers,
}: {
  customers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [f, setF] = useState({
    make: "",
    model: "",
    plate: "",
    category: "berline" as VehicleCategory,
    color: "",
    ownerId: customers[0]?.id ?? "",
  });

  const setI = (k: "make" | "model" | "plate" | "color") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setF((s) => ({ ...s, [k]: e.target.value }));

  const valid = f.make.trim() && f.model.trim() && f.plate.trim() && f.ownerId;

  function submit() {
    if (!valid || pending) return;
    const owner = customers.find((c) => c.id === f.ownerId);
    start(async () => {
      await createVehicleAction({
        make: f.make.trim(),
        model: f.model.trim(),
        plate: f.plate.trim().toUpperCase(),
        category: f.category,
        color: f.color.trim() || undefined,
        ownerId: f.ownerId,
        ownerName: owner?.name ?? "",
      });
      router.push("/app/vehicules");
      router.refresh();
    });
  }

  if (customers.length === 0) {
    return (
      <Card className="max-w-xl py-10 text-center">
        <p className="text-sm text-ink-muted">
          Créez d'abord un client, il sera le propriétaire du véhicule.
        </p>
        <Link href="/app/clients/nouveau">
          <Button className="mt-4">+ Nouveau client</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl">
      <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
        <Input label="Marque *" value={f.make} onChange={setI("make")} placeholder="BMW" />
        <Input label="Modèle *" value={f.model} onChange={setI("model")} placeholder="M340i" />
      </div>
      <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
        <Input label="Plaque *" value={f.plate} onChange={setI("plate")} placeholder="1-ABC-123" />
        <Input label="Couleur" value={f.color} onChange={setI("color")} placeholder="Noir" />
      </div>

      <div className="my-2.5">
        <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted">
          Catégorie (tarif)
        </label>
        <select
          className={selectClass}
          value={f.category}
          onChange={(e) => setF((s) => ({ ...s, category: e.target.value as VehicleCategory }))}
        >
          {CATS.map(([v, label]) => (
            <option key={v} value={v} className="bg-night-2">
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="my-2.5">
        <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted">
          Propriétaire *
        </label>
        <select
          className={selectClass}
          value={f.ownerId}
          onChange={(e) => setF((s) => ({ ...s, ownerId: e.target.value }))}
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id} className="bg-night-2">
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Button
        fullWidth
        size="lg"
        disabled={!valid || pending}
        className={!valid || pending ? "mt-4 cursor-not-allowed opacity-40" : "mt-4"}
        onClick={submit}
      >
        <Check size={18} /> {pending ? "Enregistrement…" : "Enregistrer le véhicule"}
      </Button>
      <p className="mt-2 text-center text-[11px] text-ink-faint">* champs obligatoires</p>
    </Card>
  );
}
