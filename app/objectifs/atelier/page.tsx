"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useObjectifsState } from "@/lib/objectifs-store";
import {
  dateLocale,
  nouvelId,
  type AutomatisationAtelier,
  type CollectionAtelier,
  type ElementAtelier,
  type EvenementAtelier,
  type HabitudeAtelier,
  type IndicateurAtelier,
  type ObjectifAtelier,
  type SemestreAtelier,
  type TacheAtelier,
} from "@/lib/atelier";

type Onglet =
  | "taches"
  | "habitudes"
  | "agenda"
  | "objectifs"
  | "indicateurs"
  | "etudes"
  | "automatisations"
  | "widgets"
  | "corbeille";

const onglets: { id: Onglet; label: string }[] = [
  { id: "taches", label: "Tâches" },
  { id: "habitudes", label: "Habitudes" },
  { id: "agenda", label: "Agenda" },
  { id: "objectifs", label: "Objectifs" },
  { id: "indicateurs", label: "Indicateurs" },
  { id: "etudes", label: "Études" },
  { id: "automatisations", label: "Automatisations" },
  { id: "widgets", label: "Tableau de bord" },
  { id: "corbeille", label: "Corbeille" },
];

const inputClass =
  "w-full rounded-md border border-hairline bg-canvas px-3 py-2 font-sans text-sm text-ink outline-none focus:border-brand";
const primaryClass =
  "rounded-md bg-brand px-4 py-2 font-sans text-sm font-semibold text-canvas hover:bg-brand-hover transition-colors";
const subtleClass =
  "rounded-md border border-hairline px-3 py-1.5 font-sans text-xs text-text-muted hover:text-ink hover:border-text-secondary transition-colors";

function Champ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-sans text-xs text-text-muted">{label}</span>
      {children}
    </label>
  );
}

function EnteteSection({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-sans text-base font-semibold text-ink">{titre}</h2>
      <p className="mt-1 font-sans text-sm text-text-muted">{texte}</p>
    </div>
  );
}

