import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** En-tête de page admin : accroche, titre, date, recherche globale, action. */
export function TopBar({
  greeting,
  title,
  date,
  cta,
}: {
  greeting?: string;
  title: string;
  date?: string;
  cta?: string;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        {greeting && (
          <div className="text-xs uppercase tracking-[0.2em] text-gold-2">
            {greeting}
          </div>
        )}
        <h1 className="mt-0.5 font-display text-3xl uppercase md:text-4xl">
          {title}
        </h1>
        {date && <div className="mt-1 text-sm text-ink-muted">{date}</div>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-[230px] items-center gap-2.5 rounded-xl border border-line-soft bg-night-panel px-4 py-2.5 text-[13px] text-ink-faint">
          <Search size={16} />
          <input
            className="w-full bg-transparent placeholder:text-ink-faint focus:outline-none"
            placeholder="Rechercher client, plaque…"
            aria-label="Recherche globale"
          />
        </label>
        {cta && (
          <Button className="whitespace-nowrap">
            <Plus size={16} /> {cta}
          </Button>
        )}
      </div>
    </header>
  );
}
