"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useObjectifsState } from "@/lib/objectifs-store";
import { dateLocale, nouvelId, type CaptureAtelier, type NoteJourAtelier } from "@/lib/atelier";
import { SouverainSemaine } from "@/components/SouverainSemaine";

const inputClass = "w-full rounded-md border border-hairline bg-canvas px-3 py-2 font-sans text-sm text-ink outline-none focus:border-brand";
const buttonClass = "rounded-md bg-brand px-4 py-2 font-sans text-sm font-semibold text-canvas hover:bg-brand-hover";

export default function AujourdhuiPage() {
  const { state, ajouterAtelier, modifierAtelier } = useObjectifsState();
  const atelier = state.atelier;
  const aujourdHui = dateLocale();
  const [capture, setCapture] = useState("");
  const [typeCapture, setTypeCapture] = useState<CaptureAtelier["type"]>("note");

  const noteJour = atelier.notesJour.find((item) => item.date === aujourdHui);
  const noteVide: NoteJourAtelier = {
    id: nouvelId("jour"),
    date: aujourdHui,
    priorites: ["", "", ""],
    matin: "",
    soir: "",
    gratitude: "",
    creeLe: new Date().toISOString(),
  };
  const note = noteJour ?? noteVide;

  function mettreAJourNote(patch: Record<string, unknown>) {
    if (noteJour) modifierAtelier("notesJour", noteJour.id, patch);
    else ajouterAtelier("notesJour", { ...noteVide, ...patch });
  }

  function envoyerCapture() {
    if (!capture.trim()) return;
    const texte = capture.trim();
    ajouterAtelier("captures", {
      id: nouvelId("capture"),
      texte,
      type: typeCapture,
      traitee: false,
      creeLe: new Date().toISOString(),
    });
    if (typeCapture === "tache") {
      ajouterAtelier("taches", {
        id: nouvelId("tache"),
        titre: texte,
        notes: "Créée depuis la capture rapide",
        projet: "Boîte de réception",
        echeance: aujourdHui,
        heure: "",
        priorite: "normale",
        repetition: "aucune",
        terminee: false,
        creeLe: new Date().toISOString(),
      });
    }
    if (typeCapture === "depense") {
      const montant = Number(texte.match(/-?\d+(?:[.,]\d+)?/)?.[0]?.replace(",", ".") ?? 0);
      ajouterAtelier("transactions", {
        id: nouvelId("transaction"),
        date: aujourdHui,
        libelle: texte,
        montant: Math.abs(montant),
        type: "depense",
        categorie: "Capture rapide",
        note: "",
        creeLe: new Date().toISOString(),
      });
    }
    setCapture("");
  }

  const widgets = useMemo(
    () => [...atelier.widgets].filter((widget) => widget.visible).sort((a, b) => a.ordre - b.ordre),
    [atelier.widgets]
  );

  const taches = atelier.taches
    .filter((item) => !item.terminee && (!item.echeance || item.echeance <= aujourdHui))
    .sort((a, b) => Number(b.priorite === "haute") - Number(a.priorite === "haute"));
  const evenements = atelier.evenements
    .filter((item) => item.date === aujourdHui || item.repetition === "quotidienne")
    .sort((a, b) => a.debut.localeCompare(b.debut));
  const revenus = atelier.transactions.filter((item) => item.type === "revenu").reduce((s, item) => s + item.montant, 0);
  const depenses = atelier.transactions.filter((item) => item.type === "depense").reduce((s, item) => s + item.montant, 0);
  const sante = atelier.sante.find((item) => item.date === aujourdHui);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-hairline bg-canvas p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-brand">Centre de commande</p>
            <h1 className="mt-1 font-serif text-3xl text-ink">Aujourd’hui</h1>
            <p className="mt-1 font-sans text-sm text-text-muted">Décidez, capturez et terminez depuis un seul écran.</p>
          </div>
          <Link href="/objectifs/atelier" className="rounded-md border border-hairline px-3 py-2 font-sans text-sm text-text-muted hover:text-ink hover:border-text-secondary">Configurer dans l’Atelier</Link>
        </div>
        <div className="mt-5 flex gap-2 flex-wrap">
          <select className={`${inputClass} w-auto`} value={typeCapture} onChange={(e) => setTypeCapture(e.target.value as CaptureAtelier["type"])}>
            <option value="note">Note</option><option value="tache">Tâche</option><option value="idee">Idée</option><option value="depense">Dépense</option><option value="lien">Lien</option>
          </select>
          <input className={`${inputClass} min-w-[240px] flex-1`} value={capture} onChange={(e) => setCapture(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") envoyerCapture(); }} placeholder="Capture rapide : idée, tâche, dépense, lien…" />
          <button type="button" onClick={envoyerCapture} className={buttonClass}>Capturer</button>
        </div>
      </div>

      <SouverainSemaine />

      <div className="grid gap-4 xl:grid-cols-2 items-start">
        {widgets.map((widget) => {
          if (widget.type === "priorites") return (
            <Bloc key={widget.id} titre={widget.titre} lien="/objectifs/atelier">
              <div className="flex flex-col gap-2">{[0, 1, 2].map((index) => <div key={index} className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft font-sans text-xs font-semibold text-brand">{index + 1}</span><input className={inputClass} value={note.priorites[index] ?? ""} onChange={(e) => { const priorites = [...note.priorites]; priorites[index] = e.target.value; mettreAJourNote({ priorites }); }} placeholder={`Priorité ${index + 1}`} /></div>)}</div>
            </Bloc>
          );
          if (widget.type === "agenda") return (
            <Bloc key={widget.id} titre={widget.titre} lien="/objectifs/atelier">
              {evenements.length === 0 ? <Vide texte="Aucun événement personnel aujourd’hui. Le programme académique reste visible dans Programme." /> : <div className="divide-y divide-hairline">{evenements.map((item) => <div key={item.id} className="flex gap-3 py-2 first:pt-0 last:pb-0"><span className="font-mono text-xs text-brand tabular-nums">{item.debut}</span><div><p className="font-sans text-sm font-medium text-ink">{item.titre}</p><p className="font-sans text-xs text-text-muted">{item.fin}{item.lieu ? ` · ${item.lieu}` : ""}</p></div></div>)}</div>}
              <Link href="/objectifs/programme" className="mt-3 inline-block font-sans text-xs text-brand hover:underline">Voir le programme académique →</Link>
            </Bloc>
          );
          if (widget.type === "taches") return (
            <Bloc key={widget.id} titre={`${widget.titre} · ${taches.length}`} lien="/objectifs/atelier">
              {taches.length === 0 ? <Vide texte="Tout est à jour." /> : <div className="flex flex-col gap-2">{taches.slice(0, 8).map((item) => <label key={item.id} className="flex items-start gap-3 rounded-md border border-hairline p-3 cursor-pointer"><input type="checkbox" className="mt-0.5 accent-brand" checked={item.terminee} onChange={() => modifierAtelier("taches", item.id, { terminee: true, termineeLe: new Date().toISOString() })} /><span className="min-w-0"><span className="block font-sans text-sm text-ink">{item.titre}</span><span className="font-sans text-xs text-text-muted">{item.projet || "Sans projet"}{item.heure ? ` · ${item.heure}` : ""}</span></span>{item.priorite === "haute" && <span className="ml-auto rounded bg-accent-coral px-1.5 py-0.5 font-sans text-[10px] text-accent-deep">Haute</span>}</label>)}</div>}
            </Bloc>
          );
          if (widget.type === "habitudes") return (
            <Bloc key={widget.id} titre={widget.titre} lien="/objectifs/atelier">
              {atelier.habitudes.length === 0 ? <Vide texte="Créez vos habitudes dans l’Atelier." /> : <div className="grid gap-2 sm:grid-cols-2">{atelier.habitudes.map((item) => { const faite = item.jours.includes(aujourdHui); return <button key={item.id} type="button" onClick={() => modifierAtelier("habitudes", item.id, { jours: faite ? item.jours.filter((jour) => jour !== aujourdHui) : [...item.jours, aujourdHui] })} className={`flex items-center gap-3 rounded-md border p-3 text-left transition-colors ${faite ? "border-brand bg-brand-soft" : "border-hairline"}`}><span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.couleur }} /><span className="font-sans text-sm text-ink">{item.nom}</span><span className="ml-auto font-sans text-xs text-text-muted">{faite ? "Fait" : `${item.objectifHebdo}×/sem.`}</span></button>; })}</div>}
            </Bloc>
          );
          if (widget.type === "captures") return (
            <Bloc key={widget.id} titre={`${widget.titre} · ${atelier.captures.filter((item) => !item.traitee).length}`} lien="/objectifs/atelier">
              {atelier.captures.filter((item) => !item.traitee).length === 0 ? <Vide texte="Boîte vide." /> : <div className="flex flex-col gap-2">{atelier.captures.filter((item) => !item.traitee).slice(0, 6).map((item) => <div key={item.id} className="flex items-center gap-2 rounded-md border border-hairline px-3 py-2"><span className="rounded bg-surface-secondary px-1.5 py-0.5 font-sans text-[10px] text-text-muted">{item.type}</span><span className="min-w-0 flex-1 truncate font-sans text-sm text-ink">{item.texte}</span><button type="button" onClick={() => modifierAtelier("captures", item.id, { traitee: true })} className="font-sans text-xs text-brand">Traiter</button></div>)}</div>}
            </Bloc>
          );
          if (widget.type === "finances") return (
            <Bloc key={widget.id} titre={widget.titre} lien="/objectifs/finances"><div className="grid grid-cols-3 gap-2"><Stat label="Revenus" valeur={`${revenus.toFixed(2)} MAD`} /><Stat label="Dépenses" valeur={`${depenses.toFixed(2)} MAD`} /><Stat label="Solde" valeur={`${(revenus - depenses).toFixed(2)} MAD`} /></div></Bloc>
          );
          if (widget.type === "sante") return (
            <Bloc key={widget.id} titre={widget.titre} lien="/objectifs/sante">{sante ? <div className="grid grid-cols-4 gap-2"><Stat label="Sommeil" valeur={`${sante.sommeil} h`} /><Stat label="Énergie" valeur={`${sante.energie}/5`} /><Stat label="Humeur" valeur={`${sante.humeur}/5`} /><Stat label="Sport" valeur={`${sante.sportMinutes} min`} /></div> : <Vide texte="Aucun bilan santé aujourd’hui." />}</Bloc>
          );
          return (
            <Bloc key={widget.id} titre={widget.titre} lien="/objectifs/atelier">{atelier.objectifs.length === 0 ? <Vide texte="Ajoutez un objectif personnel dans l’Atelier." /> : <div className="flex flex-col gap-3">{atelier.objectifs.slice(0, 5).map((item) => { const pct = item.cible > 0 ? Math.min(100, Math.round((item.valeur / item.cible) * 100)) : 0; return <div key={item.id}><div className="mb-1 flex justify-between gap-2"><span className="font-sans text-sm text-ink">{item.titre}</span><span className="font-sans text-xs text-text-muted">{pct}%</span></div><div className="h-1.5 rounded-full bg-surface-warm overflow-hidden"><div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></div></div>; })}</div>}</Bloc>
          );
        })}
      </div>

      <div className="rounded-lg border border-hairline bg-canvas p-5">
        <h2 className="font-sans text-base font-semibold text-ink">Bilan du jour</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3"><label><span className="mb-1.5 block font-sans text-xs text-text-muted">Intention du matin</span><textarea className={`${inputClass} min-h-24`} value={note.matin} onChange={(e) => mettreAJourNote({ matin: e.target.value })} /></label><label><span className="mb-1.5 block font-sans text-xs text-text-muted">Bilan du soir</span><textarea className={`${inputClass} min-h-24`} value={note.soir} onChange={(e) => mettreAJourNote({ soir: e.target.value })} /></label><label><span className="mb-1.5 block font-sans text-xs text-text-muted">Gratitude</span><textarea className={`${inputClass} min-h-24`} value={note.gratitude} onChange={(e) => mettreAJourNote({ gratitude: e.target.value })} /></label></div>
      </div>
    </div>
  );
}

function Bloc({ titre, lien, children }: { titre: string; lien: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-hairline bg-canvas p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-sans text-base font-semibold text-ink">{titre}</h2><Link href={lien} className="font-sans text-xs text-brand hover:underline">Ouvrir</Link></div>{children}</section>;
}

function Vide({ texte }: { texte: string }) { return <p className="font-sans text-sm text-text-muted">{texte}</p>; }

function Stat({ label, valeur }: { label: string; valeur: string }) { return <div className="rounded-md bg-surface-secondary p-3"><p className="font-sans text-xs text-text-muted">{label}</p><p className="mt-1 font-sans text-sm font-semibold text-ink tabular-nums">{valeur}</p></div>; }
