"use client";

import { useEffect, useRef, useState } from "react";
import {
  addPdf,
  listPdfs,
  deletePdf,
  getPdfUrl,
  type PdfMeta,
} from "@/lib/file-store";
import { IconCalendar } from "./icons";

const semestres = [
  { cle: "S3", numero: 3, periode: "Septembre 2026 → Janvier 2027" },
  { cle: "S4", numero: 4, periode: "Février 2027 → Juin 2027" },
] as const;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Calendrier pédagogique de l'année : un emplacement par semestre.
 * Déposer un nouveau fichier remplace le précédent.
 */
export function CalendrierAnnee({ compact = false }: { compact?: boolean }) {
  const [fichiers, setFichiers] = useState<PdfMeta[]>([]);
  const [cible, setCible] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listPdfs("calendrier")
      .then(setFichiers)
      .catch(() => setError("Impossible de lire les calendriers enregistrés."));
  }, []);

  function demander(numero: number) {
    setCible(numero);
    setError(null);
    fileRef.current?.click();
  }

  async function onPick(file: File | undefined) {
    if (!file || cible === null) return;
    if (file.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    try {
      // Un seul calendrier par semestre : on remplace l'ancien
      const existant = fichiers.find((f) => f.semaine === cible);
      if (existant) await deletePdf(existant.id);

      await addPdf(file, cible, "calendrier", `S${cible}`);
      setFichiers(await listPdfs("calendrier"));
    } catch {
      setError("Enregistrement impossible.");
    } finally {
      setCible(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onOpen(id: string) {
    const url = await getPdfUrl(id);
    if (!url) {
      setError("Fichier introuvable.");
      return;
    }
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  // Variante resserrée pour la colonne de contexte
  if (compact) {
    return (
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
          Calendrier de l&apos;année
        </p>
        <div className="flex gap-2">
          {semestres.map((s) => {
            const f = fichiers.find((x) => x.semaine === s.numero);
            return (
              <button
                key={s.cle}
                type="button"
                onClick={() => (f ? onOpen(f.id) : demander(s.numero))}
                title={f ? `Ouvrir le calendrier ${s.cle}` : `Ajouter le calendrier ${s.cle}`}
                className={`flex-1 rounded-md border px-2 py-2 font-sans text-xs transition-colors ${
                  f
                    ? "border-hairline text-ink hover:border-brand hover:text-brand"
                    : "border-dashed border-text-secondary text-text-muted hover:border-brand hover:text-brand"
                }`}
              >
                <span className="font-semibold block">{s.cle}</span>
                <span className="text-[10px] text-text-muted">{f ? "Ouvrir" : "Ajouter"}</span>
              </button>
            );
          })}
        </div>
        {error && <p className="font-sans text-xs text-accent-deep mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-hairline bg-canvas">
      <div className="px-5 py-4 border-b border-hairline">
        <div className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-md bg-accent-sky/10 text-accent-sky flex items-center justify-center shrink-0">
            <IconCalendar width={16} height={16} />
          </span>
          <div>
            <h2 className="font-sans font-semibold text-base text-ink leading-tight">
              Calendrier pédagogique de l&apos;année
            </h2>
            <p className="font-sans text-xs text-text-muted">
              2ᵉ année cycle ingénieur — Génie des Données de Santé
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />

      {error && (
        <p className="px-5 py-3 font-sans text-sm text-accent-deep border-b border-hairline">
          {error}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-3 p-5">
        {semestres.map((s) => {
          const f = fichiers.find((x) => x.semaine === s.numero);
          return (
            <div
              key={s.cle}
              className="rounded-md border border-hairline p-4 flex flex-col gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-sans font-semibold text-sm text-ink">{s.cle}</span>
                  {f && (
                    <span className="font-sans text-[11px] text-accent-olive bg-accent-cactus rounded px-1.5 py-0.5">
                      Ajouté
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-text-muted">{s.periode}</p>
              </div>

              {f ? (
                <>
                  <p className="font-sans text-xs text-text-muted truncate">
                    {f.nom} · {formatSize(f.taille)}
                  </p>
                  <div className="flex items-center gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => onOpen(f.id)}
                      className="flex-1 rounded-md bg-brand hover:bg-brand-hover text-canvas font-sans text-sm font-medium py-2 transition-colors"
                    >
                      Ouvrir
                    </button>
                    <button
                      type="button"
                      onClick={() => demander(s.numero)}
                      className="rounded-md border border-hairline text-text-muted hover:text-ink hover:border-text-secondary font-sans text-sm px-3 py-2 transition-colors"
                    >
                      Remplacer
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => demander(s.numero)}
                  className="mt-auto rounded-md border border-dashed border-text-secondary text-text-muted hover:text-brand hover:border-brand font-sans text-sm py-2.5 transition-colors"
                >
                  Ajouter le calendrier {s.cle}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
