import {
  Droplets,
  Wrench,
  Sparkles,
  ShieldCheck,
  Wand2,
  Car,
  Star,
  Check,
  Home,
  Phone,
  ArrowRight,
  Gem,
  BadgeCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { Reveal } from "@/components/site/Reveal";
import { CarSilhouette } from "@/components/CarSilhouette";

const SERVICES = [
  { icon: Droplets, name: "Lavage complet", desc: "Intérieur & extérieur, nettoyage en profondeur pour un résultat impeccable." },
  { icon: Wrench, name: "Lavage moteur", desc: "Nettoyage en profondeur, protège, embellit et préserve votre moteur." },
  { icon: Sparkles, name: "Detailing & polissage", desc: "Correction de la peinture et brillance profonde, finitions premium." },
  { icon: ShieldCheck, name: "Protection céramique", desc: "Protection longue durée, effet hydrophobe et éclat préservé." },
  { icon: Wand2, name: "Lifting & reconditionnement", desc: "Redonnez vie à votre véhicule, intérieur comme extérieur." },
  { icon: Car, name: "Montage accessoires", desc: "Personnalisez votre véhicule avec des accessoires de qualité." },
];

const WHY = [
  { icon: Gem, t: "Soin du détail garanti", d: "Chaque véhicule traité comme une pièce d'exception." },
  { icon: BadgeCheck, t: "Produits professionnels", d: "Des produits haut de gamme, adaptés à chaque surface." },
  { icon: Car, t: "Traitement adapté", d: "Une approche sur-mesure selon le type de véhicule." },
  { icon: Home, t: "À domicile possible", d: "Nous pouvons intervenir directement chez vous." },
];

const STEPS = [
  { n: "1", t: "Réservez", d: "Par téléphone ou message, en quelques minutes." },
  { n: "2", t: "Déposez votre véhicule", d: "À l'atelier de Thuin — ou nous venons à vous." },
  { n: "3", t: "Nous nous en occupons", d: "Soin du détail, produits pro, résultat premium." },
  { n: "4", t: "Repartez impeccable", d: "Un véhicule transformé, comme neuf." },
];

const PACKAGES = [
  { name: "Essential", price: "35", desc: "Extérieur + aspirateur", feats: ["Lavage extérieur soigné", "Aspiration habitacle", "Vitres & jantes"], highlight: false },
  { name: "Premium", price: "90", desc: "Extérieur + intérieur complet", feats: ["Tout l'Essential", "Nettoyage intérieur complet", "Plastiques & finitions"], highlight: true },
  { name: "Signature", price: "180", desc: "Le grand jeu", feats: ["Lavage premium", "Protection hydrophobe", "Détails & finitions premium"], highlight: false },
];

const AVIS = [
  { n: "Julien D.", t: "Voiture méconnaissable après un detailing complet. Travail minutieux, je recommande." },
  { n: "Sarah L.", t: "Accueil au top et résultat impeccable. On sent le vrai souci du détail." },
  { n: "Marc V.", t: "Intérieur comme neuf, service premium. Rapport qualité-prix excellent." },
];

export default function HomePage() {
  return (
    <div id="top">
      <SiteHeader />

      {/* HERO */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-5 pt-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_75%_-10%,rgba(201,162,39,0.16),transparent_55%)]" />
        <div className="pointer-events-none absolute -right-10 bottom-10 opacity-[0.08]">
          <CarSilhouette width={720} />
        </div>
        <div className="relative mx-auto w-full max-w-6xl">
          <div className="max-w-2xl animate-fade-up">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-line-gold bg-gold/[0.06] px-4 py-1.5 text-xs uppercase tracking-widest text-gold-1">
              <Star size={13} className="fill-gold-1 text-gold-1" /> Offre de lancement · −20 % sur votre premier detailing
            </span>
            <h1 className="font-display text-5xl uppercase leading-[1.05] sm:text-6xl lg:text-7xl">
              Plus qu'un lavage,
              <span className="gold-text"> une transformation.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-muted">
              Esthétique automobile haut de gamme à Thuin. Detailing,
              reconditionnement et protection — l'exigence à chaque détail.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/reserver"
                className="inline-flex items-center gap-2 rounded-xl bg-gold-grad px-7 py-4 font-display text-base uppercase tracking-wide text-[#1a1400] shadow-gold transition-transform hover:scale-[1.02]"
              >
                Réserver un lavage <ArrowRight size={18} />
              </a>
              <a
                href="#prestations"
                className="inline-flex items-center gap-2 rounded-xl border border-line-gold px-7 py-4 font-display text-base uppercase tracking-wide text-gold-1 transition-colors hover:bg-gold/[0.08]"
              >
                Découvrir nos prestations
              </a>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-ink-muted">
              <div className="flex text-gold-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-gold-1" />
                ))}
              </div>
              Déjà recommandé par nos premiers clients
            </div>
          </div>
        </div>
      </section>

      {/* PRESTATIONS */}
      <section id="prestations" className="mx-auto max-w-6xl px-5 py-24">
        <Reveal className="mb-12 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold-2">Nos prestations</div>
          <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">
            Un soin pour chaque besoin
          </h2>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.name} delay={i * 60}>
              <div className="group h-full rounded-2xl border border-line-soft bg-night-panel p-7 transition-colors hover:border-line-gold">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-grad text-[#1a1400]">
                  <s.icon size={24} />
                </div>
                <h3 className="font-display text-xl uppercase">{s.name}</h3>
                <p className="mt-2 text-sm text-ink-muted">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* POURQUOI NOUS */}
      <section className="border-y border-line-soft bg-night-2">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal className="mb-12">
            <div className="text-xs uppercase tracking-[0.3em] text-gold-2">Pourquoi nous choisir</div>
            <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">
              Votre véhicule, notre passion
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => (
              <Reveal key={w.t} delay={i * 60}>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line-gold text-gold-1">
                    <w.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg uppercase">{w.t}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{w.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* REALISATIONS / AVANT-APRÈS */}
      <section id="realisations" className="mx-auto max-w-6xl px-5 py-24">
        <Reveal className="mb-10 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold-2">Réalisations</div>
          <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">
            Le résultat parle de lui-même
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted">
            Glissez pour comparer l'avant et l'après.
          </p>
        </Reveal>
        <Reveal>
          <BeforeAfter />
        </Reveal>
      </section>

      {/* PROCESS */}
      <section className="border-y border-line-soft bg-night-2">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal className="mb-12 text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-gold-2">Comment ça marche</div>
            <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">Simple &amp; sans effort</h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 70}>
                <div className="rounded-2xl border border-line-soft bg-night-panel p-7">
                  <div className="mb-4 font-display text-5xl text-gold-3">{s.n}</div>
                  <h3 className="font-display text-lg uppercase">{s.t}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" className="mx-auto max-w-6xl px-5 py-24">
        <Reveal className="mb-12 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold-2">Tarifs</div>
          <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">Nos formules</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted">
            Tarifs adaptés à la taille de votre véhicule. Devis gratuit sur demande.
          </p>
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <Reveal key={p.name} delay={i * 70}>
              <div
                className={
                  "relative h-full rounded-2xl border p-8 " +
                  (p.highlight
                    ? "border-line-gold bg-gradient-to-b from-gold/10 to-transparent shadow-premium"
                    : "border-line-soft bg-night-panel")
                }
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-8 rounded-full bg-gold-grad px-3 py-1 font-display text-[10px] uppercase tracking-widest text-[#1a1400]">
                    Le plus choisi
                  </span>
                )}
                <h3 className="font-display text-2xl uppercase">{p.name}</h3>
                <p className="mt-1 text-sm text-ink-muted">{p.desc}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-xs text-ink-faint">dès</span>
                  <span className="font-display text-4xl text-gold-1">{p.price}&nbsp;€</span>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {p.feats.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-ink-muted">
                      <Check size={16} className="text-gold-1" /> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/reserver"
                  className={
                    "mt-7 block rounded-xl py-3 text-center font-display text-sm uppercase tracking-wide transition-colors " +
                    (p.highlight
                      ? "bg-gold-grad text-[#1a1400] shadow-gold"
                      : "border border-line-gold text-gold-1 hover:bg-gold/[0.08]")
                  }
                >
                  Réserver
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* AVIS */}
      <section className="border-y border-line-soft bg-night-2">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal className="mb-12 text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-gold-2">Avis clients</div>
            <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">Ils nous font confiance</h2>
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-3">
            {AVIS.map((a, i) => (
              <Reveal key={a.n} delay={i * 70}>
                <div className="h-full rounded-2xl border border-line-soft bg-night-panel p-7">
                  <div className="mb-3 flex text-gold-1">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} size={15} className="fill-gold-1" />
                    ))}
                  </div>
                  <p className="text-sm text-ink">“{a.t}”</p>
                  <div className="mt-4 font-display text-sm uppercase tracking-wide text-gold-2">
                    {a.n}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section id="contact" className="relative overflow-hidden px-5 py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(201,162,39,0.14),transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl">
              Votre voiture mérite mieux
              <span className="gold-text"> qu'un simple lavage.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-muted">
              Réservez dès maintenant ou demandez votre devis gratuit. À l'atelier
              de Thuin ou à domicile.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="tel:0499912932"
                className="inline-flex items-center gap-2 rounded-xl bg-gold-grad px-7 py-4 font-display text-base uppercase tracking-wide text-[#1a1400] shadow-gold"
              >
                <Phone size={18} /> 0499 91 29 32
              </a>
              <a
                href="#tarifs"
                className="inline-flex items-center gap-2 rounded-xl border border-line-gold px-7 py-4 font-display text-base uppercase tracking-wide text-gold-1 hover:bg-gold/[0.08]"
              >
                Devis gratuit
              </a>
            </div>
            <div className="mt-6 text-sm text-ink-faint">
              Thuin, Belgique · @stonecarprestige
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
