import type { Prieres } from "@/content/emploi-du-temps";
import { JETONS_COULEUR, PALETTES, type IdPalette, type JetonCouleur } from "./palettes";

/*
 * L'ambiance « Ciel de Casablanca » : l'interface suit la lumière du jour.
 *
 * Cinq phases, calées sur les horaires de prière du jour : l'aube (un peu avant
 * Fajr), le jour, la fin de journée (après Asr), le crépuscule (autour de
 * Maghrib) et la nuit (après Isha). Autour de chaque bascule, les deux palettes
 * se fondent l'une dans l'autre pendant une vingtaine de minutes, couleur par
 * couleur, dans l'espace OKLab — celui où un mélange paraît naturel à l'œil.
 */

export type PhaseCiel = "nuit" | "aube" | "jour" | "fin-de-jour" | "crepuscule";

export const PALETTE_DE_PHASE: Record<PhaseCiel, IdPalette> = {
  nuit: "merzouga",
  aube: "aube",
  jour: "clair",
  "fin-de-jour": "medina",
  crepuscule: "crepuscule",
};

export const NOMS_PHASES: Record<PhaseCiel, string> = {
  nuit: "Nuit",
  aube: "Aube",
  jour: "Jour",
  "fin-de-jour": "Fin de journée",
  crepuscule: "Crépuscule",
};

const ORDRE: PhaseCiel[] = ["nuit", "aube", "jour", "fin-de-jour", "crepuscule"];

/** Minutes de fondu de part et d'autre d'une bascule */
const DEMI_FONDU = 12;

const enMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Les cinq bascules du jour, dans l'ordre */
export function basculesDuJour(p: Prieres): { minute: number; phase: PhaseCiel }[] {
  return [
    { minute: enMinutes(p.fajr) - 30, phase: "aube" },
    { minute: enMinutes(p.shuruq) + 40, phase: "jour" },
    { minute: enMinutes(p.asr) + 30, phase: "fin-de-jour" },
    { minute: enMinutes(p.maghrib) - 20, phase: "crepuscule" },
    { minute: enMinutes(p.isha) + 45, phase: "nuit" },
  ];
}

export type EtatCiel = {
  phase: PhaseCiel;
  palette: IdPalette;
  /** Présent pendant un fondu : t va de 0 (palette de départ) à 1 (palette d'arrivée) */
  melange: { de: IdPalette; vers: IdPalette; t: number } | null;
  prochaine: { phase: PhaseCiel; minute: number };
};

export function etatDuCiel(maintenant: Date, prieres: Prieres): EtatCiel {
  const m = maintenant.getHours() * 60 + maintenant.getMinutes() + maintenant.getSeconds() / 60;
  const bascules = basculesDuJour(prieres);

  let index = -1;
  bascules.forEach((b, i) => {
    if (m >= b.minute) index = i;
  });
  const phase: PhaseCiel = index >= 0 ? bascules[index].phase : "nuit";
  const prochaine = bascules[index + 1] ?? { minute: bascules[0].minute + 1440, phase: bascules[0].phase };

  let melange: EtatCiel["melange"] = null;
  for (const b of bascules) {
    const ecart = m - b.minute;
    if (Math.abs(ecart) < DEMI_FONDU) {
      const precedente = ORDRE[(ORDRE.indexOf(b.phase) + ORDRE.length - 1) % ORDRE.length];
      melange = {
        de: PALETTE_DE_PHASE[precedente],
        vers: PALETTE_DE_PHASE[b.phase],
        t: (ecart + DEMI_FONDU) / (2 * DEMI_FONDU),
      };
    }
  }

  return { phase, palette: PALETTE_DE_PHASE[phase], melange, prochaine };
}

// ——— Mélange de couleurs dans OKLab ———

const versLineaire = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const versSrgb = (c: number) => {
  // Un mélange peut sortir très légèrement de la gamme : on borne avant la courbe gamma
  const x = Math.min(1, Math.max(0, c));
  const v = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  return Math.round(v * 255);
};

function versOklab(hex: string): [number, number, number] {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => versLineaire(parseInt(n.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const mm = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * mm - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * mm + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * mm - 0.808675766 * s,
  ];
}

function depuisOklab([L, a, b]: [number, number, number]): string {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return `#${rgb.map((c) => versSrgb(c).toString(16).padStart(2, "0")).join("")}`;
}

export function melangerCouleurs(de: string, vers: string, t: number): string {
  const a = versOklab(de);
  const b = versOklab(vers);
  return depuisOklab([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
}

export function melangerPalettes(de: IdPalette, vers: IdPalette, t: number): Record<JetonCouleur, string> {
  const resultat = {} as Record<JetonCouleur, string>;
  for (const jeton of JETONS_COULEUR) {
    resultat[jeton] = melangerCouleurs(PALETTES[de].couleurs[jeton], PALETTES[vers].couleurs[jeton], t);
  }
  return resultat;
}
