import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { customers as demoCustomers } from "@/lib/demo-data";
import { getCustomers } from "@/lib/crm-store";
import { eur, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TAG_STYLE: Record<string, string> = {
  nouveau: "text-state-blue bg-state-blue/15",
  regulier: "text-gold-1 border border-line-gold bg-gold/[0.08]",
  vip: "text-[#1a1400] bg-gold-grad font-bold",
  inactif: "text-ink-muted bg-night-panel2 border border-line-soft",
};
const TAG_LABEL: Record<string, string> = {
  nouveau: "Nouveau",
  regulier: "Régulier",
  vip: "VIP",
  inactif: "Inactif",
};

type Row = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  tag: string;
  visits: number;
  totalSpent: number;
  lastVisitDaysAgo: number | null;
};

export default async function ClientsPage() {
  const stored = await getCustomers();
  const rows: Row[] = [
    ...stored.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone,
      tag: "nouveau",
      visits: 0,
      totalSpent: 0,
      lastVisitDaysAgo: null,
    })),
    ...demoCustomers,
  ];

  return (
    <>
      <TopBar title="Clients" cta="Client" ctaHref="/app/clients/nouveau" />
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((c) => (
          <Card key={c.id} className="p-4 transition-colors hover:border-line-gold">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display text-lg uppercase">
                  {c.firstName} {c.lastName}
                </div>
                <div className="text-[13px] text-ink-muted">{c.phone}</div>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 font-display text-[10px] uppercase tracking-wider",
                  TAG_STYLE[c.tag],
                )}
              >
                {TAG_LABEL[c.tag]}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3 text-[12px] text-ink-muted">
              <span>
                {c.visits} visite{c.visits > 1 ? "s" : ""}
              </span>
              <span className="font-display text-gold-1">{eur(c.totalSpent)}</span>
              <span>
                {c.lastVisitDaysAgo === null ? "—" : `Il y a ${c.lastVisitDaysAgo} j`}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
