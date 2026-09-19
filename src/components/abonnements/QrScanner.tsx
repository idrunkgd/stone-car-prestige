"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, CameraOff, Search, ScanLine, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CARD_STATUS, type CardStatus } from "@/lib/subscription-types";
import { cn } from "@/lib/utils";

type IndexItem = {
  id: string;
  number: string;
  name: string;
  plan: string;
  phone: string;
  email: string;
  plates: string[];
  remaining: number | null;
  status: CardStatus;
};

/** API navigateur disponible sur Chrome/Android — absente sur iOS Safari. */
type DetectedBarcode = { rawValue: string };
type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
};
type BarcodeDetectorCtor = new (opts: {
  formats: string[];
}) => BarcodeDetectorLike;

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[\s.-]/g, "");
}

/**
 * Scan d'une carte d'abonnement.
 *
 * Trois chemins, du plus rapide au plus universel :
 *  1. lecteur intégré (BarcodeDetector) quand le navigateur le propose ;
 *  2. appareil photo natif du téléphone : le QR contient une URL qui ouvre
 *     directement la fiche ;
 *  3. recherche manuelle (numéro de carte, client, téléphone, plaque).
 */
export function QrScanner({
  index,
  origin,
}: {
  index: IndexItem[];
  origin: string;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const handledRef = useRef(false);

  const [supported, setSupported] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "BarcodeDetector" in window &&
        !!navigator.mediaDevices?.getUserMedia,
    );
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stop() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  function handleValue(raw: string) {
    if (handledRef.current) return;
    // On n'accepte que nos propres URL de carte.
    const m = raw.match(/\/app\/carte\/([A-Za-z0-9_-]+)/);
    if (!m) {
      setError("Ce QR code ne correspond pas à une carte Stone Car Prestige.");
      return;
    }
    handledRef.current = true;
    stop();
    router.push(`/app/carte/${m[1]}`);
  }

  async function startCamera() {
    setError(null);
    handledRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setScanning(true);

      const Ctor = (
        window as unknown as { BarcodeDetector: BarcodeDetectorCtor }
      ).BarcodeDetector;
      const detector = new Ctor({ formats: ["qr_code"] });

      let busy = false;
      const tick = async () => {
        if (!streamRef.current) return;
        if (!busy && video.readyState >= 2) {
          busy = true;
          try {
            const codes = await detector.detect(video);
            if (codes.length > 0) handleValue(codes[0].rawValue);
          } catch {
            /* image non exploitable : on retente à la frame suivante */
          }
          busy = false;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError(
        "Accès à la caméra refusé. Utilisez l'appareil photo du téléphone ou la recherche manuelle.",
      );
      stop();
    }
  }

  const results = useMemo(() => {
    const needle = norm(q);
    if (!needle) return [];
    return index
      .filter((it) =>
        norm(
          [it.number, it.name, it.phone, it.email, it.plan, ...it.plates].join(
            "|",
          ),
        ).includes(needle),
      )
      .slice(0, 8);
  }, [index, q]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <div className="mb-3 flex items-center gap-2 text-gold-1">
          <ScanLine size={18} />{" "}
          <b className="font-display uppercase">Lecteur intégré</b>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line-soft bg-night-2">
          <video
            ref={videoRef}
            playsInline
            muted
            className={cn(
              "h-full w-full object-cover",
              !scanning && "opacity-0",
            )}
          />
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <Camera size={34} className="text-ink-faint" />
              <p className="px-6 text-[12.5px] text-ink-muted">
                Placez le QR code du client dans le cadre.
              </p>
            </div>
          )}
          {scanning && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="h-40 w-40 rounded-2xl border-2 border-gold-1/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
            </div>
          )}
        </div>

        {supported === false ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-line-soft bg-night-2 px-3 py-2.5 text-[12.5px] text-ink-muted">
            <CameraOff size={15} className="mt-0.5 shrink-0" />
            Ce navigateur ne propose pas de lecteur intégré (iPhone / Safari).
            Utilisez l&apos;appareil photo du téléphone : il ouvrira
            directement la fiche du client.
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            {!scanning ? (
              <button
                onClick={startCamera}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold-grad py-3 font-display text-sm uppercase tracking-wide text-[#1a1400] shadow-gold"
              >
                <Camera size={17} /> Activer la caméra
              </button>
            ) : (
              <button
                onClick={stop}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line-soft py-3 font-display text-sm uppercase tracking-wide text-ink-muted hover:border-line-gold"
              >
                <CameraOff size={17} /> Arrêter
              </button>
            )}
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-lg border border-state-red/40 bg-state-red/10 px-3 py-2 text-[12.5px] text-[#e88]">
            {error}
          </p>
        )}

        <div className="mt-4 flex items-start gap-2 border-t border-line-soft pt-3 text-[12px] text-ink-faint">
          <Smartphone size={14} className="mt-0.5 shrink-0" />
          Les QR des cartes pointent vers {origin}/app/carte/… — scannés avec
          l&apos;appareil photo du téléphone, ils ouvrent la fiche sans passer
          par cet écran.
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2 text-gold-1">
          <Search size={18} />{" "}
          <b className="font-display uppercase">Recherche manuelle</b>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="N° de carte, client, téléphone, plaque…"
          className="w-full rounded-[10px] border border-line-soft bg-night-2 px-3.5 py-3 text-[15px] focus:border-gold focus:outline-none"
          autoComplete="off"
        />
        <div className="mt-3 space-y-1.5">
          {q && results.length === 0 && (
            <p className="py-4 text-sm text-ink-muted">Aucune carte trouvée.</p>
          )}
          {results.map((it) => (
            <Link
              key={it.id}
              href={`/app/abonnements/${it.id}`}
              className="flex items-center gap-3 rounded-lg border border-line-soft px-3 py-2.5 transition-colors hover:border-line-gold"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[14px] uppercase">
                  {it.name}
                </span>
                <span className="block truncate text-[11.5px] text-ink-faint">
                  {it.plan} · {it.number}
                  {it.plates.length > 0 && ` · ${it.plates.join(", ")}`}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-display text-gold-1">
                  {it.remaining === null ? "∞" : it.remaining}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block rounded-full px-1.5 py-px text-[9px] uppercase tracking-wider",
                    CARD_STATUS[it.status].className,
                  )}
                >
                  {CARD_STATUS[it.status].label}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
