/*
 * Le départ du programme : jeudi 1er octobre 2026 à 19 h 27.
 *
 * Avant l'heure, l'app s'ouvre sur le compte à rebours ; à l'heure dite, elle
 * lance le spectacle. Une fois célébré, le spectacle ne se rejoue plus tout
 * seul — on peut toujours le revoir à la demande.
 */

export const DEBUT_PROGRAMME = new Date(2026, 9, 1, 19, 27, 0).getTime();

/** Ouvrir l'app jusqu'à 18 h après le départ déclenche encore la fête, si on l'a manquée */
export const FENETRE_CELEBRATION = 18 * 3600 * 1000;

export const CLE_CELEBRE = "think-anas-lancement-celebre";
export const CLE_VU_SESSION = "think-anas-lancement-vu";

export function decomposer(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  return {
    jours: Math.floor(t / 86400),
    heures: Math.floor((t % 86400) / 3600),
    minutes: Math.floor((t % 3600) / 60),
    secondes: t % 60,
  };
}

export const deuxChiffres = (n: number) => String(n).padStart(2, "0");

/**
 * Répétition depuis l'adresse : ?ceremonie=repetition lance le spectacle tout de
 * suite, ?ceremonie=dans-15 simule un départ dans 15 secondes.
 */
export function lireRepetition(recherche: string, maintenant: number): { cible: number } | null {
  const valeur = new URLSearchParams(recherche).get("ceremonie");
  if (valeur === "repetition") return { cible: maintenant - 1000 };
  const dans = valeur?.match(/^dans-(\d{1,5})$/);
  if (dans) return { cible: maintenant + Number(dans[1]) * 1000 };
  return null;
}