function Carte({
  titre,
  detail,
  onArchiver,
  children,
}: {
  titre: string;
  detail?: string;
  onArchiver?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-hairline bg-canvas p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-sans text-sm font-semibold text-ink">{titre}</p>
          {detail && <p className="mt-0.5 font-sans text-xs text-text-muted">{detail}</p>}
        </div>
        {onArchiver && (
          <button type="button" onClick={onArchiver} className={subtleClass}>
            Corbeille
          </button>
        )}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function AtelierPage() {
  const {
    state,
    ajouterAtelier,
    modifierAtelier,
    archiverAtelier,
    restaurerAtelier,
    setWidgets,
  } = useObjectifsState();
  const [onglet, setOnglet] = useState<Onglet>("taches");
  const atelier = state.atelier;

  const [tache, setTache] = useState({
    titre: "",
    projet: "",
    echeance: dateLocale(),
    heure: "",
    priorite: "normale" as TacheAtelier["priorite"],
    repetition: "aucune" as TacheAtelier["repetition"],
  });
  const [habitude, setHabitude] = useState({ nom: "", objectifHebdo: 3, heureRappel: "", couleur: "#b9782f" });
  const [evenement, setEvenement] = useState({ titre: "", date: dateLocale(), debut: "09:00", fin: "10:00", lieu: "", repetition: "aucune" as EvenementAtelier["repetition"] });
  const [objectif, setObjectif] = useState({ titre: "", type: "nombre" as ObjectifAtelier["type"], cible: 1, unite: "", echeance: "", couleur: "#b9782f" });
  const [indicateur, setIndicateur] = useState({ nom: "", type: "nombre" as IndicateurAtelier["type"], cible: 1, unite: "", couleur: "#64748b" });
  const [semestre, setSemestre] = useState("");
  const [automatisation, setAutomatisation] = useState({ nom: "", declencheur: "quotidien" as AutomatisationAtelier["declencheur"], heure: "08:00", jourSemaine: 1, action: "notification" as AutomatisationAtelier["action"], message: "" });

  function ajouter(collection: CollectionAtelier, element: ElementAtelier) {
    ajouterAtelier(collection, element);
  }

  function ajouterTache(e: FormEvent) {
    e.preventDefault();
    if (!tache.titre.trim()) return;
    ajouter("taches", {
      id: nouvelId("tache"),
      titre: tache.titre.trim(),
      notes: "",
      projet: tache.projet.trim(),
      echeance: tache.echeance,
      heure: tache.heure,
      priorite: tache.priorite,
      repetition: tache.repetition,
      terminee: false,
      creeLe: new Date().toISOString(),
    });
    setTache((actuel) => ({ ...actuel, titre: "", projet: "" }));
  }

  function ajouterHabitude(e: FormEvent) {
    e.preventDefault();
    if (!habitude.nom.trim()) return;
    const value: HabitudeAtelier = {
      id: nouvelId("habitude"),
      nom: habitude.nom.trim(),
      objectifHebdo: Math.max(1, habitude.objectifHebdo),
      couleur: habitude.couleur,
      heureRappel: habitude.heureRappel,
      jours: [],
      creeLe: new Date().toISOString(),
    };
    ajouter("habitudes", value);
    setHabitude((actuel) => ({ ...actuel, nom: "" }));
  }

  function ajouterEvenement(e: FormEvent) {
    e.preventDefault();
    if (!evenement.titre.trim()) return;
    ajouter("evenements", {
      id: nouvelId("evenement"),
      titre: evenement.titre.trim(),
      date: evenement.date,
      debut: evenement.debut,
      fin: evenement.fin,
      lieu: evenement.lieu.trim(),
      notes: "",
      repetition: evenement.repetition,
      rappelMinutes: 15,
      creeLe: new Date().toISOString(),
    });
    setEvenement((actuel) => ({ ...actuel, titre: "", lieu: "" }));
  }

  function ajouterObjectif(e: FormEvent) {
    e.preventDefault();
    if (!objectif.titre.trim()) return;
    ajouter("objectifs", {
      id: nouvelId("objectif"),
      titre: objectif.titre.trim(),
      description: "",
      type: objectif.type,
      valeur: 0,
      cible: Math.max(1, objectif.cible),
      unite: objectif.unite.trim(),
      echeance: objectif.echeance,
      couleur: objectif.couleur,
      etapes: [],
      creeLe: new Date().toISOString(),
    });
    setObjectif((actuel) => ({ ...actuel, titre: "" }));
  }

  function ajouterIndicateur(e: FormEvent) {
    e.preventDefault();
    if (!indicateur.nom.trim()) return;
    ajouter("indicateurs", {
      id: nouvelId("indicateur"),
      nom: indicateur.nom.trim(),
      type: indicateur.type,
      unite: indicateur.unite.trim(),
      cible: indicateur.cible,
      couleur: indicateur.couleur,
      entrees: [],
      creeLe: new Date().toISOString(),
    });
    setIndicateur((actuel) => ({ ...actuel, nom: "" }));
  }

  function ajouterSemestre(e: FormEvent) {
    e.preventDefault();
    if (!semestre.trim()) return;
    ajouter("semestres", {
      id: nouvelId("semestre"),
      nom: semestre.trim(),
      modules: [],
      creeLe: new Date().toISOString(),
    });
    setSemestre("");
  }

  function ajouterAutomatisation(e: FormEvent) {
    e.preventDefault();
    if (!automatisation.nom.trim() || !automatisation.message.trim()) return;
    ajouter("automatisations", {
      id: nouvelId("automatisation"),
      nom: automatisation.nom.trim(),
      declencheur: automatisation.declencheur,
      heure: automatisation.heure,
      jourSemaine: automatisation.jourSemaine,
      action: automatisation.action,
      message: automatisation.message.trim(),
      active: true,
      creeLe: new Date().toISOString(),
    });
    setAutomatisation((actuel) => ({ ...actuel, nom: "", message: "" }));
  }

  function deplacerWidget(id: string, direction: -1 | 1) {
    const tries = [...atelier.widgets].sort((a, b) => a.ordre - b.ordre);
    const index = tries.findIndex((widget) => widget.id === id);
    const cible = index + direction;
    if (index < 0 || cible < 0 || cible >= tries.length) return;
    [tries[index], tries[cible]] = [tries[cible], tries[index]];
    setWidgets(tries.map((widget, ordre) => ({ ...widget, ordre })));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-hairline bg-canvas p-5">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-brand">Configuration sans code</p>
        <div className="mt-1 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl text-ink">Atelier</h1>
            <p className="mt-1 max-w-2xl font-sans text-sm text-text-muted">
              Ajoutez et organisez votre quotidien ici. Les fonctions historiques de think.anas restent intactes.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/objectifs/finances" className={subtleClass}>Finances</Link>
            <Link href="/objectifs/sante" className={subtleClass}>Santé</Link>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-hairline bg-canvas p-2 overflow-x-auto no-scrollbar">
        <div className="flex gap-1 min-w-max">
          {onglets.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOnglet(item.id)}
              className={`rounded-md px-3 py-2 font-sans text-sm transition-colors ${onglet === item.id ? "bg-brand text-canvas" : "text-text-muted hover:bg-surface-secondary hover:text-ink"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {onglet === "taches" && (
        <SectionDeuxColonnes
          formulaire={
            <form onSubmit={ajouterTache}>
              <EnteteSection titre="Nouvelle tâche" texte="Une action libre, datée, priorisée et éventuellement répétée." />
              <div className="flex flex-col gap-3">
                <Champ label="Titre"><input className={inputClass} value={tache.titre} onChange={(e) => setTache({ ...tache, titre: e.target.value })} /></Champ>
                <Champ label="Projet"><input className={inputClass} value={tache.projet} onChange={(e) => setTache({ ...tache, projet: e.target.value })} placeholder="Études, contenu, personnel…" /></Champ>
                <div className="grid grid-cols-2 gap-3">
                  <Champ label="Échéance"><input type="date" className={inputClass} value={tache.echeance} onChange={(e) => setTache({ ...tache, echeance: e.target.value })} /></Champ>
                  <Champ label="Heure"><input type="time" className={inputClass} value={tache.heure} onChange={(e) => setTache({ ...tache, heure: e.target.value })} /></Champ>
                  <Champ label="Priorité"><select className={inputClass} value={tache.priorite} onChange={(e) => setTache({ ...tache, priorite: e.target.value as TacheAtelier["priorite"] })}><option value="basse">Basse</option><option value="normale">Normale</option><option value="haute">Haute</option></select></Champ>
                  <Champ label="Répétition"><select className={inputClass} value={tache.repetition} onChange={(e) => setTache({ ...tache, repetition: e.target.value as TacheAtelier["repetition"] })}><option value="aucune">Aucune</option><option value="quotidienne">Chaque jour</option><option value="hebdomadaire">Chaque semaine</option><option value="mensuelle">Chaque mois</option></select></Champ>
                </div>
                <button className={primaryClass}>Ajouter la tâche</button>
              </div>
            </form>
          }
        >
          {atelier.taches.map((item) => (
            <Carte key={item.id} titre={item.titre} detail={`${item.projet || "Sans projet"} · ${item.echeance || "Sans date"}${item.heure ? ` à ${item.heure}` : ""}`} onArchiver={() => archiverAtelier("taches", item.id)}>
              <label className="flex items-center gap-2 font-sans text-xs text-text-muted"><input type="checkbox" checked={item.terminee} onChange={() => modifierAtelier("taches", item.id, { terminee: !item.terminee, termineeLe: !item.terminee ? new Date().toISOString() : undefined })} className="accent-brand" /> Terminée · priorité {item.priorite}</label>
            </Carte>
          ))}
        </SectionDeuxColonnes>
      )}

      {onglet === "habitudes" && (
        <SectionDeuxColonnes formulaire={<form onSubmit={ajouterHabitude}><EnteteSection titre="Nouvelle habitude" texte="Suivez une répétition sans la transformer en objectif rigide." /><div className="flex flex-col gap-3"><Champ label="Nom"><input className={inputClass} value={habitude.nom} onChange={(e) => setHabitude({ ...habitude, nom: e.target.value })} /></Champ><div className="grid grid-cols-2 gap-3"><Champ label="Fois par semaine"><input type="number" min="1" max="7" className={inputClass} value={habitude.objectifHebdo} onChange={(e) => setHabitude({ ...habitude, objectifHebdo: Number(e.target.value) })} /></Champ><Champ label="Rappel"><input type="time" className={inputClass} value={habitude.heureRappel} onChange={(e) => setHabitude({ ...habitude, heureRappel: e.target.value })} /></Champ></div><Champ label="Couleur"><input type="color" className="h-10 w-full rounded-md border border-hairline bg-canvas p-1" value={habitude.couleur} onChange={(e) => setHabitude({ ...habitude, couleur: e.target.value })} /></Champ><button className={primaryClass}>Ajouter l’habitude</button></div></form>}>
          {atelier.habitudes.map((item) => <Carte key={item.id} titre={item.nom} detail={`${item.objectifHebdo} fois/semaine${item.heureRappel ? ` · rappel ${item.heureRappel}` : ""}`} onArchiver={() => archiverAtelier("habitudes", item.id)}><div className="h-1.5 rounded-full" style={{ backgroundColor: item.couleur }} /></Carte>)}
        </SectionDeuxColonnes>
      )}

      {onglet === "agenda" && (
        <SectionDeuxColonnes formulaire={<form onSubmit={ajouterEvenement}><EnteteSection titre="Nouvel événement" texte="Ajoutez rendez-vous, sport, travail ou temps personnel." /><div className="flex flex-col gap-3"><Champ label="Titre"><input className={inputClass} value={evenement.titre} onChange={(e) => setEvenement({ ...evenement, titre: e.target.value })} /></Champ><Champ label="Date"><input type="date" className={inputClass} value={evenement.date} onChange={(e) => setEvenement({ ...evenement, date: e.target.value })} /></Champ><div className="grid grid-cols-2 gap-3"><Champ label="Début"><input type="time" className={inputClass} value={evenement.debut} onChange={(e) => setEvenement({ ...evenement, debut: e.target.value })} /></Champ><Champ label="Fin"><input type="time" className={inputClass} value={evenement.fin} onChange={(e) => setEvenement({ ...evenement, fin: e.target.value })} /></Champ></div><Champ label="Lieu"><input className={inputClass} value={evenement.lieu} onChange={(e) => setEvenement({ ...evenement, lieu: e.target.value })} /></Champ><Champ label="Répétition"><select className={inputClass} value={evenement.repetition} onChange={(e) => setEvenement({ ...evenement, repetition: e.target.value as EvenementAtelier["repetition"] })}><option value="aucune">Aucune</option><option value="quotidienne">Quotidienne</option><option value="hebdomadaire">Hebdomadaire</option><option value="mensuelle">Mensuelle</option></select></Champ><button className={primaryClass}>Ajouter l’événement</button></div></form>}>
          {[...atelier.evenements].sort((a, b) => `${a.date}${a.debut}`.localeCompare(`${b.date}${b.debut}`)).map((item) => <Carte key={item.id} titre={item.titre} detail={`${item.date} · ${item.debut}–${item.fin}${item.lieu ? ` · ${item.lieu}` : ""}`} onArchiver={() => archiverAtelier("evenements", item.id)} />)}
        </SectionDeuxColonnes>
      )}

      {onglet === "objectifs" && (
        <SectionDeuxColonnes formulaire={<form onSubmit={ajouterObjectif}><EnteteSection titre="Nouvel objectif" texte="Créez un objectif chiffré, une liste d’étapes ou une date cible." /><div className="flex flex-col gap-3"><Champ label="Titre"><input className={inputClass} value={objectif.titre} onChange={(e) => setObjectif({ ...objectif, titre: e.target.value })} /></Champ><div className="grid grid-cols-2 gap-3"><Champ label="Type"><select className={inputClass} value={objectif.type} onChange={(e) => setObjectif({ ...objectif, type: e.target.value as ObjectifAtelier["type"] })}><option value="nombre">Valeur</option><option value="liste">Étapes</option><option value="date">Date</option></select></Champ><Champ label="Cible"><input type="number" className={inputClass} value={objectif.cible} onChange={(e) => setObjectif({ ...objectif, cible: Number(e.target.value) })} /></Champ></div><div className="grid grid-cols-2 gap-3"><Champ label="Unité"><input className={inputClass} value={objectif.unite} onChange={(e) => setObjectif({ ...objectif, unite: e.target.value })} /></Champ><Champ label="Échéance"><input type="date" className={inputClass} value={objectif.echeance} onChange={(e) => setObjectif({ ...objectif, echeance: e.target.value })} /></Champ></div><button className={primaryClass}>Créer l’objectif</button></div></form>}>
          {atelier.objectifs.map((item) => { const pct = item.cible > 0 ? Math.min(100, Math.round((item.valeur / item.cible) * 100)) : 0; return <Carte key={item.id} titre={item.titre} detail={`${item.valeur} / ${item.cible} ${item.unite} · ${pct}%`} onArchiver={() => archiverAtelier("objectifs", item.id)}><div className="flex items-center gap-2"><input type="number" className={`${inputClass} max-w-28`} value={item.valeur} onChange={(e) => modifierAtelier("objectifs", item.id, { valeur: Number(e.target.value) })} /><div className="h-2 flex-1 rounded-full bg-surface-warm overflow-hidden"><div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></div></div></Carte>; })}
        </SectionDeuxColonnes>
      )}

      {onglet === "indicateurs" && (
        <SectionDeuxColonnes formulaire={<form onSubmit={ajouterIndicateur}><EnteteSection titre="Nouvel indicateur" texte="Mesurez ce qui compte : note, durée, argent, compteur ou case." /><div className="flex flex-col gap-3"><Champ label="Nom"><input className={inputClass} value={indicateur.nom} onChange={(e) => setIndicateur({ ...indicateur, nom: e.target.value })} /></Champ><div className="grid grid-cols-2 gap-3"><Champ label="Type"><select className={inputClass} value={indicateur.type} onChange={(e) => setIndicateur({ ...indicateur, type: e.target.value as IndicateurAtelier["type"] })}><option value="nombre">Nombre</option><option value="case">Case</option><option value="duree">Durée</option><option value="argent">Argent</option><option value="note">Note /20</option></select></Champ><Champ label="Cible"><input type="number" className={inputClass} value={indicateur.cible} onChange={(e) => setIndicateur({ ...indicateur, cible: Number(e.target.value) })} /></Champ></div><Champ label="Unité"><input className={inputClass} value={indicateur.unite} onChange={(e) => setIndicateur({ ...indicateur, unite: e.target.value })} /></Champ><button className={primaryClass}>Créer l’indicateur</button></div></form>}>
          {atelier.indicateurs.map((item) => <Carte key={item.id} titre={item.nom} detail={`${item.type} · cible ${item.cible} ${item.unite}`} onArchiver={() => archiverAtelier("indicateurs", item.id)}><button type="button" className={subtleClass} onClick={() => modifierAtelier("indicateurs", item.id, { entrees: [{ id: nouvelId("entree"), date: dateLocale(), valeur: 1, note: "" }, ...item.entrees] })}>+ Ajouter une mesure</button><span className="ml-2 font-sans text-xs text-text-muted">{item.entrees.length} mesure(s)</span></Carte>)}
        </SectionDeuxColonnes>
      )}

      {onglet === "etudes" && (
        <SectionDeuxColonnes formulaire={<form onSubmit={ajouterSemestre}><EnteteSection titre="Nouveau semestre" texte="Créez vos prochains semestres sans modifier le dossier S3 existant." /><div className="flex flex-col gap-3"><Champ label="Nom du semestre"><input className={inputClass} value={semestre} onChange={(e) => setSemestre(e.target.value)} placeholder="S4 — Génie des données de santé" /></Champ><button className={primaryClass}>Créer le semestre</button></div></form>}>
          {atelier.semestres.map((item) => <GestionSemestre key={item.id} semestre={item} modifier={(patch) => modifierAtelier("semestres", item.id, patch)} archiver={() => archiverAtelier("semestres", item.id)} />)}
        </SectionDeuxColonnes>
      )}

      {onglet === "automatisations" && (
        <SectionDeuxColonnes formulaire={<form onSubmit={ajouterAutomatisation}><EnteteSection titre="Nouvelle automatisation" texte="Déclenchez une notification ou une tâche récurrente." /><div className="flex flex-col gap-3"><Champ label="Nom"><input className={inputClass} value={automatisation.nom} onChange={(e) => setAutomatisation({ ...automatisation, nom: e.target.value })} /></Champ><div className="grid grid-cols-2 gap-3"><Champ label="Déclencheur"><select className={inputClass} value={automatisation.declencheur} onChange={(e) => setAutomatisation({ ...automatisation, declencheur: e.target.value as AutomatisationAtelier["declencheur"] })}><option value="quotidien">Chaque jour</option><option value="hebdomadaire">Chaque semaine</option><option value="echeance">À l’échéance</option></select></Champ><Champ label="Heure"><input type="time" className={inputClass} value={automatisation.heure} onChange={(e) => setAutomatisation({ ...automatisation, heure: e.target.value })} /></Champ></div><Champ label="Action"><select className={inputClass} value={automatisation.action} onChange={(e) => setAutomatisation({ ...automatisation, action: e.target.value as AutomatisationAtelier["action"] })}><option value="notification">Notification</option><option value="creer-tache">Créer une tâche</option></select></Champ><Champ label="Message"><textarea className={`${inputClass} min-h-24`} value={automatisation.message} onChange={(e) => setAutomatisation({ ...automatisation, message: e.target.value })} /></Champ><button className={primaryClass}>Créer l’automatisation</button></div></form>}>
          {atelier.automatisations.map((item) => <Carte key={item.id} titre={item.nom} detail={`${item.declencheur} à ${item.heure} · ${item.action}`} onArchiver={() => archiverAtelier("automatisations", item.id)}><label className="flex items-center gap-2 font-sans text-xs text-text-muted"><input type="checkbox" checked={item.active} onChange={() => modifierAtelier("automatisations", item.id, { active: !item.active })} className="accent-brand" /> Active</label></Carte>)}
        </SectionDeuxColonnes>
      )}

      {onglet === "widgets" && (
        <div className="rounded-lg border border-hairline bg-canvas p-5"><EnteteSection titre="Tableau Aujourd’hui" texte="Choisissez les blocs visibles et leur ordre. Les pages historiques restent disponibles dans le menu." /><div className="flex flex-col divide-y divide-hairline">{[...atelier.widgets].sort((a, b) => a.ordre - b.ordre).map((widget, index, liste) => <div key={widget.id} className="flex items-center gap-3 py-3"><input type="checkbox" checked={widget.visible} onChange={() => setWidgets(atelier.widgets.map((item) => item.id === widget.id ? { ...item, visible: !item.visible } : item))} className="accent-brand" /><input className={`${inputClass} flex-1`} value={widget.titre} onChange={(e) => setWidgets(atelier.widgets.map((item) => item.id === widget.id ? { ...item, titre: e.target.value } : item))} /><button type="button" disabled={index === 0} onClick={() => deplacerWidget(widget.id, -1)} className={subtleClass}>↑</button><button type="button" disabled={index === liste.length - 1} onClick={() => deplacerWidget(widget.id, 1)} className={subtleClass}>↓</button></div>)}</div></div>
      )}

      {onglet === "corbeille" && (
        <div className="rounded-lg border border-hairline bg-canvas p-5"><EnteteSection titre="Corbeille récupérable" texte="Tout élément retiré depuis l’Atelier peut être restauré. Les fonctions historiques ne passent jamais ici." /><div className="grid gap-3 md:grid-cols-2">{atelier.corbeille.length === 0 && <p className="font-sans text-sm text-text-muted">La corbeille est vide.</p>}{atelier.corbeille.map((item) => <Carte key={item.id} titre={(item.element as { titre?: string; nom?: string; texte?: string }).titre ?? (item.element as { nom?: string }).nom ?? (item.element as { texte?: string }).texte ?? "Élément"} detail={`${item.collection} · retiré le ${item.supprimeLe.slice(0, 10)}`}><button type="button" className={primaryClass} onClick={() => restaurerAtelier(item.id)}>Restaurer</button></Carte>)}</div></div>
      )}
    </div>
  );
}

function SectionDeuxColonnes({ formulaire, children }: { formulaire: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)] items-start">
      <div className="rounded-lg border border-hairline bg-canvas p-5 xl:sticky xl:top-28">{formulaire}</div>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

function GestionSemestre({ semestre, modifier, archiver }: { semestre: SemestreAtelier; modifier: (patch: Record<string, unknown>) => void; archiver: () => void }) {
  const [module, setModule] = useState("");
  const [coefficient, setCoefficient] = useState(1);

  function ajouterModule(e: FormEvent) {
    e.preventDefault();
    if (!module.trim()) return;
    modifier({
      modules: [
        ...semestre.modules,
        {
          id: nouvelId("module"),
          nom: module.trim(),
          coefficient,
          evaluations: [
            { id: nouvelId("evaluation"), nom: "CC", poids: 20, note: null },
            { id: nouvelId("evaluation"), nom: "TP", poids: 20, note: null },
            { id: nouvelId("evaluation"), nom: "Examen final", poids: 60, note: null },
          ],
        },
      ],
    });
    setModule("");
  }

  return (
    <Carte titre={semestre.nom} detail={`${semestre.modules.length} module(s)`} onArchiver={archiver}>
      <form onSubmit={ajouterModule} className="flex gap-2">
        <input className={`${inputClass} flex-1`} value={module} onChange={(e) => setModule(e.target.value)} placeholder="Nom du module" />
        <input type="number" min="1" className={`${inputClass} w-20`} value={coefficient} onChange={(e) => setCoefficient(Number(e.target.value))} aria-label="Coefficient" />
        <button className={subtleClass}>Ajouter</button>
      </form>
      <div className="mt-3 flex flex-col gap-2">
        {semestre.modules.map((item) => {
          const notes = item.evaluations.filter((evaluation) => evaluation.note !== null);
          const poids = notes.reduce((somme, evaluation) => somme + evaluation.poids, 0);
          const moyenne = poids > 0 ? notes.reduce((somme, evaluation) => somme + (evaluation.note ?? 0) * evaluation.poids, 0) / poids : null;
          return <div key={item.id} className="rounded border border-hairline px-3 py-2"><div className="flex justify-between gap-2"><span className="font-sans text-xs font-medium text-ink">{item.nom} · coef. {item.coefficient}</span><span className="font-sans text-xs text-text-muted">{moyenne === null ? "—" : moyenne.toFixed(2)} /20</span></div><div className="mt-2 grid grid-cols-3 gap-1">{item.evaluations.map((evaluation) => <label key={evaluation.id} className="font-sans text-[10px] text-text-muted">{evaluation.nom} {evaluation.poids}%<input type="number" min="0" max="20" step="0.25" className={`${inputClass} mt-1 px-1.5 py-1`} value={evaluation.note ?? ""} onChange={(e) => modifier({ modules: semestre.modules.map((mod) => mod.id === item.id ? { ...mod, evaluations: mod.evaluations.map((ev) => ev.id === evaluation.id ? { ...ev, note: e.target.value === "" ? null : Number(e.target.value) } : ev) } : mod) })} /></label>)}</div></div>;
        })}
      </div>
    </Carte>
  );
}
