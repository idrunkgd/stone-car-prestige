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
import { DAMAGE_TYPES, UPSELLS, type Damage } from "@/lib/inspection";
import { updateCheckinAction } from "@/app/app/checkin/actions";
import { eur, cn } from "@/lib/utils";

export type Intervention = {
  id: string;
  ref: string;
  vehicleTitle: string;
  plate: string;
  customer: string;
  service: string;
  total: number;
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

export function CheckinFlow({ record }: { record: Intervention }) {
  const [step, setStep] = useState(1); // 1..5 étapes ; 6 = terminé
  const [mileage, setMileage] = useState("");
  const [damages, setDamages] = useState<Damage[]>([]);
  const [pending, setPending] = useState<{ id: string; label: string } | null>(null);
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [options, setOptions] = useState<Set<string>>(new Set());
  const [signature, setSignature] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const extrasTotal = useMemo(
    () => UPSELLS.filter((u) => options.has(u.id)).reduce((s, u) => s + u.price, 0),
    [options],
  );
  const total = record.total + extrasTotal;

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
      files.map(async (f) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(f), data: await fileToDataUrl(f) })),
    );
    setPhotos((p) => [...p, ...added]);
    e.target.value = "";
  }

  function toggleOption(id: string) {
    setOptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function finish() {
    const optionItems = UPSELLS.filter((u) => options.has(u.id)).map((u) => ({ label: u.label, price: u.price }));
    try {
      setSaving(true);
      await updateCheckinAction(record.id, {
        mileage,
        damages,
        options: optionItems,
        photos: photos.map((p) => p.data),
        signature,
        total,
        status: "RECU",
        checkinDone: true,
      });
      setDone(true);
    } catch {
      /* prototype */
    } finally {
      setSaving(false);
      setStep(6);
    }
  }

  /* ── Terminé ── */
  if (step === 6) {
    return (
      <Card gold className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-grad text-[#1a1400]">
          <Check size={32} strokeWidth={3} />
        </div>
        <div>
          <div className="font-display text-2xl uppercase">Véhicule reçu</div>
          <div className="mt-1 text-sm text-ink-muted">{record.vehicleTitle} · {record.plate}</div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-ink-muted">
          <span className="rounded-full border border-line-soft px-3 py-1">Intervention {record.ref}</span>
          <span className="rounded-full border border-line-soft px-3 py-1">{damages.length} dommage(s)</span>
          <span className="rounded-full border border-line-soft px-3 py-1">{photos.length} photo(s)</span>
          {signature && <span className="rounded-full border border-line-soft px-3 py-1">Signé ✓</span>}
        </div>
        <div className="font-display text-lg text-gold-1">Total estimé {eur(total)}</div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href={`/app/checkin/rapport/${record.id}`}>
            <Button variant="ghost">Voir le rapport</Button>
          </Link>
          <Link href={`/app/intervention/${record.id}`}>
            <Button>Démarrer l'intervention →</Button>
          </Link>
        </div>
        {done && <p className="text-[11px] text-ink-faint">Check-in enregistré · véhicule réceptionné</p>}
      </Card>
    );
  }

  return (
    <div>
      {/* Barre de progression */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const isDone = n < step;
          const active = n === step;
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs", isDone && "bg-gold-grad text-[#1a1400]", active && "border border-line-gold bg-gold/15 text-gold-1", !isDone && !active && "border border-line-soft text-ink-faint")}>
                  {isDone ? <Check size={14} strokeWidth={3} /> : n}
                </div>
                {i < STEPS.length - 1 && <div className={cn("h-px flex-1", isDone ? "bg-gold" : "bg-line-soft")} />}
              </div>
              <span className={cn("hidden text-[10px] uppercase tracking-wider sm:block", active ? "text-gold-1" : "text-ink-faint")}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* En-tête véhicule */}
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-line-soft bg-night-panel px-4 py-3">
        <CarSilhouette width={44} />
        <div>
          <b className="font-display text-base uppercase">{record.vehicleTitle}</b>
          <span className="ml-2 rounded border border-line-soft bg-[#111] px-1.5 py-px font-display text-[11px] tracking-wider">{record.plate}</span>
          <div className="text-xs text-ink-muted">{record.customer} · {record.service} · {record.ref}</div>
        </div>
      </div>

      {/* Étape 1 — véhicule + km */}
      {step === 1 && (
        <Card>
          <div className="mb-3 flex items-center gap-2 text-gold-1"><Car size={18} /> <b className="font-display uppercase">Confirmer le véhicule</b></div>
          <p className="mb-4 text-sm text-ink-muted">Vérifiez le véhicule, puis relevez le kilométrage.</p>
          <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted"><Gauge size={13} className="mr-1 inline" /> Kilométrage</label>
          <input inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value.replace(/\D/g, ""))} placeholder="ex : 48 500" className="w-full max-w-xs rounded-[10px] border border-line-soft bg-night-2 px-3.5 py-3 text-[15px] focus:border-gold focus:outline-none" />
        </Card>
      )}

      {/* Étape 2 — état des lieux */}
      {step === 2 && (
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2 text-gold-1"><ClipboardCheck size={18} /> <b className="font-display uppercase">État des lieux</b></div>
            <p className="mb-3 text-sm text-ink-muted">Tapez une zone pour signaler un dommage existant.</p>
            <VehicleDiagram damages={damages} activeZone={pending?.id ?? null} onZoneClick={(id, label) => { setPending({ id, label }); setNote(""); }} />
          </div>
          <div>
            {pending ? (
              <Card gold>
                <div className="mb-2 flex items-center justify-between"><b className="font-display uppercase">{pending.label}</b><button onClick={() => setPending(null)} className="text-ink-faint"><X size={18} /></button></div>
                <div className="mb-3 flex flex-wrap gap-2">{DAMAGE_TYPES.map((t) => (<button key={t} onClick={() => addDamage(t)} className="rounded-full border border-line-gold bg-gold/[0.06] px-3 py-1.5 text-xs text-gold-1 hover:bg-gold/15">{t}</button>))}</div>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Remarque (facultatif)" className="w-full rounded-[10px] border border-line-soft bg-night-2 px-3 py-2.5 text-sm focus:border-gold focus:outline-none" />
              </Card>
            ) : (
              <Card>
                <b className="font-display uppercase text-gold-1">Dommages relevés ({damages.length})</b>
                {damages.length === 0 ? (<p className="mt-2 text-sm text-ink-muted">Aucun pour l'instant.</p>) : (
                  <ul className="mt-3 space-y-2">{damages.map((d) => (<li key={d.id} className="flex items-center justify-between rounded-lg border border-line-soft px-3 py-2 text-sm"><span><b>{d.type}</b> — {d.zoneLabel}{d.note && <span className="text-ink-faint"> · {d.note}</span>}</span><button onClick={() => setDamages((l) => l.filter((x) => x.id !== d.id))} className="text-ink-faint hover:text-state-red"><X size={16} /></button></li>))}</ul>
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Étape 3 — photos */}
      {step === 3 && (
        <Card>
          <div className="mb-3 flex items-center gap-2 text-gold-1"><Camera size={18} /> <b className="font-display uppercase">Photos du check-in</b></div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple onChange={onFiles} className="hidden" />
          <Button variant="ghost" onClick={() => fileRef.current?.click()}><Camera size={16} /> Prendre / ajouter une photo</Button>
          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">{photos.map((p) => (<div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border border-line-soft">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.url} alt="" className="h-full w-full object-cover" /><button onClick={() => setPhotos((l) => l.filter((x) => x.id !== p.id))} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"><X size={14} /></button></div>))}</div>
          )}
        </Card>
      )}

      {/* Étape 4 — suppléments */}
      {step === 4 && (
        <Card>
          <div className="mb-3 flex items-center gap-2 text-gold-1"><Plus size={18} /> <b className="font-display uppercase">Suppléments proposés</b></div>
          <div className="space-y-2">{UPSELLS.map((u) => { const on = options.has(u.id); return (
            <button key={u.id} onClick={() => toggleOption(u.id)} className={cn("flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors", on ? "border-line-gold bg-gold/10" : "border-line-soft hover:border-line-gold")}>
              <span className="flex items-center gap-3"><span className={cn("flex h-6 w-6 items-center justify-center rounded-md border", on ? "border-gold bg-gold-grad text-[#1a1400]" : "border-line-soft")}>{on && <Check size={14} strokeWidth={3} />}</span>{u.label}</span>
              <span className="font-display text-gold-1">+{eur(u.price)}</span>
            </button>); })}
          </div>
        </Card>
      )}

      {/* Étape 5 — résumé + signature */}
      {step === 5 && (
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <b className="font-display uppercase text-gold-1">Résumé</b>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between"><span>{record.service}</span><span>{eur(record.total)}</span></li>
              {UPSELLS.filter((u) => options.has(u.id)).map((u) => (<li key={u.id} className="flex justify-between text-ink-muted"><span>+ {u.label}</span><span>{eur(u.price)}</span></li>))}
              <li className="flex justify-between border-t border-line-soft pt-2 font-display text-base"><span>Total estimé</span><span className="text-gold-1">{eur(total)}</span></li>
            </ul>
            <div className="mt-3 space-y-1 text-xs text-ink-muted">
              <div>Kilométrage : {mileage ? `${mileage} km` : "—"}</div>
              <div>État véhicule : {damages.length} dommage(s)</div>
              <div>Photos : {photos.length}</div>
            </div>
          </Card>
          <Card>
            <b className="font-display uppercase text-gold-1">Signature client</b>
            <p className="my-2 text-xs text-ink-muted">Le client valide l'état du véhicule et les prestations.</p>
            <SignaturePad onChange={setSignature} />
          </Card>
        </div>
      )}

      {/* Barre d'action */}
      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => setStep((s) => Math.max(1, s - 1))} className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink"><ChevronLeft size={16} /> Précédent</button>
        {step < 5 ? (
          <Button size="lg" onClick={() => setStep((s) => s + 1)}>Continuer →</Button>
        ) : (
          <Button size="lg" disabled={!signature || saving} className={cn((!signature || saving) && "cursor-not-allowed opacity-40")} onClick={finish}>
            <Check size={18} /> {saving ? "Enregistrement…" : "Je valide et je reçois le véhicule"}
          </Button>
        )}
      </div>
    </div>
  );
}
