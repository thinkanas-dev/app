import type {
  BlocPerso,
  JourProgramme,
  ModuleId,
  Prieres,
  Seance,
  SemaineProgramme,
  TypePerso,
} from "@/content/emploi-du-temps";
import { cleJour } from "./rituel";

/** Mêmes poids que le dossier S3 : 3 = cœur du projet, 1 = module de langue. */
export const moduleMeta: Record<
  ModuleId,
  { court: string; nom: string; couleur: string; utilite: number }
> = {
  ia: { court: "IA", nom: "Intelligence Artificielle", couleur: "#8b5cf6", utilite: 3 },
  datamining: { court: "Data Mining", nom: "Data Mining et analyse de données", couleur: "#10b981", utilite: 3 },
  sih: { court: "SIH", nom: "Système d'Information Hospitalier et Santé Digital", couleur: "#ef4444", utilite: 3 },
  python: { court: "Python", nom: "Programmation Avancée en Python", couleur: "#f97316", utilite: 3 },
  bdd: { court: "BDD avancée", nom: "Bases de Données Avancée", couleur: "#ec4899", utilite: 2 },
  web: { court: "Dév. web", nom: "Développement web", couleur: "#14b8a6", utilite: 2 },
  eco: { court: "Économie", nom: "Environnement Économique d'Entreprise", couleur: "#eab308", utilite: 2 },
  anglais: { court: "Anglais", nom: "Anglais", couleur: "#3b82f6", utilite: 1 },
  francais: { court: "Français", nom: "Français", couleur: "#65a30d", utilite: 1 },
};

/** Les blocs personnels restent neutres : ils ne doivent jamais concurrencer les cours. */
export const couleurPerso: Record<TypePerso, string> = {
  rituel: "var(--color-ink)",
  hizb: "var(--color-neutre-profond)",
  revision: "var(--color-brand)",
  formation: "var(--color-brand)",
  libre: "var(--color-neutre)",
  "a-confirmer": "var(--color-neutre)",
  bilan: "var(--color-ink)",
};

export const PRIERES_AFFICHEES = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

