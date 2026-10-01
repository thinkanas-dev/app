export type Priorite = "basse" | "normale" | "haute";
export type Repetition = "aucune" | "quotidienne" | "hebdomadaire" | "mensuelle";

export type TacheAtelier = {
  id: string;
  titre: string;
  notes: string;
  projet: string;
  echeance: string;
  heure: string;
  priorite: Priorite;
  repetition: Repetition;
  terminee: boolean;
  creeLe: string;
  termineeLe?: string;
};

export type HabitudeAtelier = {
  id: string;
  nom: string;
  objectifHebdo: number;
  couleur: string;
  heureRappel: string;
  jours: string[];
  creeLe: string;
};

export type EvenementAtelier = {
  id: string;
  titre: string;
  date: string;
  debut: string;
  fin: string;
  lieu: string;
  notes: string;
  repetition: Repetition;
  rappelMinutes: number;
  creeLe: string;
};

export type ObjectifAtelier = {
  id: string;
  titre: string;
  description: string;
  type: "nombre" | "liste" | "date";
  valeur: number;
  cible: number;
  unite: string;
  echeance: string;
  couleur: string;
  etapes: { id: string; texte: string; terminee: boolean }[];
  creeLe: string;
};

export type IndicateurAtelier = {
  id: string;
  nom: string;
  type: "nombre" | "case" | "duree" | "argent" | "note";
  unite: string;
  cible: number;
  couleur: string;
  entrees: { id: string; date: string; valeur: number; note: string }[];
  creeLe: string;
};

export type CaptureAtelier = {
  id: string;
  texte: string;
  type: "note" | "tache" | "idee" | "depense" | "lien";
  traitee: boolean;
  creeLe: string;
};

export type TransactionAtelier = {
  id: string;
  date: string;
  libelle: string;
  montant: number;
  type: "revenu" | "depense";
  categorie: string;
  note: string;
  creeLe: string;
};

export type SanteAtelier = {
  id: string;
  date: string;
  sommeil: number;
  energie: number;
  humeur: number;
  sportMinutes: number;
  eau: number;
  note: string;
  creeLe: string;
};

export type NoteJourAtelier = {
  id: string;
  date: string;
  priorites: string[];
  matin: string;
  soir: string;
  gratitude: string;
  creeLe: string;
};

export type AutomatisationAtelier = {
  id: string;
  nom: string;
  declencheur: "quotidien" | "hebdomadaire" | "echeance";
  heure: string;
  jourSemaine: number;
  action: "notification" | "creer-tache";
  message: string;
  active: boolean;
  derniereExecution?: string;
  creeLe: string;
};

export type WidgetAtelier = {
  id: string;
  type: "priorites" | "taches" | "habitudes" | "agenda" | "captures" | "finances" | "sante" | "objectifs";
  titre: string;
  visible: boolean;
  ordre: number;
};

export type EvaluationAtelier = {
  id: string;
  nom: string;
  poids: number;
  note: number | null;
};

export type ModuleAtelier = {
  id: string;
  nom: string;
  coefficient: number;
  evaluations: EvaluationAtelier[];
};

export type SemestreAtelier = {
  id: string;
  nom: string;
  modules: ModuleAtelier[];
  creeLe: string;
};

export type CollectionAtelier =
  | "taches"
  | "habitudes"
  | "evenements"
  | "objectifs"
  | "indicateurs"
  | "captures"
  | "transactions"
  | "sante"
  | "notesJour"
  | "automatisations"
  | "semestres";

export type ElementAtelier =
  | TacheAtelier
  | HabitudeAtelier
  | EvenementAtelier
  | ObjectifAtelier
  | IndicateurAtelier
  | CaptureAtelier
  | TransactionAtelier
  | SanteAtelier
  | NoteJourAtelier
  | AutomatisationAtelier
  | SemestreAtelier;

export type ElementCorbeille = {
  id: string;
  collection: CollectionAtelier;
  element: ElementAtelier;
  supprimeLe: string;
};

export type AtelierState = {
  taches: TacheAtelier[];
  habitudes: HabitudeAtelier[];
  evenements: EvenementAtelier[];
  objectifs: ObjectifAtelier[];
  indicateurs: IndicateurAtelier[];
  captures: CaptureAtelier[];
  transactions: TransactionAtelier[];
  sante: SanteAtelier[];
  notesJour: NoteJourAtelier[];
  automatisations: AutomatisationAtelier[];
  semestres: SemestreAtelier[];
  widgets: WidgetAtelier[];
  corbeille: ElementCorbeille[];
};

export const widgetsParDefaut: WidgetAtelier[] = [
  { id: "widget-priorites", type: "priorites", titre: "Mes 3 priorités", visible: true, ordre: 0 },
  { id: "widget-agenda", type: "agenda", titre: "Agenda du jour", visible: true, ordre: 1 },
  { id: "widget-taches", type: "taches", titre: "Tâches", visible: true, ordre: 2 },
  { id: "widget-habitudes", type: "habitudes", titre: "Habitudes", visible: true, ordre: 3 },
  { id: "widget-captures", type: "captures", titre: "Boîte de réception", visible: true, ordre: 4 },
  { id: "widget-finances", type: "finances", titre: "Finances", visible: true, ordre: 5 },
  { id: "widget-sante", type: "sante", titre: "Énergie et santé", visible: true, ordre: 6 },
  { id: "widget-objectifs", type: "objectifs", titre: "Objectifs personnels", visible: true, ordre: 7 },
];

export const atelierParDefaut: AtelierState = {
  taches: [],
  habitudes: [],
  evenements: [],
  objectifs: [],
  indicateurs: [],
  captures: [],
  transactions: [],
  sante: [],
  notesJour: [],
  automatisations: [],
  semestres: [],
  widgets: widgetsParDefaut,
  corbeille: [],
};

export function nouvelId(prefixe: string) {
  return `${prefixe}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function dateLocale(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function atelierFusionne(value?: Partial<AtelierState>): AtelierState {
  return {
    ...atelierParDefaut,
    ...(value ?? {}),
    widgets: value?.widgets?.length ? value.widgets : widgetsParDefaut,
    corbeille: value?.corbeille ?? [],
  };
}
