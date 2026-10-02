"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { LangueCible } from "@/content/lexique";
import type { ModuleId, SemaineProgramme } from "@/content/emploi-du-temps";
import {
  atelierFusionne,
  atelierParDefaut,
  nouvelId as nouvelIdAtelier,
  type AtelierState,
  type CollectionAtelier,
  type ElementAtelier,
  type WidgetAtelier,
} from "./atelier";
import { createSupabaseBrowserClient } from "./supabase/client";

export type ChecklistStatus = "not-started" | "in-progress" | "done";
export type ModuleAssessment = "cc" | "tp" | "exam";
export type ModuleAssessmentGrades = Partial<Record<ModuleAssessment, number>>;

export type Profile = {
  name: string;
  handle: string;
  email: string;
  phone: string;
  photo: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
};

export type EtatRituel = {
  /** Langue visée par les dix mots du jour */
  langue: LangueCible;
  /** Heure à laquelle la citation du jour paraît */
  heure: number;
  /** Clés du lexique déjà acquises, par langue */
  motsAcquis: Record<string, string[]>;
  /** Jours où le rituel a été ouvert — alimente la série */
  jours: string[];
};

/** Pourquoi un onglet est ouvert : sans intention, pas d'onglet */
export type Intention = {
  type: "module" | "formation" | "video" | "libre";
  moduleId?: ModuleId;
  libelle: string;
};

/** Ce qu'on a retenu d'une page, rangé avec son intention */
export type CarteSavoir = {
  id: string;
  creeLe: string;
  url: string;
  titre: string;
  intention: Intention;
  idees: string[];
  note: string;
};

/** Le temps passé sur une page, pour le radar de dérive */
export type SessionLecture = {
  id: string;
  url: string;
  domaine: string;
  intention: Intention;
  debut: string;
  fin: string | null;
};

export type LectureLivre = {
  joursTermines: number[];
  morales: Record<string, string>;
  dates: Record<string, string>;
  souverainsTermines: number[];
  notesSouverains: Record<string, string>;
};

/** Ce qu'on a compris d'une séance, en un coup d'œil */
export type Comprehension = "clair" | "a-revoir" | "perdu";

export type QuestionProf = { id: string; texte: string; posee: boolean; creeLe: string };

/** Un vocal : le son vit dans IndexedDB, ici seulement sa trace */
export type VocalSeance = {
  id: string;
  creeLe: string;
  dureeMs: number;
  transcription: string;
  /** 56 niveaux de 0 à 1, pour dessiner l'onde sans relire le fichier */
  cretes: number[];
};

export type PhotoSeance = { id: string; creeLe: string; largeur: number; hauteur: number };

export type FicheSeanceIA = { texte: string; creeLe: string; fournisseur?: string };

/** Tout ce qu'on garde d'une séance de cours */
export type CarnetSeance = {
  moduleId: ModuleId;
  /** Jour de la séance, AAAA-MM-JJ */
  date: string;
  note: string;
  comprehension: Comprehension | null;
  questions: QuestionProf[];
  vocaux: VocalSeance[];
  photos: PhotoSeance[];
  fiche: FicheSeanceIA | null;
  majLe: string;
};

export function carnetVide(base: { moduleId: ModuleId; date: string }): CarnetSeance {
  return { ...base, note: "", comprehension: null, questions: [], vocaux: [], photos: [], fiche: null, majLe: "" };
}

export type ObjectifsState = {
  milestoneCurrent: Record<string, number>;
  prayerDates: string[];
  checklistStatus: Record<string, ChecklistStatus>;
  countdownDates: Record<string, string>;
  goalSteps: Record<string, boolean[]>;
  goalNotes: Record<string, string>;
  hizbDone: number[];
  /** Jour où chaque hizb a été marqué mémorisé (clé : numéro du hizb), pour la tapisserie */
  hizbDates: Record<string, string>;
  moduleGrades: Record<string, number>;
  /** Notes CC, TP et examen final par module, toutes sur 20. */
  moduleAssessmentGrades: Record<string, ModuleAssessmentGrades>;
  profile: Profile;
  rituel: EtatRituel;
  /** Séances de l'emploi du temps révisées le soir même */
  seancesRevisees: string[];
  /** Semaines importées depuis les PDF d'emploi du temps */
  semainesImportees: SemaineProgramme[];
  /** Le carnet du navigateur à intention */
  carnet: CarteSavoir[];
  lectures: SessionLecture[];
  /** Parcours de lecture et découvertes historiques. */
  lecturesLivres: Record<string, LectureLivre>;
  /** Carnets des séances de cours, par identifiant de séance */
  carnetsSeances: Record<string, CarnetSeance>;
  /** Couche personnelle entièrement configurable depuis l'Atelier. */
  atelier: AtelierState;
};

