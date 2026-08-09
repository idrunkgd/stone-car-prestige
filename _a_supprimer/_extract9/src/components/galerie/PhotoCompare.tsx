"use client";

import { useRef, useState } from "react";

/** Comparateur avant/après pour deux photos (data URLs). */
export function PhotoCompare({ before, after }: { before: string; after: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  function move(clientX: number) {
    const rect = ref.current!.getBoundingClientRect();
    setPos(Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100)));
  }

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden rounded-xl border border-line-soft"
      onPointerDown={(e) => {
        dragging.current = true;
        move(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && move(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt="Après" className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute bottom-2 right-2 z-10 rounded-full bg-gold-grad px-2.5 py-0.5 font-display text-[10px] uppercase tracking-widest text-[#1a1400]">
        Après
      </span>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt="Avant" className="h-full w-full object-cover" />
        <span className="absolute bottom-2 left-2 rounded-full border border-line-soft bg-black/50 px-2.5 py-0.5 font-display text-[10px] uppercase tracking-widest text-ink-muted">
          Avant
        </span>
      </div>
      <div className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-gold-grad" style={{ left: `${pos}%` }} />
    </div>
  );
}
