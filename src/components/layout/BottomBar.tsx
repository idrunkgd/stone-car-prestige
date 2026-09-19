"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navFor } from "@/lib/nav";
import type { StaffRole } from "@/lib/subscription-types";
import { cn } from "@/lib/utils";

/** Barre inférieure tablette/mobile : fonctions vitales uniquement. */
export function BottomBar({ role = "admin" }: { role?: StaffRole }) {
  const pathname = usePathname();
  const items = navFor(role).filter((i) => i.primary);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line-soft bg-night-2/95 px-2 py-2 backdrop-blur md:hidden">
      {items.map((item) => {
        const active =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-ink-faint",
              active && "text-gold-1",
            )}
          >
            <Icon size={22} strokeWidth={1.8} />
            <span className="text-[10px] uppercase tracking-tight">
              {item.short}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
