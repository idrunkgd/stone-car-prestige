"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Check,
  ChevronLeft,
  Plus,
  X,
  Gauge,
  Car,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CarSilhouette } from "@/components/CarSilhouette";
import { VehicleDiagram } from "./VehicleDiagram";
import { SignaturePad } from "./SignaturePad";
import {
  DAMAGE_TYPES,
  UPSELLS,
  type Damage,
} from "@/lib/inspection";
import { eur, cn } from "@/lib/utils";
import { saveCheckinAction } from "@/app/app/checkin/actions";
import type { CheckinRecord } from "@/lib/checkin-types";

export type Arrival = {
  id: string;
  time: string;
  title: string;
  plate: string;
  customer: string;
  service: string;
  price: number;
};

type Photo = { id: string; url: string; data: string };

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

const STEPS = ["Véhicule", "État des lieux", "Photos", "Suppléments", "Signature"];

export function CheckinFlow({ arrivals }: { arrivals: Arrival[] }) {
  const [step, setStep] = useState(0); // 0 = sélection ; 1..5 = étapes ; 6 = terminé
  const [sel, setSel] = useState<Arrival | null>(null);
  const [mileage, setMileage] = useState("");
  const [damages, setDamages] = useState<Damage[]>([]);
  const [pending, setPending] = useState<{ id: string; label: string } | null>(null);
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [options, setOptions] = useState<Set<string>>(new Set());
  const [signature, setSignature] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const woRef = useMemo(
    () => "WO-2026-" + String(Math.floor(100000 + Math.random() * 899999)),
    [],
  );

  const extrasTotal = useMemo(
    () =>
      UPSELLS.filter((u) => options.has(u.id)).reduce((s, u) => s + u.price, 0),
    [options],
  );
  const total = (sel?.price ?? 0) + extrasTotal;

  function addDamage(type: string) {
    if (!pending) return;
    setDamages((d) => [
      ...d,
      { id: crypto.randomUUID(), zoneId: pending.id, zoneLabel: pending.label, type, note: note.trim() || undefined },
    ]);
    setPending(null);
    setNote("");
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const added = await Promise.all(
      files.map(async (f) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(f),
        data: await fileToDataUrl(f),
      })),
    );
    setPhotos((p) => [...p, ...added]);
    e.target.value = "";
  }

  async function finish() {
    const id = crypto.randomUUID();
    const record: CheckinRecord = {
      id,
      ref: woRef,
      createdAt: new Date().toISOString(),
      vehicleTitle: sel?.title ?? "",
      plate: sel?.plate ?? "",
      customer: sel?.customer ?? "",
      service: sel?.service ?? "",
      mileage,
      damages,
      options: UPSELLS.filter((u) => options.has(u.id)).map((u) => ({
        label: u.label,
        price: u.price,
      })),
      photos: photos.map((p) => p.data),
      signature,
      total,
      status: "RECU",
    };
    try {
      setSaving(true);
      await saveCheckinAction(record);
      setSavedId(id);
    } catch {
      // même en cas d'échec d'enregistrement, on n'empêche pas la réception
    } finally {
      setSaving(false);
      setStep(6);
    }
  }

  function toggleOption(id: string) {
    setOptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* ───────────── Étape 0 : sélection ───────────── */
  if (step === 0) {
    return (
      <div>
        <p className="mb-4 text-sm text-ink-muted">
          Sélectionnez le véhicule qui arrive pour démarrer son check-in.
        </p>
        {arrivals.length === 0 ? (
          <Card className="py-12 text-center text-sm text-ink-muted">
            Aucun véhicule en attente d'arrivée aujourd'hui.
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {arrivals.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setSel(a);
                  setStep(1);
                }}
                className="flex items-center gap-4 rounded-xl border border-line-soft bg-night-panel p-4 text-left transition-colors hover:border-line-gold"
              >
                <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#26262c] to-night">
                  <CarSilhouette width={52} />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-lg uppercase leading-tight">
                    {a.title}
                  </div>
                  <span className="my-1 inline-block rounded border border-line-soft bg-[#111] px-1.5 py-px font-display text-[11px] tracking-wider">
                    {a.plate}
                  </span>
                  <div className="truncate text-[12px] text-ink-muted">
                    {a.time} · {a.customer} · {a.service}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ───────────── Étape 6 : terminé ───────────── */
  if (step === 6) {
    return (
      <Card gold className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-grad text-[#1a1400]">
          <Check size={32} strokeWidth={3} />
        </div>
        <div>
          <div className="font-display text-2xl uppercase">Véhicule reçu</div>
          <div className="mt-1 text-sm text-ink-muted">
            {sel?.title} · {sel?.plate}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-ink-muted">
          <span className="rounded-full border border-line-soft px-3 py-1">
            Ordre de travail {woRef}
          </span>
          <span className="rounded-full border border-line-soft px-3 py-1">
            {damages.length} dommage{damages.length > 1 ? "s" : ""} relevé{damages.length > 1 ? "s" : ""}
          </span>
          <span className="rounded-full border border-line-soft px-3 py-1">
            {photos.length} photo{photos.length > 1 ? "s" : ""}
          </span>
          <span className="rounded-full border border-line-soft px-3 py-1">
            Signé ✓
          </span>
        </div>
        <div className="font-display text-lg text-gold-1">
          Total estimé {eur(total)}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {savedId && (
            <Link href={`/app/checkin/rapport/${savedId}`}>
              <Button variant="ghost">Voir le rapport de check-in</Button>
            </Link>
          )}
          {savedId ? (
            <Link href={`/app/intervention/${savedId}`}>
              <Button>Démarrer l'intervention →</Button>
            </Link>
          ) : (
            <Button onClick={() => window.location.reload()}>
              Nouveau check-in →
            </Button>
          )}
        </div>
        <p className="text-[11px] text-ink-faint">
          Enregistré automatiquement · retrouvable dans l'historique des check-ins
        </p>
      </Card>
    );
  }

  /* ───────────── Étapes 1..5 ───────────── */
  return (
    <div>
      {/* Barre de progression */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs",
                    done && "bg-gold-grad text-[#1a1400]",
                    active && "border border-line-gold bg-gold/15 text-gold-1",
                    !done && !active && "border border-line-soft text-ink-faint",
                  )}
                >
                  {done ? <Check size={14} strokeWidth={3} /> : n}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-px flex-1",
                      done ? "bg-gold" : "bg-line-soft",
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] uppercase tracking-wider sm:block",
                  active ? "text-gold-1" : "text-ink-faint",
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* En-tête véhicule */}
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-line-soft bg-night-panel px-4 py-3">
        <CarSilhouette width={44} />
        <div>
          <b className="font-display text-base uppercase">{sel?.title}</b>
          <span className="ml-2 rounded border border-line-soft bg-[#111] px-1.5 py-px font-display text-[11px] tracking-wider">
            {sel?.plate}
          </span>
          <div className="text-xs text-ink-muted">
            {sel?.customer} · {sel?.service}
          </div>
        </div>
      </div>

      {/* Étape 1 — véhicule + kilométrage */}
      {step === 1 && (
        <Card>
          <div className="mb-3 flex items-center gap-2 text-gold-1">
            <Car size={18} /> <b className="font-display uppercase">Confirmer le véhicule</b>
          </div>
          <p className="mb-4 text-sm text-ink-muted">
            Vérifiez que le véhicule correspond, puis relevez le kilométrage.
          </p>
          <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted">
            <Gauge size={13} className="mr-1 inline" /> Kilométrage
          </label>
          <input
            inputMode="numeric"
            value={mileage}
            onChange={(e) => setMileage(e.target.value.replace(/\D/g, ""))}
            placeholder="ex : 48 500"
            className="w-full max-w-xs rounded-[10px] border border-line-soft bg-night-2 px-3.5 py-3 text-[15px] focus:border-gold focus:outline-none"
          />
        </Card>
      )}

      {/* Étape 2 — état des lieux */}
      {step === 2 && (
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2 text-gold-1">
              <ClipboardCheck size={18} />{" "}
              <b className="font-display uppercase">État des lieux</b>
            </div>
            <p className="mb-3 text-sm text-ink-muted">
              Tapez une zone pour signaler un dommage existant avant l'intervention.
            </p>
            <VehicleDiagram
              damages={damages}
              activeZone={pending?.id ?? null}
              onZoneClick={(id, label) => {
                setPending({ id, label });
                setNote("");
              }}
            />
          </div>
          <div>
            {pending ? (
              <Card gold>
                <div className="mb-2 flex items-center justify-between">
                  <b className="font-display uppercase">{pending.label}</b>
                  <button onClick={() => setPending(null)} className="text-ink-faint">
                    <X size={18} />
                  </button>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {DAMAGE_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => addDamage(t)}
                      className="rounded-full border border-line-gold bg-gold/[0.06] px-3 py-1.5 text-xs text-gold-1 hover:bg-gold/15"
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Remarque (facultatif)"
                  className="w-full rounded-[10px] border border-line-soft bg-night-2 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
                />
                <p className="mt-2 text-[11px] text-ink-faint">
                  Choisissez un type pour ajouter le dommage.
                </p>
              </Card>
            ) : (
              <Card>
                <b className="font-display uppercase text-gold-1">
                  Dommages relevés ({damages.length})
                </b>
                {damages.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-muted">
                    Aucun pour l'instant. Le véhicule est réputé en bon état.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {damages.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center justify-between rounded-lg border border-line-soft px-3 py-2 text-sm"
                      >
                        <span>
                          <b>{d.type}</b> — {d.zoneLabel}
                          {d.note && (
                            <span className="text-ink-faint"> · {d.note}</span>
                          )}
                        </span>
                        <button
                          onClick={() =>
                            setDamages((list) => list.filter((x) => x.id !== d.id))
                          }
                          className="text-ink-faint hover:text-state-red"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Étape 3 — photos */}
      {step === 3 && (
        <Card>
          <div className="mb-3 flex items-center gap-2 text-gold-1">
            <Camera size={18} /> <b className="font-display uppercase">Photos du check-in</b>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={onFiles}
            className="hidden"
          />
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>
            <Camera size={16} /> Prendre / ajouter une photo
          </Button>
          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-line-soft"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setPhotos((l) => l.filter((x) => x.id !== p.id))}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-[11px] text-ink-faint">
            Sur tablette, l'appareil photo s'ouvre directement.
          </p>
        </Card>
      )}

      {/* Étape 4 — suppléments */}
      {step === 4 && (
        <Card>
          <div className="mb-3 flex items-center gap-2 text-gold-1">
            <Plus size={18} /> <b className="font-display uppercase">Suppléments proposés</b>
          </div>
          <div className="space-y-2">
            {UPSELLS.map((u) => {
              const on = options.has(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => toggleOption(u.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                    on
                      ? "border-line-gold bg-gold/10"
                      : "border-line-soft hover:border-line-gold",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md border",
                        on ? "border-gold bg-gold-grad text-[#1a1400]" : "border-line-soft",
                      )}
                    >
                      {on && <Check size={14} strokeWidth={3} />}
                    </span>
                    {u.label}
                  </span>
                  <span className="font-display text-gold-1">+{eur(u.price)}</span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Étape 5 — résumé + signature */}
      {step === 5 && (
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <b className="font-display uppercase text-gold-1">Résumé</b>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between">
                <span>{sel?.service}</span>
                <span>{eur(sel?.price ?? 0)}</span>
              </li>
              {UPSELLS.filter((u) => options.has(u.id)).map((u) => (
                <li key={u.id} className="flex justify-between text-ink-muted">
                  <span>+ {u.label}</span>
                  <span>{eur(u.price)}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-line-soft pt-2 font-display text-base">
                <span>Total estimé</span>
                <span className="text-gold-1">{eur(total)}</span>
              </li>
            </ul>
            <div className="mt-3 space-y-1 text-xs text-ink-muted">
              <div>Kilométrage : {mileage ? `${mileage} km` : "—"}</div>
              <div>État véhicule : {damages.length} dommage(s) relevé(s)</div>
              <div>Photos : {photos.length}</div>
            </div>
          </Card>
          <Card>
            <b className="font-display uppercase text-gold-1">Signature client</b>
            <p className="my-2 text-xs text-ink-muted">
              En signant, le client valide l'état du véhicule et les prestations ci-contre.
            </p>
            <SignaturePad onChange={setSignature} />
          </Card>
        </div>
      )}

      {/* Barre d'action */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => s - 1)}
          className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
        >
          <ChevronLeft size={16} /> Précédent
        </button>
        {step < 5 ? (
          <Button size="lg" onClick={() => setStep((s) => s + 1)}>
            Continuer →
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={!signature || saving}
            className={cn((!signature || saving) && "cursor-not-allowed opacity-40")}
            onClick={finish}
          >
            <Check size={18} />{" "}
            {saving ? "Enregistrement…" : "Je valide et je reçois le véhicule"}
          </Button>
        )}
      </div>
    </div>
  );
}
