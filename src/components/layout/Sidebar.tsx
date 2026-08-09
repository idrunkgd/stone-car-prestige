"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV } from "@/lib/nav";
import { Logo } from "./Logo";
import { logoutAdminAction } from "@/app/connexion-pro/actions";
import { cn } from "@/lib/utils";

/** Barre latérale rétractable (masquée sur mobile → BottomBar). */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[76px] flex-col items-center gap-1.5 border-r border-line-soft bg-gradient-to-b from-night-2 to-night py-4 md:flex">
      <Link href="/app" className="mb-3.5">
        <Logo />
      </Link>
      {NAV.map((item) => {
        const active =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={cn(
              "relative flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-[13px] text-ink-faint transition-colors",
              active
                ? "border border-line-gold bg-gold/[0.12] text-gold-1"
                : "hover:text-ink",
              item.href === "/app/parametres" && "mt-auto",
            )}
          >
            {active && (
              <span className="absolute -left-[18px] top-3 h-6 w-[3px] rounded bg-gold-grad" />
            )}
            <Icon size={20} strokeWidth={1.8} />
            <span className="text-[8.5px] uppercase tracking-tight">
              {item.short}
            </span>
          </Link>
        );
      })}
      <form action={logoutAdminAction} className="mt-1">
        <button
          type="submit"
          title="Déconnexion"
          className="flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-[13px] text-ink-faint transition-colors hover:text-state-red"
        >
          <LogOut size={20} strokeWidth={1.8} />
          <span className="text-[8.5px] uppercase tracking-tight">Quitter</span>
        </button>
      </form>
    </aside>
  );
}
