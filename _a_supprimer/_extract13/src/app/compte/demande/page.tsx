import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { DemandeBuilder } from "@/components/compte/DemandeBuilder";
import { getCurrentAccount } from "@/lib/auth-store";
import { getServices } from "@/lib/service-catalog-store";
import { getRequests } from "@/lib/request-store";
import type { Booked } from "@/lib/availability";

export const dynamic = "force-dynamic";

export default async function DemandePage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/compte");
  if (account.vehicles.length === 0) redirect("/compte");

  const services = await getServices();
  const booked: Booked[] = (await getRequests())
    .filter((r) => r.slotDate && r.slotStart && r.durationMin && r.status !== "refuse")
    .map((r) => ({ date: r.slotDate!, start: r.slotStart!, duration: r.durationMin! }));

  return (
    <div id="top">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-5 pb-24 pt-32">
        <div className="mb-4">
          <Link href="/compte" className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
            <ChevronLeft size={16} /> Mon compte
          </Link>
        </div>
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-gold-2">Demande de prix</div>
          <h1 className="mt-2 font-display text-4xl uppercase">Composez votre prestation</h1>
        </div>
        <DemandeBuilder vehicles={account.vehicles} services={services} booked={booked} />
      </section>
      <SiteFooter />
    </div>
  );
}
