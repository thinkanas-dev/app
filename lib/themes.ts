import { JETONS_COULEUR, PALETTES, type IdPalette } from "./palettes";
import { etatDuCiel, melangerPalettes, type EtatCiel } from "./ciel";
import { horairesPriere } from "./horaires-priere";

/*
 * Les ambiances de think.anas.
 *
 * Deux classiques — clair et sombre —, trois signatures — Majorelle, Médina,
 * Merzouga —, et une ambiance vivante, « Ciel de Casablanca », qui suit la
 * lumière du jour. Chaque ambiance ne redéfinit que des jetons de couleur
 * (app/globals.css, généré) ; les composants n'en connaissent aucune.
 *
 * Le choix se pose sur <html data-theme="…"> avant même le premier affichage,
 * grâce à un petit script en tête de page : aucun éclair blanc au chargement.
 */

export type IdTheme = "clair" | "sombre" | "majorelle" | "medina" | "merzouga";
export type ChoixTheme = IdTheme | "systeme" | "ciel";

export type Theme = {
  id: IdTheme;
  nom: string;
  ambiance: string;
  signature: boolean;
};

export const THEMES: Theme[] = [
  { id: "clair", nom: "Clair", ambiance: "Le blanc net du travail, lisible en plein jour.", signature: false },
  { id: "sombre", nom: "Sombre", ambiance: "Un graphite doux pour le soir, sans noir brutal.", signature: false },
  { id: "majorelle", nom: "Majorelle", ambiance: "Le bleu électrique du jardin de Marrakech, citron et cactus.", signature: true },
  { id: "medina", nom: "Médina", ambiance: "Ivoire, terre cuite et zellige vert, comme une cour de Fès.", signature: true },
  { id: "merzouga", nom: "Merzouga", ambiance: "La nuit sur les dunes : violet profond et or de sable, étoiles comprises.", signature: true },
];

export const CLE_THEME = "think-anas-theme";
export const EVENEMENT_THEME = "think-anas:theme";

const CHOIX_VALIDES: string[] = [...THEMES.map((t) => t.id), "systeme", "ciel"];

export function lireChoix(): ChoixTheme {
  try {
    const valeur = window.localStorage.getItem(CLE_THEME);
    if (valeur && CHOIX_VALIDES.includes(valeur)) return valeur as ChoixTheme;
  } catch {
    // stockage indisponible : on suit le système
  }
  return "systeme";
}

export function etatCielMaintenant(maintenant = new Date()): EtatCiel {
  return etatDuCiel(maintenant, horairesPriere(maintenant));
}

const dominante = (e: EtatCiel): IdPalette => (e.melange ? (e.melange.t < 0.5 ? e.melange.de : e.melange.vers) : e.palette);

/** La palette réellement affichée pour un choix */
export function paletteResolue(choix: ChoixTheme): IdPalette {
  if (choix === "ciel") return dominante(etatCielMaintenant());
  if (choix === "systeme") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "sombre" : "clair";
  return choix;
}

function poserPalette(id: IdPalette) {
  document.documentElement.dataset.theme = id;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", PALETTES[id].couleurs["surface-secondary"]);
}

function effacerMelange() {
  const style = document.documentElement.style;
  for (const jeton of JETONS_COULEUR) style.removeProperty(`--color-${jeton}`);
  style.removeProperty("color-scheme");
}

// ——— L'ambiance vivante ———

let minuterieCiel: number | null = null;

function poserCiel() {
  const racine = document.documentElement;
  const etat = etatCielMaintenant();
  const id = dominante(etat);
  poserPalette(id);
  racine.dataset.ciel = etat.phase;

  if (!etat.melange) {
    effacerMelange();
    return;
  }
  // Pendant un fondu, chaque jeton reçoit sa couleur intermédiaire, recalculée toutes les 15 s
  const couleurs = melangerPalettes(etat.melange.de, etat.melange.vers, etat.melange.t);
  for (const jeton of JETONS_COULEUR) racine.style.setProperty(`--color-${jeton}`, couleurs[jeton]);
  racine.style.setProperty("color-scheme", PALETTES[id].sombre ? "dark" : "light");
}

/** Démarre le suivi du ciel ; sans effet s'il tourne déjà */
export function demarrerCiel() {
  poserCiel();
  if (minuterieCiel === null) minuterieCiel = window.setInterval(poserCiel, 15_000);
}

function arreterCiel() {
  if (minuterieCiel !== null) {
    window.clearInterval(minuterieCiel);
    minuterieCiel = null;
  }
  effacerMelange();
  delete document.documentElement.dataset.ciel;
}

type DocumentAvecTransition = { startViewTransition?: (miseAJour: () => void) => unknown };

/**
 * Change d'ambiance. Avec une origine (le point cliqué), la nouvelle ambiance
 * se révèle en cercle depuis ce point — là où le navigateur sait le faire, et
 * sauf si l'on a demandé moins d'animations.
 */
export function appliquerTheme(choix: ChoixTheme, origine?: { x: number; y: number }) {
  const racine = document.documentElement;

  try {
    window.localStorage.setItem(CLE_THEME, choix);
  } catch {
    // le choix vaut pour cette visite seulement
  }

  const cible = paletteResolue(choix);
  const changer = () => {
    if (choix === "ciel") demarrerCiel();
    else {
      arreterCiel();
      poserPalette(cible);
    }
  };

  const change = racine.dataset.theme !== cible || (choix === "ciel") !== Boolean(racine.dataset.ciel);
  const moinsDAnimations = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as unknown as DocumentAvecTransition;

  // Onglet masqué : le navigateur ne dessine pas, la transition attendrait indéfiniment son premier rendu
  if (change && origine && !moinsDAnimations && !document.hidden && typeof doc.startViewTransition === "function") {
    const rayon = Math.hypot(
      Math.max(origine.x, window.innerWidth - origine.x),
      Math.max(origine.y, window.innerHeight - origine.y)
    );
    racine.style.setProperty("--revelation-x", `${origine.x}px`);
    racine.style.setProperty("--revelation-y", `${origine.y}px`);
    racine.style.setProperty("--revelation-rayon", `${Math.ceil(rayon)}px`);
    doc.startViewTransition(changer);
  } else {
    changer();
  }

  window.dispatchEvent(new Event(EVENEMENT_THEME));
}

const fonds = Object.fromEntries(
  (Object.keys(PALETTES) as IdPalette[]).map((id) => [id, PALETTES[id].couleurs["surface-secondary"]])
);

/**
 * Exécuté en tête de page, avant React : pose l'ambiance mémorisée sans attendre
 * l'hydratation. Pour « Ciel », une estimation à l'heure près suffit ici ; le
 * calcul exact avec les horaires de prière prend le relais au montage.
 */
export const scriptThemeInitial = `(function(){try{var c=localStorage.getItem(${JSON.stringify(CLE_THEME)})||"systeme";var ok=${JSON.stringify(THEMES.map((t) => t.id))};var fonds=${JSON.stringify(fonds)};var t;if(c==="ciel"){var d=new Date(),m=d.getHours()*60+d.getMinutes();t=m<320?"merzouga":m<465?"aube":m<1055?"clair":m<1165?"medina":m<1310?"crepuscule":"merzouga";document.documentElement.dataset.ciel="1";}else{t=ok.indexOf(c)>=0?c:(window.matchMedia("(prefers-color-scheme: dark)").matches?"sombre":"clair");}document.documentElement.dataset.theme=t;var el=document.querySelector('meta[name="theme-color"]');if(el)el.setAttribute("content",fonds[t]);}catch(e){document.documentElement.dataset.theme="clair";}})();`;
