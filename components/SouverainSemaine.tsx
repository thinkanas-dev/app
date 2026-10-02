"use client";

import Link from "next/link";
import { datesSemaineSouverain, semaineSouverain, souverainsMaroc } from "@/content/souverains-maroc";
import { useObjectifsState } from "@/lib/objectifs-store";

const LIVRE_ID = "histoire-maroc-michel-abitbol";

export function SouverainSemaine() {
  const { state } = useObjectifsState();
  const semaine = semaineSouverain();
  const souverain = souverainsMaroc[semaine - 1];
  const valide = state.lecturesLivres?.[LIVRE_ID]?.souverainsTermines.includes(semaine) ?? false;

  return (
    <section className="overflow-hidden rounded-lg border border-hairline bg-canvas">
      <div className="grid md:grid-cols-[150px_minmax(0,1fr)_auto]">
        <div className="flex min-h-32 flex-col justify-between bg-[#17482f] p-5 text-[#f5e8c8]">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em]">Histoire du Maroc</span>
          <div><p className="font-serif text-3xl tabular-nums">{semaine}</p><p className="font-sans text-xs opacity-75">sur {souverainsMaroc.length} semaines</p></div>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2"><span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-brand">Souverain de la semaine</span>{valide && <span className="rounded-full bg-accent-olive/15 px-2 py-0.5 font-sans text-[10px] font-semibold text-accent-olive">Retenu ✓</span>}</div>
          <h2 className="mt-1 font-serif text-2xl text-ink">{souverain.nom}</h2>
          <p className="mt-0.5 font-sans text-xs text-text-muted">{souverain.dynastie} · {souverain.regne} · {datesSemaineSouverain(semaine)}</p>
          <p className="mt-3 max-w-3xl font-sans text-sm leading-6 text-text-secondary">{souverain.recit}</p>
        </div>
        <div className="flex items-center p-5 pt-0 md:pt-5">
          <Link href="/objectifs/goal/histoire-maroc" className="whitespace-nowrap rounded-md border border-brand px-4 py-2 font-sans text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-canvas">Découvrir et noter →</Link>
        </div>
      </div>
    </section>
  );
}
