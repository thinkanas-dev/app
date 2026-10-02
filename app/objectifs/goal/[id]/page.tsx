"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ProgrammeRails } from "@/components/ProgrammeRails";
import { DossierAcademique } from "@/components/DossierAcademique";
import { GoalIcon } from "@/components/GoalIcon";
import { ProgressRing } from "@/components/ProgressRing";
import { StatusBadge } from "@/components/StatusBadge";
import { GoalNotes } from "@/components/GoalNotes";
import { HistoireMarocBook } from "@/components/HistoireMarocBook";
import { Breadcrumb } from "@/components/Breadcrumb";
import { InstagramIcon, TikTokIcon, LinkedInIcon } from "@/components/brand-icons";
import { daysUntil } from "@/components/Countdown";
import { IconArrowRight } from "@/components/icons";
import { findGoal, type BrandKey } from "@/content/objectifs";
import { useObjectifsState } from "@/lib/objectifs-store";
import { classifyStatus } from "@/lib/goal-status";
import { timeElapsedPct, PLAN_START, PLAN_END } from "@/lib/plan-timeline";

const backConfig = {
  milestone: { href: "/objectifs/progression", label: "Progression" },
  checklist: { href: "/objectifs/statuts", label: "Statuts" },
  countdown: { href: "/objectifs/echeances", label: "Échéances" },
};

const brandIcon: Record<BrandKey, (size?: number) => React.ReactNode> = {
  instagram: (size) => <InstagramIcon size={size} />,
  tiktok: (size) => <TikTokIcon size={size} />,
  linkedin: (size) => <LinkedInIcon size={size} />,
};

const checklistLabels = {
  "not-started": "Non commencé",
  "in-progress": "En cours",
  done: "Terminé",
} as const;

function formatNumber(n: number) {
  // Les entiers restent sans décimale ; 16,7 ne doit jamais s'afficher « 17 »
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MetricTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-hairline px-4 py-3">
      <p className="font-sans font-semibold text-lg text-ink tabular-nums leading-tight truncate">
        {value}
      </p>
      <p className="font-sans text-xs text-text-muted mt-0.5">{label}</p>
    </div>
  );
}

