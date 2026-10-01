import { citationDuJour } from "./citation-du-jour";
import { rituels } from "@/content/rituel";
import { lexique, type Entree, type LangueCible } from "@/content/lexique";
import type { Citation } from "@/content/citations";

export type MotDuJour = { cle: string; entree: Entree };

/**
 * La journée ne commence pas à minuit mais à l'heure du rituel. Avant 6 h du
 * matin, vous êtes encore dans la journée de la veille — et c'est la citation
 * de la veille qui reste affichée.
 */
export function jourDuRituel(maintenant: Date, heureBascule: number): Date {
  const jour = new Date(maintenant);
  if (maintenant.getHours() < heureBascule) jour.setDate(jour.getDate() - 1);
  jour.setHours(0, 0, 0, 0);
  return jour;
}

/** Clé locale AAAA-MM-JJ — surtout pas toISOString(), qui décale d'un fuseau. */
export function cleJour(d: Date): string {
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mois}-${jour}`;
}

/** Millisecondes avant la prochaine bascule de journée. */
export function msAvantBascule(maintenant: Date, heureBascule: number): number {
  const cible = new Date(maintenant);
  cible.setHours(heureBascule, 0, 0, 0);
  if (cible.getTime() <= maintenant.getTime()) cible.setDate(cible.getDate() + 1);
  return cible.getTime() - maintenant.getTime();
}

function motsDe(citation: Citation, langue: LangueCible): MotDuJour[] {
  const rituel = rituels[citation.id];
  if (!rituel) return [];
  void langue; // la langue ne change pas la sélection, seulement la face visible
  return rituel.mots
    .map((cle) => ({ cle, entree: lexique[cle] }))
    .filter((m): m is MotDuJour => Boolean(m.entree));
}

export type ContenuDuJour = {
  citation: Citation;
  morale: string;
  mots: MotDuJour[];
  /** Deux mots d'hier laissés de côté, remis sous les yeux */
  rappels: MotDuJour[];
};

export function contenuDuJour(
  jour: Date,
  langue: LangueCible,
  acquis: string[]
): ContenuDuJour {
  const citation = citationDuJour(jour);
  const mots = motsDe(citation, langue);

  const veille = new Date(jour);
  veille.setDate(veille.getDate() - 1);
  const dejaVus = new Set(mots.map((m) => m.cle));

  // Rappel espacé minimal : on ne repropose que ce qui n'a pas été acquis
  // et qui ne figure pas déjà dans la liste du jour.
  const rappels = motsDe(citationDuJour(veille), langue)
    .filter((m) => !acquis.includes(m.cle) && !dejaVus.has(m.cle))
    .slice(0, 2);

  return {
    citation,
    morale: rituels[citation.id]?.morale ?? "",
    mots,
    rappels,
  };
}

/** Jours consécutifs de rituel, en remontant depuis aujourd'hui (ou hier). */
export function serieDeJours(jours: string[], aujourdhui: Date): number {
  const vus = new Set(jours);
  const curseur = new Date(aujourdhui);
  if (!vus.has(cleJour(curseur))) curseur.setDate(curseur.getDate() - 1);

  let serie = 0;
  while (vus.has(cleJour(curseur))) {
    serie++;
    curseur.setDate(curseur.getDate() - 1);
  }
  return serie;
}
