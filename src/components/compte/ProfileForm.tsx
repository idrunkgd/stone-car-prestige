"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, Check, Pencil } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { updateProfileAction } from "@/app/compte/actions";
import { formatVat, validateVat } from "@/lib/vat";
import type { AccountKind, PublicAccount } from "@/lib/auth-types";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-[10px] border border-line-soft bg-night-2 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none";

/**
 * Informations de facturation du client.
 *
 * Permet de passer un compte existant en société et d'y ajouter un numéro de
 * TVA — celui-ci est ensuite reporté automatiquement sur les devis et factures.
 */
export function ProfileForm({ account }: { account: PublicAccount }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [vatError, setVatError] = useState("");

  const [kind, setKind] = useState<AccountKind>(account.kind ?? "particulier");
  const [f, setF] = useState({
    name: account.name ?? "",
    phone: account.phone ?? "",
    company: account.company ?? "",
    vatNumber: account.vatNumber ? formatVat(account.vatNumber) : "",
    address: account.address ?? "",
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const societe = kind === "societe";

  function checkVat() {
    if (!societe || !f.vatNumber.trim()) {
      setVatError("");
      return;
    }
    const v = validateVat(f.vatNumber);
    setVatError(v.ok ? "" : (v.error ?? ""));
    if (v.ok && v.value) setF((s) => ({ ...s, vatNumber: formatVat(v.value!) }));
  }

  function save() {
    setError("");
    start(async () => {
      const r = await updateProfileAction({
        name: f.name,
        phone: f.phone,
        kind,
        company: societe ? f.company : undefined,
        vatNumber: societe ? f.vatNumber : undefined,
        address: societe ? f.address : undefined,
      });
      if (r?.error) {
        setError(r.error);
        return;
      }
      setSaved(true);
      setOpen(false);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    });
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gold-1">
          {account.kind === "societe" ? <Building2 size={18} /> : <User size={18} />}
          <b className="font-display uppercase">Mes informations</b>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-gold-1"
          >
            <Pencil size={13} /> Modifier
          </button>
        )}
      </div>

      {!open ? (
        <div className="space-y-1 text-sm">
          {account.kind === "societe" ? (
            <>
              <div className="font-display text-[15px] uppercase">
                {account.company}
              </div>
              <div className="text-ink-muted">
                TVA {account.vatNumber ? formatVat(account.vatNumber) : "—"}
              </div>
              {account.address && (
                <div className="text-ink-muted">{account.address}</div>
              )}
              <div className="text-[12.5px] text-ink-faint">
                Contact : {account.name}
                {account.phone && ` · ${account.phone}`}
              </div>
            </>
          ) : (
            <>
              <div className="font-display text-[15px] uppercase">
                {account.name}
              </div>
              <div className="text-ink-muted">
                {[account.phone, account.email].filter(Boolean).join(" · ")}
              </div>
              <p className="mt-2 text-[12px] text-ink-faint">
                Vous facturez au nom d&apos;une société ? Ajoutez votre numéro
                de TVA, il figurera sur vos devis et factures.
              </p>
            </>
          )}
          {saved && (
            <div className="mt-2 flex items-center gap-1.5 text-[12.5px] text-state-green">
              <Check size={14} /> Informations enregistrées
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { k: "particulier" as const, label: "Particulier", Icon: User },
                { k: "societe" as const, label: "Société", Icon: Building2 },
              ]
            ).map(({ k, label, Icon }) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border py-2.5 font-display text-[12px] uppercase tracking-wider transition-colors",
                  kind === k
                    ? "border-line-gold bg-gold/[0.12] text-gold-1"
                    : "border-line-soft text-ink-muted hover:border-line-gold",
                )}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {societe && (
            <>
              <input
                className={field}
                placeholder="Raison sociale *"
                value={f.company}
                onChange={set("company")}
              />
              <div>
                <input
                  className={cn(field, vatError && "border-state-red")}
                  placeholder="Numéro de TVA * (BE 0123.456.749)"
                  value={f.vatNumber}
                  onChange={set("vatNumber")}
                  onBlur={checkVat}
                  autoCapitalize="characters"
                />
                {vatError && (
                  <p className="mt-1 text-[12px] text-state-red">{vatError}</p>
                )}
              </div>
              <input
                className={field}
                placeholder="Adresse de facturation"
                value={f.address}
                onChange={set("address")}
              />
            </>
          )}

          <input
            className={field}
            placeholder={societe ? "Personne de contact *" : "Nom complet *"}
            value={f.name}
            onChange={set("name")}
          />
          <input
            className={field}
            placeholder="Téléphone"
            value={f.phone}
            onChange={set("phone")}
          />

          {error && <p className="text-sm text-state-red">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              disabled={pending}
              className="flex-1 rounded-xl border border-line-soft py-2.5 font-display text-[12px] uppercase tracking-wider text-ink-muted hover:border-line-gold"
            >
              Annuler
            </button>
            <button
              onClick={save}
              disabled={pending}
              className={cn(
                "flex-[1.4] rounded-xl bg-gold-grad py-2.5 font-display text-[12px] uppercase tracking-wider text-[#1a1400] shadow-gold",
                pending && "opacity-60",
              )}
            >
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
