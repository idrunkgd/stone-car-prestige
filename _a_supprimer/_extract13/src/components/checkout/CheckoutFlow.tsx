"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Camera, Check, BadgeCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updateCheckinAction } from "@/app/app/checkin/actions";
import { DEFAULT_QUALITY } from "@/lib/workorder";
import type { CheckinRecord, Task } from "@/lib/checkin-types";
import { eur, cn } from "@/lib/utils";

const METHODS = ["Espèces", "Carte", "Virement"];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function CheckoutFlow({ record }: { record: CheckinRecord }) {
  const [quality, setQuality] = useState<Task[]>(
    record.quality ?? DEFAULT_QUALITY.map((label) => ({ label, done: false })),
  );
  const [afterPhotos, setAfterPhotos] = useState<string[]>(record.afterPhotos ?? []);
  const [method, setMethod] = useState(record.payment?.method ?? "Carte");
  const [paid, setPaid] = useState<boolean>(!!record.payment);
  const [status, setStatus] = useState(record.status ?? "TERMINE");
  const fileRef = useRef<HTMLInputElement>(null);

  const extraTotal = (record.extraWork ?? []).reduce((s, e) => s + e.price, 0);
  const finalTotal = record.total + extraTotal;
  const [amount, setAmount] = useState(String(finalTotal));

  const qualityDone = quality.every((q) => q.done);
  const delivered = status === "LIVRE";

  async function save(patch: Partial<CheckinRecord>) {
    try {
      await updateCheckinAction(record.id, patch);
    } catch {
      /* no-op prototype */
    }
  }

  function toggle(i: number) {
    const next = quality.map((q, k) => (k === i ? { ...q, done: !q.done } : q));
    setQuality(next);
    save({ quality: next });
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const data = await Promise.all(files.map(fileToDataUrl));
    const next = [...afterPhotos, ...data];
    setAfterPhotos(next);
    e.target.value = "";
    save({ afterPhotos: next });
  }

  function markPaid() {
    const amt = parseFloat(amount.replace(",", ".")) || finalTotal;
    setPaid(true);
    setStatus("PRET");
    save({
      payment: { method, amount: amt, paidAt: new Date().toISOString() },
      status: "PRET",
    });
  }

  function deliver() {
    setStatus("LIVRE");
    save({ status: "LIVRE", deliveredAt: new Date().toISOString() });
  }

  if (delivered) {
    return (
      <Card gold className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-grad text-[#1a1400]">
          <Truck size={30} />
        </div>
        <div>
          <div className="font-display text-2xl uppercase">Véhicule livré</div>
          <div className="mt-1 text-sm text-ink-muted">
            {record.vehicleTitle} · {record.plate}
          </div>
        </div>
        <div className="font-display text-lg text-gold-1">
          Encaissé {eur(finalTotal)} · {method}
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href={`/app/checkin/rapport/${record.id}`}>
            <Button variant="ghost">Voir le rapport</Button>
          </Link>
          <Link href="/app">
            <Button>Retour à Aujourd'hui →</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center gap-3 rounded-xl border border-line-gold bg-night-panel px-4 py-3">
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

      <div className="grid gap-5 md:grid-cols-2">
        {/* Contrôle qualité */}
        <Card>
          <div className="mb-3 flex items-center gap-2 text-gold-1">
            <BadgeCheck size={18} /> <b className="font-display uppercase">Contrôle qualité</b>
          </div>
          <div className="space-y-2">
            {quality.map((q, i) => (
              <button
                key={q.label}
                onClick={() => toggle(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  q.done ? "border-line-gold bg-gold/10" : "border-line-soft hover:border-line-gold",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md border",
                    q.done ? "border-gold bg-gold-grad text-[#1a1400]" : "border-line-soft",
                  )}
                >
                  {q.done && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="text-sm">{q.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Photos après + paiement */}
        <div className="space-y-5">
          <Card>
            <div className="mb-3 flex items-center gap-2 text-gold-1">
              <Camera size={18} /> <b className="font-display uppercase">Photos après</b>
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
              <Camera size={16} /> Ajouter une photo
            </Button>
            {afterPhotos.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {afterPhotos.map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-lg border border-line-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <b className="font-display uppercase text-gold-1">Paiement</b>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li className="flex justify-between">
                <span>{record.service}</span>
                <span>{eur(record.total)}</span>
              </li>
              {(record.extraWork ?? []).map((e) => (
                <li key={e.id} className="flex justify-between text-ink-muted">
                  <span>+ {e.label}</span>
                  <span>{eur(e.price)}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-line-soft pt-2 font-display text-base">
                <span>Total</span>
                <span className="text-gold-1">{eur(finalTotal)}</span>
              </li>
            </ul>

            {paid ? (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-line-gold bg-state-green/10 py-3 text-state-green">
                <Check size={18} /> Payé {eur(finalTotal)} · {method}
              </div>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-sm transition-colors",
                        method === m
                          ? "border-line-gold bg-gold/15 text-gold-1"
                          : "border-line-soft hover:border-line-gold",
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
                    inputMode="decimal"
                    className="w-28 rounded-[10px] border border-line-soft bg-night-2 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
                  />
                  <Button onClick={markPaid}>Marquer payé</Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Action finale */}
      <div className="flex flex-col items-end gap-1.5">
        <Button
          size="lg"
          disabled={!qualityDone || !paid}
          className={cn((!qualityDone || !paid) && "cursor-not-allowed opacity-40")}
          onClick={deliver}
        >
          <Truck size={18} /> Livrer le véhicule
        </Button>
        {(!qualityDone || !paid) && (
          <span className="text-[11px] text-ink-faint">
            {!qualityDone
              ? "Terminez le contrôle qualité"
              : "Encaissez le paiement pour livrer"}
          </span>
        )}
      </div>
    </div>
  );
}
