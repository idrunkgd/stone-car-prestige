import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCheckin } from "@/lib/checkin-store";
import { PrintButton } from "@/components/checkin/PrintButton";
import { eur } from "@/lib/utils";

export const dynamic = "force-dynamic";

function longDateTime(iso: string) {
  return new Intl.DateTimeFormat("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function RapportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rec = await getCheckin(id);
  if (!rec) notFound();

  return (
    <div>
      {/* Barre d'action (non imprimée) */}
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/app/checkin/historique"
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Historique
        </Link>
        <PrintButton />
      </div>

      {/* Feuille du rapport (thème clair, façon document) */}
      <div className="sheet mx-auto max-w-3xl rounded-xl bg-white p-8 text-neutral-900 shadow-premium print:rounded-none print:shadow-none">
        <div className="flex items-start justify-between border-b-2 border-[#C9A227] pb-4">
          <div>
            <div className="text-2xl font-bold uppercase tracking-wide">
              Stone Car <span className="text-[#C9A227]">Prestige</span>
            </div>
            <div className="text-xs uppercase tracking-widest text-neutral-500">
              L'exigence à chaque détail · Thuin
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-bold">Rapport d'état des lieux</div>
            <div className="text-neutral-500">Check-in · {rec.ref}</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400">
              Véhicule
            </div>
            <div className="text-lg font-semibold">{rec.vehicleTitle}</div>
            <div className="inline-block rounded border border-neutral-300 px-2 py-0.5 font-mono text-sm">
              {rec.plate}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400">
              Client
            </div>
            <div className="text-lg font-semibold">{rec.customer}</div>
            <div className="text-neutral-500">{rec.service}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400">
              Date du check-in
            </div>
            <div className="capitalize">{longDateTime(rec.createdAt)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-400">
              Kilométrage
            </div>
            <div>{rec.mileage ? `${rec.mileage} km` : "—"}</div>
          </div>
        </div>

        {/* Dommages */}
        <div className="mt-6">
          <div className="mb-2 text-sm font-bold uppercase tracking-wide text-[#9C7B1E]">
            État des lieux — dommages préexistants
          </div>
          {rec.damages.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Aucun dommage relevé. Véhicule réputé en bon état à la réception.
            </p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-300 text-left text-xs uppercase text-neutral-500">
                  <th className="py-1.5">Zone</th>
                  <th className="py-1.5">Type</th>
                  <th className="py-1.5">Remarque</th>
                </tr>
              </thead>
              <tbody>
                {rec.damages.map((d) => (
                  <tr key={d.id} className="border-b border-neutral-100">
                    <td className="py-1.5">{d.zoneLabel}</td>
                    <td className="py-1.5 font-medium">{d.type}</td>
                    <td className="py-1.5 text-neutral-500">{d.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Photos */}
        {rec.photos.length > 0 && (
          <div className="mt-6">
            <div className="mb-2 text-sm font-bold uppercase tracking-wide text-[#9C7B1E]">
              Photos ({rec.photos.length})
            </div>
            <div className="grid grid-cols-4 gap-2">
              {rec.photos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`Photo ${i + 1}`}
                  className="aspect-square w-full rounded border border-neutral-200 object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Prestations & total */}
        <div className="mt-6">
          <div className="mb-2 text-sm font-bold uppercase tracking-wide text-[#9C7B1E]">
            Prestations prévues
          </div>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr className="border-b border-neutral-100">
                <td className="py-1.5">{rec.service}</td>
                <td className="py-1.5 text-right">{eur(rec.total - rec.options.reduce((s, o) => s + o.price, 0))}</td>
              </tr>
              {rec.options.map((o, i) => (
                <tr key={i} className="border-b border-neutral-100 text-neutral-600">
                  <td className="py-1.5">+ {o.label}</td>
                  <td className="py-1.5 text-right">{eur(o.price)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-neutral-300 font-bold">
                <td className="py-2">Total estimé</td>
                <td className="py-2 text-right text-[#9C7B1E]">{eur(rec.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signature */}
        <div className="mt-6 flex items-end justify-between">
          <p className="max-w-md text-[11px] text-neutral-500">
            Le client reconnaît l'exactitude de l'état des lieux ci-dessus et
            approuve les prestations avant intervention.
          </p>
          <div className="text-center">
            {rec.signature ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={rec.signature}
                alt="Signature"
                className="h-20 w-48 rounded border border-neutral-200 object-contain"
                style={{ background: "#fff" }}
              />
            ) : (
              <div className="h-20 w-48 rounded border border-dashed border-neutral-300" />
            )}
            <div className="mt-1 text-xs text-neutral-500">
              Signature — {rec.customer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
