import type { MessageIA } from "./routeur";

/*
 * Ce que l'IA sait faire sur une page lue dans le navigateur à intention.
 * Chaque tâche a sa consigne ; toutes partagent le même cadre : répondre en
 * français, s'appuyer sur le texte fourni, ne rien inventer.
 */

export const TACHES_IA = ["resumer", "idees", "expliquer", "quiz", "angle", "question", "fiche"] as const;

export type TacheIA = (typeof TACHES_IA)[number];

export type ContexteIA = {
  texte: string;
  titre?: string;
  url?: string;
  /** « Intelligence Artificielle », « Formation — jour 12 »… */
  intention?: string;
  question?: string;
};

/**
 * Environ 3 000 tokens : sous les plafonds par minute des niveaux gratuits les
 * plus serrés, pour qu'aucun fournisseur ne refuse d'emblée.
 */
export const LIMITE_TEXTE = 12_000;

const CADRE =
  "Tu es l'assistant d'étude d'Anas, étudiant ingénieur en 2ᵉ année de Génie des Données de Santé (UM6SS, Casablanca), " +
  "qui construit @think.anas, un média sur l'IA en santé en français. Réponds en français, avec précision et sans remplissage, " +
  "sans emoji. Appuie-toi uniquement sur le texte fourni : si une information n'y figure pas, dis-le clairement.";

const CONSIGNES: Record<TacheIA, (c: ContexteIA) => string> = {
  resumer: () => "Résume cette page en cinq phrases au plus, de la plus importante à la moins importante.",
  idees: () =>
    "Donne exactement trois idées à retenir. Une idée par ligne, chacune en une phrase complète qui se comprend seule. " +
    "Pas de numéro, pas de puce, pas de titre.",
  expliquer: (c) =>
    `Explique le cœur de cette page à un étudiant de S3${c.intention ? ` qui travaille « ${c.intention} »` : ""} : ` +
    "les définitions indispensables, puis un exemple concret, dans le domaine de la santé quand c'est pertinent.",
  quiz: () =>
    "Écris trois questions pour vérifier que la page est comprise, chacune suivie de sa réponse courte. " +
    "Format strict, une question par bloc : « Q : … » puis, à la ligne, « R : … ».",
  angle: () =>
    "Propose un angle de vidéo courte (Instagram, TikTok) pour le grand public marocain francophone, tiré de cette page : " +
    "une accroche d'une phrase, trois points à montrer, puis une idée reçue à démonter.",
  fiche: (c) =>
    `Ce texte réunit mes notes, mes questions et la transcription de mes vocaux pendant une séance de cours${
      c.intention ? ` du module « ${c.intention} »` : ""
    }${c.titre ? ` (« ${c.titre} »)` : ""}. ` +
    "Transforme-le en fiche de révision en quatre parties, dont les titres sont exactement, chacun seul sur sa ligne : " +
    "« L'essentiel » (trois phrases), « Notions » (une par ligne, sous la forme terme — définition), " +
    "« À vérifier » (ce qui paraît confus, incomplet ou peut-être mal compris dans les notes), " +
    "« Quiz » (trois blocs « Q : … » puis, à la ligne, « R : … »). Pas de markdown.",
  question: (c) => `Réponds à cette question en t'appuyant sur la page : ${c.question ?? ""}`,
};

export function messagesPour(tache: TacheIA, contexte: ContexteIA): MessageIA[] {
  const texte = contexte.texte.slice(0, LIMITE_TEXTE);
  const tronque = contexte.texte.length > LIMITE_TEXTE ? "\n[… texte tronqué]" : "";
  const entete = [contexte.titre && `Titre : ${contexte.titre}`, contexte.url && `Adresse : ${contexte.url}`]
    .filter(Boolean)
    .join("\n");

  return [
    { role: "system", content: CADRE },
    {
      role: "user",
      content: `${CONSIGNES[tache](contexte)}\n\n${entete}\n\n--- Texte de la page ---\n${texte}${tronque}`,
    },
  ];
}
