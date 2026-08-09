"use client";

import { useRef, useState } from "react";
import { CarSilhouette } from "@/components/CarSilhouette";

/**
 * Comparateur avant / après avec poignée déplaçable (section 19).
 * Visuels de démonstration (dégradés) — à remplacer par de vraies photos.
 */
export function BeforeAfter() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  function setFromClientX(clientX: number) {
    const rect = ref.current!.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(4, Math.min(96, pct)));
  }

  return (
    <div
      ref={ref}
      className="relative aspect-[16/9] w-full cursor-ew-resize select-none overflow-hidden rounded-2xl border border-line-gold"
      onPointerDown={(e) => {
        dragging.current = true;
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      {/* APRÈS (dessous, pleine largeur) */}
      <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(120%_120%_at_50%_0%,#2a2410,#0c0c0e)]">
        <CarSilhouette width={280} className="drop-shadow-[0_0_40px_rgba(201,162,39,0.35)]" />
        <span className="absolute bottom-4 right-4 rounded-full bg-gold-grad px-3 py-1 font-display text-[11px] uppercase tracking-widest text-[#1a1400]">
          Après
        </span>
      </div>

      {/* AVANT (dessus, clippé) */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-[#111]"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <CarSilhouette width={280} className="opacity-60 grayscale" />
        <span className="absolute bottom-4 left-4 rounded-full border border-line-soft bg-black/50 px-3 py-1 font-display text-[11px] uppercase tracking-widest text-ink-muted">
          Avant
        </span>
      </div>

      {/* Poignée */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-gold-grad"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-grad p-2 text-[#1a1400] shadow-gold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M8 7l-4 5 4 5M16 7l4 5-4 5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
