"use client";

import { useState } from "react";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { cn } from "@/lib/utils";
import type { Realisation } from "@/lib/realisation-types";

function RealisationBlock({ realisation }: { realisation: Realisation }) {
  const [active, setActive] = useState(0);
  const set = realisation.sets[active] ?? realisation.sets[0];
  const multi = realisation.sets.length > 1;

  return (
    <article className="overflow-hidden rounded-2xl border border-line-soft bg-night-panel">
      <BeforeAfter before={set.before} after={set.after} />

      {multi && (
        <div className="flex gap-2 overflow-x-auto px-4 pt-4">
          {realisation.sets.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-colors",
                i === active ? "border-line-gold" : "border-line-soft opacity-60 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.after} alt={s.label ?? `Set ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2">
          {realisation.tag && (
            <span className="rounded-full border border-line-gold px-2.5 py-0.5 font-display text-[10px] uppercase tracking-widest text-gold-1">
              {realisation.tag}
            </span>
          )}
          {multi && (
            <span className="text-[11px] text-ink-faint">
              {set.label ? set.label : `${active + 1} / ${realisation.sets.length}`}
            </span>
          )}
        </div>
        <h3 className="mt-2 font-display text-xl uppercase leading-tight">{realisation.title}</h3>
        {realisation.vehicle && (
          <div className="text-[12px] text-ink-muted">{realisation.vehicle}</div>
        )}
        {realisation.description && (
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{realisation.description}</p>
        )}
      </div>
    </article>
  );
}

export function RealisationGallery({ realisations }: { realisations: Realisation[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {realisations.map((r) => (
        <RealisationBlock key={r.id} realisation={r} />
      ))}
    </div>
  );
}
