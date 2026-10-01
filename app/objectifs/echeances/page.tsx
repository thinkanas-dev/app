"use client";

import Link from "next/link";
import { objectifsContent } from "@/content/objectifs";
import { GoalIcon } from "@/components/GoalIcon";
import { daysUntil } from "@/components/Countdown";
import { useObjectifsState } from "@/lib/objectifs-store";
import { totalPlanDays, daysElapsed, PLAN_START, PLAN_END } from "@/lib/plan-timeline";
import { IconArrowUpRight } from "@/components/icons";

function formatLongDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function EcheancesPage() {
  const { state, hydrated, setCountdownDate } = useObjectifsState();

  const planTotal = totalPlanDays();
  const planElapsed = daysElapsed();

  return (
    <div className="flex flex-col gap-4">
      {/* Frise du plan */}
      <div className="rounded-lg border border-hairline bg-canvas p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2 className="font-sans font-semibold text-base text-ink">Durée totale du plan</h2>
          <span className="font-sans text-xs text-text-muted tabular-nums">
            Jour {planElapsed} sur {planTotal}
          </span>
        </div>

        <div className="relative h-2 w-full rounded-full bg-surface-warm overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-500"
            style={{ width: `${(planElapsed / planTotal) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-text-muted">{formatShortDate(PLAN_START)}</span>
          <span className="font-sans text-xs text-text-muted">{formatShortDate(PLAN_END)}</span>
        </div>
      </div>

      {/* Échéances */}
      <div className="grid md:grid-cols-2 gap-4">
        {objectifsContent.countdowns.map((c) => {
          const date = c.editable ? state.countdownDates[c.id] ?? c.date : c.date;
          const remaining = hydrated ? daysUntil(date) : null;
          const totalSpan = Math.max(
            1,
            Math.round(
              (new Date(date + "T00:00:00").getTime() -
                new Date(PLAN_START + "T00:00:00").getTime()) /
                86_400_000
            )
          );
          const done = Math.max(0, totalSpan - (remaining ?? totalSpan));
          const pct = Math.min(100, (done / totalSpan) * 100);
          const urgent = remaining !== null && remaining < 90;

          return (
            <div key={c.id} className="rounded-lg border border-hairline bg-canvas p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3 min-w-0">
                  <GoalIcon id={c.id} accent="sky" size="md" />
                  <div className="min-w-0">
                    <Link
                      href={`/objectifs/goal/${c.id}`}
                      className="font-sans text-sm font-medium text-ink hover:text-brand transition-colors block leading-snug"
                    >
                      {c.label}
                    </Link>
                    <p className="font-sans text-xs text-text-muted mt-0.5 capitalize">
                      {formatLongDate(date)}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/objectifs/goal/${c.id}`}
                  aria-label={`Ouvrir ${c.label}`}
                  className="h-7 w-7 rounded-md border border-hairline text-text-muted hover:text-brand hover:border-brand flex items-center justify-center shrink-0 transition-colors"
                >
                  <IconArrowUpRight width={11} height={11} />
                </Link>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span
                  className={`font-sans font-semibold text-3xl tabular-nums ${
                    urgent ? "text-accent-deep" : "text-ink"
                  }`}
                >
                  {remaining === null ? "—" : remaining}
                </span>
                <span className="font-sans text-sm text-text-muted">jours restants</span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-surface-warm overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${
                    urgent ? "bg-accent-deep" : "bg-brand"
                  }`}
                  style={{ width: `${hydrated ? pct : 0}%` }}
                />
              </div>

              {c.editable ? (
                <label className="block">
                  <span className="font-sans text-xs text-text-muted block mb-1.5">
                    Ajuster la date
                  </span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setCountdownDate(c.id, e.target.value)}
                    className="w-full bg-canvas text-ink font-sans text-sm rounded-md border border-hairline px-3 py-2 outline-none focus:border-brand transition-colors"
                  />
                </label>
              ) : (
                <p className="font-sans text-xs text-text-muted">Date fixe, non modifiable</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
