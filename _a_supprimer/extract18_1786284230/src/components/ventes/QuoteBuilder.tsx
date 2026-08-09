"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createQuoteAction } from "@/app/app/ventes/actions";
import { SIZE_LABEL, VAT_RATE, sizeForCategory, humanMinutes } from "@/lib/pricing";
import type { VehicleCategory } from "@/lib/demo-data";
import type { ManagedService } from "@/lib/service-catalog-types";
import { eur, cn } from "@/lib/utils";

type V = {
  id: string;
  title: string;
  plate: string;
  category: VehicleCategory;
  owner: string;
};

const selectClass =
  "w-full rounded-[10px] border border-line-soft bg-night-2 px-3.5 py-3 text-[15px] text-ink focus:border-gold focus:outline-none";

export function QuoteBuilder({
  vehicles,
  services,
}: {
  vehicles: V[];
  services: ManagedService[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [discount, setDiscount] = useState("");

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const size = vehicle ? sizeForCategory(vehicle.category) : "moyenne";

  const chosen = useMemo(
    () => services.filter((s) => selected.has(s.id)),
    [services, selected],
  );
  const items = useMemo(
    () => chosen.map((s) => ({ label: s.name, price: s.tiers[size].price })),
    [chosen, size],
  );
  const totalDuration = chosen.reduce((sum, s) => sum + s.tiers[size].duration, 0);

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const discountNum = Math.min(
    Math.max(0, parseFloat(discount.replace(",", ".")) || 0),
    subtotal,
  );
  const taxable = subtotal - discountNum;
  const vat = Math.round(taxable * (VAT_RATE / 100) * 100) / 100;
  const total = Math.round((taxable + vat) * 100) / 100;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    if (!vehicle || items.length === 0 || pending) return;
    start(async () => {
      const res = await createQuoteAction({
        customer: vehicle.owner,
        vehicleTitle: vehicle.title,
        plate: vehicle.plate,
        size,
        items,
        discount: discountNum,
      });
      router.push(`/app/ventes/devis/${res.id}`);
      router.refresh();
    });
  }

  if (vehicles.length === 0) {
    return (
      <Card className="max-w-xl py-10 text-center">
        <p className="text-sm text-ink-muted">
          Créez d'abord un véhicule pour établir un devis.
        </p>
        <Link href="/app/vehicules/nouveau">
          <Button className="mt-4">+ Nouveau véhicule</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5">
        <Card>
          <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted">
            Véhicule
          </label>
          <select className={selectClass} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id} className="bg-night-2">
                {v.title} — {v.plate} ({v.owner})
              </option>
            ))}
          </select>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-ink-muted">Taille tarifaire détectée :</span>
            <span className="rounded-full bg-gold-grad px-3 py-1 font-display text-xs uppercase tracking-wider text-[#1a1400]">
              {SIZE_LABEL[size]}
            </span>
          </div>
        </Card>

        <Card>
          <b className="font-display uppercase text-gold-1">Prestations</b>
          <p className="my-2 text-xs text-ink-muted">
            Prix et durée s'ajustent automatiquement à la taille du véhicule.
          </p>
          <div className="space-y-2">
            {services.map((s) => {
              const on = selected.has(s.id);
              const t = s.tiers[size];
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                    on ? "border-line-gold bg-gold/10" : "border-line-soft hover:border-line-gold",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md border",
                        on ? "border-gold bg-gold-grad text-[#1a1400]" : "border-line-soft",
                      )}
                    >
                      {on && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span>
                      {s.name}
                      <span className="ml-2 text-[11px] text-ink-faint">
                        <Clock size={11} className="mb-0.5 mr-0.5 inline" />
                        {humanMinutes(t.duration)}
                      </span>
                    </span>
                  </span>
                  <span className="font-display text-gold-1">{eur(t.price)}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <div>
        <Card gold className="sticky top-4">
          <b className="font-display uppercase text-gold-1">Devis</b>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">
              Sélectionnez des prestations pour composer le devis.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm">
              {items.map((i) => (
                <li key={i.label} className="flex justify-between">
                  <span>{i.label}</span>
                  <span>{eur(i.price)}</span>
                </li>
              ))}
            </ul>
          )}

          {totalDuration > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-sm">
              <Clock size={15} className="text-gold-1" />
              <span className="text-ink-muted">Durée estimée :</span>
              <span className="font-display text-gold-1">{humanMinutes(totalDuration)}</span>
            </div>
          )}

          <div className="mt-4">
            <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted">
              Remise (€)
            </label>
            <input
              value={discount}
              onChange={(e) => setDiscount(e.target.value.replace(/[^\d.,]/g, ""))}
              inputMode="decimal"
              placeholder="0"
              className="w-28 rounded-[10px] border border-line-soft bg-night-2 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
          </div>

          <div className="mt-4 space-y-1 border-t border-line-soft pt-3 text-sm">
            <div className="flex justify-between text-ink-muted">
              <span>Sous-total HT</span>
              <span>{eur(subtotal)}</span>
            </div>
            {discountNum > 0 && (
              <div className="flex justify-between text-ink-muted">
                <span>Remise</span>
                <span>-{eur(discountNum)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-muted">
              <span>TVA {VAT_RATE}%</span>
              <span>{eur(vat)}</span>
            </div>
            <div className="flex justify-between font-display text-lg">
              <span>Total TTC</span>
              <span className="text-gold-1">{eur(total)}</span>
            </div>
          </div>

          <Button
            fullWidth
            size="lg"
            disabled={items.length === 0 || pending}
            className={items.length === 0 || pending ? "mt-4 cursor-not-allowed opacity-40" : "mt-4"}
            onClick={submit}
          >
            <Check size={18} /> {pending ? "Création…" : "Créer le devis"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
