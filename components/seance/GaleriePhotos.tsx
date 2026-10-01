"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PhotoSeance } from "@/lib/objectifs-store";
import { compresserPhoto, enregistrerMedia, nouvelId, useUrlMedia } from "@/lib/medias-seances";
import { Glyphe } from "./outils";

/*
 * Les photos du tableau : appareil photo sur téléphone, glisser-déposer ou
 * Ctrl+V d'une capture sur ordinateur. Chaque image est réduite avant d'être
 * rangée, puis s'ouvre en grand, flèches pour passer à la suivante.
 */

export function GaleriePhotos({
  photos,
  onAjouter,
  onSupprimer,
}: {
  photos: PhotoSeance[];
  onAjouter: (photo: PhotoSeance) => void;
  onSupprimer: (id: string) => void;
}) {
  const entree = useRef<HTMLInputElement>(null);
  const [enCours, setEnCours] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [depot, setDepot] = useState(false);
  const [ouverte, setOuverte] = useState<number | null>(null);
  const ajouter = useRef(onAjouter);

  useEffect(() => {
    ajouter.current = onAjouter;
  });

  const importer = useCallback(async (fichiers: File[]) => {
    const images = fichiers.filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    setErreur(null);
    setEnCours((n) => n + images.length);
    for (const fichier of images) {
      try {
        const { blob, largeur, hauteur } = await compresserPhoto(fichier);
        const id = nouvelId("photo");
        await enregistrerMedia(id, blob);
        ajouter.current({ id, creeLe: new Date().toISOString(), largeur, hauteur });
      } catch {
        setErreur("Une image n’a pas pu être importée.");
      } finally {
        setEnCours((n) => n - 1);
      }
    }
  }, []);

  // Une capture collée (Ctrl+V) est ajoutée directement
  useEffect(() => {
    const coller = (e: ClipboardEvent) => {
      const fichiers = Array.from(e.clipboardData?.files ?? []);
      if (fichiers.some((f) => f.type.startsWith("image/"))) {
        e.preventDefault();
        void importer(fichiers);
      }
    };
    window.addEventListener("paste", coller);
    return () => window.removeEventListener("paste", coller);
  }, [importer]);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => entree.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDepot(true);
        }}
        onDragLeave={() => setDepot(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDepot(false);
          void importer(Array.from(e.dataTransfer.files));
        }}
        className={`rounded-lg border-2 border-dashed px-4 py-6 flex flex-col items-center gap-2 text-center transition-colors ${
          depot ? "border-brand bg-brand-soft" : "border-hairline hover:border-text-secondary"
        }`}
      >
        <span className="text-text-muted">
          <Glyphe outil="photos" taille={26} />
        </span>
        <span className="font-sans text-sm font-medium text-ink">Photographier le tableau ou importer une image</span>
        <span className="font-sans text-xs text-text-muted">Glisser-déposer, ou coller une capture avec Ctrl+V</span>
      </button>
      <input
        ref={entree}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        hidden
        onChange={(e) => {
          void importer(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {enCours > 0 && (
        <p className="font-sans text-xs text-text-muted">
          Compression de {enCours} image{enCours > 1 ? "s" : ""}…
        </p>
      )}
      {erreur && <p className="font-sans text-xs text-accent-deep">{erreur}</p>}

      {photos.length === 0 && enCours === 0 ? (
        <p className="font-sans text-sm text-text-muted">Aucune photo pour cette séance.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <Vignette key={p.id} photo={p} onOuvrir={() => setOuverte(i)} onSupprimer={() => onSupprimer(p.id)} />
          ))}
        </ul>
      )}

      {ouverte !== null && photos[ouverte] && (
        <Visionneuse photos={photos} index={ouverte} onIndex={setOuverte} onFermer={() => setOuverte(null)} />
      )}
    </div>
  );
}

function Vignette({ photo, onOuvrir, onSupprimer }: { photo: PhotoSeance; onOuvrir: () => void; onSupprimer: () => void }) {
  const url = useUrlMedia(photo.id);
  const [confirmer, setConfirmer] = useState(false);
  return (
    <li className="group relative aspect-[4/3] rounded-md overflow-hidden border border-hairline bg-surface-secondary">
      <button type="button" onClick={onOuvrir} className="absolute inset-0" aria-label="Agrandir la photo">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element -- image locale (blob:), hors de portée de next/image
          <img src={url} alt="" className="h-full w-full object-cover" />
        )}
      </button>
      <button
        type="button"
        onClick={() => (confirmer ? onSupprimer() : setConfirmer(true))}
        onMouseLeave={() => setConfirmer(false)}
        className={`absolute top-1 right-1 rounded px-1.5 py-0.5 font-sans text-[10px] transition-opacity ${
          confirmer
            ? "bg-accent-deep text-canvas opacity-100"
            : "bg-canvas/90 text-ink opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        }`}
      >
        {confirmer ? "Confirmer" : "Retirer"}
      </button>
    </li>
  );
}

function Visionneuse({
  photos,
  index,
  onIndex,
  onFermer,
}: {
  photos: PhotoSeance[];
  index: number;
  onIndex: (i: number) => void;
  onFermer: () => void;
}) {
  const url = useUrlMedia(photos[index].id);
  const n = photos.length;

  useEffect(() => {
    // En capture : Échap ferme la photo sans fermer le tiroir derrière
    const clavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onFermer();
      } else if (e.key === "ArrowRight") onIndex((index + 1) % n);
      else if (e.key === "ArrowLeft") onIndex((index - 1 + n) % n);
    };
    window.addEventListener("keydown", clavier, true);
    return () => window.removeEventListener("keydown", clavier, true);
  }, [index, n, onIndex, onFermer]);

  const fleche = "absolute top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center";

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/85 flex items-center justify-center p-6" onClick={onFermer} role="dialog" aria-label="Photo du tableau">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- image locale (blob:)
        <img src={url} alt="" className="max-h-full max-w-full object-contain rounded" onClick={(e) => e.stopPropagation()} />
      )}
      {n > 1 && (
        <>
          <button
            type="button"
            aria-label="Photo précédente"
            className={`${fleche} left-4`}
            onClick={(e) => {
              e.stopPropagation();
              onIndex((index - 1 + n) % n);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden>
              <path d="M8 2L4 6l4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Photo suivante"
            className={`${fleche} right-4`}
            onClick={(e) => {
              e.stopPropagation();
              onIndex((index + 1) % n);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden>
              <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
      <p className="absolute bottom-4 inset-x-0 text-center font-sans text-xs text-white/70 tabular-nums">
        {index + 1} / {n} · Échap pour fermer
      </p>
    </div>,
    document.body
  );
}
