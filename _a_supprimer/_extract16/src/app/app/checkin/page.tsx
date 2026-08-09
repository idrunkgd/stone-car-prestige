import Link from "next/link";
import { History, ClipboardCheck, Calendar } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { CarSilhouette } from "@/components/CarSilhouette";
import { getCheckins } from "@/lib/checkin-store";
import { eur } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const toCheckin = (await getCheckins()).filter(
    (c) => c.status === "PLANIFIE" && !c.checkinDone,
  );

  return (
    <>
      <TopBar title="Check-in" />
      <div className="mb-4 flex justify-end">
        <Link href="/app/checkin/historique" className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-gold-1">
          <History size={16} /> Historique des check-ins
        </Link>
      </div>

      {toCheckin.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line-gold bg-gold/[0.08] text-gold-1">
            <ClipboardCheck size={26} strokeWidth={1.6} />
          </div>
          <div className="font-display text-lg uppercase">Aucune intervention à réceptionner</div>
          <p className="max-w-md text-sm text-ink-muted">
            Le check-in se fait sur une intervention. Une intervention est créée
            lorsqu'une demande est <b>validée (acompte payé)</b> dans l'écran Demandes.
          </p>
          <Link href="/app/demandes" className="mt-1 rounded-xl border border-line-gold bg-gold/[0.06] px-4 py-2 font-display text-sm uppercase tracking-wider text-gold-1">
            Voir les demandes
          </Link>
        </Card>
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-muted">
            {toCheckin.length} intervention{toCheckin.length > 1 ? "s" : ""} à réceptionner — cliquez pour lancer le check-in.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {toCheckin.map((c) => (
              <Link key={c.id} href={`/app/checkin/${c.id}`}>
                <Card className="flex items-center gap-4 p-4 transition-colors hover:border-line-gold">
                  <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#26262c] to-night">
                    <CarSilhouette width={52} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-lg uppercase leading-tight">{c.vehicleTitle}</div>
                    <span className="my-1 inline-block rounded border border-line-soft bg-[#111] px-1.5 py-px font-display text-[11px] tracking-wider">{c.plate}</span>
                    <div className="truncate text-[12px] text-ink-muted">{c.customer} · {c.service}</div>
                    {c.slotDate && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-gold-1"><Calendar size={11} /> {c.slotDate} · {c.slotStart}</div>
                    )}
                  </div>
                  <span className="font-display text-gold-1">{eur(c.total)}</span>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