const STORAGE_KEY = "think-anas-objectifs-v1";
const CLOUD_SYNC_KEY = "think-anas-cloud-sync-v1";
let cloudSaveTimer: ReturnType<typeof setTimeout> | null = null;

function programmerSauvegardeCloud(state: ObjectifsState) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  if (cloudSaveTimer) clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const { error } = await supabase.from("user_state").upsert({ user_id: data.user.id, state });
    if (!error) window.localStorage.setItem(CLOUD_SYNC_KEY, new Date().toISOString());
  }, 700);
}

const defaultProfile: Profile = {
  name: "Anas Senhaji",
  handle: "@think.anas",
  email: "",
  phone: "",
  photo: "",
  instagram: "think.anas",
  tiktok: "think.anas",
  linkedin: "think.anas",
};

const defaultRituel: EtatRituel = {
  langue: "en",
  heure: 6,
  motsAcquis: {},
  jours: [],
};

export const SEANCES_BOUCLEES = [
  // Semaine 1 (du 14 au 18 septembre 2026)
  "2026-09-14-c1", "2026-09-14-c2", "2026-09-14-c3", "2026-09-14-c4",
  "2026-09-15-c2", "2026-09-15-c3", "2026-09-15-c4",
  "2026-09-16-c2",
  "2026-09-17-c2", "2026-09-17-c3", "2026-09-17-c4",
  "2026-09-18-c1", "2026-09-18-c2", "2026-09-18-c3",
  // Semaine 2 (du 21 au 25 septembre 2026)
  "2026-09-21-c1", "2026-09-21-c2", "2026-09-21-c3", "2026-09-21-c4",
  "2026-09-22-c2", "2026-09-22-c3", "2026-09-22-c4",
  "2026-09-23-c2",
  "2026-09-24-c1", "2026-09-24-c2", "2026-09-24-c3", "2026-09-24-c4",
  "2026-09-25-c1", "2026-09-25-c2", "2026-09-25-c3", "2026-09-25-c4",
];

const defaultState: ObjectifsState = {
  milestoneCurrent: { patrimoine: -0.62 },
  prayerDates: [],
  checklistStatus: {},
  countdownDates: {},
  goalSteps: {},
  goalNotes: {},
  hizbDone: [],
  hizbDates: {},
  moduleGrades: {},
  moduleAssessmentGrades: {},
  profile: defaultProfile,
  rituel: defaultRituel,
  seancesRevisees: SEANCES_BOUCLEES,
  semainesImportees: [],
  carnet: [],
  lectures: [],
  lecturesLivres: {},
  carnetsSeances: {},
  atelier: atelierParDefaut,
};

function normaliserState(parsed: Partial<ObjectifsState> | null | undefined): ObjectifsState {
  if (!parsed) return defaultState;
  try {
    const milestoneCurrent = {
      patrimoine: -0.62,
      ...(parsed.milestoneCurrent ?? {}),
    };
    if (parsed.milestoneCurrent?.patrimoine === undefined) {
      milestoneCurrent.patrimoine = -0.62;
    }
    return {
      ...defaultState,
      ...parsed,
      milestoneCurrent,
      seancesRevisees: Array.from(new Set([...SEANCES_BOUCLEES, ...(parsed.seancesRevisees ?? [])])),
      profile: { ...defaultProfile, ...(parsed.profile ?? {}) },
      rituel: { ...defaultRituel, ...(parsed.rituel ?? {}) },
      atelier: atelierFusionne(parsed.atelier),
    };
  } catch {
    return defaultState;
  }
}

function readStorage(): ObjectifsState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return normaliserState(JSON.parse(raw));
  } catch {
    return defaultState;
  }
}

