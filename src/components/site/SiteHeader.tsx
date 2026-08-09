"use client";

import { useEffect, useState } from "react";
import { Phone, Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

// Liens vers les sections de la page d'accueil, préfixés par "/" pour qu'ils
// fonctionnent depuis n'importe quelle page (compte, demande de prix, devis…).
const LINKS = [
  { href: "/#prestations", label: "Prestations" },
  { href: "/#realisations", label: "Réalisations" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line-soft bg-night/90 backdrop-blur"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <a href="/" className="flex items-center gap-2.5">
          <Logo size={34} />
          <span className="font-display text-sm uppercase leading-none tracking-wide">
            Stone Car
            <span className="block text-[10px] tracking-[0.3em] text-gold-2">
              Prestige
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ink-muted transition-colors hover:text-gold-1"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/compte"
            className="hidden items-center gap-2 text-sm text-ink-muted hover:text-gold-1 sm:flex"
          >
            Mon compte
          </a>
          <a
            href="/compte"
            className="rounded-xl bg-gold-grad px-4 py-2.5 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold"
          >
            Réserver
          </a>
          <button
            className="text-ink md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line-soft bg-night/95 px-5 py-4 backdrop-blur md:hidden">
          <nav className="flex flex-col gap-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-ink-muted hover:text-gold-1"
              >
                {l.label}
              </a>
            ))}
            <a href="tel:0499912932" className="flex items-center gap-2 text-ink-muted">
              <Phone size={15} /> 0499 91 29 32
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
