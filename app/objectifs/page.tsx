"use client";

import Link from "next/link";
import { objectifsContent } from "@/content/objectifs";
import { journeyNodes } from "@/content/journey";
import { JourneyNode } from "@/components/JourneyNode";
import { GoalIcon } from "@/components/GoalIcon";
import { ProgressRing } from "@/components/ProgressRing";
import { TrajectoryChart } from "@/components/TrajectoryChart";
import { useObjectifsState } from "@/lib/objectifs-store";
import { classifyStatus, statusMeta } from "@/lib/goal-status";
import {
  daysElapsed,
  totalPlanDays,
  timeElapsedPct,
  PLAN_START,
  PLAN_END,
} from "@/lib/plan-timeline";
import { daysUntil } from "@/components/Countdown";
import { ArtCoran, ArtPriere, ArtHajj } from "@/components/goal-art";
import { IconChecklist, IconArrowUpRight, IconArrowRight, IconRefresh } from "@/components/icons";
import { RituelDuJour } from "@/components/RituelDuJour";
import { ProgrammeApercu } from "@/components/ProgrammeApercu";

function isoOf(d: Date) {
  return d.toISOString().slice(0, 10);
}

function computeStreak(dates: string[]): number {
  const set = new Set(dates);
  const cursor = new Date();
  if (!set.has(isoOf(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(isoOf(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  sub,
  pct,
  href,
  accent,
  art,
}: {
  label: string;
  value: string;
  sub: string;
  pct: number | null;
  href: string;
  accent: "clay" | "sky" | "cactus" | "fig";
  art: React.ReactNode;
}) {
  const ringColor = {
    clay: "text-accent-clay",
    sky: "text-accent-sky",
    cactus: "text-accent-olive",
    fig: "text-accent-fig",
  }[accent];

  return (
    <div className="rounded-lg border border-hairline bg-canvas p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="font-sans text-xs text-text-muted">{label}</p>
        <Link
          href={href}
          aria-label={`Ouvrir ${label}`}
          className="h-6 w-6 rounded-full bg-brand-soft text-brand flex items-center justify-center shrink-0 hover:bg-brand hover:text-canvas transition-colors"
        >
          <IconArrowUpRight width={11} height={11} />
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className={ringColor}>
          <ProgressRing value={pct} size={44} stroke={4} />
        </div>
        <div className="min-w-0">
          <p className="font-sans font-semibold text-xl text-ink tabular-nums leading-tight">
            {value}
            <span className="font-sans font-normal text-sm text-text-secondary ml-0.5">{sub}</span>
          </p>
          <div className="mt-0.5">{art}</div>
        </div>
      </div>
    </div>
  );
}

export default function ObjectifsOverviewPage() {
  const { state, hydrated } = useObjectifsState();
  const elapsedPct = timeElapsedPct();

  const streak = computeStreak(state.prayerDates);
  const hizbCount = state.hizbDone.length;
  const doneStatuts = objectifsContent.checklist.filter(
    (c) => (state.checklistStatus[c.id] ?? "not-started") === "done"
  ).length;

  const patrimoine = objectifsContent.milestones.find((m) => m.id === "patrimoine")!;
  const patrimoineNote = "note" in patrimoine ? patrimoine.note : "";
  const patrimoineCurrent = state.milestoneCurrent[patrimoine.id] ?? -0.62;
  const patrimoineRemaining = Math.max(0, patrimoine.target - patrimoineCurrent);

  const hajj = objectifsContent.countdowns[0];
  const hajjDays = hydrated ? daysUntil(hajj.date) : null;

  const programMilestone = objectifsContent.milestones.find((m) => m.id === "instagram-tiktok");
  const upcomingDays =
    programMilestone && "contentStrategy" in programMilestone
      ? (programMilestone.contentStrategy?.programme.blocs ?? [])
          .flatMap((b) =>
            b.items.map((item) => ({ ...item, domain: b.titre }))
          )
          .slice(0, 4)
      : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Le rituel ouvre la page : citation, morale, dix mots */}
      <RituelDuJour />

      {/* Le programme de la semaine : miniature, prochain cours, accès aux trois vues */}
      <ProgrammeApercu />

      {/* Row 1 : stats + objectifs suivis */}
      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 items-start">
        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <StatCard
              label="Mémorisation du Coran"
              value={hydrated ? String(hizbCount) : "—"}
              sub="/60 hizb"
              pct={hydrated ? (hizbCount / 60) * 100 : null}
              href="/objectifs/coran"
              accent="cactus"
              art={<ArtCoran width={18} height={18} className="text-accent-olive" />}
            />
            <StatCard
              label="Statuts terminés"
              value={hydrated ? String(doneStatuts) : "—"}
              sub={`/${objectifsContent.checklist.length}`}
              pct={hydrated ? (doneStatuts / objectifsContent.checklist.length) * 100 : null}
              href="/objectifs/statuts"
              accent="fig"
              art={<IconChecklist width={16} height={16} className="text-accent-fig" />}
            />
            <StatCard
              label="Constance en prière"
              value={hydrated ? String(streak) : "—"}
              sub=" jours"
              pct={hydrated ? (streak / objectifsContent.streak.recordTarget) * 100 : null}
              href="/objectifs/constance"
              accent="clay"
              art={<ArtPriere width={18} height={18} className="text-accent-clay" />}
            />
            <StatCard
              label="Hajj"
              value={hajjDays === null ? "—" : String(hajjDays)}
              sub=" jours"
              pct={hydrated ? elapsedPct : null}
              href="/objectifs/goal/hajj"
              accent="sky"
              art={<ArtHajj width={18} height={18} className="text-accent-sky" />}
            />
          </div>

          {/* Patrimoine + trajectoire */}
          <div className="rounded-lg border border-hairline bg-canvas p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <GoalIcon id="patrimoine" accent="clay" size="sm" />
                <div>
                  <h2 className="font-sans font-semibold text-base text-ink leading-tight">
                    Objectif financier
                  </h2>
                  <p className="font-sans text-xs text-text-muted">{patrimoineNote}</p>
                </div>
              </div>
              <Link
                href="/objectifs/goal/patrimoine"
                className="font-sans text-xs text-brand hover:underline shrink-0"
              >
                Détail
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 rounded-md border border-hairline bg-surface-secondary/40 p-3">
              <div className="min-w-0">
                <p className="font-sans text-xs text-text-muted mb-0.5 truncate">Objectif</p>
                <p className="font-sans font-semibold text-sm sm:text-base text-ink tabular-nums truncate">
                  {formatNumber(patrimoine.target)} $
                </p>
              </div>
              <div className="min-w-0">
                <p className="font-sans text-xs text-text-muted mb-0.5 truncate">Actuel</p>
                <p className="font-sans font-semibold text-sm sm:text-base text-ink tabular-nums truncate">
                  {hydrated ? formatNumber(patrimoineCurrent) : "—"} $
                </p>
              </div>
              <div className="min-w-0">
                <p className="font-sans text-xs text-text-muted mb-0.5 truncate">Restant</p>
                <p className="font-sans font-semibold text-sm sm:text-base text-accent-deep tabular-nums truncate">
                  {hydrated ? formatNumber(patrimoineRemaining) : "—"} $
                </p>
              </div>
            </div>

            <TrajectoryChart
              target={patrimoine.target}
              current={hydrated ? patrimoineCurrent : 0}
              elapsedPct={elapsedPct}
              unit="$"
            />
          </div>
        </div>

        {/* Objectifs suivis */}
        <div className="rounded-lg border border-hairline bg-canvas">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-hairline flex-wrap">
            <h2 className="font-sans font-semibold text-base text-ink">Objectifs suivis</h2>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-sans text-xs text-text-muted">
                <IconRefresh width={12} height={12} />
                Sauvegarde auto
              </span>
              <Link
                href="/objectifs/progression"
                className="inline-flex items-center gap-1 rounded-md bg-brand hover:bg-brand-hover text-canvas font-sans text-xs font-medium px-3 py-1.5 transition-colors"
              >
                Mettre à jour
              </Link>
            </div>
          </div>

          <div className="divide-y divide-hairline">
            {objectifsContent.milestones.map((m) => {
              const current = state.milestoneCurrent[m.id] ?? 0;
              const pct = Math.min(100, (current / m.target) * 100);
              const status = classifyStatus(pct, elapsedPct);
              const meta = statusMeta[status];
              return (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <GoalIcon id={m.id} accent={m.accent} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/objectifs/goal/${m.id}`}
                      className="font-sans text-sm font-medium text-ink hover:text-brand transition-colors block truncate"
                    >
                      {m.label}
                    </Link>
                    <p className="font-sans text-xs text-text-muted tabular-nums">
                      {hydrated ? formatNumber(current) : "—"} / {formatNumber(m.target)} {m.unit}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <div className="w-20 h-1.5 rounded-full bg-surface-warm overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand transition-[width] duration-300"
                        style={{ width: `${hydrated ? pct : 0}%` }}
                      />
                    </div>
                    <span className="font-sans text-xs text-text-muted tabular-nums w-9 text-right">
                      {hydrated ? Math.round(pct) : 0}%
                    </span>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 font-sans text-[11px] font-medium rounded-full px-2 py-1 ${meta.bgClass} ${meta.textClass}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
                    <span className="hidden md:inline">{meta.label}</span>
                  </span>
                  <Link
                    href={`/objectifs/goal/${m.id}`}
                    aria-label={`Ouvrir ${m.label}`}
                    className="h-7 w-7 rounded-md border border-hairline text-text-muted hover:text-brand hover:border-brand flex items-center justify-center shrink-0 transition-colors"
                  >
                    <IconArrowUpRight width={11} height={11} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2 : parcours + programme */}
      <div className="grid xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4 items-start">
        <div className="rounded-lg border border-hairline bg-canvas">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-hairline">
            <h2 className="font-sans font-semibold text-base text-ink">Le parcours</h2>
            <span className="font-sans text-xs text-text-muted tabular-nums">
              Jour {daysElapsed()} / {totalPlanDays()}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 p-5 pb-0">
            <div className="rounded-md border border-hairline p-3">
              <p className="font-sans text-xs text-text-muted mb-1">Point de départ</p>
              <p className="font-sans font-semibold text-sm text-ink">{formatDate(PLAN_START)}</p>
              <p className="font-sans text-xs text-text-muted mt-1">Lancement du plan</p>
            </div>
            <div className="rounded-md border border-hairline p-3">
              <p className="font-sans text-xs text-text-muted mb-1">Destination</p>
              <p className="font-sans font-semibold text-sm text-ink">{formatDate(PLAN_END)}</p>
              <p className="font-sans text-xs text-text-muted mt-1 tabular-nums">
                Hajj dans {hajjDays === null ? "—" : `${hajjDays} jours`}
              </p>
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap items-start gap-x-1 gap-y-5">
              {journeyNodes.map((node, i) => (
                <div key={node.id} className="flex items-start">
                  <JourneyNode node={node} />
                  {i < journeyNodes.length - 1 && (
                    <div aria-hidden className="w-4 md:w-6 h-16 flex items-center shrink-0">
                      <div className="w-full border-t border-dashed border-hairline" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Programme */}
        <div className="rounded-lg border border-hairline bg-canvas">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-hairline">
            <div className="flex items-center gap-2">
              <h2 className="font-sans font-semibold text-base text-ink">Programme</h2>
              <span className="font-sans text-[11px] font-medium rounded-full bg-brand-soft text-brand px-2 py-0.5">
                37 jours
              </span>
            </div>
            <Link
              href="/objectifs/goal/instagram-tiktok"
              aria-label="Ouvrir le programme complet"
              className="h-6 w-6 rounded-full bg-brand-soft text-brand flex items-center justify-center hover:bg-brand hover:text-canvas transition-colors"
            >
              <IconArrowRight width={12} height={12} />
            </Link>
          </div>

          <div className="divide-y divide-hairline">
            {upcomingDays.map((d) => (
              <div key={d.day} className="px-5 py-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-sans text-[11px] font-semibold text-brand bg-brand-soft rounded px-1.5 py-0.5 tabular-nums">
                    J{d.day}
                  </span>
                  <span className="font-sans text-[11px] text-text-muted uppercase tracking-wide">
                    {d.domain}
                  </span>
                </div>
                <p className="font-sans text-sm text-ink leading-snug mb-1">{d.formation}</p>
                <p className="font-sans text-xs text-text-muted leading-snug">{d.contenu}</p>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-hairline">
            <Link
              href="/objectifs/goal/instagram-tiktok"
              className="inline-flex items-center gap-1 font-sans text-xs text-brand hover:gap-2 transition-all"
            >
              Voir les 37 jours <IconArrowRight width={12} height={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
