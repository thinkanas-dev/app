"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { objectifsContent } from "@/content/objectifs";
import { useObjectifsState } from "@/lib/objectifs-store";

type Resultat = { id: string; type: string; titre: string; detail: string; href: string };

export default function RecherchePage() {
  const { state } = useObjectifsState();
  const [query, setQuery] = useState("");

  const resultats = useMemo(() => {
    const liste: Resultat[] = [];
    for (const item of state.atelier.taches) liste.push({ id: item.id, type: "Tâche", titre: item.titre, detail: `${item.projet} ${item.notes}`, href: "/objectifs/atelier" });
    for (const item of state.atelier.habitudes) liste.push({ id: item.id, type: "Habitude", titre: item.nom, detail: `${item.objectifHebdo} fois par semaine`, href: "/objectifs/atelier" });
    for (const item of state.atelier.evenements) liste.push({ id: item.id, type: "Événement", titre: item.titre, detail: `${item.date} ${item.lieu} ${item.notes}`, href: "/objectifs/atelier" });
    for (const item of state.atelier.objectifs) liste.push({ id: item.id, type: "Objectif personnel", titre: item.titre, detail: item.description, href: "/objectifs/atelier" });
    for (const item of state.atelier.captures) liste.push({ id: item.id, type: "Capture", titre: item.texte, detail: item.type, href: "/objectifs/aujourdhui" });
    for (const item of state.atelier.transactions) liste.push({ id: item.id, type: "Finance", titre: item.libelle, detail: `${item.montant} MAD ${item.categorie}`, href: "/objectifs/finances" });
    for (const item of state.atelier.notesJour) liste.push({ id: item.id, type: "Journal", titre: `Journal du ${item.date}`, detail: `${item.matin} ${item.soir} ${item.gratitude} ${item.priorites.join(" ")}`, href: "/objectifs/aujourdhui" });
    for (const item of state.carnet) liste.push({ id: item.id, type: "Carte de savoir", titre: item.titre, detail: `${item.idees.join(" ")} ${item.note} ${item.url}`, href: "/objectifs/navigateur" });
    for (const [id, note] of Object.entries(state.goalNotes)) {
      const goal = [...objectifsContent.milestones, ...objectifsContent.checklist, ...objectifsContent.countdowns].find((item) => item.id === id);
      liste.push({ id: `goal-${id}`, type: "Note d’objectif", titre: goal?.label ?? id, detail: note, href: `/objectifs/goal/${id}` });
    }
    for (const goal of objectifsContent.milestones) liste.push({ id: `fixe-${goal.id}`, type: "Objectif historique", titre: goal.label, detail: "note" in goal ? goal.note ?? "" : "", href: `/objectifs/goal/${goal.id}` });
    const mots = query.trim().toLocaleLowerCase("fr").split(/\s+/).filter(Boolean);
    if (mots.length === 0) return liste.slice(0, 20);
    return liste.filter((item) => {
      const texte = `${item.type} ${item.titre} ${item.detail}`.toLocaleLowerCase("fr");
      return mots.every((mot) => texte.includes(mot));
    });
  }, [query, state]);

  return <div className="flex flex-col gap-4"><div className="rounded-lg border border-hairline bg-canvas p-5"><p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-brand">Toutes vos données</p><h1 className="mt-1 font-serif text-3xl text-ink">Recherche globale</h1><input autoFocus className="mt-5 w-full rounded-md border border-hairline bg-canvas px-4 py-3 font-sans text-base text-ink outline-none focus:border-brand" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tâche, note, cours, dépense, objectif, idée…" /></div><div className="rounded-lg border border-hairline bg-canvas"><div className="border-b border-hairline px-5 py-3"><span className="font-sans text-xs text-text-muted">{resultats.length} résultat(s)</span></div><div className="divide-y divide-hairline">{resultats.length === 0 && <p className="p-6 font-sans text-sm text-text-muted">Aucun résultat.</p>}{resultats.map((item) => <Link key={`${item.type}-${item.id}`} href={item.href} className="block px-5 py-3 hover:bg-surface-secondary transition-colors"><div className="flex items-center gap-2"><span className="rounded bg-brand-soft px-1.5 py-0.5 font-sans text-[10px] font-medium text-brand">{item.type}</span><p className="font-sans text-sm font-medium text-ink">{item.titre}</p></div>{item.detail && <p className="mt-1 line-clamp-2 font-sans text-xs text-text-muted">{item.detail}</p>}</Link>)}</div></div></div>;
}