export const nomsPrieres: Record<keyof Prieres, string> = {
  fajr: "Fajr",
  shuruq: "Lever du soleil",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

// Noms écrits en dur plutôt que via toLocaleDateString : le serveur et le
// navigateur n'embarquent pas toujours les mêmes données de langue, et un
// « sept. » d'un côté contre « sep » de l'autre casserait l'hydratation.
export const JOURS_COURTS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
export const JOURS_LONGS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
export const MOIS_COURTS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
export const MOIS_LONGS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** Premier lundi de cours du S3 : la semaine 1 */
export const LUNDI_DEBUT_S3 = "2026-09-14";

export function majuscule(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function enMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** 8 h 15 · 18 h */
export function formatHeure(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

/** 1 h 50 · 45 min · 3 h */
export function formatDuree(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

function dateDeCle(cle: string): Date {
  const [a, mo, j] = cle.split("-").map(Number);
  return new Date(a, mo - 1, j);
}

export function dateDe(jour: JourProgramme): Date {
  return dateDeCle(jour.date);
}

/** Numéro de la semaine dans le semestre, compté depuis le premier lundi du S3. */
export function numeroDeSemaine(lundi: string): number {
  const ecart = dateDeCle(lundi).getTime() - dateDeCle(LUNDI_DEBUT_S3).getTime();
  // Arrondi : absorbe une éventuelle heure d'été du fuseau du navigateur
  return Math.round(ecart / (7 * 86_400_000)) + 1;
}

/** « Lun. 14 » ou « lundi 14 septembre » */
export function libelleJour(jour: JourProgramme, format: "court" | "long" = "court"): string {
  const d = dateDe(jour);
  if (format === "long") {
    return `${JOURS_LONGS[d.getDay()]} ${d.getDate()} ${MOIS_LONGS[d.getMonth()]}`;
  }
  return `${majuscule(JOURS_COURTS[d.getDay()])} ${d.getDate()}`;
}

export function dureeSeance(s: Seance): number {
  return enMinutes(s.fin) - enMinutes(s.debut);
}

export type Etat = "passee" | "en-cours" | "a-venir";

export function etatEntre(
  jour: JourProgramme,
  debut: number,
  fin: number,
  maintenant: Date | null
): Etat {
  if (!maintenant) return "a-venir";
  const base = dateDe(jour).getTime();
  const t = maintenant.getTime();
  if (t >= base + fin * 60_000) return "passee";
  if (t >= base + debut * 60_000) return "en-cours";
  return "a-venir";
}

export type ElementAgenda =
  | { genre: "seance"; id: string; debut: number; fin: number; seance: Seance }
  | { genre: "perso"; id: string; debut: number; fin: number; bloc: BlocPerso }
  | { genre: "priere"; id: string; debut: number; fin: number; nom: string };

/** Tout ce qui se passe dans la journée, dans l'ordre : cours, blocs personnels, prières. */
export function agendaDuJour(jour: JourProgramme): ElementAgenda[] {
  const elements: ElementAgenda[] = [
    ...jour.seances.map((seance) => ({
      genre: "seance" as const,
      id: seance.id,
      debut: enMinutes(seance.debut),
      fin: enMinutes(seance.fin),
      seance,
    })),
    ...jour.blocs.map((bloc) => ({
      genre: "perso" as const,
      id: bloc.id,
      debut: enMinutes(bloc.debut),
      fin: enMinutes(bloc.fin),
      bloc,
    })),
    ...PRIERES_AFFICHEES.map((cle) => ({
      genre: "priere" as const,
      id: `${jour.date}-${cle}`,
      debut: enMinutes(jour.prieres[cle]),
      fin: enMinutes(jour.prieres[cle]),
      nom: nomsPrieres[cle],
    })),
  ];

  const rang = (e: ElementAgenda) => (e.genre === "priere" ? 0 : e.genre === "seance" ? 1 : 2);
  return elements.sort((a, b) => a.debut - b.debut || rang(a) - rang(b));
}

/** Aujourd'hui si la date tombe dans la semaine, sinon le jour le plus proche. */
export function jourParDefaut(semaine: SemaineProgramme, maintenant: Date | null): JourProgramme {
  const jours = semaine.jours;
  if (!maintenant) return jours[0];
  const cle = cleJour(maintenant);
  const exact = jours.find((j) => j.date === cle);
  if (exact) return exact;
  return cle < jours[0].date ? jours[0] : jours[jours.length - 1];
}

/**
 * La semaine à montrer d'abord : celle qui contient aujourd'hui (du lundi au
 * dimanche), sinon la prochaine à venir, sinon la dernière connue.
 */
export function semaineParDefaut(semaines: SemaineProgramme[], maintenant: Date | null): SemaineProgramme {
  if (!maintenant) return semaines[0];
  const aujourdhui = cleJour(maintenant);
  const finDe = (s: SemaineProgramme) => {
    const d = dateDeCle(s.lundi);
    return cleJour(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6));
  };
  return (
    semaines.find((s) => aujourdhui >= s.lundi && aujourdhui <= finDe(s)) ??
    semaines.find((s) => s.lundi > aujourdhui) ??
    semaines[semaines.length - 1]
  );
}

export type SeanceDatee = { jour: JourProgramme; seance: Seance; debut: Date; fin: Date };

const chronologies = new WeakMap<SemaineProgramme, SeanceDatee[]>();

/** Toutes les séances d'une semaine, datées et triées. */
export function seancesChronologiques(semaine: SemaineProgramme): SeanceDatee[] {
  const deja = chronologies.get(semaine);
  if (deja) return deja;

  const liste = semaine.jours
    .flatMap((jour) =>
      jour.seances.map((seance) => {
        const base = dateDe(jour).getTime();
        return {
          jour,
          seance,
          debut: new Date(base + enMinutes(seance.debut) * 60_000),
          fin: new Date(base + enMinutes(seance.fin) * 60_000),
        };
      })
    )
    .sort((a, b) => a.debut.getTime() - b.debut.getTime());

  chronologies.set(semaine, liste);
  return liste;
}

export function etatSeance(item: SeanceDatee, maintenant: Date | null): Etat {
  if (!maintenant) return "a-venir";
  const t = maintenant.getTime();
  if (t >= item.fin.getTime()) return "passee";
  if (t >= item.debut.getTime()) return "en-cours";
  return "a-venir";
}

export function seanceActuelleOuProchaine(
  semaine: SemaineProgramme,
  maintenant: Date
): { etat: "en-cours" | "a-venir"; item: SeanceDatee } | undefined {
  const t = maintenant.getTime();
  for (const item of seancesChronologiques(semaine)) {
    if (t < item.fin.getTime()) {
      return { etat: t >= item.debut.getTime() ? "en-cours" : "a-venir", item };
    }
  }
  return undefined;
}

/** « dans 42 min », « dans 3 h 10 », « dans 1 j 6 h » */
export function formatRelatif(de: Date, a: Date): string {
  const min = Math.round((a.getTime() - de.getTime()) / 60_000);
  if (min <= 0) return "maintenant";
  if (min < 24 * 60) return `dans ${formatDuree(min)}`;
  const j = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  return h > 0 ? `dans ${j} j ${h} h` : `dans ${j} j`;
}
