import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { RealisationGallery } from "@/components/site/RealisationGallery";
import { getPublishedRealisations } from "@/lib/realisation-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Réalisations — Stone Car Prestige",
  description: "Nos avant / après : détailing, rénovation et vitrage tout véhicule.",
};

export default async function RealisationsPage() {
  const realisations = await getPublishedRealisations();

  return (
    <div id="top">
      <SiteHeader />

      <section className="relative overflow-hidden pb-24 pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(201,162,39,0.10),transparent_70%)]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-gold-2">Blog photo</div>
            <h1 className="mt-2 font-display text-4xl uppercase sm:text-5xl">Nos réalisations</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
              Faites glisser la poignée sur chaque photo pour révéler l'avant et l'après.
              Chaque véhicule peut présenter plusieurs étapes du travail réalisé.
            </p>
          </div>

          {realisations.length === 0 ? (
            <div className="rounded-2xl border border-line-soft bg-night-panel py-16 text-center text-sm text-ink-muted">
              Les premières réalisations arrivent très bientôt.
            </div>
          ) : (
            <RealisationGallery realisations={realisations} />
          )}

          <div className="mt-12 text-center">
            <Link
              href="/compte"
              className="inline-flex rounded-xl bg-gold-grad px-6 py-3 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
