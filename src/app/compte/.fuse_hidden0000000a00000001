import Link from "next/link";
import { Car, LogOut, Check, Clock, Calendar, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Card } from "@/components/ui/Card";
import { AuthForms } from "@/components/compte/AuthForms";
import { AddVehicleForm } from "@/components/compte/AddVehicleForm";
import { getCurrentAccount } from "@/lib/auth-store";
import { getRequests } from "@/lib/request-store";
import { logoutAction } from "./actions";
import { eur } from "@/lib/utils";
import { humanMinutes } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  nouveau: "En attente",
  devis_envoye: "Devis à accepter",
  accepte: "Accepté",
  refuse: "Refusé",
};

export default async function ComptePage({
  searchParams,
}: {
  searchParams: Promise<{ envoye?: string; accepte?: string }>;
}) {
  const account = await getCurrentAccount();
  const sp = await searchParams;

  return (
    <div id="top">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-5 pb-24 pt-32">
        {!account ? (
          <>
            <div className="mb-8 text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-gold-2">Espace client</div>
              <h1 className="mt-2 font-display text-4xl uppercase">Bienvenue</h1>
            </div>
            <AuthForms />
          </>
        ) : (
          <>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-gold-2">Espace client</div>
                <h1 className="mt-2 font-display text-4xl uppercase">Bonjour {account.name.split(" ")[0]}</h1>
              </div>
              <form action={logoutAction}>
                <button className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
                  <LogOut size={16} /> Déconnexion
                </button>
              </form>
            </div>

            {sp?.envoye && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-line-gold bg-state-green/10 px-4 py-3 text-state-green">
                <Check size={18} /> Votre demande a bien été envoyée. Nous vous recontactons rapidement.
              </div>
            )}
            {sp?.accepte && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-line-gold bg-state-green/10 px-4 py-3 text-state-green">
                <Check size={18} /> Devis accepté et acompte payé. Votre intervention est planifiée !
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Véhicules */}
              <Card>
                <div className="mb-3 flex items-center gap-2 text-gold-1">
                  <Car size={18} /> <b className="font-display uppercase">Mes véhicules</b>
                </div>
                {account.vehicles.length === 0 ? (
                  <p className="mb-4 text-sm text-ink-muted">
                    Ajoutez votre véhicule pour pouvoir demander un prix.
                  </p>
                ) : (
                  <div className="mb-4 space-y-2">
                    {account.vehicles.map((v) => (
                      <div key={v.id} className="flex items-center justify-between rounded-lg border border-line-soft px-3 py-2">
                        <span className="font-display uppercase">{v.make} {v.model}</span>
                        <span className="rounded border border-line-soft bg-[#111] px-1.5 py-px font-display text-[11px] tracking-wider">{v.plate}</span>
                      </div>
                    ))}
                  </div>
                )}
                <AddVehicleForm />
              </Card>

              {/* Action demande */}
              <Card gold className="flex flex-col items-center justify-center gap-3 text-center">
                <b className="font-display text-lg uppercase">Demander un prix</b>
                <p className="text-sm text-ink-muted">
                  Choisissez vos prestations, obtenez un prix indicatif, une durée
                  et réservez un créneau.
                </p>
                {account.vehicles.length > 0 ? (
                  <Link href="/compte/demande" className="rounded-xl bg-gold-grad px-6 py-3 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold">
                    Nouvelle demande →
                  </Link>
                ) : (
                  <span className="text-[12px] text-ink-faint">Ajoutez d'abord un véhicule.</span>
                )}
              </Card>
            </div>

            {/* Mes demandes */}
            <MyRequests accountId={account.id} />
          </>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}

async function MyRequests({ accountId }: { accountId: string }) {
  const mine = (await getRequests()).filter((r) => r.accountId === accountId);
  if (mine.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="mb-3 font-display text-sm uppercase tracking-[0.15em] text-gold-1">Mes demandes</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {mine.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display uppercase">{r.vehicleTitle ?? r.vehicle}</div>
                <div className="text-[12px] text-ink-muted">{r.service}</div>
              </div>
              <span className="rounded-full border border-line-gold bg-gold/[0.08] px-2.5 py-1 font-display text-[10px] uppercase tracking-wider text-gold-1">
                {STATUS_LABEL[r.status] ?? r.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line-soft pt-3 text-[12px] text-ink-muted">
              {r.priceEstimate != null && <span>{eur(r.priceEstimate)} TTC indicatif</span>}
              {r.durationMin != null && <span className="flex items-center gap-1"><Clock size={12} /> {humanMinutes(r.durationMin)}</span>}
              {r.slotDate && <span className="flex items-center gap-1"><Calendar size={12} /> {r.slotDate} · {r.slotStart}</span>}
            </div>
            {r.status === "devis_envoye" && r.devisId && (
              <Link href={`/compte/devis/${r.devisId}`} className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-gold-grad py-2.5 font-display text-xs uppercase tracking-wide text-[#1a1400] shadow-gold">
                Accepter le devis <ArrowRight size={14} />
              </Link>
            )}
            {r.status === "accepte" && (
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-line-gold bg-state-green/10 py-2 text-[12px] text-state-green">
                <Check size={14} /> Intervention planifiée
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
