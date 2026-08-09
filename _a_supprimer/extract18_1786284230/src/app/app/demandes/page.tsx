import Link from "next/link";
import { Phone, Mail, Home, Calendar } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { getRequests } from "@/lib/request-store";
import { requestStatusMeta } from "@/lib/request-status";
import { humanMinutes } from "@/lib/pricing";
import { eur, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function fmt(iso: string) {
  return new Intl.DateTimeFormat("fr-BE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function DemandesPage() {
  const requests = await getRequests();
  const nouveaux = requests.filter((r) => r.status === "nouveau").length;

  return (
    <>
      <TopBar title="Demandes de réservation" />
      {requests.length === 0 ? (
        <Card className="py-14 text-center text-sm text-ink-muted">
          Aucune demande pour l'instant. Les réservations envoyées depuis le site
          apparaîtront ici.
        </Card>
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-muted">
            {nouveaux} nouvelle{nouveaux > 1 ? "s" : ""} · {requests.length} au total
            <span className="ml-2 text-ink-faint">· cliquez une demande pour la gérer</span>
          </p>
          <div className="grid gap-3 lg:grid-cols-2">
            {requests.map((r) => (
              <Link key={r.id} href={`/app/demandes/${r.id}`}>
                <Card className={cn("p-5 transition-colors hover:border-line-gold", r.status === "nouveau" && "border-line-gold")}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display text-lg uppercase">{r.name}</div>
                      <div className="text-[13px] text-ink-muted">{r.service}</div>
                    </div>
                    <span className={cn("rounded-full px-2.5 py-1 font-display text-[10px] uppercase tracking-wider", requestStatusMeta(r.status).className)}>
                      {requestStatusMeta(r.status).label}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-ink-muted">
                    <span className="flex items-center gap-1.5"><Phone size={14} /> {r.phone}</span>
                    {r.email && <span className="flex items-center gap-1.5"><Mail size={14} /> {r.email}</span>}
                    {r.plate && <span>🚗 {r.plate}</span>}
                    {r.atHome && <span className="flex items-center gap-1.5 text-gold-1"><Home size={14} /> À domicile</span>}
                  </div>

                  {(r.priceEstimate != null || r.slotDate) && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px]">
                      {r.priceEstimate != null && <span className="font-display text-gold-1">{eur(r.priceEstimate)} TTC indicatif</span>}
                      {r.durationMin != null && <span className="text-ink-muted">⏱ {humanMinutes(r.durationMin)}</span>}
                      {r.slotDate && (
                        <span className="flex items-center gap-1 rounded-full border border-line-gold bg-gold/[0.06] px-2.5 py-0.5 text-gold-1">
                          <Calendar size={12} /> {r.slotDate} · {r.slotStart}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-3 border-t border-line-soft pt-3 text-[11px] text-ink-faint">
                    Reçu le {fmt(r.createdAt)}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
