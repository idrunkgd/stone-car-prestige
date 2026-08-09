import { STATUS, type OperationalStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

export function StatusPill({
  status,
  className,
}: {
  status: OperationalStatus;
  className?: string;
}) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2.5 py-1 font-display text-[10px] uppercase tracking-wider",
        s.className,
        className,
      )}
    >
      {s.label}
    </span>
  );
}
