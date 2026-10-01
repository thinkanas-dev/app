import type { ModuleId } from "@/content/emploi-du-temps";
import type { ElementTexte, PagePdf } from "./lecture-pdf";

/*
 * Analyse d'un emploi du temps UM6SS à partir de la page lue par pdf.js.
 *
 * Aucune grille n'est tracée : le texte de chaque case est centré, donc le
 * centre de chaque ligne suffit à la ranger. Les colonnes viennent des en-têtes
 * LUNDI… SAMEDI, les rangées des libellés de créneau (8H15--10H05…). Les
 * rectangles colorés servent à une seule chose : repérer les cases colorées qui
 * n'ont aucun texte, comme le bloc vert du mercredi de la semaine 1.
 *
 * Tout ce qui n'est pas certain devient un avertissement, affiché avant
 * l'enregistrement : l'import propose, vous validez.
 */

export type SeanceLue = {
  /** 0 = lundi */
  jourIndex: number;
  creneauIndex: number;
  /** null : module non reconnu, à choisir avant d'enregistrer */
  moduleId: ModuleId | null;
  intitule: string;
  /** Texte de la case tel qu'il figure dans le PDF */
  brut: string;
  prof: string;
  format: string;
  numero: number;
  total: number;
  salle: string;
  debut: string;
  fin: string;
};

export type CaseSansTexte = { jourIndex: number; debut: string; fin: string; couleur: string };

export type EmploiDuTempsLu = {
  /** Lundi de la semaine, AAAA-MM-JJ */
  lundi: string | null;
  salle: string;
  groupe: string;
  niveau: string | null;
  semestre: number | null;
  creneaux: { debut: string; fin: string }[];
  seances: SeanceLue[];
  casesSansTexte: CaseSansTexte[];
  avertissements: string[];
  /** Renseignée quand le PDF n'a rien d'un emploi du temps reconnaissable */
  erreur: string | null;
};

const JOURS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
const JOURS_AFFICHES = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

const MOIS: Record<string, number> = {
  JANVIER: 0, JANUARY: 0, FEVRIER: 1, FEBRUARY: 1, MARS: 2, MARCH: 2,
  AVRIL: 3, APRIL: 3, MAI: 4, MAY: 4, JUIN: 5, JUNE: 5,
  JUILLET: 6, JULY: 6, AOUT: 7, AUGUST: 7, SEPTEMBRE: 8, SEPTEMBER: 8,
  OCTOBRE: 9, OCTOBER: 9, NOVEMBRE: 10, NOVEMBER: 10, DECEMBRE: 11, DECEMBER: 11,
};

/** L'ordre compte : le premier motif qui correspond l'emporte. */
export const MODULES_RECONNUS: { id: ModuleId; court: string; motif: RegExp; intitule: string }[] = [
  { id: "sih", court: "SIH", motif: /SYSTEME D.INFORMATION|HOSPITALIER|\bSIH\b/, intitule: "Système d'Information Hospitalier et Santé Digital" },
  { id: "datamining", court: "Data Mining", motif: /DATA\s*MINING|ANALYSE DE DONNEES/, intitule: "DATA Mining et analyse de données — Techniques et Applications Médicales" },
  { id: "bdd", court: "BDD avancée", motif: /BASES?\s+DE\s+DONNEES/, intitule: "Bases de Données Avancée" },
  { id: "python", court: "Python", motif: /PYTHON/, intitule: "Programmation Avancée en Python" },
  { id: "ia", court: "IA", motif: /INTELLIGENCE\s+ARTIFICIELLE|\bIA\b/, intitule: "Intelligence Artificielle" },
  { id: "web", court: "Dév. web", motif: /DEVELOPPEMENT\s+WEB|\bWEB\b/, intitule: "Développement web" },
  { id: "eco", court: "Économie", motif: /ENVIRONNEMENT|ECONOMIQUE|\bEEE\b/, intitule: "Environnement Économique d'Entreprise (EEE)" },
  { id: "anglais", court: "Anglais", motif: /ANGLAIS|ENGLISH/, intitule: "Anglais" },
  { id: "francais", court: "Français", motif: /FRANCAIS/, intitule: "Français" },
];

