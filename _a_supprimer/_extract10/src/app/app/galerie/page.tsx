import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { PhotoCompare } from "@/components/galerie/PhotoCompare";
import { getCheckins } from "@/lib/checkin-store";

export const dynamic = "force-dynamic";

export default async function GaleriePage() {
  const checkins = await getCheckins();
  const withPhotos = checkins.filter(
    (c) => (c.photos?.length ?? 0) > 0 || (c.afterPhotos?.length ?? 0) > 0,
  );

  return (
    <>
      <TopBar title="Galerie avant / après" />
      {withPhotos.length === 0 ? (
        <Card className="py-14 text-center text-sm text-ink-muted">
          Aucune photo pour l'instant. Les photos prises lors des check-ins et
          check-outs apparaîtront ici, en comparaison avant / après.
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {withPhotos.map((c) => {
            const before = c.photos?.[0];
            const after = c.afterPhotos?.[0];
            return (
              <Card key={c.id} className="p-4">
                <div className="mb-3">
                  <div className="font-display text-base uppercase leading-tight">
                    {c.vehicleTitle}
                  </div>
                  <div className="text-[12px] text-ink-muted">
                    {c.service} · {c.plate}
                  </div>
                </div>
                {before && after ? (
                  <PhotoCompare before={before} after={after} />
                ) : (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={(after ?? before)!}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 rounded-full border border-line-soft bg-black/50 px-2.5 py-0.5 font-display text-[10px] uppercase tracking-widest text-ink-muted">
                      {after ? "Après" : "Avant"}
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
