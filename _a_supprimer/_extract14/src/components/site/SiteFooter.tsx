import { Phone, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line-soft bg-night-2">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-display text-sm uppercase tracking-wide">
              Stone Car Prestige
            </span>
          </div>
          <p className="text-sm text-ink-muted">
            Esthétique automobile haut de gamme. L'exigence à chaque détail.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-display text-xs uppercase tracking-widest text-gold-2">
            Contact
          </h4>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li className="flex items-center gap-2">
              <Phone size={14} /> 0499 91 29 32
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} /> Thuin, Belgique
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display text-xs uppercase tracking-widest text-gold-2">
            Horaires
          </h4>
          <ul className="space-y-1.5 text-sm text-ink-muted">
            <li className="flex items-center gap-2">
              <Clock size={14} /> Lun–Ven · 9h–18h
            </li>
            <li className="pl-6">Samedi · 9h–13h</li>
            <li className="pl-6">Dimanche · fermé</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display text-xs uppercase tracking-widest text-gold-2">
            Suivez-nous
          </h4>
          <div className="flex gap-3">
            <a
              href="https://instagram.com/stonecarprestige"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-soft text-ink-muted transition-colors hover:border-line-gold hover:text-gold-1"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://facebook.com/stonecarprestige"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-soft text-ink-muted transition-colors hover:border-line-gold hover:text-gold-1"
              aria-label="Facebook"
            >
              <Facebook size={18} />
            </a>
          </div>
          <p className="mt-3 text-xs text-ink-faint">@stonecarprestige</p>
        </div>
      </div>

      <div className="border-t border-line-soft">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-4 text-xs text-ink-faint sm:flex-row">
          <span>© 2026 Stone Car Prestige — Thuin</span>
          <a href="/app" className="hover:text-gold-1">
            Espace pro
          </a>
        </div>
      </div>
    </footer>
  );
}
