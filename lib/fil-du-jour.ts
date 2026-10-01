import type {
  BlocPerso,
  JourProgramme,
  ModuleId,
  Prieres,
  Seance,
  TypePerso,
} from "@/content/emploi-du-temps";

/*
 * Le fil du jour : la journée découpée en une suite continue de moments, sans
 * aucun trou, de la nuit à la nuit. Chaque moment a un début, une fin, une
 * nature et une consigne — c'est ce qui permet d'afficher « en cours », un
 * compte à rebours, puis de passer tout seul au moment suivant.
 *
 * Une prière qui tombe dans un creux devient un moment à part entière. Une
 * prière qui tombe pendant un cours devient une alerte (« Asr est entré, à
 * prier à la sortie ») sans couper le cours.
 *
 * Fonctions pures, dépendances passées en paramètre : ce fichier se teste seul.
 */

export type NatureMoment =
  | "priere"
  | "seance"
  | TypePerso
  | "pause"
  | "repas"
  | "preparation"
  | "temps-libre"
  | "nuit";

export type NomPriere = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export type Moment = {
  id: string;
  nature: NatureMoment;
  /** Horodatages en millisecondes */
  debut: number;
  fin: number;
  titre: string;
  detail: string;
  /** Ce qu'il y a à faire, maintenant */
  consigne: string;
  moduleId?: ModuleId;
  priere?: NomPriere;
};

export type AlertePriere = {
  id: string;
  instant: number;
  priere: NomPriere;
  titre: string;
  consigne: string;
  /** Moment pendant lequel la prière est entrée */
  momentId: string;
};

export type FilDuJour = { moments: Moment[]; alertes: AlertePriere[] };

export type DependancesFil = {
  /** Programme connu pour cette date, ou null (dimanche, jour hors semaines importées) */
  jourDe: (date: Date) => JourProgramme | null;
  prieresDe: (date: Date) => Prieres;
  nomModule: (id: ModuleId) => string;
};

