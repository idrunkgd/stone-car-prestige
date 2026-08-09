import type { Metadata } from "next";
import { MapPin, Clock, Phone, Home } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ReservationForm } from "@/components/site/ReservationForm";

export const metadata: Metadata = {
  title: "Réserver — Stone Car Prestige",
  description: "Réservez votre lavage ou demandez un devis gratuit à Thuin.",
};

export default function ReserverPage() {
  return (
    <div id="top">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-5 pb-24 pt-32">
        <div className="mb-10 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold-2">
            Réservation
          </div>
          <h1 className="mt-2 font-display text-4xl uppercase sm:text-5xl">
            Réservez votre rendez-vous
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted">
            Remplissez ce formulaire, nous vous recontactons pour confirmer.
            Devis gratuit et sans engagement.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <ReservationForm />

          <aside className="space-y-5">
            <div className="rounded-2xl border border-line-soft bg-night-panel p-6">
              <h3 className="mb-4 font-display text-sm uppercase tracking-widest text-gold-2">
                Nous contacter
              </h3>
              <ul className="space-y-3 text-sm text-ink-muted">
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-gold-1" /> 0499 91 29 32
                </li>
                <li className="flex items-center gap-3">
                  <MapPin size={16} className="text-gold-1" /> Thuin, Belgique
                </li>
                <li className="flex items-center gap-3">
                  <Clock size={16} className="text-gold-1" /> Lun–Ven 9h–18h · Sam 9h–13h
                </li>
                <li className="flex items-center gap-3">
                  <Home size={16} className="text-gold-1" /> Prestation à domicile possible
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-line-gold bg-gradient-to-b from-gold/10 to-transparent p-6">
              <div className="font-display text-lg uppercase text-gold-1">
                Offre de lancement
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                −20 % sur votre premier detailing. Profitez-en dès maintenant.
              </p>
            </div>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