function writeStorage(state: ObjectifsState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    void window.thinkAnas?.donnees?.sauvegarder(state).catch(() => undefined);
    programmerSauvegardeCloud(state);
  } catch {
    // localStorage unavailable (private browsing, quota) — state stays in-memory for this session
  }
}

/*
 * Une seule source de vérité pour toute l'application. Chaque composant qui
 * appelle useObjectifsState() lit et écrit le même objet et se redessine avec
 * les autres : saisir une note dans le tableau déforme le radar affiché à côté.
 * Avec un useState par composant, chacun n'aurait vu que sa propre copie.
 */
let sharedState: ObjectifsState = defaultState;
let sharedHydrated = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function hydrateOnce() {
  if (sharedHydrated) return;
  sharedState = readStorage();
  sharedHydrated = true;
  notify();
}

async function restaurerDepuisLeBureau() {
  if (typeof window === "undefined" || window.localStorage.getItem(STORAGE_KEY)) return;
  try {
    const sauvegarde = await window.thinkAnas?.donnees?.charger();
    if (!sauvegarde || window.localStorage.getItem(STORAGE_KEY)) return;
    sharedState = normaliserState(sauvegarde as Partial<ObjectifsState>);
    writeStorage(sharedState);
    notify();
  } catch {
    // Le stockage du navigateur reste disponible si la sauvegarde disque ne peut pas être lue.
  }
}

async function synchroniserDepuisLeCloud() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  try {
    const { data: utilisateur } = await supabase.auth.getUser();
    if (!utilisateur.user) return;
    const { data, error } = await supabase
      .from("user_state")
      .select("state, updated_at")
      .eq("user_id", utilisateur.user.id)
      .maybeSingle();
    if (error) return;

    const derniereSync = window.localStorage.getItem(CLOUD_SYNC_KEY) ?? "";
    if (data?.state && (!derniereSync || data.updated_at > derniereSync)) {
      sharedState = normaliserState(data.state as Partial<ObjectifsState>);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sharedState));
      window.localStorage.setItem(CLOUD_SYNC_KEY, data.updated_at);
      notify();
      return;
    }
    programmerSauvegardeCloud(sharedState);
  } catch {
    // Le mode local reste disponible hors connexion.
  }
}

/** Reprend la main quand un autre onglet modifie les mêmes données. */
function syncFromOtherTab(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  sharedState = readStorage();
  notify();
}

