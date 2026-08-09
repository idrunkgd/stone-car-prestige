import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { LucideIcon } from "lucide-react";

/**
 * Empty state premium (section 55 du brief) pour les modules
 * prévus dans la roadmap mais pas encore construits à ce jalon.
 */
export function PagePlaceholder({
  title,
  icon: Icon,
  roadmap,
  message,
  cta,
}: {
  title: string;
  icon: LucideIcon;
  roadmap: string;
  message: string;
  cta?: string;
}) {
  return (
    <>
      <TopBar title={title} />
      <Card className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line-gold bg-gold/[0.08] text-gold-1">
          <Icon size={28} strokeWidth={1.6} />
        </div>
        <div>
          <div className="font-display text-xl uppercase">{title}</div>
          <div className="mt-1 inline-block rounded-full border border-line-soft px-3 py-1 text-[10px] uppercase tracking-widest text-ink-faint">
            {roadmap}
          </div>
        </div>
        <p className="max-w-md text-sm text-ink-muted">{message}</p>
        {cta && <Button variant="ghost">{cta}</Button>}
      </Card>
    </>
  );
}
