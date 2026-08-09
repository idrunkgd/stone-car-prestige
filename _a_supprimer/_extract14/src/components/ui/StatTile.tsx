"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Tuile KPI avec compteur animé (section 4 du brief). */
export function StatTile({
  value,
  label,
  suffix = "",
  gold,
  green,
}: {
  value: number;
  label: string;
  suffix?: string;
  gold?: boolean;
  green?: boolean;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <div
      ref={ref}
      className="rounded-xl border border-line-soft bg-night-panel p-4 animate-fade-up"
    >
      <div
        className={cn(
          "font-display text-[26px] leading-none",
          gold && "text-gold-1",
          green && "text-state-green",
        )}
      >
        {display.toLocaleString("fr-BE")}
        {suffix}
      </div>
      <div className="mt-1.5 text-[10.5px] uppercase tracking-wider text-ink-faint">
        {label}
      </div>
    </div>
  );
}
