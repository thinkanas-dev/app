"use client";

import { objectifsContent } from "@/content/objectifs";
import { ProgressRing } from "@/components/ProgressRing";
import { ArtPriere } from "@/components/goal-art";
import { useObjectifsState } from "@/lib/objectifs-store";

function isoOf(d: Date) {
  return d.toISOString().slice(0, 10);
}

function computeStreak(set: Set<string>): number {
  const cursor = new Date();
  if (!set.has(isoOf(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(isoOf(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function computeBestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const cur = new Date(sorted[i] + "T00:00:00");
    const diff = Math.round((cur.getTime() - prev.getTime()) / 86_400_000);
    run = diff === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

/** 12 semaines glissantes, alignées lundi → dimanche */
function buildWeeks(): string[][] {
  const today = new Date();
  const end = new Date(today);
  // fin de la semaine courante (dimanche)
  const dow = (end.getDay() + 6) % 7; // lundi = 0
  end.setDate(end.getDate() + (6 - dow));

  const weeks: string[][] = [];
  for (let w = 11; w >= 0; w--) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(end);
      day.setDate(end.getDate() - (w * 7 + (6 - d)));
      week.push(isoOf(day));
    }
    weeks.push(week);
  }
  return weeks;
}

const dayLabels = ["L", "M", "M", "J", "V", "S", "D"];

export default function ConstancePage() {
  const { state, hydrated, togglePrayerToday } = useObjectifsState();
  const set = new Set(state.prayerDates);

  const today = isoOf(new Date());
  const doneToday = set.has(today);
  const streak = computeStreak(set);
  const best = computeBestStreak(state.prayerDates);
  const target = objectifsContent.streak.recordTarget;
  const weeks = buildWeeks();
  const markedInWindow = weeks.flat().filter((d) => set.has(d)).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Tuiles */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Série en cours", value: hydrated ? `${streak}` : "—", sub: "jours" },
          { label: "Meilleure série", value: hydrated ? `${best}` : "—", sub: "jours" },
          { label: "Record visé", value: `${target}`, sub: "jours consécutifs" },
        ].map((t) => (
          <div key={t.label} className="rounded-lg border border-hairline bg-canvas p-4">
            <p className="font-sans text-xs text-text-muted mb-2">{t.label}</p>
            <p className="font-sans font-semibold text-2xl text-ink tabular-nums">
              {t.value}
              <span className="font-sans font-normal text-sm text-text-secondary ml-1">
                {t.sub}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Carte principale */}
      <div className="rounded-lg border border-hairline bg-canvas">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-hairline">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-md bg-accent-clay/10 text-accent-clay flex items-center justify-center">
              <ArtPriere width={20} height={20} />
            </span>
            <div>
              <h2 className="font-sans font-semibold text-base text-ink leading-tight">
                Prière quotidienne
              </h2>
              <p className="font-sans text-xs text-text-muted">
                Au moins une prière marquée chaque jour
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={togglePrayerToday}
            className={`rounded-md font-sans text-sm font-medium px-4 py-2 transition-colors ${
              doneToday
                ? "bg-accent-olive text-canvas hover:opacity-90"
                : "bg-brand text-canvas hover:bg-brand-hover"
            }`}
          >
            {doneToday ? "Marqué aujourd'hui" : "Marquer aujourd'hui"}
          </button>
        </div>

        <div className="flex items-center gap-8 px-5 py-5 flex-wrap border-b border-hairline">
          <div className="text-accent-olive">
            <ProgressRing
              value={hydrated ? Math.min(100, (streak / target) * 100) : null}
              size={104}
              stroke={9}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="font-sans text-sm text-ink mb-1">
              <span className="font-semibold tabular-nums">{hydrated ? streak : "—"}</span> jours
              d&apos;affilée sur les {target} visés
            </p>
            <p className="font-sans text-xs text-text-muted mb-3 tabular-nums">
              {hydrated ? target - streak : target} jours restants pour atteindre le record
            </p>
            <div className="h-2 w-full rounded-full bg-surface-warm overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-olive transition-[width] duration-500"
                style={{ width: `${hydrated ? Math.min(100, (streak / target) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Heatmap 12 semaines */}
        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <p className="font-sans text-sm font-medium text-ink">12 dernières semaines</p>
            <p className="font-sans text-xs text-text-muted tabular-nums">
              {hydrated ? markedInWindow : 0} jours marqués sur 84
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <div className="flex flex-col gap-1 shrink-0 pt-0.5">
              {dayLabels.map((d, i) => (
                <span
                  key={i}
                  className="h-4 font-sans text-[9px] text-text-secondary leading-4 w-3"
                >
                  {i % 2 === 0 ? d : ""}
                </span>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1 shrink-0">
                {week.map((day) => {
                  const marked = set.has(day);
                  const isToday = day === today;
                  const future = day > today;
                  return (
                    <span
                      key={day}
                      title={day}
                      className={`h-4 w-4 rounded ${
                        future
                          ? "bg-surface-secondary"
                          : marked
                            ? "bg-accent-olive"
                            : "bg-surface-warm"
                      } ${isToday ? "ring-2 ring-brand ring-offset-1 ring-offset-canvas" : ""}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <span className="font-sans text-[11px] text-text-secondary">Non marqué</span>
            <span className="h-3 w-3 rounded bg-surface-warm" />
            <span className="h-3 w-3 rounded bg-accent-olive/40" />
            <span className="h-3 w-3 rounded bg-accent-olive" />
            <span className="font-sans text-[11px] text-text-secondary">Marqué</span>
          </div>
        </div>
      </div>
    </div>
  );
}
