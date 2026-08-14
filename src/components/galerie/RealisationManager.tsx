"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Star,
  Eye,
  EyeOff,
  ImagePlus,
  Check,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Realisation } from "@/lib/realisation-types";
import {
  createRealisationAction,
  updateRealisationAction,
  deleteRealisationAction,
  addPhotoSetAction,
  deletePhotoSetAction,
} from "@/app/app/galerie/actions";

/** Redimensionne + compresse une image côté navigateur pour garder la DB légère. */
function fileToDataUrl(file: File, maxSize = 1400, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("img"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("ctx"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function PhotoField({
  label,
  value,
  onPick,
}: {
  label: string;
  value: string | null;
  onPick: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handle(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      onPick(await fileToDataUrl(file));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line-soft bg-night-2 text-ink-faint transition-colors hover:border-line-gold"
    >
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt={label} className="h-full w-full object-cover" />
      ) : busy ? (
        <Loader2 size={22} className="animate-spin text-gold-1" />
      ) : (
        <span className="flex flex-col items-center gap-1.5 text-[12px]">
          <ImagePlus size={22} />
          {label}
        </span>
      )}
      <span className="absolute left-2 top-2 rounded-full border border-line-soft bg-black/60 px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-ink-muted">
        {label}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </button>
  );
}

function AddSet({ realisationId }: { realisationId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [label, setLabel] = useState("");
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);

  function submit() {
    if (!before || !after) return;
    start(async () => {
      await addPhotoSetAction(realisationId, {
        label: label.trim() || undefined,
        before,
        after,
      });
      setLabel("");
      setBefore(null);
      setAfter(null);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-line-soft bg-night-2/50 p-3">
      <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-faint">
        Nouveau set avant / après
      </div>
      <div className="grid grid-cols-2 gap-2">
        <PhotoField label="Avant" value={before} onPick={setBefore} />
        <PhotoField label="Après" value={after} onPick={setAfter} />
      </div>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Étiquette (facultatif) — ex. Extérieur, Jantes…"
        className="mt-2 w-full rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
      />
      <button
        onClick={submit}
        disabled={pending || !before || !after}
        className={cn(
          "mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-line-gold py-2 font-display text-sm uppercase tracking-wide text-gold-1 hover:bg-gold/[0.08]",
          (pending || !before || !after) && "opacity-40",
        )}
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
        Ajouter le set
      </button>
    </div>
  );
}

function RealisationCard({ realisation }: { realisation: Realisation }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState(realisation.title);
  const [vehicle, setVehicle] = useState(realisation.vehicle ?? "");
  const [description, setDescription] = useState(realisation.description ?? "");
  const [tag, setTag] = useState(realisation.tag ?? "");
  const [saved, setSaved] = useState(false);

  function saveInfo() {
    start(async () => {
      await updateRealisationAction(realisation.id, {
        title: title.trim() || realisation.title,
        vehicle: vehicle.trim(),
        description: description.trim(),
        tag: tag.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      router.refresh();
    });
  }

  function toggle(patch: Partial<Realisation>) {
    start(async () => {
      await updateRealisationAction(realisation.id, patch);
      router.refresh();
    });
  }

  function removeRealisation() {
    start(async () => {
      await deleteRealisationAction(realisation.id);
      router.refresh();
    });
  }

  function removeSet(setId: string) {
    start(async () => {
      await deletePhotoSetAction(realisation.id, setId);
      router.refresh();
    });
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-start gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-lg border border-line-soft bg-night-2 px-3 py-2 font-display text-lg uppercase tracking-wide text-ink focus:border-gold focus:outline-none"
        />
        <button
          onClick={removeRealisation}
          disabled={pending}
          title="Supprimer la réalisation"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line-soft text-ink-faint hover:border-state-red hover:text-state-red"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          placeholder="Véhicule / plaque (facultatif)"
          className="rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
        />
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Étiquette (ex. Céramique)"
          className="rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description affichée sur le site (facultatif)"
        rows={2}
        className="mt-2 w-full resize-none rounded-lg border border-line-soft bg-night-2 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => toggle({ published: !realisation.published })}
          disabled={pending}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
            realisation.published
              ? "border-line-gold bg-gold/10 text-gold-1"
              : "border-line-soft text-ink-muted hover:border-line-gold",
          )}
        >
          {realisation.published ? <Eye size={14} /> : <EyeOff size={14} />}
          {realisation.published ? "Publié" : "Brouillon"}
        </button>
        <button
          onClick={() => toggle({ featured: !realisation.featured })}
          disabled={pending}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
            realisation.featured
              ? "border-line-gold bg-gold/10 text-gold-1"
              : "border-line-soft text-ink-muted hover:border-line-gold",
          )}
        >
          <Star size={14} className={realisation.featured ? "fill-gold-1 text-gold-1" : ""} />
          En avant
        </button>
        <button
          onClick={saveInfo}
          disabled={pending}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-line-gold px-3 py-1.5 text-sm text-gold-1 hover:bg-gold/[0.08]"
        >
          <Check size={14} /> {saved ? "Enregistré ✓" : "Enregistrer"}
        </button>
      </div>

      <div className="mt-4 mb-2 text-[11px] uppercase tracking-wider text-ink-faint">
        Sets photo ({realisation.sets.length})
      </div>
      {realisation.sets.length > 0 && (
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          {realisation.sets.map((s) => (
            <div key={s.id} className="rounded-xl border border-line-soft p-2">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.before} alt="Avant" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[9px] uppercase tracking-widest text-ink-muted">
                    Avant
                  </span>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.after} alt="Après" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 left-1 rounded bg-gold-grad px-1.5 text-[9px] uppercase tracking-widest text-[#1a1400]">
                    Après
                  </span>
                </div>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[12px] text-ink-muted">{s.label || "Set"}</span>
                <button
                  onClick={() => removeSet(s.id)}
                  disabled={pending}
                  className="text-ink-faint hover:text-state-red"
                  title="Supprimer ce set"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddSet realisationId={realisation.id} />
    </Card>
  );
}

export function RealisationManager({ realisations }: { realisations: Realisation[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");

  function add() {
    start(async () => {
      await createRealisationAction({ title: title.trim() || "Nouvelle réalisation" });
      setTitle("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nom du véhicule (ex. Chrysler 300C)"
          className="flex-1 rounded-lg border border-line-soft bg-night-2 px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
        />
        <Button onClick={add} disabled={pending} className="whitespace-nowrap">
          <Plus size={16} /> Nouvelle réalisation
        </Button>
      </Card>

      {realisations.length === 0 ? (
        <Card className="py-12 text-center text-sm text-ink-muted">
          Aucune réalisation pour l'instant. Créez-en une, puis ajoutez un ou
          plusieurs sets avant / après. Une fois « Publié », elle apparaît sur le
          blog photo visible par vos clients.
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {realisations.map((r) => (
            <RealisationCard key={r.id} realisation={r} />
          ))}
        </div>
      )}

      <p className="text-[11px] text-ink-faint">
        Les photos sont automatiquement redimensionnées et compressées. Seules les
        réalisations « Publié » sont visibles sur la page publique{" "}
        <a href="/realisations" className="text-gold-1 underline">
          /realisations
        </a>
        .
      </p>
    </div>
  );
}
