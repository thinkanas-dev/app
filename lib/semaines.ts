"use client";

import { useMemo } from "react";
import { semaine1, semaine2, type SemaineProgramme } from "@/content/emploi-du-temps";
import { useObjectifsState } from "./objectifs-store";

const AUCUNE: SemaineProgramme[] = [];

/**
 * Toutes les semaines connues, dans l'ordre : la semaine 1 et la semaine 2 relevées,
 * puis les semaines importées (dont la semaine 3 actuelle ajoutée par l'utilisateur).
 */
export function useSemaines(): SemaineProgramme[] {
  const { state, hydrated } = useObjectifsState();
  const importees = hydrated ? state.semainesImportees : AUCUNE;

  return useMemo(() => {
    const parLundi = new Map<string, SemaineProgramme>([
      [semaine1.lundi, semaine1],
      [semaine2.lundi, semaine2],
    ]);
    for (const s of importees) parLundi.set(s.lundi, s);
    return [...parLundi.values()].sort((a, b) => a.lundi.localeCompare(b.lundi));
  }, [importees]);
}
