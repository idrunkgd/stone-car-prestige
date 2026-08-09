import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { CarSilhouette } from "@/components/CarSilhouette";
import { getCheckins } from "@/lib/checkin-store";
import { WORK_STATUS, nextStep } from "@/lib/workorder";
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

export default async function HistoriquePage() {
  const checkins = await getCheckins();

  return (
    <>
      <TopBar title="Historique des check-ins" />
      {checkins.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="font-display text-lg uppercase text-ink">
            Aucun check-in enregistré
          </div>
          <p className="max-w-md text-sm text-ink-muted">
            Vos check-ins terminés apparaîtront ici, avec leurs photos, dommages
            relevés et signature.
          </p>
          <Link
            href="/app/checkin"
            className="mt-1 rounded-xl border border-line-gold bg-gold/[0.06] px-4 py-2 font-display text-sm uppercase tracking-wider text-gold-1"
          >
            + Démarrer un check-in
          </Link>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {checkins.map((c) => {
            const st = WORK_STATUS[c.status ?? "RECU"];
            const step = nextStep(c.id, c.status);
            return (
              <Link key={c.id} href={step.href}>
                <Card className="p-4 transition-colors hover:border-line-gold">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#26262c] to-night">
                      <CarSilhouette width={52} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-lg uppercase leading-tight">
                        {c.vehicleTitle}
                      </div>
                      <span className="my-1 inline-block rounded border border-line-soft bg-[#111] px-1.5 py-px font-display text-[11px] tracking-wider">
                        {c.plate}
                      </span>
                      <div className="truncate text-[12px] text-ink-muted">
                        {c.customer} · {c.service}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 font-display text-[10px] uppercase tracking-wider",
                          st.className,
                        )}
                      >
                        {st.label}
                      </span>
                      <div className="font-display text-gold-1">{eur(c.total)}</div>
                      <div className="text-[11px] text-ink-faint">{fmt(c.createdAt)}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3">
                    <span className="text-[11px] text-ink-muted">{c.ref}</span>
                    <span className="font-display text-[11px] uppercase tracking-wider text-gold-1">
                      {step.label} →
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
