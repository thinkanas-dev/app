"use client";

import { createPortal } from "react-dom";
import type { CarnetSeance } from "@/lib/objectifs-store";
import { COMPREHENSION, Glyphe, OUTILS, comptesCarnet, type OutilSeance } from "./outils";

/*
 * La barre d'outils d'une séance.
 *
 * Avec une ancre (le rectangle de la séance à l'écran), elle flotte au-dessus
 * de la séance survolée ; sans ancre, elle se pose là où on la place, comme
 * dans l'agenda de la journée. Un point bleu signale un outil déjà utilisé.
 */

const LARGEUR = 250;

export function DockSeance({
  carnet,
  couleur,
  etiquette,
  onOutil,
  ancre,
  onEntrer,
  onSortir,
}: {
  carnet?: CarnetSeance;
  couleur: string;
  etiquette: string;
  onOutil: (outil: OutilSeance) => void;
  ancre?: DOMRect;
  onEntrer?: () => void;
  onSortir?: () => void;
}) {
  const comptes = comptesCarnet(carnet);
  const comprehension = COMPREHENSION.find((c) => c.cle === carnet?.comprehension);

  const barre = (
    <div
      role="toolbar"
      aria-label={`Carnet de séance : ${etiquette}`}
      onMouseEnter={onEntrer}
      onMouseLeave={onSortir}
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-0.5 rounded-full border border-hairline bg-canvas pl-2.5 pr-1 py-1 shadow-[0_12px_32px_-14px_rgba(15,23,42,0.4)]"
    >
      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: couleur }} aria-hidden />
      <span className="font-sans text-[10px] font-semibold text-text-muted ml-1.5 mr-1 whitespace-nowrap tabular-nums">
        {etiquette}
      </span>
      {comprehension && (
        <span
          className="h-1.5 w-1.5 rounded-full mr-1 shrink-0"
          style={{ background: comprehension.couleur }}
          title={`Compréhension : ${comprehension.nom}`}
        />
      )}
      {OUTILS.map((o) => (
        <button
          key={o.cle}
          type="button"
          onClick={() => onOutil(o.cle)}
          aria-label={`${o.nom} : ${o.aide}`}
          className="group/outil relative h-8 w-8 rounded-full flex items-center justify-center text-text-muted hover:text-ink hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-colors"
        >
          <Glyphe outil={o.cle} taille={16} />
          {comptes[o.cle] > 0 && <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />}
          <span className="pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 font-sans text-[10px] text-canvas opacity-0 group-hover/outil:opacity-100 transition-opacity z-10">
            {o.nom}
          </span>
        </button>
      ))}
    </div>
  );

  if (!ancre) return barre;

  const centre = Math.min(
    Math.max(ancre.left + ancre.width / 2, LARGEUR / 2 + 8),
    window.innerWidth - LARGEUR / 2 - 8
  );
  const auDessus = ancre.top > 64;

  return createPortal(
    <div
      className="fixed z-[60] -translate-x-1/2 animate-fade-in-up"
      style={{ left: centre, top: auDessus ? ancre.top - 46 : ancre.bottom + 8 }}
    >
      {barre}
    </div>,
    document.body
  );
}
