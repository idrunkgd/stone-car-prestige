import Link from "next/link";
import { Phone, Mail, Car, CreditCard } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { getCustomers, getVehicles } from "@/lib/crm-store";
import { getAccounts } from "@/lib/auth-store";
import { getAllCardViews } from "@/lib/subscription-store";
import { formatVat } from "@/lib/vat";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Clients — vue unifiée.
 *
 * Deux origines coexistent dans l'application :
 *   • « Compte »  : le client s'est inscrit sur le site (collection `accounts`),
 *                   il a un espace personnel et peut faire des demandes ;
 *   • « Fiche »   : créé au comptoir depuis le back-office (`customers`).
 *
 * Les deux sont listés ici. Un même client présent des deux côtés (même email
 * ou même téléphone) n'apparaît qu'une fois, avec les deux origines.
 */

type Row = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  sources: ("compte" | "fiche")[];
  company?: string;
  vatNumber?: string;
  accountId?: string;
  vehicles: string[];
  createdAt: string;
  /** Abonnement actif éventuel. */
  card?: { id: string; plan: string; remaining: number | null; total: number };
};

/** Clé de rapprochement : email sinon téléphone, normalisés. */
function key(email?: string, phone?: string): string {
  const e = (email ?? "").trim().toLowerCase();
  if (e) return `e:${e}`;
  const p = (phone ?? "").replace(/[^\d]/g, "");
  return p ? `p:${p}` : `x:${Math.random()}`;
}

export default async function ClientsPage() {
  const [customers, crmVehicles, accounts, cards] = await Promise.all([
    getCustomers(),
    getVehicles(),
    getAccounts(),
    getAllCardViews(),
  ]);

  const byKey = new Map<string, Row>();

  const merge = (k: string, row: Row) => {
    const existing = byKey.get(k);
    if (!existing) {
      byKey.set(k, row);
      return;
    }
    existing.sources = [...new Set([...existing.sources, ...row.sources])];
    existing.accountId = existing.accountId ?? row.accountId;
    existing.email = existing.email ?? row.email;
    existing.phone = existing.phone || row.phone;
    existing.vehicles = [...new Set([...existing.vehicles, ...row.vehicles])];
    existing.company = existing.company ?? row.company;
    existing.vatNumber = existing.vatNumber ?? row.vatNumber;
  };

  // Comptes de l'espace client
  for (const a of accounts) {
    merge(key(a.email, a.phone), {
      id: a.id,
      name: a.name,
      phone: a.phone,
      email: a.email,
      sources: ["compte"],
      company: a.kind === "societe" ? a.company : undefined,
      vatNumber: a.vatNumber,
      accountId: a.id,
      vehicles: a.vehicles.map((v) => v.plate),
      createdAt: a.createdAt,
    });
  }

  // Fiches créées au back-office
  for (const c of customers) {
    const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
    merge(key(c.email, c.phone), {
      id: c.id,
      name,
      phone: c.phone,
      email: c.email,
      sources: ["fiche"],
      company: c.company,
      vatNumber: c.vatNumber,
      vehicles: crmVehicles
        .filter((v) => v.ownerId === c.id)
        .map((v) => v.plate),
      createdAt: c.createdAt,
    });
  }

  // Rattachement des cartes d'abonnement
  for (const v of cards) {
    if (v.status !== "active") continue;
    const k = key(v.card.holder.email, v.card.holder.phone);
    const row = byKey.get(k);
    if (row && !row.card) {
      row.card = {
        id: v.card.id,
        plan: v.card.plan.name,
        remaining: v.unlimited ? null : v.remaining,
        total: v.creditsTotal,
      };
    }
  }

  const rows = [...byKey.values()].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );

  return (
    <>
      <TopBar title="Clients" cta="Client" ctaHref="/app/clients/nouveau" />

      {rows.length === 0 ? (
        <Card className="py-12 text-center text-sm text-ink-muted">
          Aucun client pour l&apos;instant. Les inscriptions faites depuis le
          site apparaîtront ici automatiquement.
        </Card>
      ) : (
        <>
          <p className="mb-3 text-[12px] text-ink-faint">
            {rows.length} client{rows.length > 1 ? "s" : ""} ·{" "}
            {rows.filter((r) => r.sources.includes("compte")).length} avec un
            espace client
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {rows.map((c) => (
              <Card
                key={c.id}
                className="p-4 transition-colors hover:border-line-gold"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-display text-lg uppercase">
                      {c.company || c.name || "Sans nom"}
                    </div>
                    {c.company && c.name && (
                      <div className="truncate text-[12px] text-ink-faint">
                        {c.name}
                      </div>
                    )}
                    {c.vatNumber && (
                      <div className="text-[12px] text-gold-2">
                        TVA {formatVat(c.vatNumber)}
                      </div>
                    )}
                    <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[12.5px] text-ink-muted">
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="flex items-center gap-1.5 hover:text-gold-1"
                        >
                          <Phone size={12} /> {c.phone}
                        </a>
                      )}
                      {c.email && (
                        <a
                          href={`mailto:${c.email}`}
                          className="flex items-center gap-1.5 truncate hover:text-gold-1"
                        >
                          <Mail size={12} /> {c.email}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {c.sources.map((s) => (
                      <span
                        key={s}
                        className={cn(
                          "rounded-full px-2 py-0.5 font-display text-[9.5px] uppercase tracking-wider",
                          s === "compte"
                            ? "border border-line-gold bg-gold/[0.08] text-gold-1"
                            : "border border-line-soft text-ink-muted",
                        )}
                      >
                        {s === "compte" ? "Compte" : "Fiche"}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line-soft pt-3 text-[12px] text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <Car size={12} />
                    {c.vehicles.length === 0
                      ? "Aucun véhicule"
                      : c.vehicles.join(" · ")}
                  </span>
                  {c.card && (
                    <Link
                      href={`/app/abonnements/${c.card.id}`}
                      className="flex items-center gap-1.5 text-gold-1 hover:underline"
                    >
                      <CreditCard size={12} />
                      {c.card.plan} ·{" "}
                      {c.card.remaining === null
                        ? "illimité"
                        : `${c.card.remaining}/${c.card.total}`}
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
