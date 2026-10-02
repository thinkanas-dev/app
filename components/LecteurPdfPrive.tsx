"use client";

import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";

async function chargerPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }
  return pdfjs;
}

export function LecteurPdfPrive({ debut, fin }: { debut: number; fin: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [documentPdf, setDocumentPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(debut);
  const [etat, setEtat] = useState<"chargement" | "pret" | "erreur">("chargement");

  useEffect(() => setPage(debut), [debut]);

  useEffect(() => {
    const controleur = new AbortController();
    void (async () => {
      try {
        setEtat("chargement");
        const reponse = await fetch("/api/livres/histoire-maroc", {
          cache: "no-store",
          signal: controleur.signal,
        });
        if (!reponse.ok) throw new Error("Livre indisponible");
        const pdfjs = await chargerPdfjs();
        const charge = pdfjs.getDocument({
          data: new Uint8Array(await reponse.arrayBuffer()),
        });
        setDocumentPdf(await charge.promise);
      } catch {
        if (!controleur.signal.aborted) setEtat("erreur");
      }
    })();
    return () => controleur.abort();
  }, []);

  useEffect(() => {
    if (!documentPdf || !canvasRef.current) return;
    let annule = false;
    let rendu: RenderTask | null = null;

    void (async () => {
      const pagePdf = await documentPdf.getPage(page);
      if (annule || !canvasRef.current) return;
      const densite = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = pagePdf.getViewport({ scale: 1.25 * densite });
      const canvas = canvasRef.current;
      const contexte = canvas.getContext("2d", { alpha: false });
      if (!contexte) throw new Error("Canvas indisponible");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${Math.floor(viewport.width / densite)}px`;
      canvas.style.height = `${Math.floor(viewport.height / densite)}px`;
      rendu = pagePdf.render({ canvas, canvasContext: contexte, viewport });
      await rendu.promise;
      if (!annule) setEtat("pret");
    })().catch(() => {
      if (!annule) setEtat("erreur");
    });

    return () => {
      annule = true;
      rendu?.cancel();
    };
  }, [documentPdf, page]);

  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-hairline bg-surface-secondary">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-canvas px-3 py-2">
        <button type="button" disabled={page <= debut || etat === "chargement"} onClick={() => setPage((numero) => Math.max(debut, numero - 1))} className="rounded-md border border-hairline px-3 py-1.5 font-sans text-xs text-ink disabled:opacity-35">← Page précédente</button>
        <span className="font-sans text-xs font-semibold tabular-nums text-text-muted">Page {page} · séance {debut}–{fin}</span>
        <button type="button" disabled={page >= fin || etat === "chargement"} onClick={() => setPage((numero) => Math.min(fin, numero + 1))} className="rounded-md border border-hairline px-3 py-1.5 font-sans text-xs text-ink disabled:opacity-35">Page suivante →</button>
      </div>
      <div className="relative flex h-[72vh] min-h-[560px] items-start justify-center overflow-auto bg-[#dedbd3] p-4">
        {etat === "chargement" && <p className="absolute inset-x-0 top-8 text-center font-sans text-sm text-text-muted">Ouverture du livre privé…</p>}
        {etat === "erreur" && <p className="m-auto rounded-md bg-canvas px-4 py-3 font-sans text-sm text-accent-deep">Le lecteur n’a pas pu ouvrir le livre.</p>}
        <canvas ref={canvasRef} className={`bg-white shadow-xl ${etat === "erreur" ? "hidden" : "block"}`} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline bg-canvas px-3 py-2">
        <p className="font-sans text-xs text-text-muted">Document privé, transmis uniquement après le contrôle PIN et réseau.</p>
        <a href={`/api/livres/histoire-maroc#page=${page}`} target="_blank" rel="noreferrer" className="font-sans text-xs font-semibold text-brand hover:underline">Ouvrir le PDF complet ↗</a>
      </div>
    </div>
  );
}
