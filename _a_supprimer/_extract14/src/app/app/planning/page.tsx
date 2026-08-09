import { TopBar } from "@/components/layout/TopBar";
import { StatusPill } from "@/components/ui/StatusPill";
import { getRequests } from "@/lib/request-store";
import { todaysAppointments, getVehicle } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default async function PlanningPage() {
  const requests = await getRequests();

  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // 0 = lundi
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  monday.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const dayName = new Intl.DateTimeFormat("fr-BE", { weekday: "short" });
  const todayKey = ymd(today);

  const appts = todaysAppointments.map((a) => {
    const v = getVehicle(a.vehicleId)!;
    return { time: a.time, title: `${v.make} ${v.model}`, service: a.service, status: a.status };
  });

  return (
    <>
      <TopBar title="Planning" />
      <p className="mb-4 text-sm text-ink-muted">
        Semaine du {monday.toLocaleDateString("fr-BE")} · vue agenda
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {days.map((d) => {
          const key = ymd(d);
          const isToday = key === todayKey;
          const dayRequests = requests.filter((r) => r.preferredDate === key);
          return (
            <div
              key={key}
              className={cn(
                "min-h-[220px] rounded-xl border p-2.5",
                isToday ? "border-line-gold bg-gold/[0.05]" : "border-line-soft bg-night-panel",
              )}
            >
              <div className="mb-2 flex items-baseline justify-between px-1">
                <span
                  className={cn(
                    "font-display text-xs uppercase tracking-wider",
                    isToday ? "text-gold-1" : "text-ink-muted",
                  )}
                >
                  {dayName.format(d)}
                </span>
                <span className={cn("font-display text-lg", isToday && "text-gold-1")}>
                  {d.getDate()}
                </span>
              </div>

              <div className="space-y-1.5">
                {isToday &&
                  appts.map((a, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-line-soft bg-night-2 p-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-[13px]">{a.time}</span>
                        <StatusPill status={a.status} />
                      </div>
                      <div className="mt-0.5 text-[12px] leading-tight">{a.title}</div>
                      <div className="text-[11px] text-ink-faint">{a.service}</div>
                    </div>
                  ))}

                {dayRequests.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-state-blue/30 bg-state-blue/10 p-2"
                  >
                    <div className="text-[12px] font-medium leading-tight">{r.name}</div>
                    <div className="text-[11px] text-ink-faint">Demande · {r.service.split(" — ")[0]}</div>
                  </div>
                ))}

                {!isToday && dayRequests.length === 0 && (
                  <div className="px-1 pt-4 text-center text-[11px] text-ink-faint">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[11px] text-ink-faint">
        Les rendez-vous du jour et les demandes datées apparaissent ici. Le
        glisser-déposer et la création directe viendront enrichir cette vue.
      </p>
    </>
  );
}
