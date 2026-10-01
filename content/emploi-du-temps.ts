/**
 * Emploi du temps — Semaine 1, du 14 au 18 septembre 2026.
 *
 * Les cours sont relevés case par case sur le PDF officiel (EDT ESM6ISS, GR1,
 * salle A402), en croisant le rendu image et les coordonnées de chaque cellule :
 * aucun cours n'est placé par déduction.
 *
 * Les blocs personnels (rituel, hizb, révision, formation) ne figurent pas dans
 * le PDF : c'est le plan construit autour des cours.
 *
 * Horaires de prière : namazvakti.com, Casablanca (Bourgogne). Source non
 * officielle — quelques minutes d'écart possibles avec le ministère des Habous.
 */

export type ModuleId =
  | "ia"
  | "datamining"
  | "sih"
  | "python"
  | "bdd"
  | "web"
  | "eco"
  | "anglais"
  | "francais";

export type Seance = {
  id: string;
  moduleId: ModuleId;
  /** Intitulé tel qu'écrit dans l'emploi du temps */
  intitule: string;
  prof: string;
  format: string;
  /** « 1/22 » dans le PDF : numéro de la séance sur le total du module */
  numero: number;
  total: number;
  salle: string;
  debut: string;
  fin: string;
};

export type TypePerso =
  | "rituel"
  | "hizb"
  | "revision"
  | "formation"
  | "libre"
  | "bilan"
  | "a-confirmer";

export type BlocPerso = {
  id: string;
  type: TypePerso;
  debut: string;
  fin: string;
  titre: string;
  detail?: string;
};

