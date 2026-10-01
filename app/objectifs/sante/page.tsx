"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useObjectifsState } from "@/lib/objectifs-store";
import { dateLocale, nouvelId } from "@/lib/atelier";

const inputClass = "w-full rounded-md border border-hairline bg-canvas px-3 py-2 font-sans text-sm text-ink outline-none focus:border-brand";

export default function SantePage() {
  const { state, ajouterAtelier, modifierAtelier } = useObjectifsState();
  const [date, setDate] = useState(dateLocale());
  const existant = state.atelier.sante.find((item) => item.date === date);
  const [brouillon, setBrouillon] = useState({ sommeil: 7, energie: 3, humeur: 3, sportMinutes: 0, eau: 1.5, note: "" });

  function enregistrer(e: FormEvent) {
    e.preventDefault();
    if (existant) modifierAtelier("sante", existant.id, { ...brouillon, date });
    else ajouterAtelier("sante", { id: nouvelId("sante"), date, ...brouillon, creeLe: new Date().toISOString() });
  }

  const moyennes = useMemo(() => {
    const liste = state.atelier.sante.slice(0, 30);
    const moyenne = (cle: "sommeil" | "energie" | "humeur" | "sportMinutes") => liste.length ? liste.reduce((s, item) => s + item[cle], 0) / liste.length : 0;
    return { sommeil: moyenne("sommeil"), energie: moyenne("energie"), humeur: moyenne("humeur"), sport: moyenne("sportMinutes") };
  }, [state.atelier.sante]);

  return <div className="flex flex-col gap-4"><div className="rounded-lg border border-hairline bg-canvas p-5"><p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-brand">Énergie quotidienne</p><h1 className="mt-1 font-serif text-3xl text-ink">Santé</h1><p className="mt-1 font-sans text-sm text-text-muted">Un suivi léger pour ajuster la charge de travail à votre état réel.</p><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Sommeil moyen" value={`${moyennes.sommeil.toFixed(1)} h`} /><Stat label="Énergie" value={`${moyennes.energie.toFixed(1)}/5`} /><Stat label="Humeur" value={`${moyennes.humeur.toFixed(1)}/5`} /><Stat label="Sport moyen" value={`${moyennes.sport.toFixed(0)} min`} /></div></div><div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)] items-start"><form onSubmit={enregistrer} className="rounded-lg border border-hairline bg-canvas p-5"><h2 className="font-sans text-base font-semibold text-ink">Bilan du jour</h2><div className="mt-4 flex flex-col gap-3"><Champ label="Date"><input type="date" className={inputClass} value={date} onChange={(e) => { setDate(e.target.value); const trouve = state.atelier.sante.find((item) => item.date === e.target.value); if (trouve) setBrouillon({ sommeil: trouve.sommeil, energie: trouve.energie, humeur: trouve.humeur, sportMinutes: trouve.sportMinutes, eau: trouve.eau, note: trouve.note }); }} /></Champ><div className="grid grid-cols-2 gap-3"><Champ label="Sommeil (heures)"><input type="number" step="0.25" min="0" max="24" className={inputClass} value={brouillon.sommeil} onChange={(e) => setBrouillon({ ...brouillon, sommeil: Number(e.target.value) })} /></Champ><Champ label="Sport (minutes)"><input type="number" min="0" className={inputClass} value={brouillon.sportMinutes} onChange={(e) => setBrouillon({ ...brouillon, sportMinutes: Number(e.target.value) })} /></Champ><Champ label="Énergie /5"><input type="range" min="1" max="5" value={brouillon.energie} onChange={(e) => setBrouillon({ ...brouillon, energie: Number(e.target.value) })} className="w-full accent-brand" /></Champ><Champ label="Humeur /5"><input type="range" min="1" max="5" value={brouillon.humeur} onChange={(e) => setBrouillon({ ...brouillon, humeur: Number(e.target.value) })} className="w-full accent-brand" /></Champ></div><Champ label="Eau (litres)"><input type="number" step="0.25" min="0" className={inputClass} value={brouillon.eau} onChange={(e) => setBrouillon({ ...brouillon, eau: Number(e.target.value) })} /></Champ><Champ label="Note"><textarea className={`${inputClass} min-h-24`} value={brouillon.note} onChange={(e) => setBrouillon({ ...brouillon, note: e.target.value })} /></Champ><button className="rounded-md bg-brand px-4 py-2 font-sans text-sm font-semibold text-canvas">{existant ? "Mettre à jour" : "Enregistrer"}</button></div></form><div className="rounded-lg border border-hairline bg-canvas"><div className="border-b border-hairline px-5 py-4"><h2 className="font-sans text-base font-semibold text-ink">Historique</h2></div><div className="divide-y divide-hairline">{state.atelier.sante.length === 0 && <p className="p-5 font-sans text-sm text-text-muted">Le premier bilan créera votre tendance.</p>}{[...state.atelier.sante].sort((a, b) => b.date.localeCompare(a.date)).map((item) => <div key={item.id} className="grid grid-cols-[1fr_repeat(4,auto)] gap-4 px-5 py-3 items-center"><span className="font-sans text-sm text-ink">{item.date}</span><span className="font-sans text-xs text-text-muted">{item.sommeil} h</span><span className="font-sans text-xs text-text-muted">⚡ {item.energie}/5</span><span className="font-sans text-xs text-text-muted">☺ {item.humeur}/5</span><span className="font-sans text-xs text-text-muted">{item.sportMinutes} min</span></div>)}</div></div></div></div>;
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-hairline p-3"><p className="font-sans text-xs text-text-muted">{label}</p><p className="mt-1 font-sans text-lg font-semibold text-ink tabular-nums">{value}</p></div>; }
function Champ({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="mb-1.5 block font-sans text-xs text-text-muted">{label}</span>{children}</label>; }
