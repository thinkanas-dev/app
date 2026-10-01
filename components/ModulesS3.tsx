"use client";

import { useState } from "react";
import { ProgressRing } from "./ProgressRing";
import { ModulesRadar } from "./ModulesRadar";
import { ModulesQuadrant } from "./ModulesQuadrant";
import { ModulesSimulateur } from "./ModulesSimulateur";
import { useObjectifsState } from "@/lib/objectifs-store";
import { formatNote } from "@/lib/format";
import { moduleGradesWithAssessments } from "@/lib/module-grades";

type Module = { id: string; nom: string; lien: string; utilite: number };

type Vue = "profil" | "notes" | "priorites" | "simulation";

const vues: { cle: Vue; label: string; question: string }[] = [
  { cle: "profil", label: "Profil", question: "À quoi ressemble mon profil ?" },
  { cle: "notes", label: "Notes", question: "Où en suis-je, module par module ?" },
  { cle: "priorites", label: "Priorités", question: "Sur quoi travailler en premier ?" },
  { cle: "simulation", label: "Simulation", question: "Que me reste-t-il à décrocher ?" },
];

export function ModulesS3({
  semestre,
  note,
  modules,
  cible,
  /** Le radar est affiché en permanence ailleurs : on le retire des onglets */
  sansRadar = false,
  sansSynthese = false,
}: {
  semestre: string;
  note: string;
  modules: Module[];
  cible: number;
  sansRadar?: boolean;
  sansSynthese?: boolean;
}) {
  const { state, hydrated, setModuleAssessmentGrade } = useObjectifsState();
  const [vue, setVue] = useState<Vue>(sansRadar ? "notes" : "profil");
  const grades = moduleGradesWithAssessments(
    state.moduleGrades,
    state.moduleAssessmentGrades
  );
  const vuesVisibles = sansRadar ? vues.filter((v) => v.cle !== "profil") : vues;

  const saisies = modules.filter((m) => typeof grades[m.id] === "number");
  const moyenne =
    saisies.length > 0
      ? saisies.reduce((sum, m) => sum + grades[m.id], 0) / saisies.length
      : 0;
  const auDessus = saisies.filter((m) => grades[m.id] >= cible).length;
  const ecart = moyenne - cible;
  const pret = hydrated && saisies.length > 0;

  return (
    <div className="rounded-lg border border-hairline bg-canvas">
      <div className="px-5 py-4 border-b border-hairline">
        <h2 className="font-sans font-semibold text-base text-ink mb-1">Modules du semestre</h2>
        <p className="font-sans text-sm text-text-muted">{semestre}</p>
      </div>

      {/* Synthèse — masquée quand elle est déjà présente dans la colonne fixe */}
      <div
        className={`items-center gap-6 px-5 py-5 border-b border-hairline flex-wrap ${
          sansSynthese ? "hidden" : "flex"
        }`}
      >
        <div
          className={
            !pret ? "text-text-secondary" : ecart >= 0 ? "text-accent-olive" : "text-accent-deep"
          }
        >
          <ProgressRing
            value={pret ? (moyenne / 20) * 100 : null}
            size={92}
            stroke={8}
            showLabel={false}
          />
        </div>

        <div className="flex-1 min-w-[220px]">
          <p className="font-sans font-semibold text-2xl text-ink tabular-nums leading-none mb-1">
            {pret ? formatNote(moyenne) : "—"}
            <span className="font-sans font-normal text-sm text-text-secondary ml-1">/ 20</span>
          </p>
          <p className="font-sans text-sm text-text-muted mb-3">
            Cible : {formatNote(cible)} / 20
            {pret && (
              <span
                className={`ml-2 font-medium rounded px-1.5 py-0.5 text-xs tabular-nums ${
                  ecart >= 0
                    ? "bg-accent-cactus text-accent-olive"
                    : "bg-accent-coral text-accent-deep"
                }`}
              >
                {ecart >= 0 ? "+" : ""}
                {formatNote(ecart)}
              </span>
            )}
          </p>
          <p className="font-sans text-xs text-text-muted tabular-nums">
            {hydrated ? saisies.length : 0} module{saisies.length > 1 ? "s" : ""} saisi
            {saisies.length > 1 ? "s" : ""} sur {modules.length} · {hydrated ? auDessus : 0}{" "}
            au-dessus de la cible
          </p>
        </div>
      </div>

      {/* Note stratégique */}
      <div className="px-5 py-3 border-b border-hairline bg-brand-soft/50">
        <p className="font-sans text-sm text-ink leading-snug">{note}</p>
      </div>

      {/* Sélecteur de vue */}
      <div className="px-5 pt-4">
        <div className="flex items-center gap-1 p-1 rounded-md bg-surface-secondary w-fit max-w-full overflow-x-auto no-scrollbar">
          {vuesVisibles.map((v) => (
            <button
              key={v.cle}
              type="button"
              onClick={() => setVue(v.cle)}
              className={`rounded px-3 py-1.5 font-sans text-sm whitespace-nowrap transition-colors ${
                vue === v.cle
                  ? "bg-canvas text-ink font-medium shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                  : "text-text-muted hover:text-ink"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="font-sans text-xs text-text-muted mt-2">
          {vues.find((v) => v.cle === vue)?.question}
        </p>
      </div>

      {/* Vue active */}
      <div className="px-5 py-5">
        {vue === "profil" && (
          <ModulesRadar modules={modules} grades={grades} cible={cible} />
        )}

        {vue === "priorites" && (
          <ModulesQuadrant modules={modules} grades={grades} cible={cible} />
        )}

        {vue === "simulation" && (
          <ModulesSimulateur modules={modules} grades={grades} cible={cible} />
        )}

        {vue === "notes" && (
          <>
            <p className="font-sans text-xs text-text-muted mb-3">
              Pondération : CC 20 %, TP 20 %, examen final 60 %. La moyenne est provisoire
              tant que toutes les notes ne sont pas saisies.
            </p>
            <div className="rounded-md border border-hairline divide-y divide-hairline overflow-hidden">
              {modules.map((m) => {
                const g = grades[m.id];
                const assessments = state.moduleAssessmentGrades[m.id] ?? {};
                const saisi = typeof g === "number";
                const atteint = saisi && g >= cible;

                return (
                  <div key={m.id} className="flex items-center gap-4 px-4 py-4 flex-wrap">
                    <span
                      className={`h-8 w-1 rounded-full shrink-0 ${
                        !saisi
                          ? "bg-surface-warm"
                          : atteint
                            ? "bg-accent-olive"
                            : "bg-accent-deep"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-sm font-medium text-ink leading-snug">
                        {m.nom}
                      </p>
                      {m.lien && (
                        <p className="font-sans text-xs text-brand mt-0.5 leading-snug">
                          ↳ {m.lien}
                        </p>
                      )}
                    </div>
                    <div className="flex items-end gap-2 shrink-0 flex-wrap">
                      {([
                        ["cc", "CC", 20],
                        ["tp", "TP", 20],
                        ["exam", "Examen final", 60],
                      ] as const).map(([key, label, weight]) => (
                        <label key={key} className="flex flex-col gap-1">
                          <span className="font-sans text-[11px] text-text-muted whitespace-nowrap">
                            {label} · {weight}%
                          </span>
                          <span className="flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={20}
                              step={0.25}
                              value={
                                typeof assessments[key] === "number" ? assessments[key] : ""
                              }
                              placeholder="—"
                              onChange={(e) =>
                                setModuleAssessmentGrade(
                                  m.id,
                                  key,
                                  e.target.value === "" ? null : Number(e.target.value)
                                )
                              }
                              className="w-[4.25rem] bg-canvas text-ink font-sans text-sm tabular-nums text-right rounded-md border border-hairline px-2 py-1.5 outline-none focus:border-brand transition-colors"
                              aria-label={`Note ${label} — ${m.nom}`}
                            />
                            <span className="font-sans text-xs text-text-secondary">/20</span>
                          </span>
                        </label>
                      ))}
                      <div className="min-w-[5rem] pl-2">
                        <p className="font-sans text-[11px] text-text-muted">Moyenne</p>
                        <p className="font-sans text-sm font-semibold text-ink tabular-nums">
                          {saisi ? formatNote(g) : "—"}
                          <span className="text-xs font-normal text-text-secondary"> /20</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