export type Prieres = {
  fajr: string;
  shuruq: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export type JourProgramme = {
  /** AAAA-MM-JJ, heure locale */
  date: string;
  seances: Seance[];
  blocs: BlocPerso[];
  prieres: Prieres;
};

export type SemaineProgramme = {
  numero: number;
  /** Lundi de la semaine, AAAA-MM-JJ */
  lundi: string;
  /** Relevée à la main, ou importée depuis le PDF */
  source: "releve" | "import";
  libelle: string;
  salle: string;
  groupe: string;
  jours: JourProgramme[];
  aVerifier: string[];
};

const PR = {
  kasmi: "Pr Kasmi Alaoui Seddik",
  bahassine: "Pr Bahassine Said",
  benBouazza: "Pr Ben Bouazza Fatima Ezzahraa",
  tallache: "Pr Tallache Sanaa",
  snadrou: "Pr Snadrou Khalid",
  elBakkali: "Pr El Bakkali Driss",
  aitWakrime: "Pr Ait Wakrime Abderrahim",
  lamkhanter: "Pr Lamkhanter Fouzia",
  mahdaoui: "Pr Mahdaoui Meriem",
  saad: "Pr Saad El Madani",
};

const INTITULE = {
  python: "Programmation Avancée en Python",
  datamining: "DATA Mining et analyse de données — Techniques et Applications Médicales",
  ia: "Intelligence Artificielle",
  francais: "Français",
  eco: "Environnement Économique d'Entreprise (EEE)",
  bdd: "Bases de Données Avancée",
  anglais: "Anglais",
  web: "Développement web",
  sih: "Système d'Information Hospitalier et Santé Digital",
};

function seance(date: string, rang: number, s: Omit<Seance, "id">): Seance {
  return { id: `${date}-c${rang}`, ...s };
}

const rituel = (date: string): BlocPerso => ({
  id: `${date}-rituel`,
  type: "rituel",
  debut: "06:00",
  fin: "06:15",
  titre: "Rituel du jour",
  detail: "Citation, morale et dix mots",
});

const hizb = (
  date: string,
  fin = "07:00",
  detail = "Mémorisation, avant le lever du soleil"
): BlocPerso => ({
  id: `${date}-hizb`,
  type: "hizb",
  debut: "06:15",
  fin,
  titre: "Hizb",
  detail,
});

const formation = (date: string): BlocPerso => ({
  id: `${date}-formation`,
  type: "formation",
  debut: "20:15",
  fin: "21:00",
  titre: "Formation think.anas",
  detail: "Piste privée : apprendre. Piste publique : l'angle grand public.",
});

export const semaine1: SemaineProgramme = {
  numero: 1,
  lundi: "2026-09-14",
  source: "releve",
  libelle: "du 14 au 18 septembre",
  salle: "A402",
  groupe: "GR1",
  jours: [
    {
      date: "2026-09-14",
      seances: [
        seance("2026-09-14", 1, {
          moduleId: "python",
          intitule: INTITULE.python,
          prof: PR.kasmi,
          format: "Cours & TD & TP",
          numero: 1,
          total: 22,
          salle: "A402",
          debut: "08:15",
          fin: "10:05",
        }),
        seance("2026-09-14", 2, {
          moduleId: "datamining",
          intitule: INTITULE.datamining,
          prof: PR.bahassine,
          format: "Cours & TD & TP",
          numero: 1,
          total: 22,
          salle: "A402",
          debut: "10:20",
          fin: "12:05",
        }),
        seance("2026-09-14", 3, {
          moduleId: "ia",
          intitule: INTITULE.ia,
          prof: PR.benBouazza,
          format: "Cours TD & TP",
          numero: 1,
          total: 22,
          salle: "A402",
          debut: "14:00",
          fin: "15:55",
        }),
        seance("2026-09-14", 4, {
          moduleId: "francais",
          intitule: INTITULE.francais,
          prof: PR.tallache,
          format: "Cours TD",
          numero: 1,
          total: 11,
          salle: "A402",
          debut: "16:10",
          fin: "18:00",
        }),
      ],
      blocs: [
        rituel("2026-09-14"),
        hizb("2026-09-14"),
        {
          id: "2026-09-14-revision",
          type: "revision",
          debut: "18:30",
          fin: "19:30",
          titre: "Révision à chaud",
          detail: "IA et Data Mining, puis relancer le TP Python",
        },
        formation("2026-09-14"),
      ],
      prieres: { fajr: "05:50", shuruq: "07:08", dhuhr: "13:35", asr: "17:06", maghrib: "19:45", isha: "21:06" },
    },
    {
      date: "2026-09-15",
      seances: [
        seance("2026-09-15", 2, {
          moduleId: "eco",
          intitule: INTITULE.eco,
          prof: PR.snadrou,
          format: "Cours & TD",
          numero: 1,
          total: 10,
          salle: "Amphi D4",
          debut: "10:20",
          fin: "12:05",
        }),
        seance("2026-09-15", 3, {
          moduleId: "bdd",
          intitule: INTITULE.bdd,
          prof: PR.aitWakrime,
          format: "Cours & TD & TP",
          numero: 1,
          total: 22,
          salle: "A402",
          debut: "14:00",
          fin: "15:55",
        }),
        seance("2026-09-15", 4, {
          moduleId: "bdd",
          intitule: INTITULE.bdd,
          prof: PR.aitWakrime,
          format: "Cours & TD & TP",
          numero: 2,
          total: 22,
          salle: "A402",
          debut: "16:10",
          fin: "18:00",
        }),
      ],
      blocs: [
        rituel("2026-09-15"),
        hizb("2026-09-15"),
        {
          id: "2026-09-15-libre",
          type: "libre",
          debut: "08:15",
          fin: "10:05",
          titre: "Créneau libre",
          detail: "Travail de fond : reprendre l'IA, le Data Mining et Python de lundi",
        },
        {
          id: "2026-09-15-revision",
          type: "revision",
          debut: "18:30",
          fin: "19:15",
          titre: "Révision à chaud",
          detail: "Les requêtes BDD de la journée, puis 15 min d'économie",
        },
        formation("2026-09-15"),
      ],
      prieres: { fajr: "05:50", shuruq: "07:08", dhuhr: "13:34", asr: "17:05", maghrib: "19:44", isha: "21:04" },
    },
    {
      date: "2026-09-16",
      seances: [
        seance("2026-09-16", 2, {
          moduleId: "eco",
          intitule: INTITULE.eco,
          prof: PR.elBakkali,
          format: "Cours & TD",
          numero: 1,
          total: 10,
          salle: "Amphi D4",
          debut: "10:20",
          fin: "12:05",
        }),
      ],
      blocs: [
        rituel("2026-09-16"),
        hizb("2026-09-16"),
        {
          id: "2026-09-16-libre",
          type: "libre",
          debut: "08:15",
          fin: "10:05",
          titre: "Créneau libre",
          detail: "Refaire le TP BDD, préparer la séance 2 d'IA",
        },
        {
          id: "2026-09-16-a-confirmer",
          type: "a-confirmer",
          debut: "14:00",
          fin: "18:00",
          titre: "Case verte sans intitulé",
          detail: "Si elle est libre : production think.anas et une révision prioritaire",
        },
      ],
      prieres: { fajr: "05:51", shuruq: "07:09", dhuhr: "13:34", asr: "17:04", maghrib: "19:42", isha: "21:03" },
    },
    {
      date: "2026-09-17",
      seances: [
        seance("2026-09-17", 2, {
          moduleId: "ia",
          intitule: INTITULE.ia,
          prof: PR.benBouazza,
          format: "Cours TD & TP",
          numero: 2,
          total: 22,
          salle: "A402",
          debut: "10:20",
          fin: "12:05",
        }),
        seance("2026-09-17", 3, {
          moduleId: "anglais",
          intitule: INTITULE.anglais,
          prof: PR.lamkhanter,
          format: "Cours TD & TP",
          numero: 1,
          total: 11,
          salle: "A402",
          debut: "14:00",
          fin: "15:55",
        }),
        seance("2026-09-17", 4, {
          moduleId: "web",
          intitule: INTITULE.web,
          prof: PR.mahdaoui,
          format: "Cours & TD & TP",
          numero: 1,
          total: 22,
          salle: "A402",
          debut: "16:10",
          fin: "18:00",
        }),
      ],
      blocs: [
        rituel("2026-09-17"),
        hizb("2026-09-17"),
        {
          id: "2026-09-17-libre",
          type: "libre",
          debut: "08:15",
          fin: "10:05",
          titre: "Créneau libre",
          detail: "Préparer la séance 2 d'IA",
        },
        {
          id: "2026-09-17-revision",
          type: "revision",
          debut: "18:30",
          fin: "19:15",
          titre: "Révision à chaud",
          detail: "IA, puis installer l'environnement web",
        },
        formation("2026-09-17"),
      ],
      prieres: { fajr: "05:52", shuruq: "07:10", dhuhr: "13:34", asr: "17:03", maghrib: "19:41", isha: "21:01" },
    },
    {
      date: "2026-09-18",
      seances: [
        seance("2026-09-18", 1, {
          moduleId: "web",
          intitule: INTITULE.web,
          prof: PR.mahdaoui,
          format: "Cours & TD & TP",
          numero: 2,
          total: 22,
          salle: "A402",
          debut: "08:15",
          fin: "10:05",
        }),
        seance("2026-09-18", 2, {
          moduleId: "datamining",
          intitule: INTITULE.datamining,
          prof: PR.bahassine,
          format: "Cours & TD & TP",
          numero: 2,
          total: 22,
          salle: "A402",
          debut: "10:20",
          fin: "12:05",
        }),
        seance("2026-09-18", 3, {
          moduleId: "python",
          intitule: INTITULE.python,
          prof: PR.kasmi,
          format: "Cours & TD & TP",
          numero: 2,
          total: 22,
          salle: "A402",
          debut: "14:00",
          fin: "15:55",
        }),
      ],
      blocs: [
        rituel("2026-09-18"),
        hizb("2026-09-18"),
        {
          id: "2026-09-18-bilan",
          type: "bilan",
          debut: "16:10",
          fin: "17:30",
          titre: "Bilan de la semaine",
          detail: "Ce qui a été vu, ce qui manque, préparer la semaine 2",
        },
        formation("2026-09-18"),
      ],
      prieres: { fajr: "05:53", shuruq: "07:10", dhuhr: "13:33", asr: "17:03", maghrib: "19:40", isha: "21:00" },
    },
    {
      date: "2026-09-19",
      seances: [],
      blocs: [
        rituel("2026-09-19"),
        hizb("2026-09-19", "07:15", "Plus long : révision des hizb déjà appris"),
        {
          id: "2026-09-19-revision",
          type: "revision",
          debut: "09:00",
          fin: "12:00",
          titre: "Révision de fond",
          detail: "IA, Data Mining et Python — trois heures, avec pauses",
        },
        {
          id: "2026-09-19-formation",
          type: "formation",
          debut: "15:00",
          fin: "18:00",
          titre: "Jour tampon",
          detail: "Formation ou tournage think.anas",
        },
      ],
      prieres: { fajr: "05:54", shuruq: "07:11", dhuhr: "13:33", asr: "17:02", maghrib: "19:38", isha: "20:58" },
    },
  ],
  aVerifier: [
    "L'en-tête du PDF indique « 1ère année ingénieur », alors que le fichier et le dossier S3 parlent de 2ᵉ année.",
    "Économie : deux professeurs différents mardi (Pr Snadrou Khalid) et mercredi (Pr El Bakkali Driss), et les deux séances sont notées 1/10.",
    "Mercredi 14 h – 18 h : case verte sans intitulé.",
    "Le système d'information hospitalier (SIH) n'apparaît pas cette semaine, alors que c'est un module à poids maximal.",
    "Coefficients et modalités d'évaluation à demander en première séance : la moyenne de l'app est une moyenne simple.",
    "Horaires de prière : namazvakti.com (Casablanca, Bourgogne), source non officielle — quelques minutes d'écart possibles avec le ministère des Habous.",
  ],
};

export const semaine2: SemaineProgramme = {
  numero: 2,
  lundi: "2026-09-21",
  source: "releve",
  libelle: "du 21 au 25 septembre",
  salle: "A402",
  groupe: "GR1",
  jours: [
    {
      date: "2026-09-21",
      seances: [
        seance("2026-09-21", 1, {
          moduleId: "python",
          intitule: INTITULE.python,
          prof: PR.kasmi,
          format: "Cours & TD & TP",
          numero: 3,
          total: 22,
          salle: "A402",
          debut: "08:15",
          fin: "10:05",
        }),
        seance("2026-09-21", 2, {
          moduleId: "datamining",
          intitule: INTITULE.datamining,
          prof: PR.bahassine,
          format: "Cours & TD & TP",
          numero: 2,
          total: 22,
          salle: "A402",
          debut: "10:20",
          fin: "12:05",
        }),
        seance("2026-09-21", 3, {
          moduleId: "ia",
          intitule: INTITULE.ia,
          prof: PR.benBouazza,
          format: "Cours & TD & TP",
          numero: 3,
          total: 22,
          salle: "A402",
          debut: "14:00",
          fin: "15:55",
        }),
        seance("2026-09-21", 4, {
          moduleId: "francais",
          intitule: INTITULE.francais,
          prof: PR.tallache,
          format: "Cours & TD",
          numero: 2,
          total: 10,
          salle: "A402",
          debut: "16:10",
          fin: "18:00",
        }),
      ],
      blocs: [
        rituel("2026-09-21"),
        hizb("2026-09-21"),
        {
          id: "2026-09-21-revision",
          type: "revision",
          debut: "18:30",
          fin: "19:30",
          titre: "Révision du jour",
          detail: "Python, Data Mining, IA et Français",
        },
        formation("2026-09-21"),
      ],
      prieres: { fajr: "05:55", shuruq: "07:13", dhuhr: "13:33", asr: "17:00", maghrib: "19:35", isha: "20:55" },
    },
    {
      date: "2026-09-22",
      seances: [
        seance("2026-09-22", 2, {
          moduleId: "eco",
          intitule: INTITULE.eco,
          prof: PR.snadrou,
          format: "Cours & TD",
          numero: 1,
          total: 10,
          salle: "Amphi D4",
          debut: "10:20",
          fin: "12:05",
        }),
        seance("2026-09-22", 3, {
          moduleId: "bdd",
          intitule: INTITULE.bdd,
          prof: PR.aitWakrime,
          format: "Cours & TD & TP",
          numero: 3,
          total: 22,
          salle: "A402",
          debut: "14:00",
          fin: "15:55",
        }),
        seance("2026-09-22", 4, {
          moduleId: "web",
          intitule: INTITULE.web,
          prof: PR.mahdaoui,
          format: "Cours & TD & TP",
          numero: 3,
          total: 22,
          salle: "A402",
          debut: "16:10",
          fin: "18:00",
        }),
      ],
      blocs: [
        rituel("2026-09-22"),
        hizb("2026-09-22"),
        {
          id: "2026-09-22-libre",
          type: "libre",
          debut: "08:15",
          fin: "10:05",
          titre: "Créneau libre",
          detail: "Préparation ou révision",
        },
        {
          id: "2026-09-22-revision",
          type: "revision",
          debut: "18:30",
          fin: "19:15",
          titre: "Révision du jour",
          detail: "EEE, BDD avancée et Dév. web",
        },
        formation("2026-09-22"),
      ],
      prieres: { fajr: "05:56", shuruq: "07:13", dhuhr: "13:32", asr: "16:59", maghrib: "19:34", isha: "20:54" },
    },
    {
      date: "2026-09-23",
      seances: [
        seance("2026-09-23", 2, {
          moduleId: "eco",
          intitule: INTITULE.eco,
          prof: PR.elBakkali,
          format: "Cours & TD",
          numero: 2,
          total: 11,
          salle: "Amphi D4",
          debut: "10:20",
          fin: "12:05",
        }),
      ],
      blocs: [
        rituel("2026-09-23"),
        hizb("2026-09-23"),
        {
          id: "2026-09-23-libre-matin",
          type: "libre",
          debut: "08:15",
          fin: "10:05",
          titre: "Créneau libre",
          detail: "Préparation économie",
        },
        {
          id: "2026-09-23-libre-aprem",
          type: "libre",
          debut: "14:00",
          fin: "18:00",
          titre: "Après-midi libre",
          detail: "Travail personnel et projets",
        },
        {
          id: "2026-09-23-revision",
          type: "revision",
          debut: "18:30",
          fin: "19:15",
          titre: "Révision du jour",
          detail: "Environnement Économique",
        },
        formation("2026-09-23"),
      ],
      prieres: { fajr: "05:57", shuruq: "07:14", dhuhr: "13:32", asr: "16:58", maghrib: "19:33", isha: "20:52" },
    },
    {
      date: "2026-09-24",
      seances: [
        seance("2026-09-24", 1, {
          moduleId: "bdd",
          intitule: INTITULE.bdd,
          prof: PR.aitWakrime,
          format: "Cours & TD & TP",
          numero: 4,
          total: 22,
          salle: "A402",
          debut: "08:15",
          fin: "10:05",
        }),
        seance("2026-09-24", 2, {
          moduleId: "ia",
          intitule: INTITULE.ia,
          prof: PR.benBouazza,
          format: "Cours & TD & TP",
          numero: 4,
          total: 22,
          salle: "A402",
          debut: "10:20",
          fin: "12:05",
        }),
        seance("2026-09-24", 3, {
          moduleId: "anglais",
          intitule: INTITULE.anglais,
          prof: PR.lamkhanter,
          format: "Cours & TD",
          numero: 2,
          total: 10,
          salle: "A402",
          debut: "14:00",
          fin: "15:55",
        }),
        seance("2026-09-24", 4, {
          moduleId: "web",
          intitule: INTITULE.web,
          prof: PR.mahdaoui,
          format: "Cours & TD & TP",
          numero: 4,
          total: 22,
          salle: "A402",
          debut: "16:10",
          fin: "18:00",
        }),
      ],
      blocs: [
        rituel("2026-09-24"),
        hizb("2026-09-24"),
        {
          id: "2026-09-24-revision",
          type: "revision",
          debut: "18:30",
          fin: "19:15",
          titre: "Révision du jour",
          detail: "BDD, IA, Anglais et Dév. web",
        },
        formation("2026-09-24"),
      ],
      prieres: { fajr: "05:57", shuruq: "07:15", dhuhr: "13:32", asr: "16:57", maghrib: "19:31", isha: "20:51" },
    },
    {
      date: "2026-09-25",
      seances: [
        seance("2026-09-25", 1, {
          moduleId: "python",
          intitule: INTITULE.python,
          prof: PR.kasmi,
          format: "Cours & TD & TP",
          numero: 4,
          total: 22,
          salle: "A402",
          debut: "08:15",
          fin: "10:05",
        }),
        seance("2026-09-25", 2, {
          moduleId: "datamining",
          intitule: INTITULE.datamining,
          prof: PR.bahassine,
          format: "Cours & TD & TP",
          numero: 3,
          total: 22,
          salle: "A402",
          debut: "10:20",
          fin: "12:05",
        }),
        seance("2026-09-25", 3, {
          moduleId: "sih",
          intitule: INTITULE.sih,
          prof: PR.saad,
          format: "Cours & TD & TP",
          numero: 1,
          total: 22,
          salle: "A402",
          debut: "14:00",
          fin: "15:55",
        }),
        seance("2026-09-25", 4, {
          moduleId: "sih",
          intitule: INTITULE.sih,
          prof: PR.saad,
          format: "Cours & TD & TP",
          numero: 2,
          total: 22,
          salle: "A402",
          debut: "16:10",
          fin: "18:00",
        }),
      ],
      blocs: [
        rituel("2026-09-25"),
        hizb("2026-09-25"),
        {
          id: "2026-09-25-bilan",
          type: "bilan",
          debut: "18:30",
          fin: "19:15",
          titre: "Bilan de la semaine 2",
          detail: "Synthèse de la semaine et points d'attention",
        },
        formation("2026-09-25"),
      ],
      prieres: { fajr: "05:58", shuruq: "07:15", dhuhr: "13:31", asr: "16:56", maghrib: "19:30", isha: "20:50" },
    },
    {
      date: "2026-09-26",
      seances: [],
      blocs: [
        rituel("2026-09-26"),
        hizb("2026-09-26", "07:15", "Révision des hizb appris"),
        {
          id: "2026-09-26-revision",
          type: "revision",
          debut: "09:00",
          fin: "12:00",
          titre: "Révision de fond",
          detail: "Consolidation des acquis de la semaine",
        },
        {
          id: "2026-09-26-formation",
          type: "formation",
          debut: "15:00",
          fin: "18:00",
          titre: "Jour tampon",
          detail: "Projets et formation think.anas",
        },
      ],
      prieres: { fajr: "05:59", shuruq: "07:16", dhuhr: "13:31", asr: "16:55", maghrib: "19:28", isha: "20:48" },
    },
  ],
  aVerifier: [
    "Économie : séance 1/10 avec Pr Snadrou (mardi) et séance 2/11 avec Pr El Bakkali (mercredi) en Amphi D4.",
    "Mercredi après-midi sans cours programmé.",
    "SIH (Système d'Information Hospitalier) : début du module vendredi avec 2 séances consécutives (1/22 et 2/22).",
  ],
};
