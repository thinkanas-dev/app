import { PLAN_END, PLAN_START } from "./plan-timeline";

/*
 * La tapisserie des 734 jours.
 *
 * Les cinq couleurs sont choisies pour rester distinctes dans les sept ambiances
 * (or, violet, vert, rouge, et l'encre pour le cœur) : aucune ne dépend de la
 * couleur de marque, qui se confond avec l'or dans Majorelle ou Merzouga.
 *
 * Chaque jour du plan est une tuile de zellige : quatre pétales et un cœur,
 * qui se colorent avec ce que la journée a réellement contenu — la prière
 * tenue, le rituel ouvert, une séance révisée, un savoir rangé au carnet, un
 * hizb mémorisé. Rien n'est saisi exprès : tout vient des traces déjà laissées
 * dans l'app. Les jours vides restent vides, et c'est le motif d'ensemble qui
 * dit la vérité.
 */

export type Signal = "priere" | "rituel" | "revision" | "savoir" | "hizb";

export const SIGNAUX: { cle: Signal; nom: string; detail: string; couleur: string }[] = [
  { cle: "priere", nom: "Prière", detail: "journée cochée dans Constance", couleur: "var(--color-soleil)" },
  { cle: "rituel", nom: "Rituel", detail: "citation du jour ouverte", couleur: "var(--color-accent-fig)" },
  { cle: "revision", nom: "Révision", detail: "une séance révisée à chaud", couleur: "var(--color-accent-olive)" },
  { cle: "savoir", nom: "Savoir", detail: "une idée rangée au carnet", couleur: "var(--color-accent-deep)" },
  { cle: "hizb", nom: "Hizb", detail: "un hizb marqué mémorisé", couleur: "var(--color-ink)" },
];

export type Tuile = {
  date: string;
  signaux: Record<Signal, boolean>;
  nombre: number;
  futur: boolean;
  aujourdhui: boolean;
};

export type AnneeTapisserie = {
  titre: string;
  /** Colonnes = semaines (lundi en premier) ; null hors de l'année */
  semaines: (Tuile | null)[][];
  mois: { colonne: number; nom: string }[];
};

export type Traces = {
  prayerDates: string[];
  rituelJours: string[];
  seancesRevisees: string[];
  carnet: { creeLe: string }[];
  hizbDates: Record<string, string>;
};

const MOIS_COURTS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

const deux = (n: number) => String(n).padStart(2, "0");
export const cleLocale = (d: Date) => `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`;
const depuisCle = (cle: string) => {
  const [a, m, j] = cle.split("-").map(Number);
  return new Date(a, m - 1, j);
};
const plusJours = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function construireTapisserie(traces: Traces, maintenant: Date) {
  const parSignal: Record<Signal, Set<string>> = {
    priere: new Set(traces.prayerDates),
    rituel: new Set(traces.rituelJours),
    // Les identifiants de séance commencent par leur date : 2026-09-14-c1
    revision: new Set(traces.seancesRevisees.map((id) => id.slice(0, 10))),
    savoir: new Set(traces.carnet.map((c) => cleLocale(new Date(c.creeLe)))),
    hizb: new Set(Object.values(traces.hizbDates)),
  };

  const aujourdhui = cleLocale(maintenant);
  const tuile = (date: string): Tuile => {
    const signaux = {
      priere: parSignal.priere.has(date),
      rituel: parSignal.rituel.has(date),
      revision: parSignal.revision.has(date),
      savoir: parSignal.savoir.has(date),
      hizb: parSignal.hizb.has(date),
    };
    return {
      date,
      signaux,
      nombre: Object.values(signaux).filter(Boolean).length,
      futur: date > aujourdhui,
      aujourdhui: date === aujourdhui,
    };
  };

  const debut = depuisCle(PLAN_START);
  const fin = depuisCle(PLAN_END);
  const bornes = [
    { titre: `Année 1 · ${debut.getFullYear()} – ${debut.getFullYear() + 1}`, de: debut, a: plusJours(debut, 364) },
    { titre: `Année 2 · ${debut.getFullYear() + 1} – ${fin.getFullYear()}`, de: plusJours(debut, 365), a: fin },
  ];

  const annees: AnneeTapisserie[] = bornes.map(({ titre, de, a }) => {
    const lundi = plusJours(de, -((de.getDay() + 6) % 7));
    const semaines: (Tuile | null)[][] = [];
    const mois: { colonne: number; nom: string }[] = [];
    for (let colonne = 0, curseur = lundi; curseur <= a; colonne++) {
      const semaine: (Tuile | null)[] = [];
      for (let j = 0; j < 7; j++, curseur = plusJours(curseur, 1)) {
        if (curseur < de || curseur > a) {
          semaine.push(null);
          continue;
        }
        if (curseur.getDate() === 1 || (colonne === 0 && j === (de.getDay() + 6) % 7)) {
          mois.push({ colonne, nom: MOIS_COURTS[curseur.getMonth()] });
        }
        semaine.push(tuile(cleLocale(curseur)));
      }
      semaines.push(semaine);
    }
    return { titre, semaines, mois };
  });

  // Statistiques sur les jours déjà vécus du plan
  const vecus = annees
    .flatMap((a) => a.semaines.flat())
    .filter((t): t is Tuile => t !== null && !t.futur);

  let serie = 0;
  let meilleureSerie = 0;
  let courante = 0;
  for (const t of vecus) {
    courante = t.nombre > 0 ? courante + 1 : 0;
    meilleureSerie = Math.max(meilleureSerie, courante);
  }
  for (let i = vecus.length - 1; i >= 0 && vecus[i].nombre > 0; i--) serie++;

  const taux = Object.fromEntries(
    SIGNAUX.map((s) => [s.cle, vecus.length ? vecus.filter((t) => t.signaux[s.cle]).length / vecus.length : 0])
  ) as Record<Signal, number>;

  return {
    annees,
    stats: {
      joursVecus: vecus.length,
      joursTotal: Math.round((fin.getTime() - debut.getTime()) / 86_400_000) + 1,
      joursPleins: vecus.filter((t) => t.nombre >= 4).length,
      joursTouches: vecus.filter((t) => t.nombre > 0).length,
      serie,
      meilleureSerie,
      taux,
    },
  };
}
