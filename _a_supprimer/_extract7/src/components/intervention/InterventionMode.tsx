"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Play, Pause, Check, Plus, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CarSilhouette } from "@/components/CarSilhouette";
import { updateCheckinAction } from "@/app/app/checkin/actions";
import { DEFAULT_TASKS } from "@/lib/workorder";
import type { CheckinRecord, Task, ExtraWork } from "@/lib/checkin-types";
import { eur, cn } from "@/lib/utils";

function hms(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

export function InterventionMode({ record }: { record: CheckinRecord }) {
  const [tasks, setTasks] = useState<Task[]>(
    record.checklist ?? DEFAULT_TASKS.map((label) => ({ label, done: false })),
  );
  const [extra, setExtra] = useState<ExtraWork[]>(record.extraWork ?? []);
  const [startedAt, setStartedAt] = useState<number | null>(
    record.startedAt ? new Date(record.startedAt).getTime() : null,
  );
  const [worked, setWorked] = useState(record.workedSeconds ?? 0);
  const [status, setStatus] = useState(record.status ?? "RECU");
  const [now, setNow] = useState(() => Date.now());
  const [xLabel, setXLabel] = useState("");
  const [xPrice, setXPrice] = useState("");

  const running = startedAt !== null;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);

  const elapsed = worked + (running ? (now - startedAt!) / 1000 : 0);
  const doneCount = tasks.filter((t) => t.done).length;

  async function save(patch: Partial<CheckinRecord>) {
    try {
      await updateCheckinAction(record.id, patch);
    } catch {
      /* no-op prototype */
    }
  }

  function start() {
    const at = Date.now();
    setStartedAt(at);
    setStatus("EN_COURS");
    setNow(at);
    save({ status: "EN_COURS", startedAt: new Date(at).toISOString(), checklist: tasks });
  }
  function pause() {
    const add = (Date.now() - (startedAt ?? Date.now())) / 1000;
    const w = worked + add;
    setWorked(w);
    setStartedAt(null);
    save({ workedSeconds: Math.round(w), startedAt: null });
  }
  function finish() {
    const add = running ? (Date.now() - (startedAt ?? Date.now())) / 1000 : 0;
    const w = worked + add;
    setWorked(w);
    setStartedAt(null);
    setStatus("TERMINE");
    save({
      workedSeconds: Math.round(w),
      startedAt: null,
      status: "TERMINE",
      finishedAt: new Date().toISOString(),
      checklist: tasks,
      extraWork: extra,
    });
  }
  function toggle(i: number) {
    const next = tasks.map((t, k) => (k === i ? { ...t, done: !t.done } : t));
    setTasks(next);
    save({ checklist: next });
  }
  function addExtra() {
    const price = parseFloat(xPrice.replace(",", "."));
    if (!xLabel.trim() || isNaN(price)) return;
    const next = [...extra, { id: crypto.randomUUID(), label: xLabel.trim(), price }];
    setExtra(next);
    setXLabel("");
    setXPrice("");
    save({ extraWork: next });
  }
  function removeExtra(id: string) {
    const next = extra.filter((e) => e.id !== id);
    setExtra(next);
    save({ extraWork: next });
  }

  const doneState = status === "TERMINE";

  return (
    <div>
      {/* En-tête véhicule + statut */}
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-line-gold bg-night-panel px-4 py-3">
        <CarSilhouette width={48} />
        <div className="flex-1">
          <b className="font-display text-lg uppercase">{record.vehicleTitle}</b>
          <span className="ml-2 rounded border border-line-soft bg-[#111] px-1.5 py-px font-display text-[11px] tracking-wider">
            {record.plate}
          </span>
          <div className="text-xs text-ink-muted">
            {record.customer} · {record.service} · {record.ref}
          </div>
        </div>
      </div>

      {/* Chronomètre + commandes */}
      <Card gold className="mb-5 flex flex-col items-center gap-4 py-8">
        <div className="text-center">
          <div className="font-display text-5xl tabular-nums tracking-wider">
            {hms(elapsed)}
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-widest text-ink-faint">
            {running ? "En cours" : doneState ? "Intervention terminée" : "En pause"}
          </div>
        </div>
        {!doneState ? (
          <div className="flex flex-wrap justify-center gap-3">
            {running ? (
              <Button variant="ghost" size="lg" onClick={pause}>
                <Pause size={18} /> Pause
              </Button>
            ) : (
              <Button size="lg" onClick={start}>
                <Play size={18} /> {worked > 0 ? "Reprendre" : "Démarrer"}
              </Button>
            )}
            <Button
              size="lg"
              variant={running ? "primary" : "subtle"}
              onClick={finish}
            >
              <Check size={18} /> Terminer
            </Button>
          </div>
        ) : (
          <Link href={`/app/checkout/${record.id}`}>
            <Button size="lg">
              Effectuer le contrôle qualité <ArrowRight size={18} />
            </Button>
          </Link>
        )}
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Checklist */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <b className="font-display uppercase text-gold-1">Tâches</b>
            <span className="text-sm text-ink-muted">
              {doneCount}/{tasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {tasks.map((t, i) => (
              <button
                key={t.label}
                onClick={() => toggle(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  t.done
                    ? "border-line-gold bg-gold/10 text-ink"
                    : "border-line-soft hover:border-line-gold",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md border",
                    t.done ? "border-gold bg-gold-grad text-[#1a1400]" : "border-line-soft",
                  )}
                >
                  {t.done && <Check size={14} strokeWidth={3} />}
                </span>
                <span className={cn("text-sm", t.done && "line-through opacity-70")}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Travaux supplémentaires */}
        <Card>
          <b className="font-display uppercase text-gold-1">Travaux supplémentaires</b>
          <p className="my-2 text-xs text-ink-muted">
            Un besoin découvert en cours d'intervention ? Ajoutez-le, il sera reporté sur la facture.
          </p>
          <div className="flex gap-2">
            <input
              value={xLabel}
              onChange={(e) => setXLabel(e.target.value)}
              placeholder="ex : extraction sièges"
              className="min-w-0 flex-1 rounded-[10px] border border-line-soft bg-night-2 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
            <input
              value={xPrice}
              onChange={(e) => setXPrice(e.target.value.replace(/[^\d.,]/g, ""))}
              inputMode="decimal"
              placeholder="€"
              className="w-20 rounded-[10px] border border-line-soft bg-night-2 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
            />
            <Button onClick={addExtra}>
              <Plus size={16} />
            </Button>
          </div>
          {extra.length > 0 && (
            <ul className="mt-3 space-y-2">
              {extra.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-lg border border-line-soft px-3 py-2 text-sm"
                >
                  <span>{e.label}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-display text-gold-1">{eur(e.price)}</span>
                    <button
                      onClick={() => removeExtra(e.id)}
                      className="text-ink-faint hover:text-state-red"
                    >
                      <X size={16} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
