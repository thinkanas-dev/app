import type {
  BlocPerso,
  JourProgramme,
  ModuleId,
  Prieres,
  Seance,
  SemaineProgramme,
} from "@/content/emploi-du-temps";

/*
 * Construit une semaine complète autour des cours importés : le rituel, le
 * hizb, les créneaux libres, la révision à chaud, le bilan du vendredi, la
 * formation, le samedi de fond.
 *
 * Ce sont les règles appliquées à la main pour la semaine 1, rendues
 * explicites — sur les cours de la semaine 1, elles redonnent exactement ses
 * blocs, aux mêmes heures.
 *
 * Aucune dépendance d'exécution : les horaires de prière, les poids et les noms
 * des modules sont passés en paramètre, ce qui permet de tester ce fichier seul.
 */

export type SeancePlacee = Omit<Seance, "id"> & { jourIndex: number; creneauIndex: number };

export type EntreePlan = {
  numero: number;
  /** Lundi, AAAA-MM-JJ */
  lundi: string;
  salle: string;
  groupe: string;
  creneaux: { debut: string; fin: string }[];
  seances: SeancePlacee[];
  casesSansTexte: { jourIndex: number; debut: string; fin: string }[];
  aVerifier: string[];
  prieres: (date: Date) => Prieres;
  utilite: Record<ModuleId, number>;
  nomsCourts: Record<ModuleId, string>;
};

const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const deuxChiffres = (n: number) => String(n).padStart(2, "0");
const cleDate = (d: Date) => `${d.getFullYear()}-${deuxChiffres(d.getMonth() + 1)}-${deuxChiffres(d.getDate())}`;
const enMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const enHHMM = (min: number) => `${deuxChiffres(Math.floor(min / 60))}:${deuxChiffres(min % 60)}`;

/** « du 14 au 18 septembre », « du 28 septembre au 2 octobre » */
export function libelleDeSemaine(lundi: Date): string {
  const vendredi = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + 4);
  return lundi.getMonth() === vendredi.getMonth()
    ? `du ${lundi.getDate()} au ${vendredi.getDate()} ${MOIS[vendredi.getMonth()]}`
    : `du ${lundi.getDate()} ${MOIS[lundi.getMonth()]} au ${vendredi.getDate()} ${MOIS[vendredi.getMonth()]}`;
}

