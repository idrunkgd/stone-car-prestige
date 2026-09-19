"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown, Check, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SubscriptionCardVisual } from "@/components/subscription/SubscriptionCardVisual";
import {
  createPlanAction,
  deletePlanAction,
  updatePlanAction,
} from "@/app/app/abonnements/actions";
import {
  CARD_THEMES,
  THEME_KEYS,
  defaultExpiry,
  type CardTheme,
  type PlanKind,
  type SubscriptionPlan,
} from "@/lib/subscription-types";
import type { ManagedService } from "@/lib/service-catalog-types";
import { eur, cn } from "@/lib/utils";

/**
 * Gestion des formules d'abonnement (Carte Essential, Premium, Prestige…).
 * Aperçu en direct de la carte telle que le client la verra.
 */
export function PlanManager({
  plans,
  services,
}: {
  plans: SubscriptionPlan[];
  services: ManagedService[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState<string | null>(plans[0]?.id ?? null);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ error?: string } | unknown>) {
    start(async () => {
      const r = (await fn()) as { error?: string } | undefined;
      if (r && "error" in r && r.error) setError(r.error);
      else setError(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-state-red/40 bg-state-red/10 px-4 py-3 text-sm text-[#e88]">
          {error}
        </div>
      )}

      <Card className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted">
            Nouvelle formule
          </label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex : Carte Premium"
            className="w-full rounded-[10px] border border-line-soft bg-night-2 px-3.5 py-3 text-[15px] focus:border-gold focus:outline-none"
          />
        </div>
        <Button
          disabled={pending || !newName.trim()}
          onClick={() =>
            run(async () => {
              const r = await createPlanAction(newName.trim());
              setNewName("");
              if ("id" in r && r.id) setOpen(r.id);
              return r;
            })
          }
        >
          <Plus size={16} /> Créer
        </Button>
      </Card>

      {plans.length === 0 ? (
        <Card className="py-12 text-center text-sm text-ink-muted">
          Aucune formule pour l&apos;instant. Créez « Carte Essential »,
          « Carte Premium », « Carte Prestige »…
        </Card>
      ) : (
        plans.map((plan) => (
          <PlanRow
            key={plan.id}
            plan={plan}
            services={services}
            open={open === plan.id}
            toggle={() => setOpen(open === plan.id ? null : plan.id)}
            pending={pending}
            run={run}
          />
        ))
      )}
    </div>
  );
}

function PlanRow({
  plan,
  services,
  open,
  toggle,
  pending,
  run,
}: {
  plan: SubscriptionPlan;
  services: ManagedService[];
  open: boolean;
  toggle: () => void;
  pending: boolean;
  run: (fn: () => Promise<unknown>) => void;
}) {
  const [draft, setDraft] = useState<SubscriptionPlan>(plan);
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(plan);

  const patch = (p: Partial<SubscriptionPlan>) =>
    setDraft((d) => ({ ...d, ...p }));

  function save() {
    run(async () => {
      const r = await updatePlanAction(plan.id, {
        name: draft.name,
        description: draft.description,
        price: draft.price,
        credits: draft.credits,
        kind: draft.kind,
        serviceIds: draft.serviceIds,
        validityDays: draft.validityDays,
        active: draft.active,
        theme: draft.theme,
        imageUrl: draft.imageUrl,
        conditions: draft.conditions,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      return r;
    });
  }

  const preview = {
    id: plan.id,
    number: "SCP-2026-0000",
    planName: draft.name || "Carte",
    planDescription: draft.description,
    theme: draft.theme,
    imageUrl: draft.imageUrl,
    conditions: draft.conditions,
    holderName: "Aperçu client",
    status: "active" as const,
    statusLabel: "Active",
    creditsTotal: draft.kind === "illimite" ? 0 : draft.credits,
    used: draft.kind === "illimite" ? 0 : Math.min(2, draft.credits),
    remaining:
      draft.kind === "illimite"
        ? null
        : Math.max(0, draft.credits - Math.min(2, draft.credits)),
    startAt: new Date().toISOString(),
    expiresAt: defaultExpiry(new Date().toISOString(), draft.validityDays || 365),
    daysLeft: draft.validityDays || 365,
    usable: true,
    paid: true,
    pricePaid: draft.price,
    serviceLabels: [],
  };

  return (
    <Card className="p-0">
      <button
        onClick={toggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span
          className="h-9 w-9 shrink-0 rounded-lg border"
          style={{
            background: CARD_THEMES[plan.theme].gradient,
            borderColor: CARD_THEMES[plan.theme].ring,
          }}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-lg uppercase">
            {plan.name}
          </span>
          <span className="block text-[12px] text-ink-muted">
            {plan.kind === "illimite"
              ? "Illimité"
              : `${plan.credits} prestation${plan.credits > 1 ? "s" : ""}`}{" "}
            · {eur(plan.price)} · {plan.validityDays} j
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 font-display text-[10px] uppercase tracking-wider",
            plan.active
              ? "bg-state-green/15 text-state-green"
              : "border border-line-soft bg-night-panel2 text-ink-muted",
          )}
        >
          {plan.active ? "Actif" : "Inactif"}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 text-ink-faint transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="grid gap-6 border-t border-line-soft p-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="space-y-4">
            <Field label="Nom">
              <input
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Description">
              <textarea
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value })}
                rows={2}
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Prix TTC (€)">
                <input
                  value={String(draft.price)}
                  inputMode="decimal"
                  onChange={(e) =>
                    patch({
                      price: Number(e.target.value.replace(/[^\d.]/g, "")) || 0,
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Prestations">
                <input
                  value={String(draft.credits)}
                  inputMode="numeric"
                  disabled={draft.kind === "illimite"}
                  onChange={(e) =>
                    patch({
                      credits: Number(e.target.value.replace(/\D/g, "")) || 0,
                    })
                  }
                  className={cn(inputCls, draft.kind === "illimite" && "opacity-40")}
                />
              </Field>
              <Field label="Validité (jours)">
                <input
                  value={String(draft.validityDays)}
                  inputMode="numeric"
                  onChange={(e) =>
                    patch({
                      validityDays:
                        Number(e.target.value.replace(/\D/g, "")) || 0,
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Type">
                <select
                  value={draft.kind}
                  onChange={(e) => patch({ kind: e.target.value as PlanKind })}
                  className={inputCls}
                >
                  <option value="credits">Nombre de lavages</option>
                  <option value="illimite">Illimité</option>
                </select>
              </Field>
            </div>

            <Field label="Prestations concernées (aucune cochée = toutes)">
              <div className="flex flex-wrap gap-2">
                {services.map((s) => {
                  const on = draft.serviceIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        patch({
                          serviceIds: on
                            ? draft.serviceIds.filter((x) => x !== s.id)
                            : [...draft.serviceIds, s.id],
                        })
                      }
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-[12px] transition-colors",
                        on
                          ? "border-line-gold bg-gold/15 text-gold-1"
                          : "border-line-soft text-ink-muted hover:border-line-gold",
                      )}
                    >
                      {on && <Check size={11} className="mr-1 inline" />}
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Apparence de la carte">
              <div className="flex flex-wrap gap-2">
                {THEME_KEYS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    title={CARD_THEMES[t].label}
                    onClick={() => patch({ theme: t as CardTheme })}
                    className={cn(
                      "h-10 w-14 rounded-lg border-2 transition-transform",
                      draft.theme === t
                        ? "scale-105 border-gold"
                        : "border-transparent opacity-70 hover:opacity-100",
                    )}
                    style={{ background: CARD_THEMES[t].gradient }}
                  />
                ))}
              </div>
            </Field>

            <Field label="Visuel de fond (URL ou data:image — optionnel)">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="shrink-0 text-ink-faint" />
                <input
                  value={draft.imageUrl ?? ""}
                  onChange={(e) =>
                    patch({ imageUrl: e.target.value.trim() || undefined })
                  }
                  placeholder="https://…"
                  className={inputCls}
                />
              </div>
            </Field>

            <Field label="Conditions (affichées au client)">
              <textarea
                value={draft.conditions ?? ""}
                onChange={(e) =>
                  patch({ conditions: e.target.value || undefined })
                }
                rows={2}
                placeholder="Ex : non remboursable, utilisable sur un seul véhicule…"
                className={inputCls}
              />
            </Field>

            <div className="flex flex-wrap items-center gap-3 border-t border-line-soft pt-4">
              <button
                type="button"
                onClick={() => patch({ active: !draft.active })}
                className={cn(
                  "rounded-lg border px-3 py-2 font-display text-[11px] uppercase tracking-wider",
                  draft.active
                    ? "border-state-green/40 bg-state-green/10 text-state-green"
                    : "border-line-soft text-ink-muted",
                )}
              >
                {draft.active ? "Actif" : "Inactif"}
              </button>

              <Button
                onClick={save}
                disabled={pending || !dirty}
                className={cn(!dirty && "opacity-40")}
              >
                {saved ? "Enregistré ✓" : "Enregistrer"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      `Supprimer la formule « ${plan.name} » ? Si des cartes y sont rattachées, elle sera seulement désactivée.`,
                    )
                  ) {
                    run(() => deletePlanAction(plan.id));
                  }
                }}
                className="ml-auto flex items-center gap-1.5 text-xs text-ink-muted hover:text-state-red"
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-muted">
              Aperçu client
            </div>
            <SubscriptionCardVisual card={preview} compact />
          </div>
        </div>
      )}
    </Card>
  );
}

const inputCls =
  "w-full rounded-[10px] border border-line-soft bg-night-2 px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
