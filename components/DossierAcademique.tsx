"use client";

import { ModulesRadar } from "./ModulesRadar";
import { JaugeVerticale } from "./JaugeVerticale";
import { CalendrierAnnee } from "./CalendrierAnnee";
import { ModulesS3 } from "./ModulesS3";
import { ProgrammePdfs } from "./ProgrammePdfs";
import { useObjectifsState } from "@/lib/objectifs-store";
import { daysUntil } from "./Countdown";
import { PLAN_END } from "@/lib/plan-timeline";
import { formatNote } from "@/lib/format";
import { moduleGradesWithAssessments } from "@/lib/module-grades";

type Module = { id: string; nom: string; lien: string; utilite: number };

/**
 * Deux zones : ce qui reste vrai (colonne fixe à gauche) et ce sur quoi on
 * travaille (colonne qui défile à droite). Le radar se déforme en direct
 * pendant qu'on saisit les notes en face.
 */
export function DossierAcademique({
  semestre,
  note,
  modules,
  cible,
  children,
}: {
  semestre: string;
  note: string;
  modules: Module[];
  cible: number;
  /** Tout le reste du dossier, pour que le rail reste collé jusqu'en bas */
  children?: React.ReactNode;
}) {
  const { state, hydrated } = useObjectifsState();
  const grades = moduleGradesWithAssessments(
    state.moduleGrades,
    state.moduleAssessmentGrades
  );

  const saisies = modules.filter((m) => typeof grades[m.id] === "number");
  const moyenne =
    saisies.length > 0
      ? saisies.reduce((s, m) => s + grades[m.id], 0) / saisies.length
      : 0;
  const ecart = moyenne - cible;
  const pret = hydrated && saisies.length > 0;
  const joursRestants = hydrated ? daysUntil(PLAN_END) : null;

  return (
    <div className="grid xl:grid-cols-[300px_minmax(0,1fr)] gap-4 items-start">
      {/* Colonne de contexte — collée à l'écran */}
      <aside className="xl:sticky xl:top-28 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto no-scrollbar flex flex-col gap-4">
        <div className="rounded-lg border border-hairline bg-canvas p-4">
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              Profil du semestre
            </p>
            <p className="font-sans text-[11px] text-text-secondary tabular-nums">
              {hydrated ? saisies.length : 0}/{modules.length}
            </p>
          </div>

          <ModulesRadar modules={modules} grades={grades} cible={cible} />

          {/* Piste de saisie : un segment par module, rempli à mesure */}
          <div className="flex gap-1 mt-4" aria-hidden>
            {modules.map((m) => {
              const g = grades[m.id];
              const saisi = typeof g === "number";
              return (
                <span
                  key={m.id}
                  title={m.nom}
                  className={`h-1 flex-1 rounded-full ${
                    !saisi
                      ? "bg-surface-warm"
                      : g >= cible
                        ? "bg-accent-olive"
                        : "bg-accent-deep"
                  }`}
                />
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-hairline">
            {pret ? (
              <div className="flex items-stretch gap-5">
                <JaugeVerticale valeur={moyenne} cible={cible} hauteur={164} />

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="font-sans font-semibold text-3xl text-ink tabular-nums leading-none mb-1">
                    {formatNote(moyenne)}
                  </p>
                  <p className="font-sans text-xs text-text-muted mb-3">
                    moyenne de {saisies.length} module{saisies.length > 1 ? "s" : ""} sur{" "}
                    {modules.length}
                  </p>

                  <span
                    className={`font-sans text-xs font-medium rounded-md px-2 py-1 w-fit tabular-nums ${
                      ecart >= 0
                        ? "bg-accent-cactus text-accent-olive"
                        : "bg-accent-coral text-accent-deep"
                    }`}
                  >
                    {ecart >= 0 ? "+" : ""}
                    {formatNote(ecart)} vs cible
                  </span>
                </div>
              </div>
            ) : (
              /* Rien n'est encore saisi : on annonce la cible et le geste à faire,
                 plutôt qu'une jauge vide et un tiret. */
              <div>
                <p className="font-sans text-sm font-medium text-ink mb-1">
                  Le semestre n&apos;a pas encore de forme
                </p>
                <p className="font-sans text-xs text-text-muted leading-relaxed">
                  Saisissez une note dans le tableau des modules : le radar se déforme ici même
                  et la jauge monte vers la cible.
                </p>
                <p className="font-sans text-xs text-ink tabular-nums mt-3">
                  Cible&nbsp;: <span className="font-semibold">{formatNote(cible)} / 20</span>
                </p>
              </div>
            )}
          </div>

          <p className="font-sans text-[11px] text-text-secondary tabular-nums mt-4 pt-3 border-t border-hairline">
            {joursRestants === null ? "—" : joursRestants} jours avant la fin du plan
          </p>
        </div>

        <div className="rounded-lg border border-hairline bg-canvas p-4">
          <CalendrierAnnee compact />
        </div>
      </aside>

      {/* Colonne de travail */}
      <div className="flex flex-col gap-4 min-w-0">
        <ModulesS3
          semestre={semestre}
          note={note}
          modules={modules}
          cible={cible}
          sansRadar
          sansSynthese
        />
        <ProgrammePdfs />
        {children}
      </div>
    </div>
  );
}
