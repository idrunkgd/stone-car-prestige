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
import { Reveal } from "@/components/site/Reveal";
import { getFormules } from "@/lib/formule-store";
import { getServices } from "@/lib/service-catalog-store";
import { startingPrice } from "@/lib/pricing";

export const dynamic = "force-dynamic";

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

const VITRAGE = [
  { icon: Car, t: "Pare-brise", d: "Remplacement complet, toutes marques et tous modèles." },
  { icon: Wrench, t: "Réparation d'impact", d: "Intervention rapide avant que la fissure ne se propage." },
  { icon: Sparkles, t: "Vitres latérales", d: "Remplacement des vitres avant et arrière." },
  { icon: ShieldCheck, t: "Lunette arrière", d: "Remplacement, dégivrage et antenne intégrés." },
  { icon: Gem, t: "Toit ouvrant / panoramique", d: "Remplacement et étanchéité du vitrage de toit." },
  { icon: BadgeCheck, t: "Calibrage caméras", d: "Recalibrage des aides à la conduite après la pose." },
];

export default async function HomePage() {
  const [formules, services] = await Promise.all([getFormules(), getServices()]);
  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const horsFormule = services.filter((s) => s.horsFormule && s.active !== false);
  const formulePrice = (ids: string[]) =>
    ids.reduce((sum, id) => {
      const sv = serviceMap.get(id);
      return sum + (sv ? startingPrice(sv) : 0);
    }, 0);

  return (
    <div id="top">
      <SiteHeader />

      {/* HERO */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-5 pt-24">
        {/* Photo de fond — Chrysler 300C dans le décor Stone Car Prestige */}
        <div className="pointer-events-none absolute inset-0">
          <img
            src="/hero-car.jpg"
            alt=""
            className="h-full w-full object-cover object-center opacity-45"
          />
          {/* Fondus pour que la photo s'imprègne dans le thème sombre */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#0C0C0E_0%,rgba(12,12,14,0.86)_34%,rgba(12,12,14,0.30)_66%,rgba(12,12,14,0.66)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#0C0C0E_0%,transparent_40%,transparent_72%,rgba(12,12,14,0.75)_100%)]" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_75%_-10%,rgba(201,162,39,0.16),transparent_55%)]" />
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
                href="/compte"
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
      <section id="prestations" className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(50%_70%_at_85%_-5%,rgba(201,162,39,0.15),transparent_55%),radial-gradient(45%_60%_at_5%_100%,rgba(201,162,39,0.10),transparent_55%)]" />
          <div className="absolute inset-0 opacity-50 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_7px)]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5">
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

      {/* REALISATIONS / VITRAGE */}
      <section id="realisations" className="relative overflow-hidden py-24">
        {/* Fond d'ambiance — or & carbone */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(55%_75%_at_12%_0%,rgba(201,162,39,0.16),transparent_55%),radial-gradient(52%_72%_at_92%_100%,rgba(201,162,39,0.12),transparent_55%)]" />
          <div className="absolute inset-0 opacity-60 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_7px)]" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_58%,rgba(8,8,10,0.55)_100%)]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5">
        <Reveal className="mb-10 text-center [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">
          <div className="text-xs uppercase tracking-[0.3em] text-gold-2">Réalisations</div>
          <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">
            Vitrage — tout véhicule
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted">
            Remplacement et réparation de vitrage, tout véhicule — sur devis.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VITRAGE.map((v, i) => {
            const Icon = v.icon;
            return (
              <Reveal key={v.t} delay={i * 60}>
                <div className="flex h-full flex-col rounded-2xl border border-line-soft bg-[rgba(16,16,20,0.86)] p-7 backdrop-blur-sm transition-colors hover:border-line-gold">
                  <Icon className="text-gold-1" size={26} />
                  <h3 className="mt-4 font-display text-lg uppercase">{v.t}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{v.d}</p>
                  <span className="mt-4 inline-block w-fit rounded-full border border-line-gold bg-gold/[0.08] px-3 py-1 font-display text-[10px] uppercase tracking-widest text-gold-1">
                    Sur devis
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* dalle longue transversale */}
        <Reveal delay={120}>
          <div className="mt-5 flex flex-col items-center justify-between gap-5 rounded-2xl border border-line-gold bg-gradient-to-r from-gold/[0.14] to-[rgba(16,16,20,0.72)] p-8 backdrop-blur-sm sm:flex-row">
            <div>
              <h3 className="font-display text-2xl uppercase">Remplacement &amp; réparation de vitrage</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Pare-brise, vitres, lunette, toit — tout véhicule. Devis rapide et sans engagement.
              </p>
            </div>
            <a
              href="/compte"
              className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-gold-grad px-6 py-3 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold"
            >
              Demander un devis <ArrowRight size={16} />
            </a>
          </div>
        </Reveal>
        </div>
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
      <section id="tarifs" className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(55%_75%_at_50%_-8%,rgba(201,162,39,0.16),transparent_55%)]" />
          <div className="absolute inset-0 opacity-50 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_7px)]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5">
        <Reveal className="mb-12 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold-2">Tarifs</div>
          <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">Nos formules</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted">
            Tarifs adaptés à la taille de votre véhicule. Devis gratuit sur demande.
          </p>
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          {formules.map((f, i) => {
            const feats = f.serviceIds
              .map((id) => serviceMap.get(id)?.name)
              .filter((n): n is string => Boolean(n));
            return (
              <Reveal key={f.id} delay={i * 70}>
                <div
                  className={
                    "relative h-full rounded-2xl border p-8 " +
                    (f.highlight
                      ? "border-line-gold bg-gradient-to-b from-gold/10 to-transparent shadow-premium"
                      : "border-line-soft bg-night-panel")
                  }
                >
                  {f.highlight && (
                    <span className="absolute -top-3 left-8 rounded-full bg-gold-grad px-3 py-1 font-display text-[10px] uppercase tracking-widest text-[#1a1400]">
                      Le plus choisi
                    </span>
                  )}
                  <h3 className="font-display text-2xl uppercase">{f.name}</h3>
                  {f.description && <p className="mt-1 text-sm text-ink-muted">{f.description}</p>}
                  <div className="mt-5 flex items-end gap-1">
                    <span className="text-xs text-ink-faint">dès</span>
                    <span className="font-display text-4xl text-gold-1">{formulePrice(f.serviceIds)}&nbsp;€</span>
                  </div>
                  <ul className="mt-6 space-y-2.5">
                    {feats.map((name) => (
                      <li key={name} className="flex items-center gap-2 text-sm text-ink-muted">
                        <Check size={16} className="text-gold-1" /> {name}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/compte"
                    className={
                      "mt-7 block rounded-xl py-3 text-center font-display text-sm uppercase tracking-wide transition-colors " +
                      (f.highlight
                        ? "bg-gold-grad text-[#1a1400] shadow-gold"
                        : "border border-line-gold text-gold-1 hover:bg-gold/[0.08]")
                    }
                  >
                    Réserver
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Prestations hors formule (ex. Traitement céramique) — dalles transversales */}
        {horsFormule.length > 0 && (
          <div className="mt-6 space-y-4">
            {horsFormule.map((s, i) => (
              <Reveal key={s.id} delay={i * 70}>
                <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-line-gold bg-gradient-to-r from-gold/10 to-transparent p-8 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-display text-2xl uppercase">{s.name}</h3>
                    {s.description && <p className="mt-1 max-w-xl text-sm text-ink-muted">{s.description}</p>}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-end gap-1">
                      <span className="text-xs text-ink-faint">dès</span>
                      <span className="font-display text-4xl text-gold-1">{startingPrice(s)}&nbsp;€</span>
                    </div>
                    <a
                      href="/compte"
                      className="whitespace-nowrap rounded-xl bg-gold-grad px-6 py-3 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold"
                    >
                      Réserver
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
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
