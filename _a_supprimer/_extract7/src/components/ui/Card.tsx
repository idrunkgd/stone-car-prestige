import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  gold,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { gold?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-premium",
        gold
          ? "border-line-gold bg-gradient-to-br from-gold/10 to-gold/[0.02]"
          : "border-line-soft bg-night-panel",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeader({
  title,
  link,
}: {
  title: string;
  link?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="font-display text-sm uppercase tracking-[0.15em] text-gold-1">
        {title}
      </h3>
      {link && (
        <span className="text-[11px] uppercase tracking-wider text-ink-faint">
          {link}
        </span>
      )}
    </div>
  );
}
