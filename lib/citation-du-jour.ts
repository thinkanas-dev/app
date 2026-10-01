import { citations, type Citation } from "@/content/citations";

/** Jour de l'année, 1 pour le 1ᵉʳ janvier. */
function jourDeLAnnee(d: Date) {
  const debut = new Date(d.getFullYear(), 0, 1);
  const diff = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - debut.getTime();
  return Math.round(diff / 86_400_000) + 1;
}

/**
 * Une citation par date, toujours la même pour une date donnée : le 23 septembre
 * affichera la même chose que vous ouvriez l'app le matin ou le soir. Le décalage
 * par l'année évite de retomber sur la même série d'une année sur l'autre.
 */
export function citationDuJour(date: Date): Citation {
  const index = (jourDeLAnnee(date) + date.getFullYear()) % citations.length;
  return citations[index];
}

/** Millisecondes jusqu'au prochain passage à l'heure dite (locale). */
export function msJusquA(heure: number, depuis = new Date()) {
  const cible = new Date(depuis);
  cible.setHours(heure, 0, 0, 0);
  if (cible.getTime() <= depuis.getTime()) cible.setDate(cible.getDate() + 1);
  return cible.getTime() - depuis.getTime();
}