export default function GoalDossierPage() {
  const params = useParams<{ id: string }>();
  const goal = findGoal(params.id);
  const [activeBloc, setActiveBloc] = useState("socle");
  const [track, setTrack] = useState<"formation" | "contenu">("formation");
  const {
    state,
    hydrated,
    setMilestone,
    setChecklistStatus,
    setCountdownDate,
    toggleGoalStep,
    setGoalNotes,
  } = useObjectifsState();

  if (!goal) {
    return (
      <div className="rounded-lg border border-hairline bg-canvas p-6">
        <p className="font-sans text-sm text-ink mb-2">Objectif introuvable.</p>
        <Link href="/objectifs" className="font-sans text-sm text-brand hover:underline">
          Retour à la vue d&apos;ensemble
        </Link>
      </div>
    );
  }

  const elapsedPct = timeElapsedPct();
  const stepsDone = state.goalSteps[goal.id] ?? new Array(goal.actionSteps.length).fill(false);
  const doneStepCount = stepsDone.filter(Boolean).length;
  const stepPct = goal.actionSteps.length
    ? (doneStepCount / goal.actionSteps.length) * 100
    : 0;
  const back = backConfig[goal.kind];
  const image = "image" in goal ? goal.image : undefined;
  const logoKeys = "logoKeys" in goal ? goal.logoKeys : undefined;
  const accent = goal.kind === "milestone" ? goal.accent : "fig";

  // Valeurs propres au type d'objectif
  const current =
    goal.kind === "milestone"
      ? state.milestoneCurrent[goal.id] ?? (goal.id === "patrimoine" ? -0.62 : 0)
      : 0;
  const pct =
    goal.kind === "milestone" && goal.target > 0
      ? Math.min(100, Math.max(0, (current / goal.target) * 100))
      : goal.kind === "checklist"
        ? (state.checklistStatus[goal.id] ?? "not-started") === "done"
          ? 100
          : (state.checklistStatus[goal.id] ?? "not-started") === "in-progress"
            ? 50
            : 0
        : stepPct;

  const countdownDate =
    goal.kind === "countdown"
      ? goal.editable
        ? state.countdownDates[goal.id] ?? goal.date
        : goal.date
      : null;
  const remainingDays = countdownDate && hydrated ? daysUntil(countdownDate) : null;

  const status = classifyStatus(pct, elapsedPct);

  // Le suivi et le plan d'action : rendus dans la colonne de travail du
  // dossier quand il y en a un, pour que le rail de contexte reste collé
  // sur toute la hauteur de la page.
  const corps = (
      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <div className="flex flex-col gap-4">
          {image && (
            <div className="rounded-lg overflow-hidden border border-hairline aspect-[16/10] bg-surface-secondary">
              <Image
                src={image}
                alt={goal.label}
                width={800}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="rounded-lg border border-hairline bg-canvas p-5">
            <h2 className="font-sans font-semibold text-base text-ink mb-4">Mise à jour</h2>

            {goal.kind === "milestone" && (
              <div className="flex items-end gap-3 flex-wrap">
                <label className="flex-1 min-w-[160px]">
                  <span className="font-sans text-xs text-text-muted block mb-1.5">
                    Valeur atteinte ({goal.unit})
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={Number.isFinite(current) ? current : 0}
                    onChange={(e) => setMilestone(goal.id, Number(e.target.value))}
                    className="w-full bg-canvas text-ink font-sans text-sm tabular-nums rounded-md border border-hairline px-3 py-2 outline-none focus:border-brand transition-colors"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setMilestone(goal.id, goal.target)}
                  className="rounded-md bg-brand hover:bg-brand-hover text-canvas font-sans text-sm font-medium px-4 py-2 transition-colors"
                >
                  Marquer comme atteint
                </button>
                <button
                  type="button"
                  onClick={() => setMilestone(goal.id, 0)}
                  className="rounded-md border border-hairline text-text-muted hover:text-accent-deep hover:border-accent-deep font-sans text-sm px-4 py-2 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            )}

            {goal.kind === "checklist" && (
              <div className="flex flex-wrap gap-2">
                {(Object.keys(checklistLabels) as (keyof typeof checklistLabels)[]).map((key) => {
                  const active = (state.checklistStatus[goal.id] ?? "not-started") === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setChecklistStatus(goal.id, key)}
                      className={`rounded-md font-sans text-sm px-4 py-2 border transition-colors ${
                        active
                          ? "bg-brand text-canvas border-brand"
                          : "border-hairline text-text-muted hover:text-ink hover:border-text-secondary"
                      }`}
                    >
                      {checklistLabels[key]}
                    </button>
                  );
                })}
              </div>
            )}

            {goal.kind === "countdown" && countdownDate && (
              <div className="flex items-end gap-3 flex-wrap">
                <label className="flex-1 min-w-[160px]">
                  <span className="font-sans text-xs text-text-muted block mb-1.5">
                    Date visée
                  </span>
                  <input
                    type="date"
                    value={countdownDate}
                    disabled={!goal.editable}
                    onChange={(e) => setCountdownDate(goal.id, e.target.value)}
                    className="w-full bg-canvas text-ink font-sans text-sm rounded-md border border-hairline px-3 py-2 outline-none focus:border-brand transition-colors disabled:text-text-muted disabled:bg-surface-secondary"
                  />
                </label>
                {!goal.editable && (
                  <p className="font-sans text-xs text-text-muted pb-2">Date fixe</p>
                )}
              </div>
            )}

            <div className="mt-5">
              <p className="font-sans text-xs text-text-muted mb-2">Notes</p>
              <GoalNotes
                value={state.goalNotes[goal.id] ?? ""}
                onChange={(v) => setGoalNotes(goal.id, v)}
              />
            </div>
          </div>
        </div>

        {/* Plan d'action */}
        <div className="rounded-lg border border-hairline bg-canvas">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-hairline">
            <h2 className="font-sans font-semibold text-base text-ink">Plan d&apos;action</h2>
            <span className="font-sans text-xs text-text-muted tabular-nums">
              {hydrated ? doneStepCount : 0}/{goal.actionSteps.length} étapes
            </span>
          </div>

          <div className="px-5 pt-4">
            <div className="h-1.5 w-full rounded-full bg-surface-warm overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-300"
                style={{ width: `${hydrated ? stepPct : 0}%` }}
              />
            </div>
          </div>

          <div className="divide-y divide-hairline mt-2">
            {goal.actionSteps.map((step, i) => {
              const checked = stepsDone[i] ?? false;
              return (
                <label
                  key={i}
                  className="flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-surface-secondary/60 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleGoalStep(goal.id, i, goal.actionSteps.length)}
                    className="h-4 w-4 accent-brand shrink-0 mt-0.5"
                  />
                  <span
                    className={`font-sans text-sm leading-snug ${
                      checked ? "text-text-secondary line-through" : "text-ink"
                    }`}
                  >
                    {step}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: "Vue d'ensemble", href: "/objectifs" },
          { label: back.label, href: back.href },
          { label: goal.label },
        ]}
      />

      {/* En-tête du dossier */}
      <div className="rounded-lg border border-hairline bg-canvas p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div className="flex items-start gap-4 min-w-0">
            <GoalIcon id={goal.id} accent={accent} size="lg" />
            <div className="min-w-0">
              <h1 className="font-sans font-semibold text-xl text-ink leading-tight mb-2">
                {goal.label}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={status} />
                {logoKeys && (
                  <span className="flex items-center gap-1.5">
                    {logoKeys.map((key) => (
                      <span key={key} className="rounded-md overflow-hidden">
                        {brandIcon[key](20)}
                      </span>
                    ))}
                  </span>
                )}
                <span className="font-sans text-xs text-text-muted">
                  {back.label}
                </span>
              </div>
            </div>
          </div>

          <div className={`shrink-0 ${
            accent === "clay" ? "text-accent-clay"
            : accent === "sky" ? "text-accent-sky"
            : accent === "cactus" ? "text-accent-olive"
            : "text-accent-fig"
          }`}>
            <ProgressRing value={hydrated ? pct : null} size={64} stroke={6} />
          </div>
        </div>

        {/* Tuiles de métriques */}
        <div className="grid sm:grid-cols-3 gap-3">
          {goal.kind === "milestone" && (
            <>
              <MetricTile value={`${formatNumber(goal.target)} ${goal.unit}`} label="Cible" />
              <MetricTile
                value={hydrated ? `${formatNumber(current)} ${goal.unit}` : "—"}
                label="Atteint"
              />
              <MetricTile
                value={hydrated ? `${formatNumber(Math.max(0, goal.target - current))} ${goal.unit}` : "—"}
                label="Restant"
              />
            </>
          )}
          {goal.kind === "checklist" && (
            <>
              <MetricTile
                value={hydrated ? checklistLabels[state.checklistStatus[goal.id] ?? "not-started"] : "—"}
                label="Statut actuel"
              />
              <MetricTile
                value={hydrated ? `${doneStepCount}/${goal.actionSteps.length}` : "—"}
                label="Étapes franchies"
              />
              <MetricTile value={formatDate(PLAN_END)} label="Échéance du plan" />
            </>
          )}
          {goal.kind === "countdown" && (
            <>
              <MetricTile
                value={countdownDate ? formatDate(countdownDate) : "—"}
                label="Date visée"
              />
              <MetricTile
                value={remainingDays === null ? "—" : `${remainingDays} jours`}
                label="Temps restant"
              />
              <MetricTile value={formatDate(PLAN_START)} label="Départ du plan" />
            </>
          )}
        </div>
      </div>

      {goal.id === "histoire-maroc" && <HistoireMarocBook />}

      {/* Dossier académique : contexte fixe à gauche, surfaces de travail à droite */}
      {"modules" in goal && goal.modules ? (
        <DossierAcademique
          semestre={goal.modules.semestre}
          note={goal.modules.note}
          modules={goal.modules.liste}
          cible={goal.kind === "milestone" ? goal.target : 16.7}
        >
          {corps}
        </DossierAcademique>
      ) : (
        corps
      )}


      {/* Stratégie de contenu */}
      {"contentStrategy" in goal && goal.contentStrategy && (
        <div className="rounded-lg border border-hairline bg-canvas">
          <div className="px-5 py-4 border-b border-hairline">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-sans font-semibold text-base text-ink">Stratégie de contenu</h2>
              <span className="font-sans text-[11px] font-medium rounded-full bg-brand-soft text-brand px-2 py-0.5">
                37 jours
              </span>
            </div>
            <p className="font-sans text-sm text-text-muted">{goal.contentStrategy.theme}</p>
          </div>

          {/* Positionnement */}
          <div className="px-5 py-4 border-b border-hairline">
            <p className="font-sans text-xs font-medium text-text-muted mb-1.5">
              Pourquoi ce créneau
            </p>
            <p className="font-sans text-sm text-ink leading-relaxed">
              {goal.contentStrategy.positioning}
            </p>
          </div>

          {/* Piliers pondérés */}
          <div className="px-5 py-4 border-b border-hairline">
            <p className="font-sans text-xs font-medium text-text-muted mb-3">
              Piliers de contenu et répartition
            </p>
            <div className="flex flex-col gap-3">
              {goal.contentStrategy.pillars2.map((p) => (
                <div key={p.name}>
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <p className="font-sans text-sm font-medium text-ink">{p.name}</p>
                    <span className="font-sans text-xs font-semibold text-brand tabular-nums shrink-0">
                      {p.weight}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-warm overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${p.weight}%` }}
                    />
                  </div>
                  <p className="font-sans text-xs text-text-muted leading-relaxed">{p.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Plateformes */}
          <div className="grid sm:grid-cols-3 gap-3 px-5 py-4 border-b border-hairline">
            {goal.contentStrategy.platforms.map((pf) => (
              <div key={pf.name} className="rounded-md border border-hairline px-4 py-3">
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="font-sans font-semibold text-sm text-ink">{pf.name}</p>
                  <span className="font-sans text-[11px] text-text-muted">{pf.role}</span>
                </div>
                <p className="font-sans text-xs text-ink leading-relaxed mb-1.5">{pf.spec}</p>
                <p className="font-sans text-[11px] text-text-muted">{pf.pillars}</p>
              </div>
            ))}
          </div>

          {/* Séries récurrentes */}
          <div className="px-5 py-4 border-b border-hairline">
            <p className="font-sans text-xs font-medium text-text-muted mb-3">
              Séries récurrentes — ce qui construit la marque
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {goal.contentStrategy.series.map((s) => (
                <div
                  key={s.name}
                  className="flex items-baseline gap-2 rounded-md bg-surface-secondary px-3 py-2"
                >
                  <span className="font-sans text-sm font-medium text-ink shrink-0">
                    « {s.name} »
                  </span>
                  <span className="font-sans text-xs text-text-muted leading-snug">{s.pitch}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 px-5 py-4 border-b border-hairline">
            <div className="rounded-md bg-surface-secondary px-4 py-3">
              <p className="font-sans text-xs text-text-muted mb-1">Rythme</p>
              <p className="font-sans text-sm text-ink leading-snug">
                {goal.contentStrategy.programme.rythme}
              </p>
            </div>
            <div className="rounded-md bg-surface-secondary px-4 py-3">
              <p className="font-sans text-xs text-text-muted mb-1">Principe</p>
              <p className="font-sans text-sm text-ink leading-snug">
                {goal.contentStrategy.programme.principe}
              </p>
            </div>
          </div>

          {/* Programme hybride : visuel à gauche, sous-dossiers à droite */}
          {(() => {
            const programme = goal.contentStrategy.programme;
            const bloc =
              programme.blocs.find((b) => b.id === activeBloc) ?? programme.blocs[0];

            return (
              <div className="grid lg:grid-cols-[264px_minmax(0,1fr)] gap-4 px-5 py-5 border-b border-hairline items-start">
                <ProgrammeRails
                  blocs={programme.blocs}
                  activeId={bloc.id}
                  onSelect={setActiveBloc}
                />

                <div className="min-w-0">
                  {/* Sélecteur de sous-dossier */}
                  <div className="flex items-center gap-1 p-1 rounded-md bg-surface-secondary w-fit mb-4">
                    {(
                      [
                        { key: "formation", label: "Formation", hint: "ce que vous apprenez" },
                        { key: "contenu", label: "Contenu vidéo", hint: "ce que vous publiez" },
                      ] as const
                    ).map((t) => {
                      const on = track === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setTrack(t.key)}
                          className={`rounded px-3 py-1.5 font-sans text-sm transition-colors ${
                            on
                              ? t.key === "formation"
                                ? "bg-brand text-canvas font-medium"
                                : "bg-accent-fig text-canvas font-medium"
                              : "text-text-muted hover:text-ink"
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* En-tête du bloc sélectionné */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <h3 className="font-sans font-semibold text-base text-ink">{bloc.titre}</h3>
                      <span className="font-sans text-xs text-text-muted tabular-nums">
                        {bloc.jours}
                      </span>
                    </div>
                    <p className="font-sans text-sm text-text-muted leading-relaxed">{bloc.but}</p>
                  </div>

                  {/* Journées du bloc, filtrées par sous-dossier */}
                  <div className="rounded-md border border-hairline divide-y divide-hairline overflow-hidden">
                    {bloc.items.map((p) => (
                      <div
                        key={p.day}
                        className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 px-4 py-3 hover:bg-surface-secondary/60 transition-colors"
                      >
                        <span
                          className={`font-sans font-semibold text-xs rounded px-1.5 py-1 h-fit text-center tabular-nums ${
                            track === "formation"
                              ? "text-brand bg-brand-soft"
                              : "text-accent-fig bg-accent-fig/10"
                          }`}
                        >
                          J{p.day}
                        </span>

                        {track === "formation" ? (
                          <div className="min-w-0">
                            <p className="font-sans text-sm text-ink leading-snug mb-1">
                              {p.formation}
                            </p>
                            <p className="font-sans text-xs text-text-muted leading-snug">
                              <span className="text-text-secondary">Livrable — </span>
                              {p.livrable}
                            </p>
                          </div>
                        ) : (
                          <div className="min-w-0">
                            <p className="font-sans text-sm text-ink leading-snug mb-1">
                              {p.contenu}
                            </p>
                            <p className="font-sans text-xs text-text-muted leading-snug">
                              <span className="text-text-secondary">Format — </span>
                              {p.format}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="grid md:grid-cols-2 gap-4 px-5 py-4 border-t border-hairline">
            <div>
              <p className="font-sans text-xs font-medium text-text-muted mb-2">
                Généraliste + 9 spécialités
              </p>
              <ul className="flex flex-col gap-1.5">
                {goal.contentStrategy.specialties.map((s, i) => (
                  <li key={i} className="font-sans text-sm text-ink leading-snug flex gap-2">
                    <span className="text-text-secondary shrink-0">·</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-sans text-xs font-medium text-text-muted mb-2">
                Formations de fond
              </p>
              <ul className="flex flex-col gap-1.5">
                {goal.contentStrategy.formations.map((f, i) => (
                  <li key={i} className="font-sans text-sm text-ink leading-snug flex gap-2">
                    <span className="text-text-secondary shrink-0">·</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Pied de page */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href={back.href}
          className="font-sans text-sm text-text-muted hover:text-ink transition-colors"
        >
          ← Retour à {back.label}
        </Link>
        <Link
          href="/objectifs"
          className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-4 py-2 font-sans text-sm text-ink hover:border-brand hover:text-brand transition-colors"
        >
          Vue d&apos;ensemble
          <IconArrowRight width={13} height={13} />
        </Link>
      </div>
    </div>
  );
}
