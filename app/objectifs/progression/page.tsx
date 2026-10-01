"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { objectifsContent } from "@/content/objectifs";
import { GoalIcon } from "@/components/GoalIcon";
import { DonutChart } from "@/components/DonutChart";
import { useObjectifsState } from "@/lib/objectifs-store";
import { classifyStatus, statusMeta, type GoalStatus } from "@/lib/goal-status";
import { timeElapsedPct } from "@/lib/plan-timeline";
import { IconArrowUpRight, IconDownload } from "@/components/icons";

type SortKey = "label" | "target" | "current" | "pct" | "delta";

function formatNumber(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}

function SortHeader({
  label,
  sortKey,
  active,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  dir: "asc" | "desc";
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 font-sans text-xs font-medium transition-colors w-full ${
        align === "right" ? "justify-end" : "justify-start"
      } ${active ? "text-ink" : "text-text-muted hover:text-ink"}`}
    >
      {label}
      <span className="flex flex-col leading-none">
        <svg width="7" height="4" viewBox="0 0 8 5" className={active && dir === "asc" ? "text-brand" : "text-text-secondary"}>
          <path d="M4 0l4 5H0z" fill="currentColor" />
        </svg>
        <svg width="7" height="4" viewBox="0 0 8 5" className={`mt-0.5 ${active && dir === "desc" ? "text-brand" : "text-text-secondary"}`}>
          <path d="M4 5L0 0h8z" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}

export default function ProgressionPage() {
  const { state, hydrated, setMilestone, modifierAtelier } = useObjectifsState();
  const elapsedPct = timeElapsedPct();
  const [sortKey, setSortKey] = useState<SortKey>("pct");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(() => {
    const mapped = objectifsContent.milestones.map((m) => {
      const current = state.milestoneCurrent[m.id] ?? (m.id === "patrimoine" ? -0.62 : 0);
      const pct = m.target > 0 ? Math.min(100, (current / m.target) * 100) : 0;
      return {
        id: m.id,
        label: m.label,
        unit: m.unit,
        accent: m.accent,
        target: m.target,
        current,
        pct,
        delta: pct - elapsedPct,
        status: classifyStatus(pct, elapsedPct),
        custom: false,
      };
    });

    const personnalisés = state.atelier.objectifs.map((objectif) => {
      const pct = objectif.cible > 0 ? Math.min(100, (objectif.valeur / objectif.cible) * 100) : 0;
      return {
        id: objectif.id,
        label: objectif.titre,
        unit: objectif.unite,
        accent: "fig" as const,
        target: objectif.cible,
        current: objectif.valeur,
        pct,
        delta: pct - elapsedPct,
        status: classifyStatus(pct, elapsedPct),
        custom: true,
      };
    });

    const sorted = [...mapped, ...personnalisés].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "label") cmp = a.label.localeCompare(b.label, "fr");
      else cmp = (a[sortKey] as number) - (b[sortKey] as number);
      return dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [state.milestoneCurrent, state.atelier.objectifs, elapsedPct, sortKey, dir]);

  function onSort(k: SortKey) {
    if (k === sortKey) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setDir("desc");
    }
  }

  const counts = rows.reduce<Record<GoalStatus, number>>(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    { "not-started": 0, behind: 0, "on-track": 0, ahead: 0, done: 0 }
  );

  const avgPct = rows.reduce((s, r) => s + r.pct, 0) / (rows.length || 1);

  const segments = [
    { label: "Terminé", value: counts.done, color: "var(--color-accent-olive)" },
    { label: "En avance", value: counts.ahead, color: "var(--color-accent-olive)" },
    { label: "Dans les temps", value: counts["on-track"], color: "var(--color-brand)" },
    { label: "En retard", value: counts.behind, color: "var(--color-accent-deep)" },
    { label: "Non commencé", value: counts["not-started"], color: "var(--color-text-secondary)" },
  ];

  const allSelected = selected.length === rows.length && rows.length > 0;

  return (
    <div className="flex flex-col gap-4">

      {/* Tableau */}
      <div className="rounded-lg border border-hairline bg-canvas overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-hairline flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="font-sans font-semibold text-base text-ink">Jauges suivies</h2>
            {selected.length > 0 && (
              <span className="font-sans text-xs text-brand bg-brand-soft rounded-full px-2 py-0.5 tabular-nums">
                {selected.length} sélectionné{selected.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              const header = "Objectif;Cible;Actuel;Unite;Progression%;Ecart%\n";
              const body = rows
                .map(
                  (r) =>
                    `${r.label};${r.target};${r.current};${r.unit};${r.pct.toFixed(1)};${r.delta.toFixed(1)}`
                )
                .join("\n");
              const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "objectifs-progression.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-1.5 font-sans text-xs text-text-muted hover:text-ink transition-colors"
          >
            <IconDownload width={12} height={12} />
            Exporter en CSV
          </button>
        </div>

        {/* En-têtes */}
        <div className="hidden lg:grid grid-cols-[26px_minmax(0,2.6fr)_78px_92px_128px_74px_120px_32px] gap-3 items-center px-5 py-2.5 bg-surface-secondary border-b border-hairline">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))}
            className="h-3.5 w-3.5 accent-brand"
            aria-label="Tout sélectionner"
          />
          <SortHeader label="Objectif" sortKey="label" active={sortKey === "label"} dir={dir} onSort={onSort} />
          <SortHeader label="Cible" sortKey="target" active={sortKey === "target"} dir={dir} onSort={onSort} align="right" />
          <SortHeader label="Actuel" sortKey="current" active={sortKey === "current"} dir={dir} onSort={onSort} align="right" />
          <SortHeader label="Progression" sortKey="pct" active={sortKey === "pct"} dir={dir} onSort={onSort} />
          <SortHeader label="Écart" sortKey="delta" active={sortKey === "delta"} dir={dir} onSort={onSort} align="right" />
          <span className="font-sans text-xs font-medium text-text-muted">Statut</span>
          <span />
        </div>

        <div className="divide-y divide-hairline">
          {rows.map((r) => {
            const meta = statusMeta[r.status];
            const isSelected = selected.includes(r.id);
            const deltaPositive = r.delta >= 0;
            const deltaNeutral = !hydrated || Math.abs(r.delta) < 0.05;
            return (
              <div
                key={r.id}
                className={`grid grid-cols-[28px_1fr] lg:grid-cols-[26px_minmax(0,2.6fr)_78px_92px_128px_74px_120px_32px] gap-3 items-center px-5 py-3 transition-colors ${
                  isSelected ? "bg-brand-soft/40" : "hover:bg-surface-secondary/60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() =>
                    setSelected(
                      isSelected ? selected.filter((s) => s !== r.id) : [...selected, r.id]
                    )
                  }
                  className="h-3.5 w-3.5 accent-brand"
                  aria-label={`Sélectionner ${r.label}`}
                />

                <div className="flex items-center gap-3 min-w-0">
                  {r.custom ? (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-fig/10 font-serif text-base text-accent-fig" aria-hidden>
                      {r.label.slice(0, 1).toUpperCase()}
                    </span>
                  ) : (
                    <GoalIcon id={r.id} accent={r.accent} size="sm" />
                  )}
                  <div className="min-w-0">
                    <Link
                      href={r.custom ? "/objectifs/atelier" : `/objectifs/goal/${r.id}`}
                      className="font-sans text-sm font-medium text-ink hover:text-brand transition-colors block leading-snug"
                    >
                      {r.label}
                    </Link>
                    <p className="font-sans text-xs text-text-muted lg:hidden tabular-nums">
                      {hydrated ? formatNumber(r.current) : "—"} / {formatNumber(r.target)} {r.unit}
                    </p>
                  </div>
                </div>

                <p className="hidden lg:block font-sans text-sm text-text-muted tabular-nums text-right">
                  {formatNumber(r.target)}
                </p>

                <div className="hidden lg:block">
                  <input
                    type="number"
                    value={Number.isFinite(r.current) ? r.current : 0}
                    onChange={(e) =>
                      r.custom
                        ? modifierAtelier("objectifs", r.id, { valeur: Number(e.target.value) })
                        : setMilestone(r.id, Number(e.target.value))
                    }
                    className="w-full bg-canvas text-ink font-sans text-sm tabular-nums text-right rounded-md border border-hairline px-2 py-1 outline-none focus:border-brand transition-colors"
                    aria-label={`Valeur actuelle — ${r.label}`}
                  />
                </div>

                <div className="hidden lg:flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-surface-warm overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand transition-[width] duration-300"
                      style={{ width: `${hydrated ? r.pct : 0}%` }}
                    />
                  </div>
                  <span className="font-sans text-xs text-text-muted tabular-nums w-9 text-right">
                    {hydrated ? Math.round(r.pct) : 0}%
                  </span>
                </div>

                <div className="hidden lg:flex justify-end">
                  <span
                    className={`font-sans text-[11px] font-medium rounded-md px-1.5 py-0.5 tabular-nums ${
                      deltaNeutral
                        ? "bg-surface-secondary text-text-muted"
                        : deltaPositive
                          ? "bg-accent-cactus text-accent-olive"
                          : "bg-accent-coral text-accent-deep"
                    }`}
                  >
                    {deltaNeutral ? "—" : `${deltaPositive ? "+" : ""}${r.delta.toFixed(1)}%`}
                  </span>
                </div>

                <div className="hidden lg:block">
                  <span
                    className={`inline-flex items-center gap-1.5 font-sans text-[11px] font-medium rounded-full px-2 py-1 ${meta.bgClass} ${meta.textClass}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
                    {meta.label}
                  </span>
                </div>

                <Link
                  href={r.custom ? "/objectifs/atelier" : `/objectifs/goal/${r.id}`}
                  aria-label={`Ouvrir ${r.label}`}
                  className="hidden lg:flex h-7 w-7 rounded-md border border-hairline text-text-muted hover:text-brand hover:border-brand items-center justify-center transition-colors"
                >
                  <IconArrowUpRight width={11} height={11} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
