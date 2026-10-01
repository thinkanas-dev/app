"use client";

import { useEffect, useRef, useState } from "react";
import { addPdf, listPdfs, deletePdf, getPdfUrl, type PdfMeta } from "@/lib/file-store";
import { libelleSemaine, lundiPertinentISO, lundiDe, toISO } from "@/lib/semaine";
import { IconDownload } from "./icons";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/** Emplois du temps et supports, un PDF par semaine de cours. */
export function ProgrammePdfs() {
  const [pdfs, setPdfs] = useState<PdfMeta[]>([]);
  const [debut, setDebut] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDebut(lundiPertinentISO());
    listPdfs("semaine")
      .then(setPdfs)
      .catch(() => setError("Impossible de lire les fichiers enregistrés."));
  }, []);

  /** Chaque dépôt crée une nouvelle semaine, numérotée à la suite. */
  const prochainNumero =
    pdfs.length === 0 ? 1 : Math.max(...pdfs.map((p) => p.semaine)) + 1;

  /** Toute date choisie est ramenée au lundi de sa semaine. */
  function onChangeDebut(value: string) {
    if (!value) return;
    setDebut(toISO(lundiDe(new Date(value + "T00:00:00"))));
  }

  async function onPick(file: File | undefined) {
    if (!file || !debut) return;
    if (file.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const lundi = new Date(debut + "T00:00:00");
      await addPdf(file, prochainNumero, "semaine", libelleSemaine(debut), debut);
      setPdfs(await listPdfs("semaine"));

      // On avance d'une semaine pour le prochain ajout
      const suivant = new Date(lundi);
      suivant.setDate(lundi.getDate() + 7);
      setDebut(toISO(suivant));
    } catch {
      setError("Enregistrement impossible. Le navigateur a peut-être refusé le stockage.");
    } finally {
      setBusy(false);
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

  async function onDelete(id: string) {
    await deletePdf(id);
    setPdfs(await listPdfs("semaine"));
  }

  return (
    <div className="rounded-lg border border-hairline bg-canvas">
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-hairline flex-wrap">
        <div>
          <h2 className="font-sans font-semibold text-base text-ink">Programmes hebdomadaires</h2>
          <p className="font-sans text-xs text-text-muted mt-0.5">
            Emploi du temps et supports, un PDF par semaine de cours
          </p>
        </div>

        <div className="flex items-end gap-2 flex-wrap">
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-text-muted">Semaine du</span>
            <input
              type="date"
              value={debut}
              onChange={(e) => onChangeDebut(e.target.value)}
              className="bg-canvas text-ink font-sans text-sm rounded-md border border-hairline px-2.5 py-1.5 outline-none focus:border-brand transition-colors"
            />
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={busy || !debut}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand hover:bg-brand-hover disabled:opacity-60 text-canvas font-sans text-sm font-medium px-3.5 py-2 transition-colors"
          >
            <IconDownload width={13} height={13} />
            {busy ? "Ajout…" : "Ajouter le PDF"}
          </button>
        </div>
      </div>

      {debut && (
        <p className="px-5 py-2.5 border-b border-hairline bg-brand-soft/40 font-sans text-sm text-ink">
          Prochain dépôt :{" "}
          <span className="font-semibold">Semaine {prochainNumero}</span>
          <span className="text-text-muted"> · {libelleSemaine(debut)}</span>
        </p>
      )}

      {error && (
        <p className="px-5 py-3 font-sans text-sm text-accent-deep border-b border-hairline">
          {error}
        </p>
      )}

      {pdfs.length === 0 ? (
        <p className="px-5 py-6 font-sans text-sm text-text-muted">
          Aucun programme enregistré. Choisissez la semaine, puis ajoutez le PDF.
        </p>
      ) : (
        <div className="divide-y divide-hairline">
          {pdfs.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm leading-snug">
                  <span className="font-semibold text-ink">Semaine {p.semaine}</span>
                  {p.debut && (
                    <span className="text-text-muted"> · {libelleSemaine(p.debut)}</span>
                  )}
                </p>
                <p className="font-sans text-xs text-text-muted truncate tabular-nums">
                  {p.nom} · {formatSize(p.taille)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpen(p.id)}
                className="font-sans text-xs text-brand hover:underline shrink-0"
              >
                Ouvrir
              </button>
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                aria-label={`Supprimer ${p.nom}`}
                className="font-sans text-xs text-text-muted hover:text-accent-deep shrink-0 transition-colors"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="px-5 py-3 border-t border-hairline font-sans text-xs text-text-muted">
        Les fichiers restent dans ce navigateur, ils ne sont envoyés nulle part.
      </p>
    </div>
  );
}