/** Majuscules, sans accents, apostrophes et espaces unifiés : la base de toute comparaison. */
export function normaliser(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

const centreX = (t: ElementTexte) => t.x + t.largeur / 2;
const centreY = (t: ElementTexte) => t.y - t.hauteur / 2;

function plusProche(valeur: number, centres: number[]): number {
  let meilleur = 0;
  for (let i = 1; i < centres.length; i++) {
    if (Math.abs(valeur - centres[i]) < Math.abs(valeur - centres[meilleur])) meilleur = i;
  }
  return meilleur;
}

const deuxChiffres = (n: number) => String(n).padStart(2, "0");

function lireCreneau(texte: string): { debut: string; fin: string } | null {
  const m = normaliser(texte)
    .replace(/\s/g, "")
    .match(/^(\d{1,2})H(\d{2})?-{1,3}(\d{1,2})H(\d{2})?$/);
  if (!m) return null;
  return {
    debut: `${deuxChiffres(+m[1])}:${m[2] ?? "00"}`,
    fin: `${deuxChiffres(+m[3])}:${m[4] ?? "00"}`,
  };
}

/** « 08:15 » → « 8 h 15 », « 14:00 » → « 14 h » */
function heureLisible(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return m === 0 ? `${h} h` : `${h} h ${deuxChiffres(m)}`;
}

const jourLisible = (j: number) => JOURS_AFFICHES[j].charAt(0).toUpperCase() + JOURS_AFFICHES[j].slice(1);

function enTitre(s: string): string {
  return s
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((morceau) => (/^\s+$|^-$/.test(morceau) ? morceau : morceau.charAt(0).toUpperCase() + morceau.slice(1)))
    .join("");
}

/** Regroupe les morceaux de texte d'une case en lignes, dans l'ordre de lecture. */
function lignesDeCase(textes: ElementTexte[]): string[] {
  const tries = [...textes].sort((a, b) => a.y - b.y || a.x - b.x);
  const lignes: { y: number; morceaux: ElementTexte[] }[] = [];
  for (const t of tries) {
    const derniere = lignes[lignes.length - 1];
    if (derniere && Math.abs(derniere.y - t.y) < 2) derniere.morceaux.push(t);
    else lignes.push({ y: t.y, morceaux: [t] });
  }
  return lignes.map((l) =>
    l.morceaux
      .sort((a, b) => a.x - b.x)
      .map((m) => m.texte.trim())
      .join(" ")
      .replace(/\s+/g, " ")
  );
}

const FRACTION = /(\d{1,2})\s*\/\s*(\d{1,2})/g;

function lireCase(lignes: string[], salleParDefaut: string) {
  const normes = lignes.map(normaliser);
  const tout = normes.join(" ");

  const fractions = [...tout.matchAll(FRACTION)];
  const fraction = fractions.length > 0 ? fractions[fractions.length - 1] : null;

  const amphi = tout.match(/AMPHI(?:THEATRE)?\s*([A-Z0-9]+)/);
  const salleCase = tout.match(/\bSALLE\s*:?\s*([A-Z0-9]+)/);
  const salle = amphi ? `Amphi ${amphi[1]}` : salleCase ? salleCase[1] : salleParDefaut;

  const estFormat = (l: string) =>
    /\b(COURS|TD|TP)\b/.test(l) || /\d{1,2}\s*\/\s*\d{1,2}/.test(l) || /^AMPHI/.test(l);

  const iProf = normes.findIndex((l) => /^(PR|PROF|PROFESSEUR)\.?\s/.test(l));
  const iFormat = normes.findIndex((l, i) => i > iProf && estFormat(l));

  const finTitre = iProf >= 0 ? iProf : iFormat >= 0 ? iFormat : normes.length;
  const titre = lignes.slice(0, finTitre).join(" ").trim();

  let prof = "";
  if (iProf >= 0) {
    const finProf = iFormat >= 0 ? iFormat : normes.length;
    const nom = lignes
      .slice(iProf, finProf)
      .join(" ")
      .replace(/^\s*(PR|PROF|PROFESSEUR)\.?\s+/i, "");
    prof = `Pr ${enTitre(nom)}`;
  }

  let format = "";
  if (iFormat >= 0) {
    format = normes[iFormat]
      .replace(FRACTION, " ")
      .replace(/AMPHI\S*\s*[A-Z0-9]+/g, " ")
      .replace(/:/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((mot) => (mot === "COURS" ? "Cours" : mot))
      .join(" ");
  }

  return {
    titre,
    prof,
    format,
    fraction: fraction ? { numero: Number(fraction[1]), total: Number(fraction[2]) } : null,
    salle,
  };
}

function cleDate(d: Date): string {
  return `${d.getFullYear()}-${deuxChiffres(d.getMonth() + 1)}-${deuxChiffres(d.getDate())}`;
}

export function lireEmploiDuTemps(page: PagePdf): EmploiDuTempsLu {
  const avertissements: string[] = [];
  const echec = (erreur: string): EmploiDuTempsLu => ({
    lundi: null,
    salle: "",
    groupe: "",
    niveau: null,
    semestre: null,
    creneaux: [],
    seances: [],
    casesSansTexte: [],
    avertissements,
    erreur,
  });

  if (page.nombrePages > 1) {
    avertissements.push(`Le PDF contient ${page.nombrePages} pages : seule la première a été lue.`);
  }

  // 1. Les colonnes, depuis les en-têtes de jours
  const entetes = JOURS.map((jour) => page.textes.find((t) => normaliser(t.texte) === jour));
  const presents = entetes
    .map((t, i) => (t ? { t, i } : null))
    .filter((x): x is { t: ElementTexte; i: number } => x !== null);

  if (presents.length < 5) {
    return echec(
      "Les jours de la semaine (LUNDI, MARDI…) sont introuvables : ce PDF ne ressemble pas à l'emploi du temps habituel."
    );
  }

  const premier = presents[0];
  const dernier = presents[presents.length - 1];
  const pasX = (centreX(dernier.t) - centreX(premier.t)) / (dernier.i - premier.i);
  // Un en-tête illisible est reconstitué à pas constant
  const centresJours = JOURS.map((_, i) => {
    const t = entetes[i];
    return t ? centreX(t) : centreX(premier.t) + (i - premier.i) * pasX;
  });
  const yEntetes = Math.max(...presents.map((p) => p.t.y));

  // 2. Les rangées, depuis les libellés de créneau
  const creneauxLus = page.textes
    .map((t) => ({ t, c: lireCreneau(t.texte) }))
    .filter((x): x is { t: ElementTexte; c: { debut: string; fin: string } } => x.c !== null && x.t.y > yEntetes)
    .sort((a, b) => a.t.y - b.t.y);

  if (creneauxLus.length === 0) {
    return echec("Aucun créneau horaire (du type 8H15--10H05) n'a été trouvé dans la grille.");
  }

  const creneaux = creneauxLus.map((x) => x.c);
  const centresCreneaux = creneauxLus.map((x) => centreY(x.t));
  const pasY =
    centresCreneaux.length > 1
      ? (centresCreneaux[centresCreneaux.length - 1] - centresCreneaux[0]) / (centresCreneaux.length - 1)
      : 90;

  const caseDe = (x: number, y: number) => {
    const j = plusProche(x, centresJours);
    const k = plusProche(y, centresCreneaux);
    if (Math.abs(x - centresJours[j]) > pasX / 2 || Math.abs(y - centresCreneaux[k]) > pasY / 2) return null;
    return { j, k };
  };

  // 3. L'en-tête du document
  const hautDePage = page.textes.filter((t) => t.y < yEntetes - 1);
  const trouverEnTete = (motif: RegExp) => {
    for (const t of hautDePage) {
      const m = normaliser(t.texte).match(motif);
      if (m) return { t, m };
    }
    return null;
  };

  const salleTrouvee = trouverEnTete(/SALLE\s*:?\s*([A-Z0-9-]+)/);
  const salle = salleTrouvee ? salleTrouvee.m[1] : "";
  if (!salle) avertissements.push("Salle principale introuvable dans l'en-tête.");

  const groupeTrouve = page.textes.find((t) => /^GR\s*\d+$/.test(normaliser(t.texte)));
  const groupe = groupeTrouve ? normaliser(groupeTrouve.texte).replace(/\s/g, "") : "";

  const niveauTrouve = trouverEnTete(/ANNEE/);
  const niveau = niveauTrouve ? niveauTrouve.t.texte.trim() : null;
  if (niveau && !/2\s*(E|EME)?\s*ANNEE|DEUXIEME ANNEE/.test(normaliser(niveau))) {
    avertissements.push(`L'en-tête indique « ${niveau} » : vérifier l'année.`);
  }

  const semestreTrouve = trouverEnTete(/SEMESTRE\s*(\d+)/);
  const semestre = semestreTrouve ? Number(semestreTrouve.m[1]) : null;

  let lundi: string | null = null;
  const semaine = trouverEnTete(/SEMAINE\s+DU\s+(\d{1,2})\s+AU\s+(\d{1,2})\s+([A-Z]+)\s+(\d{4})/);
  if (!semaine) {
    avertissements.push("Dates de la semaine introuvables dans l'en-tête : à saisir.");
  } else {
    const [, j1, j2, nomMois, an] = semaine.m;
    const moisFin = MOIS[nomMois];
    if (moisFin === undefined) {
      avertissements.push(`Mois non reconnu dans l'en-tête : « ${nomMois} ».`);
    } else {
      // « du 28 AU 2 OCTOBER » : le mois écrit est celui de la fin de semaine
      const moisDebut = Number(j1) > Number(j2) ? moisFin - 1 : moisFin;
      const debut = new Date(Number(an), moisDebut, Number(j1));
      if (debut.getDay() !== 1) {
        avertissements.push(`La semaine annoncée commence un ${JOURS_AFFICHES[(debut.getDay() + 6) % 7] ?? "dimanche"}, pas un lundi.`);
      }
      lundi = cleDate(debut);
    }
  }

  // 4. Le texte de la grille, rangé case par case
  const exclus = new Set<ElementTexte>([...presents.map((p) => p.t), ...creneauxLus.map((x) => x.t)]);
  const parCase = new Map<string, ElementTexte[]>();
  for (const t of page.textes) {
    if (exclus.has(t) || t.y <= yEntetes + 1) continue;
    if (/^GR\s*\d+$/.test(normaliser(t.texte))) continue;
    const c = caseDe(centreX(t), centreY(t));
    if (!c) continue;
    const cle = `${c.j}-${c.k}`;
    parCase.set(cle, [...(parCase.get(cle) ?? []), t]);
  }

  const seances: SeanceLue[] = [];
  for (const [cle, textes] of parCase) {
    const [j, k] = cle.split("-").map(Number);
    const lignes = lignesDeCase(textes);
    const lu = lireCase(lignes, salle);
    const module = MODULES_RECONNUS.find((m) => m.motif.test(normaliser(lu.titre)));
    const ou = `${jourLisible(j)} ${heureLisible(creneaux[k].debut)}`;

    if (!module) avertissements.push(`${ou} : module non reconnu (« ${lu.titre || lignes.join(" ")} ») — à choisir.`);
    if (!lu.fraction) avertissements.push(`${ou} : numéro de séance introuvable (du type 1/22).`);
    if (!lu.prof) avertissements.push(`${ou} : professeur introuvable.`);

    seances.push({
      jourIndex: j,
      creneauIndex: k,
      moduleId: module?.id ?? null,
      intitule: module?.intitule ?? lu.titre,
      brut: lignes.join(" · "),
      prof: lu.prof,
      format: lu.format,
      numero: lu.fraction?.numero ?? 0,
      total: lu.fraction?.total ?? 0,
      salle: lu.salle,
      debut: creneaux[k].debut,
      fin: creneaux[k].fin,
    });
  }
  seances.sort((a, b) => a.jourIndex - b.jourIndex || a.creneauIndex - b.creneauIndex);

  // 5. Les cases colorées sans aucun texte
  const colorees = new Map<string, string>();
  for (const r of page.rectangles) {
    if (/^#?(fff|ffffff)$/i.test(r.couleur) || r.haut < yEntetes) continue;
    centresJours.forEach((cx, j) => {
      if (cx <= r.gauche + 2 || cx >= r.droite - 2) return;
      centresCreneaux.forEach((cy, k) => {
        if (cy <= r.haut + 2 || cy >= r.bas - 2) return;
        const cle = `${j}-${k}`;
        if (!parCase.has(cle)) colorees.set(cle, r.couleur);
      });
    });
  }

  const casesSansTexte: CaseSansTexte[] = [];
  for (let j = 0; j < JOURS.length; j++) {
    let courante: CaseSansTexte | null = null;
    for (let k = 0; k < creneaux.length; k++) {
      const couleur = colorees.get(`${j}-${k}`);
      if (!couleur) {
        courante = null;
      } else if (courante && courante.couleur === couleur) {
        courante.fin = creneaux[k].fin; // cases voisines de même couleur : un seul bloc
      } else {
        courante = { jourIndex: j, debut: creneaux[k].debut, fin: creneaux[k].fin, couleur };
        casesSansTexte.push(courante);
      }
    }
  }
  for (const c of casesSansTexte) {
    avertissements.push(
      `${jourLisible(c.jourIndex)} ${heureLisible(c.debut)} – ${heureLisible(c.fin)} : case colorée sans intitulé (cours, activité ou créneau libre ?).`
    );
  }

  // 6. Les incohérences qui méritent un coup d'œil
  const courtDe = (id: ModuleId) => MODULES_RECONNUS.find((m) => m.id === id)?.court ?? id;
  const connues = seances.filter((s): s is SeanceLue & { moduleId: ModuleId } => s.moduleId !== null);

  const parNumero = new Map<string, SeanceLue[]>();
  for (const s of connues) {
    if (s.numero === 0) continue;
    const cle = `${s.moduleId}-${s.numero}`;
    parNumero.set(cle, [...(parNumero.get(cle) ?? []), s]);
  }
  for (const groupeSeances of parNumero.values()) {
    if (groupeSeances.length < 2) continue;
    const s = groupeSeances[0];
    const jours = groupeSeances.map((x) => JOURS_AFFICHES[x.jourIndex]).join(" et ");
    avertissements.push(`${courtDe(s.moduleId!)} : séance ${s.numero}/${s.total} notée ${groupeSeances.length} fois (${jours}).`);
  }

  const profsParModule = new Map<ModuleId, Set<string>>();
  for (const s of connues) {
    if (!s.prof) continue;
    profsParModule.set(s.moduleId, (profsParModule.get(s.moduleId) ?? new Set()).add(s.prof));
  }
  for (const [id, profs] of profsParModule) {
    if (profs.size > 1) avertissements.push(`${courtDe(id)} : professeurs différents selon les séances (${[...profs].join(", ")}).`);
  }

  if (seances.length > 0) {
    const absents = MODULES_RECONNUS.filter((m) => !connues.some((s) => s.moduleId === m.id));
    if (absents.length > 0) {
      avertissements.push(`Absent${absents.length > 1 ? "s" : ""} de cette semaine : ${absents.map((m) => m.court).join(", ")}.`);
    }
  } else {
    avertissements.push("Aucun cours trouvé dans la grille.");
  }

  return { lundi, salle, groupe, niveau, semestre, creneaux, seances, casesSansTexte, avertissements, erreur: null };
}
