"use client";

import { useRef, useState } from "react";
import { CarScene } from "./CarScene";

/**
 * Comparateur avant / après avec poignée déplaçable (section 19).
 * Avec `before`/`after` : vraies photos. Sinon : illustration vectorielle.
 */
export function BeforeAfter({
  before,
  after,
  aspect = "aspect-[16/9]",
}: {
  before?: string;
  after?: string;
  aspect?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  function setFromClientX(clientX: number) {
    const rect = ref.current!.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(4, Math.min(96, pct)));
  }

  const hasPhotos = Boolean(before && after);

  return (
    <div
      ref={ref}
      className={`relative ${aspect} w-full cursor-ew-resize select-none overflow-hidden rounded-2xl border border-line-gold`}
      onPointerDown={(e) => {
        dragging.current = true;
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      {/* APRÈS (dessous, pleine largeur) */}
      <div className="absolute inset-0">
        {hasPhotos ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={after} alt="Après" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <CarScene variant="apres" />
        )}
        <span className="absolute bottom-4 right-4 rounded-full bg-gold-grad px-3 py-1 font-display text-[11px] uppercase tracking-widest text-[#1a1400]">
          Après
        </span>
      </div>

      {/* AVANT (dessus, clippé) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {hasPhotos ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={before} alt="Avant" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <CarScene variant="avant" />
        )}
        <span className="absolute bottom-4 left-4 rounded-full border border-line-soft bg-black/50 px-3 py-1 font-display text-[11px] uppercase tracking-widest text-ink-muted">
          Avant
        </span>
      </div>

      {/* Poignée */}
      <div className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-gold-grad" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-grad p-2 text-[#1a1400] shadow-gold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M8 7l-4 5 4 5M16 7l4 5-4 5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