const PRIERES: NomPriere[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const NOMS: Record<NomPriere, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const CONSIGNES_PRIERE: Record<NomPriere, string> = {
  fajr: "Priez Fajr, puis préparez-vous pour le rituel de 6 h.",
  dhuhr: "Priez Dhuhr, puis reprenez tranquillement.",
  asr: "Priez Asr, puis revenez à ce qui était prévu.",
  maghrib: "Priez Maghrib, puis dînez.",
  isha: "Priez Isha : la journée se referme.",
};

/** Heure de coucher du plan : au-delà, c'est la nuit */
export const COUCHER = 22 * 60 + 30;
/** Durée accordée à une prière qui a son propre moment (prière et dhikr) */
const DUREE_PRIERE = 20;

const deux = (n: number) => String(n).padStart(2, "0");
const cleDate = (d: Date) => `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`;
const enMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** 8 h 15 · 18 h */
export function heureLisible(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${deux(m)}`;
}

type Brut = Omit<Moment, "debut" | "fin"> & { debut: number; fin: number };

function consigneSeance(s: Seance): string {
  if (s.numero === 1) return "Première séance : notez comment le module est évalué et ses coefficients.";
  if (/TP/.test(s.format)) return "TP : ordinateur ouvert, environnement prêt, notes à reprendre ce soir.";
  return "Prenez des notes à retravailler ce soir.";
}

function consigneBloc(b: BlocPerso): string {
  if (b.type === "rituel") return "Lisez la citation et sa morale, puis retournez les dix mots.";
  if (b.type === "a-confirmer") return "Vérifiez ce créneau : cours, activité ou temps libre ?";
  return b.detail ?? "";
}

function momentsDuJour(date: Date, dep: DependancesFil): FilDuJour {
  const annee = date.getFullYear();
  const mois = date.getMonth();
  const jourDuMois = date.getDate();
  const base = new Date(annee, mois, jourDuMois).getTime();
  // Longueur réelle de la journée : 23 ou 25 heures les jours de changement d'heure
  const minutesJournee = Math.round((new Date(annee, mois, jourDuMois + 1).getTime() - base) / 60_000);
  const horodatage = (min: number) => base + min * 60_000;

  const cle = cleDate(date);
  const jour = dep.jourDe(date);
  const prieres = jour?.prieres ?? dep.prieresDe(date);
  const vendredi = date.getDay() === 5;

  // 1. Ce qui est prévu : cours et blocs du programme
  const principaux: Brut[] = [];
  if (jour) {
    for (const s of jour.seances) {
      principaux.push({
        id: s.id,
        nature: "seance",
        debut: enMinutes(s.debut),
        fin: enMinutes(s.fin),
        titre: s.intitule,
        detail: [s.prof, `séance ${s.numero}/${s.total}`, s.salle].filter(Boolean).join(" · "),
        consigne: consigneSeance(s),
        moduleId: s.moduleId,
      });
    }
    for (const b of jour.blocs) {
      principaux.push({
        id: b.id,
        nature: b.type,
        debut: enMinutes(b.debut),
        fin: enMinutes(b.fin),
        titre: b.titre,
        detail: b.detail ?? "",
        consigne: consigneBloc(b),
      });
    }
  } else {
    // Jour hors programme : le rituel et le hizb gardent leur place
    principaux.push(
      {
        id: `${cle}-rituel`,
        nature: "rituel",
        debut: 6 * 60,
        fin: 6 * 60 + 15,
        titre: "Rituel du jour",
        detail: "Citation, morale et dix mots",
        consigne: "Lisez la citation et sa morale, puis retournez les dix mots.",
      },
      {
        id: `${cle}-hizb`,
        nature: "hizb",
        debut: 6 * 60 + 15,
        fin: 7 * 60,
        titre: "Hizb",
        detail: "Mémorisation, avant le lever du soleil",
        consigne: "Mémorisation, avant le lever du soleil.",
      }
    );
  }
  principaux.sort((a, b) => a.debut - b.debut);

  // 2. Les prières : un moment dans un creux, une alerte pendant un bloc
  const alertes: AlertePriere[] = [];
  const momentsPriere: Brut[] = [];
  for (const p of PRIERES) {
    const t = enMinutes(prieres[p]);
    const nom = p === "dhuhr" && vendredi ? "Jumu'a" : NOMS[p];
    const pendant = principaux.find((b) => t >= b.debut && t < b.fin);
    const suivant = principaux.find((b) => b.debut > t);
    const place = suivant ? suivant.debut - t : DUREE_PRIERE;

    if (pendant || (suivant && place < 5)) {
      const hote = pendant ?? suivant!;
      alertes.push({
        id: `${cle}-${p}`,
        instant: horodatage(t),
        priere: p,
        titre: `${nom} est entré à ${heureLisible(t)}`,
        consigne: `À prier dès la fin, à ${heureLisible(hote.fin)}.`,
        momentId: hote.id,
      });
      continue;
    }

    momentsPriere.push({
      id: `${cle}-${p}`,
      nature: "priere",
      priere: p,
      debut: t,
      fin: t + Math.min(DUREE_PRIERE, place),
      titre: nom,
      detail: `Entrée à ${heureLisible(t)}`,
      consigne: p === "dhuhr" && vendredi ? "Prière du vendredi : partez à l'avance." : CONSIGNES_PRIERE[p],
    });
  }

  // 3. Tout assembler, puis nommer chaque creux
  const pleins = [...principaux, ...momentsPriere].sort((a, b) => a.debut - b.debut);
  const premierCours = jour?.seances.slice().sort((a, b) => enMinutes(a.debut) - enMinutes(b.debut))[0];
  const fajr = enMinutes(prieres.fajr);
  const moments: Moment[] = [];
  const ajouter = (b: Brut) => moments.push({ ...b, debut: horodatage(b.debut), fin: horodatage(b.fin) });

  const combler = (de: number, a: number) => {
    const bornes = [de, ...[fajr, COUCHER].filter((x) => x > de && x < a), a];
    for (let i = 0; i < bornes.length - 1; i++) {
      const d = bornes[i];
      const f = bornes[i + 1];
      if (f - d < 1) continue;
      const commun = { id: `${cle}-creux-${d}`, debut: d, fin: f, detail: `${heureLisible(d)} – ${heureLisible(f)}` };

      if (f <= fajr || d >= COUCHER) {
        ajouter({ ...commun, nature: "nuit", titre: "Nuit", consigne: "Dormez : le réveil de Fajr prépare le rituel." });
      } else if (d >= 11 * 60 + 30 && d < 13 * 60 + 30 && f - d >= 30 && f - d <= 150) {
        ajouter({ ...commun, nature: "repas", titre: "Déjeuner", consigne: "Mangez loin de l'écran : l'après-midi commence reposé." });
      } else if (f <= 9 * 60) {
        ajouter({
          ...commun,
          nature: "preparation",
          titre: "Préparation",
          consigne: premierCours
            ? `Petit-déjeuner ; premier cours : ${dep.nomModule(premierCours.moduleId)} à ${heureLisible(enMinutes(premierCours.debut))}, ${premierCours.salle}.`
            : "Petit-déjeuner, puis on lance la journée.",
        });
      } else if (f - d <= 30) {
        ajouter({ ...commun, nature: "pause", titre: "Pause", consigne: "Levez-vous, buvez de l'eau, regardez loin." });
      } else {
        ajouter({ ...commun, nature: "temps-libre", titre: "Temps libre", consigne: "À vous : repos, sport ou lecture choisie." });
      }
    }
  };

  let curseur = 0;
  for (const b of pleins) {
    if (b.debut > curseur) combler(curseur, b.debut);
    const debut = Math.max(b.debut, curseur);
    if (b.fin > debut) ajouter({ ...b, debut });
    curseur = Math.max(curseur, b.fin);
  }
  combler(curseur, minutesJournee);

  return { moments, alertes };
}

/**
 * Le fil de la veille, du jour et du lendemain, mis bout à bout : la nuit qui
 * traverse minuit ne fait qu'un seul moment, et le compte à rebours du soir
 * vise déjà le Fajr du lendemain.
 */
export function filAutourDe(date: Date, dep: DependancesFil): FilDuJour {
  const parties = [-1, 0, 1].map((k) =>
    momentsDuJour(new Date(date.getFullYear(), date.getMonth(), date.getDate() + k), dep)
  );

  const fusion: Moment[] = [];
  for (const m of parties.flatMap((p) => p.moments)) {
    const dernier = fusion[fusion.length - 1];
    if (dernier && dernier.nature === "nuit" && m.nature === "nuit" && dernier.fin === m.debut) {
      dernier.fin = m.fin;
    } else {
      fusion.push({ ...m });
    }
  }

  // Chaque nuit annonce le Fajr qui la termine
  fusion.forEach((m, i) => {
    if (m.nature !== "nuit") return;
    const fajr = fusion.slice(i + 1).find((x) => x.priere === "fajr");
    if (!fajr) return;
    const d = new Date(fajr.debut);
    m.detail = `Fajr à ${heureLisible(d.getHours() * 60 + d.getMinutes())}`;
  });

  return { moments: fusion, alertes: parties.flatMap((p) => p.alertes) };
}

export function positionDans(fil: FilDuJour, maintenant: Date) {
  const t = maintenant.getTime();
  const index = fil.moments.findIndex((m) => t >= m.debut && t < m.fin);
  if (index < 0) return null;
  const courant = fil.moments[index];
  return {
    courant,
    index,
    suivants: fil.moments.slice(index + 1),
    /** Prières entrées pendant le moment en cours */
    alertes: fil.alertes.filter((a) => a.momentId === courant.id && a.instant <= t),
  };
}
