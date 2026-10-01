import type { CarnetSeance, Comprehension } from "@/lib/objectifs-store";

/*
 * Les outils du carnet de séance, leurs glyphes et leurs couleurs — partagés
 * par la barre flottante, le tiroir et les indices posés sur la partition.
 */

export type OutilSeance = "note" | "vocal" | "photos" | "questions" | "fiche";

export const OUTILS: { cle: OutilSeance; nom: string; aide: string }[] = [
  { cle: "note", nom: "Note", aide: "écrire ce qu’il faut retenir" },
  { cle: "vocal", nom: "Vocal", aide: "s’enregistrer, avec transcription" },
  { cle: "photos", nom: "Tableau", aide: "photographier le tableau ou une diapo" },
  { cle: "questions", nom: "Questions", aide: "à poser au prof la prochaine fois" },
  { cle: "fiche", nom: "Fiche", aide: "transformer ses traces en fiche de révision" },
];

export const COMPREHENSION: { cle: Comprehension; nom: string; couleur: string }[] = [
  { cle: "clair", nom: "Clair", couleur: "var(--color-accent-olive)" },
  { cle: "a-revoir", nom: "À revoir", couleur: "var(--color-soleil)" },
  { cle: "perdu", nom: "Perdu", couleur: "var(--color-accent-deep)" },
];

export function comptesCarnet(c?: CarnetSeance | null): Record<OutilSeance, number> {
  return {
    note: c?.note.trim() ? 1 : 0,
    vocal: c?.vocaux.length ?? 0,
    photos: c?.photos.length ?? 0,
    questions: c?.questions.filter((q) => !q.posee).length ?? 0,
    fiche: c?.fiche ? 1 : 0,
  };
}

export function Glyphe({ outil, taille = 16 }: { outil: OutilSeance | "comprehension" | "revisee"; taille?: number }) {
  const trait = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden>
      {outil === "note" && (
        <>
          <path d="M6 3h8l4 4v14H6z" {...trait} />
          <path d="M14 3v4h4M9 12h6M9 16h4" {...trait} />
        </>
      )}
      {outil === "vocal" && (
        <>
          <rect x="9" y="3" width="6" height="11" rx="3" {...trait} />
          <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" {...trait} />
        </>
      )}
      {outil === "photos" && (
        <>
          <rect x="3" y="5" width="18" height="13" rx="2" {...trait} />
          <path d="M6.5 15l3.2-3.2 2.8 2.8 2-2 3 3" {...trait} />
          <circle cx="15.5" cy="9" r="1.3" fill="currentColor" />
        </>
      )}
      {outil === "questions" && (
        <>
          <path d="M4 5h16v11h-9.5L6 19.5V16H4z" {...trait} />
          <path d="M10.2 8.9a1.9 1.9 0 1 1 2.7 1.7c-.6.3-.9.7-.9 1.3" {...trait} />
          <circle cx="12" cy="13.6" r="0.9" fill="currentColor" />
        </>
      )}
      {outil === "fiche" && (
        <>
          <rect x="7.5" y="3" width="12.5" height="15" rx="2" {...trait} />
          <path d="M4.5 7v12a2 2 0 0 0 2 2H16M11 8h5.5M11 11.5h5.5M11 15h3" {...trait} />
        </>
      )}
      {outil === "comprehension" && (
        <>
          <path d="M4 16.5a8 8 0 0 1 16 0" {...trait} />
          <path d="M12 16.5l3.6-4.6" {...trait} />
          <circle cx="12" cy="16.5" r="1.3" fill="currentColor" />
        </>
      )}
      {outil === "revisee" && (
        <>
          <circle cx="12" cy="12" r="8.5" {...trait} />
          <path d="M8.3 12.3l2.5 2.5 4.9-5.2" {...trait} />
        </>
      )}
    </svg>
  );
}
