/**
 * Disponibilités de l'atelier (capacité 1 véhicule à la fois).
 * Horaires par défaut ; un créneau doit tenir entièrement dans l'ouverture
 * et ne pas chevaucher un créneau déjà réservé.
 */
export const CAPACITY = 1;

// 0 = dimanche … 6 = samedi
export const OPENING: Record<number, [string, string] | null> = {
  0: null,
  1: ["09:00", "18:00"],
  2: ["09:00", "18:00"],
  3: ["09:00", "18:00"],
  4: ["09:00", "18:00"],
  5: ["09:00", "18:00"],
  6: ["09:00", "13:00"],
};

const STEP = 30; // granularité des créneaux (min)

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function fromMin(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export type Booked = { date: string; start: string; duration: number };

/** Créneaux de départ possibles pour une date et une durée données. */
export function availableStartTimes(
  dateStr: string,
  durationMin: number,
  booked: Booked[],
): string[] {
  if (durationMin <= 0) return [];
  const wd = new Date(`${dateStr}T00:00:00`).getDay();
  const op = OPENING[wd];
  if (!op) return [];
  const open = toMin(op[0]);
  const close = toMin(op[1]);

  const dayBooked = booked
    .filter((b) => b.date === dateStr)
    .map((b) => [toMin(b.start), toMin(b.start) + b.duration] as [number, number]);

  const out: string[] = [];
  for (let t = open; t + durationMin <= close; t += STEP) {
    const s = t;
    const e = t + durationMin;
    const overlap = dayBooked.some(([bs, be]) => s < be && e > bs);
    if (!overlap) out.push(fromMin(t));
  }
  return out;
}

/** Prochaines dates ouvrées (YYYY-MM-DD) à partir d'aujourd'hui. */
export function nextOpenDays(count: number): string[] {
  const days: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  let guard = 0;
  while (days.length < count && guard < 60) {
    guard++;
    if (OPENING[d.getDay()]) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      days.push(`${y}-${m}-${day}`);
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export function dayLabel(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("fr-BE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(d);
}