/** « IA, Data Mining et Python » : les modules du plus lourd au plus léger, trois au plus */
function enumerer(ids: ModuleId[], e: EntreePlan): string {
  const uniques = [...new Set(ids)].sort((a, b) => e.utilite[b] - e.utilite[a]).slice(0, 3);
  const noms = uniques.map((id) => e.nomsCourts[id]);
  return noms.length <= 1 ? (noms[0] ?? "") : `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

export function construireSemaine(e: EntreePlan): SemaineProgramme {
  const [an, mois, jourDuMois] = e.lundi.split("-").map(Number);
  const lundi = new Date(an, mois - 1, jourDuMois);
  const jours: JourProgramme[] = [];

  const seancesDu = (i: number) =>
    e.seances.filter((s) => s.jourIndex === i).sort((a, b) => a.creneauIndex - b.creneauIndex);

  for (let i = 0; i < 6; i++) {
    const date = new Date(an, mois - 1, jourDuMois + i);
    const cle = cleDate(date);
    const samedi = i === 5;

    const seances: Seance[] = seancesDu(i).map((s) => ({
      // Même forme d'identifiant que la semaine relevée à la main : une séance
      // déjà cochée « révisée » le reste après un import.
      id: `${cle}-c${s.creneauIndex + 1}`,
      moduleId: s.moduleId,
      intitule: s.intitule,
      prof: s.prof,
      format: s.format,
      numero: s.numero,
      total: s.total,
      salle: s.salle,
      debut: s.debut,
      fin: s.fin,
    }));

    const aConfirmer = e.casesSansTexte.filter((c) => c.jourIndex === i);
    const blocs: BlocPerso[] = [
      {
        id: `${cle}-rituel`,
        type: "rituel",
        debut: "06:00",
        fin: "06:15",
        titre: "Rituel du jour",
        detail: "Citation, morale et dix mots",
      },
      {
        id: `${cle}-hizb`,
        type: "hizb",
        debut: "06:15",
        fin: samedi ? "07:15" : "07:00",
        titre: "Hizb",
        detail: samedi ? "Plus long : révision des hizb déjà appris" : "Mémorisation, avant le lever du soleil",
      },
    ];

    aConfirmer.forEach((c, n) =>
      blocs.push({
        id: `${cle}-a-confirmer${n > 0 ? `-${n + 1}` : ""}`,
        type: "a-confirmer",
        debut: c.debut,
        fin: c.fin,
        titre: "Case colorée sans intitulé",
        detail: "Présente dans l'emploi du temps sans texte : cours, activité ou créneau libre ?",
      })
    );

    if (samedi) {
      const semaineEntiere = e.seances.map((s) => s.moduleId);
      blocs.push(
        {
          id: `${cle}-revision`,
          type: "revision",
          debut: "09:00",
          fin: "12:00",
          titre: "Révision de fond",
          detail: semaineEntiere.length
            ? `${enumerer(semaineEntiere, e)} — trois heures, avec pauses`
            : "Trois heures sur les modules prioritaires, avec pauses",
        },
        {
          id: `${cle}-formation`,
          type: "formation",
          debut: "15:00",
          fin: "18:00",
          titre: "Jour tampon",
          detail: "Formation ou tournage think.anas",
        }
      );
      jours.push({ date: cle, seances, blocs, prieres: e.prieres(date) });
      continue;
    }

    const dernierCours = seances.length > 0 ? Math.max(...seances.map((s) => enMinutes(s.fin))) : null;
    const estLibre = (c: { debut: string; fin: string }) =>
      !seances.some((s) => s.debut === c.debut) &&
      !aConfirmer.some((x) => enMinutes(x.debut) <= enMinutes(c.debut) && enMinutes(c.fin) <= enMinutes(x.fin));

    // Un trou entre deux cours devient du travail de fond
    e.creneaux.forEach((c, k) => {
      if (!estLibre(c) || dernierCours === null || enMinutes(c.fin) > dernierCours) return;
      const veille = i > 0 ? seancesDu(i - 1).map((s) => s.moduleId) : [];
      blocs.push({
        id: `${cle}-libre-${k + 1}`,
        type: "libre",
        debut: c.debut,
        fin: c.fin,
        titre: "Créneau libre",
        detail: veille.length
          ? `Travail de fond : reprendre ${enumerer(veille, e)} de ${JOURS[i - 1]}`
          : "Travail de fond : préparer les cours qui suivent",
      });
    });

    // Vendredi : le premier créneau vide après les cours sert au bilan
    if (i === 4) {
      const apres = e.creneaux.find((c) => dernierCours !== null && enMinutes(c.debut) >= dernierCours && estLibre(c));
      const debut = apres ? enMinutes(apres.debut) : 18 * 60 + 15;
      const fin = Math.min(debut + 80, apres ? enMinutes(apres.fin) : debut + 80);
      blocs.push({
        id: `${cle}-bilan`,
        type: "bilan",
        debut: enHHMM(debut),
        fin: enHHMM(fin),
        titre: "Bilan de la semaine",
        detail: "Ce qui a été vu, ce qui manque, préparer la semaine suivante",
      });
    }

    // Révision à chaud du lundi au jeudi, quand la journée le justifie
    const poidsFort = seances.some((s) => e.utilite[s.moduleId] >= 3);
    if (i <= 3 && (seances.length >= 2 || poidsFort)) {
      const duree = seances.length >= 4 ? 60 : 45;
      blocs.push({
        id: `${cle}-revision`,
        type: "revision",
        debut: "18:30",
        fin: enHHMM(18 * 60 + 30 + duree),
        titre: "Révision à chaud",
        detail: `${enumerer(seances.map((s) => s.moduleId), e)} : reprendre les notes du jour`,
      });
    }

    // Formation le soir, sauf quand une case colorée occupe déjà l'après-midi
    if (aConfirmer.length === 0) {
      blocs.push({
        id: `${cle}-formation`,
        type: "formation",
        debut: "20:15",
        fin: "21:00",
        titre: "Formation think.anas",
        detail: "Piste privée : apprendre. Piste publique : l'angle grand public.",
      });
    }

    jours.push({ date: cle, seances, blocs, prieres: e.prieres(date) });
  }

  return {
    numero: e.numero,
    lundi: e.lundi,
    source: "import",
    libelle: libelleDeSemaine(lundi),
    salle: e.salle,
    groupe: e.groupe,
    jours,
    aVerifier: e.aVerifier,
  };
}
