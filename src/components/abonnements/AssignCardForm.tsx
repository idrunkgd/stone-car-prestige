"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, UserX, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SubscriptionCardVisual } from "@/components/subscription/SubscriptionCardVisual";
import { assignCardAction } from "@/app/app/abonnements/actions";
import {
  CARD_THEMES,
  defaultExpiry,
  type StoredCardStatus,
  type SubscriptionPlan,
} from "@/lib/subscription-types";
import { eur, cn } from "@/lib/utils";

export type ClientOption = {
  key: string;
  accountId?: string;
  customerId?: string;
  name: string;
  email?: string;
  phone?: string;
  plates: string[];
  /** « compte » : espace client — « fiche » : client CRM sans compte. */
  source: "compte" | "fiche";
};

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[\s.-]/g, "");
}

const toDateInput = (iso: string) => iso.slice(0, 10);

/** Attribution d'une carte : client → formule → réglages → confirmation. */
export function AssignCardForm({
  plans,
  clients,
  preselectAccountId,
}: {
  plans: SubscriptionPlan[];
  clients: ClientOption[];
  preselectAccountId?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [client, setClient] = useState<ClientOption | null>(
    clients.find((c) => c.accountId && c.accountId === preselectAccountId) ??
      null,
  );
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const plan = plans.find((p) => p.id === planId) ?? plans[0];

  const today = new Date().toISOString();
  const [startAt, setStartAt] = useState(toDateInput(today));
  const [expiresAt, setExpiresAt] = useState(
    toDateInput(defaultExpiry(today, plan?.validityDays ?? 365)),
  );
  const [credits, setCredits] = useState(String(plan?.credits ?? 10));
  const [paid, setPaid] = useState(true);
  const [pricePaid, setPricePaid] = useState(String(plan?.price ?? 0));
  const [status, setStatus] = useState<StoredCardStatus>("active");
  const [notes, setNotes] = useState("");

  // Changer de formule réaligne les valeurs par défaut.
  useEffect(() => {
    if (!plan) return;
    setCredits(String(plan.credits));
    setPricePaid(String(plan.price));
    setExpiresAt(
      toDateInput(
        defaultExpiry(new Date(startAt).toISOString(), plan.validityDays),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const results = useMemo(() => {
    const needle = norm(q);
    const base = needle
      ? clients.filter((c) =>
          norm(
            [c.name, c.email ?? "", c.phone ?? "", ...c.plates].join("|"),
          ).includes(needle),
        )
      : clients;
    return base.slice(0, 8);
  }, [clients, q]);

  const creditsNum = Number(credits.replace(/\D/g, "")) || 0;

  const preview = plan && {
    id: "preview",
    number: "SCP-2026-••••",
    planName: plan.name,
    planDescription: plan.description,
    theme: plan.theme,
    imageUrl: plan.imageUrl,
    conditions: plan.conditions,
    holderName: client?.name ?? "Bénéficiaire",
    status: status === "active" ? ("active" as const) : ("brouillon" as const),
    statusLabel: status === "active" ? "Active" : "Brouillon",
    creditsTotal: plan.kind === "illimite" ? 0 : creditsNum,
    used: 0,
    remaining: plan.kind === "illimite" ? null : creditsNum,
    startAt: new Date(startAt).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
    daysLeft: 0,
    usable: status === "active",
    paid,
    pricePaid: Number(pricePaid.replace(/[^\d.]/g, "")) || 0,
    serviceLabels: [],
  };

  function submit() {
    if (!client || !plan) return;
    setError(null);
    start(async () => {
      const r = await assignCardAction({
        planId: plan.id,
        holder: {
          accountId: client.accountId,
          customerId: client.customerId,
          name: client.name,
          email: client.email,
          phone: client.phone,
          plates: client.plates,
        },
        startAt: new Date(startAt).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        credits: creditsNum,
        paid,
        pricePaid: Number(pricePaid.replace(/[^\d.]/g, "")) || 0,
        status,
        notes: notes.trim() || undefined,
      });
      if ("error" in r && r.error) {
        setError(r.error);
        return;
      }
      if ("id" in r && r.id) router.push(`/app/abonnements/${r.id}`);
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-5">
        {error && (
          <div className="rounded-xl border border-state-red/40 bg-state-red/10 px-4 py-3 text-sm text-[#e88]">
            {error}
          </div>
        )}

        {/* 1. Client */}
        <Card>
          <Step n={1} title="Client" />
          {client ? (
            <div className="flex items-center gap-3 rounded-xl border border-line-gold bg-gold/[0.06] px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-[15px] uppercase">
                  {client.name}
                </div>
                <div className="truncate text-[12px] text-ink-muted">
                  {[client.phone, client.email].filter(Boolean).join(" · ")}
                </div>
                {client.source === "fiche" && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-state-orange">
                    <UserX size={12} /> Sans compte client : la carte ne
                    s&apos;affichera pas dans un espace personnel.
                  </div>
                )}
              </div>
              <button
                onClick={() => setClient(null)}
                className="shrink-0 text-xs text-ink-muted hover:text-ink"
              >
                Changer
              </button>
            </div>
          ) : (
            <>
              <label className="flex items-center gap-2.5 rounded-xl border border-line-soft bg-night-2 px-3.5 py-3 text-[14px] focus-within:border-gold">
                <Search size={16} className="text-ink-faint" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Nom, téléphone, email, plaque…"
                  className="w-full bg-transparent placeholder:text-ink-faint focus:outline-none"
                  autoComplete="off"
                />
              </label>
              <div className="mt-2 space-y-1.5">
                {results.length === 0 ? (
                  <p className="px-1 py-3 text-sm text-ink-muted">
                    Aucun client trouvé.
                  </p>
                ) : (
                  results.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setClient(c)}
                      className="flex w-full items-center gap-3 rounded-lg border border-line-soft px-3 py-2.5 text-left transition-colors hover:border-line-gold"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{c.name}</span>
                        <span className="block truncate text-[11.5px] text-ink-faint">
                          {[c.phone, c.email, ...c.plates]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 font-display text-[9.5px] uppercase tracking-wider",
                          c.source === "compte"
                            ? "border border-line-gold bg-gold/[0.08] text-gold-1"
                            : "border border-line-soft text-ink-muted",
                        )}
                      >
                        {c.source === "compte" ? "Compte" : "Fiche"}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </Card>

        {/* 2. Formule */}
        <Card>
          <Step n={2} title="Formule d'abonnement" />
          <div className="grid gap-2.5 sm:grid-cols-2">
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlanId(p.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                  p.id === planId
                    ? "border-line-gold bg-gold/[0.08]"
                    : "border-line-soft hover:border-line-gold",
                )}
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-lg border"
                  style={{
                    background: CARD_THEMES[p.theme].gradient,
                    borderColor: CARD_THEMES[p.theme].ring,
                  }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[15px] uppercase">
                    {p.name}
                  </span>
                  <span className="block text-[11.5px] text-ink-muted">
                    {p.kind === "illimite"
                      ? "Illimité"
                      : `${p.credits} prestations`}{" "}
                    · {eur(p.price)}
                  </span>
                </span>
                {p.id === planId && (
                  <Check size={16} className="shrink-0 text-gold-1" />
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* 3. Réglages */}
        <Card>
          <Step n={3} title="Réglages de la carte" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Date de début">
              <input
                type="date"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Date d'expiration">
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Nombre de prestations">
              <input
                value={credits}
                inputMode="numeric"
                disabled={plan?.kind === "illimite"}
                onChange={(e) => setCredits(e.target.value.replace(/\D/g, ""))}
                className={cn(
                  inputCls,
                  plan?.kind === "illimite" && "opacity-40",
                )}
              />
            </Field>
            <Field label="Montant encaissé (€)">
              <input
                value={pricePaid}
                inputMode="decimal"
                onChange={(e) =>
                  setPricePaid(e.target.value.replace(/[^\d.,]/g, ""))
                }
                className={inputCls}
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Toggle on={paid} onClick={() => setPaid(!paid)}>
              {paid ? "Payé" : "Non payé"}
            </Toggle>
            <Toggle
              on={status === "active"}
              onClick={() =>
                setStatus(status === "active" ? "brouillon" : "active")
              }
            >
              {status === "active" ? "Active immédiatement" : "Brouillon"}
            </Toggle>
          </div>

          <Field label="Note interne (facultatif)" className="mt-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex : offert suite à un geste commercial"
              className={inputCls}
            />
          </Field>
        </Card>

        <Button
          size="lg"
          fullWidth
          disabled={pending || !client || !plan}
          className={cn((pending || !client) && "opacity-50")}
          onClick={submit}
        >
          <CreditCard size={18} />
          {pending ? "Attribution…" : "Attribuer la carte"}
        </Button>
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-muted">
          Aperçu
        </div>
        {preview && <SubscriptionCardVisual card={preview} compact />}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-[10px] border border-line-soft bg-night-2 px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none";

function Step({ n, title }: { n: number; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-grad font-display text-[11px] text-[#1a1400]">
        {n}
      </span>
      <b className="font-display uppercase tracking-wide text-gold-1">{title}</b>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3.5 py-2 font-display text-[11px] uppercase tracking-wider transition-colors",
        on
          ? "border-line-gold bg-gold/15 text-gold-1"
          : "border-line-soft text-ink-muted hover:border-line-gold",
      )}
    >
      {children}
    </button>
  );
}