export function useObjectifsState() {
  const state = useSyncExternalStore(
    subscribe,
    () => sharedState,
    () => defaultState
  );
  const hydrated = useSyncExternalStore(
    subscribe,
    () => sharedHydrated,
    () => false
  );

  useEffect(() => {
    hydrateOnce();
    void restaurerDepuisLeBureau().then(synchroniserDepuisLeCloud);
    window.addEventListener("storage", syncFromOtherTab);
    return () => window.removeEventListener("storage", syncFromOtherTab);
  }, []);

  function setState(updater: (prev: ObjectifsState) => ObjectifsState) {
    sharedState = updater(sharedState);
    if (sharedHydrated) writeStorage(sharedState);
    notify();
  }

  function setMilestone(id: string, value: number) {
    setState((prev) => ({
      ...prev,
      milestoneCurrent: { ...prev.milestoneCurrent, [id]: value },
    }));
  }

  function togglePrayerToday() {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => {
      const has = prev.prayerDates.includes(today);
      return {
        ...prev,
        prayerDates: has
          ? prev.prayerDates.filter((d) => d !== today)
          : [...prev.prayerDates, today],
      };
    });
  }

  function setChecklistStatus(id: string, status: ChecklistStatus) {
    setState((prev) => ({
      ...prev,
      checklistStatus: { ...prev.checklistStatus, [id]: status },
    }));
  }

  function setCountdownDate(id: string, date: string) {
    setState((prev) => ({
      ...prev,
      countdownDates: { ...prev.countdownDates, [id]: date },
    }));
  }

  function toggleGoalStep(goalId: string, stepIndex: number, stepCount: number) {
    setState((prev) => {
      const current = prev.goalSteps[goalId] ?? new Array(stepCount).fill(false);
      const next = [...current];
      next[stepIndex] = !next[stepIndex];
      return { ...prev, goalSteps: { ...prev.goalSteps, [goalId]: next } };
    });
  }

  function setGoalNotes(goalId: string, notes: string) {
    setState((prev) => ({
      ...prev,
      goalNotes: { ...prev.goalNotes, [goalId]: notes },
    }));
  }

  /**
   * Saisir une note de module recalcule immédiatement la moyenne S3,
   * qui alimente la jauge « Moyenne académique ».
   */
  function setModuleGrade(moduleId: string, grade: number | null) {
    setState((prev) => {
      const grades = { ...prev.moduleGrades };
      if (grade === null || Number.isNaN(grade)) delete grades[moduleId];
      else grades[moduleId] = grade;

      const values = Object.values(grades);
      const moyenne =
        values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

      return {
        ...prev,
        moduleGrades: grades,
        milestoneCurrent: {
          ...prev.milestoneCurrent,
          moyenne: Math.round(moyenne * 100) / 100,
        },
      };
    });
  }

  function setModuleAssessmentGrade(
    moduleId: string,
    assessment: ModuleAssessment,
    grade: number | null
  ) {
    setState((prev) => {
      const moduleAssessments = { ...prev.moduleAssessmentGrades };
      const current = { ...(moduleAssessments[moduleId] ?? {}) };
      if (grade === null || Number.isNaN(grade)) delete current[assessment];
      else current[assessment] = grade;

      if (Object.keys(current).length === 0) delete moduleAssessments[moduleId];
      else moduleAssessments[moduleId] = current;

      const weights = { cc: 20, tp: 20, exam: 60 } as const;
      const weightedGrades = Object.entries(moduleAssessments).flatMap(([id, notes]) => {
        const components = (Object.keys(weights) as ModuleAssessment[]).filter(
          (key) => typeof notes[key] === "number"
        );
        if (components.length === 0) return [];
        const weightTotal = components.reduce((sum, key) => sum + weights[key], 0);
        const weightedTotal = components.reduce(
          (sum, key) => sum + notes[key]! * weights[key],
          0
        );
        return [weightedTotal / weightTotal];
      });
      const values = Object.entries(prev.moduleGrades)
        .filter(([id]) => !moduleAssessments[id])
        .map(([, value]) => value)
        .concat(weightedGrades);
      const moyenne =
        values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

      return {
        ...prev,
        moduleAssessmentGrades: moduleAssessments,
        milestoneCurrent: {
          ...prev.milestoneCurrent,
          moyenne: Math.round(moyenne * 100) / 100,
        },
      };
    });
  }

  function setLangueRituel(langue: LangueCible) {
    setState((prev) => ({ ...prev, rituel: { ...prev.rituel, langue } }));
  }

  function setHeureRituel(heure: number) {
    setState((prev) => ({ ...prev, rituel: { ...prev.rituel, heure } }));
  }

  /** Marque un mot acquis, ou le remet à réviser. */
  function basculerMotAcquis(langue: LangueCible, cle: string) {
    setState((prev) => {
      const actuels = prev.rituel.motsAcquis[langue] ?? [];
      const suivants = actuels.includes(cle)
        ? actuels.filter((c) => c !== cle)
        : [...actuels, cle];
      return {
        ...prev,
        rituel: {
          ...prev.rituel,
          motsAcquis: { ...prev.rituel.motsAcquis, [langue]: suivants },
        },
      };
    });
  }

  /** Enregistre que le rituel du jour a été ouvert — c'est ce qui fait la série. */
  function marquerJourRituel(cle: string) {
    setState((prev) =>
      prev.rituel.jours.includes(cle)
        ? prev
        : { ...prev, rituel: { ...prev.rituel, jours: [...prev.rituel.jours, cle] } }
    );
  }

  /** Ajoute une semaine importée, ou remplace celle qui commence le même lundi. */
  function enregistrerSemaine(semaine: SemaineProgramme) {
    setState((prev) => ({
      ...prev,
      semainesImportees: [
        ...prev.semainesImportees.filter((s) => s.lundi !== semaine.lundi),
        semaine,
      ].sort((a, b) => a.lundi.localeCompare(b.lundi)),
    }));
  }

  function supprimerSemaine(lundi: string) {
    setState((prev) => ({
      ...prev,
      semainesImportees: prev.semainesImportees.filter((s) => s.lundi !== lundi),
    }));
  }

  function ajouterCarte(carte: Omit<CarteSavoir, "id" | "creeLe">) {
    const id = `carte-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    setState((prev) => ({
      ...prev,
      carnet: [{ ...carte, id, creeLe: new Date().toISOString() }, ...prev.carnet],
    }));
  }

  function supprimerCarte(id: string) {
    setState((prev) => ({ ...prev, carnet: prev.carnet.filter((c) => c.id !== id) }));
  }

  /** Les 500 dernières lectures suffisent au radar : au-delà, on oublie les plus anciennes. */
  function ouvrirLecture(session: Omit<SessionLecture, "fin">) {
    setState((prev) => ({
      ...prev,
      lectures: [...prev.lectures.slice(-499), { ...session, fin: null }],
    }));
  }

  function fermerLecture(id: string) {
    const fin = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      lectures: prev.lectures.map((l) => (l.id === id && !l.fin ? { ...l, fin } : l)),
    }));
  }

  const lectureLivreVide = (): LectureLivre => ({
    joursTermines: [],
    morales: {},
    dates: {},
    souverainsTermines: [],
    notesSouverains: {},
  });

  function setMoraleLivre(livreId: string, jour: number, morale: string) {
    setState((prev) => {
      const lecture = prev.lecturesLivres[livreId] ?? lectureLivreVide();
      return {
        ...prev,
        lecturesLivres: {
          ...prev.lecturesLivres,
          [livreId]: { ...lecture, morales: { ...lecture.morales, [jour]: morale } },
        },
      };
    });
  }

  function basculerJourLivre(livreId: string, jour: number) {
    setState((prev) => {
      const lecture = prev.lecturesLivres[livreId] ?? lectureLivreVide();
      const termine = lecture.joursTermines.includes(jour);
      const dates = { ...lecture.dates };
      if (termine) delete dates[jour];
      else dates[jour] = new Date().toISOString();
      return {
        ...prev,
        lecturesLivres: {
          ...prev.lecturesLivres,
          [livreId]: {
            ...lecture,
            joursTermines: termine
              ? lecture.joursTermines.filter((item) => item !== jour)
              : [...lecture.joursTermines, jour].sort((a, b) => a - b),
            dates,
          },
        },
      };
    });
  }

  function setNoteSouverain(livreId: string, semaine: number, note: string) {
    setState((prev) => {
      const lecture = prev.lecturesLivres[livreId] ?? lectureLivreVide();
      return {
        ...prev,
        lecturesLivres: {
          ...prev.lecturesLivres,
          [livreId]: {
            ...lecture,
            notesSouverains: { ...lecture.notesSouverains, [semaine]: note },
          },
        },
      };
    });
  }

  function basculerSouverain(livreId: string, semaine: number) {
    setState((prev) => {
      const lecture = prev.lecturesLivres[livreId] ?? lectureLivreVide();
      const termine = lecture.souverainsTermines.includes(semaine);
      return {
        ...prev,
        lecturesLivres: {
          ...prev.lecturesLivres,
          [livreId]: {
            ...lecture,
            souverainsTermines: termine
              ? lecture.souverainsTermines.filter((item) => item !== semaine)
              : [...lecture.souverainsTermines, semaine].sort((a, b) => a - b),
          },
        },
      };
    });
  }

  /** Coche ou décoche une séance comme révisée à chaud. */
  function basculerSeanceRevisee(id: string) {
    setState((prev) => ({
      ...prev,
      seancesRevisees: prev.seancesRevisees.includes(id)
        ? prev.seancesRevisees.filter((s) => s !== id)
        : [...prev.seancesRevisees, id],
    }));
  }

  /** Modifie le carnet d'une séance, en le créant au premier usage. */
  function modifierCarnetSeance(
    id: string,
    base: { moduleId: ModuleId; date: string },
    modifier: (carnet: CarnetSeance) => CarnetSeance
  ) {
    setState((prev) => {
      const actuel = prev.carnetsSeances[id] ?? carnetVide(base);
      return {
        ...prev,
        carnetsSeances: { ...prev.carnetsSeances, [id]: { ...modifier(actuel), majLe: new Date().toISOString() } },
      };
    });
  }

  function setProfile(patch: Partial<Profile>) {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  }

  function toggleHizb(n: number) {
    setState((prev) => {
      const has = prev.hizbDone.includes(n);
      const hizbDone = has ? prev.hizbDone.filter((h) => h !== n) : [...prev.hizbDone, n];
      const hizbDates = { ...prev.hizbDates };
      if (has) delete hizbDates[n];
      else {
        const d = new Date();
        hizbDates[n] = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      }
      return {
        ...prev,
        hizbDone,
        hizbDates,
        milestoneCurrent: { ...prev.milestoneCurrent, hizb: hizbDone.length },
      };
    });
  }

  function ajouterAtelier(collection: CollectionAtelier, element: ElementAtelier) {
    setState((prev) => {
      const elements = prev.atelier[collection] as ElementAtelier[];
      return {
        ...prev,
        atelier: {
          ...prev.atelier,
          [collection]: [element, ...elements],
        },
      };
    });
  }

  function modifierAtelier(
    collection: CollectionAtelier,
    id: string,
    patch: Record<string, unknown>
  ) {
    setState((prev) => {
      const elements = prev.atelier[collection] as ElementAtelier[];
      return {
        ...prev,
        atelier: {
          ...prev.atelier,
          [collection]: elements.map((element) =>
            element.id === id ? ({ ...element, ...patch } as ElementAtelier) : element
          ),
        },
      };
    });
  }

  /** Retirer depuis l'Atelier reste récupérable : rien ne disparaît sans passer par la corbeille. */
  function archiverAtelier(collection: CollectionAtelier, id: string) {
    setState((prev) => {
      const elements = prev.atelier[collection] as ElementAtelier[];
      const element = elements.find((item) => item.id === id);
      if (!element) return prev;
      return {
        ...prev,
        atelier: {
          ...prev.atelier,
          [collection]: elements.filter((item) => item.id !== id),
          corbeille: [
            {
              id: nouvelIdAtelier("corbeille"),
              collection,
              element,
              supprimeLe: new Date().toISOString(),
            },
            ...prev.atelier.corbeille,
          ],
        },
      };
    });
  }

  function restaurerAtelier(corbeilleId: string) {
    setState((prev) => {
      const entree = prev.atelier.corbeille.find((item) => item.id === corbeilleId);
      if (!entree) return prev;
      const elements = prev.atelier[entree.collection] as ElementAtelier[];
      return {
        ...prev,
        atelier: {
          ...prev.atelier,
          [entree.collection]: [entree.element, ...elements],
          corbeille: prev.atelier.corbeille.filter((item) => item.id !== corbeilleId),
        },
      };
    });
  }

  function setWidgets(widgets: WidgetAtelier[]) {
    setState((prev) => ({
      ...prev,
      atelier: { ...prev.atelier, widgets },
    }));
  }

  function remplacerEtat(nouvelEtat: ObjectifsState) {
    setState(() => ({
      ...defaultState,
      ...nouvelEtat,
      profile: { ...defaultProfile, ...(nouvelEtat.profile ?? {}) },
      rituel: { ...defaultRituel, ...(nouvelEtat.rituel ?? {}) },
      atelier: atelierFusionne(nouvelEtat.atelier),
    }));
  }

  return {
    state,
    hydrated,
    setMilestone,
    togglePrayerToday,
    setChecklistStatus,
    setCountdownDate,
    toggleGoalStep,
    setGoalNotes,
    toggleHizb,
    setModuleGrade,
    setModuleAssessmentGrade,
    setProfile,
    setLangueRituel,
    setHeureRituel,
    basculerMotAcquis,
    marquerJourRituel,
    basculerSeanceRevisee,
    modifierCarnetSeance,
    enregistrerSemaine,
    supprimerSemaine,
    ajouterCarte,
    supprimerCarte,
    ouvrirLecture,
    fermerLecture,
    setMoraleLivre,
    basculerJourLivre,
    setNoteSouverain,
    basculerSouverain,
    ajouterAtelier,
    modifierAtelier,
    archiverAtelier,
    restaurerAtelier,
    setWidgets,
    remplacerEtat,
  };
}
