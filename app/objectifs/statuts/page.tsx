"use client";

import Link from "next/link";
import { objectifsContent } from "@/content/objectifs";
import { GoalIcon } from "@/components/GoalIcon";
import { useObjectifsState, type ChecklistStatus } from "@/lib/objectifs-store";
import { IconArrowUpRight } from "@/components/icons";

const options: { key: ChecklistStatus; label: string }[] = [
  { key: "not-started", label: "Non commencé" },
  { key: "in-progress", label: "En cours" },
  { key: "done", label: "Terminé" },
];

export default function StatutsPage() {
  const { state, hydrated, setChecklistStatus } = useObjectifsState();

  const counts = options.map((o) => ({
    ...o,
    value: objectifsContent.checklist.filter(
      (c) => (state.checklistStatus[c.id] ?? "not-started") === o.key
    ).length,
  }));

  const doneCount = counts.find((c) => c.key === "done")?.value ?? 0;
  const total = objectifsContent.checklist.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Synthèse */}
      <div className="grid sm:grid-cols-3 gap-4">
        {counts.map((c) => (
          <div key={c.key} className="rounded-lg border border-hairline bg-canvas p-4">
            <p className="font-sans text-xs text-text-muted mb-2">{c.label}</p>
            <p className="font-sans font-semibold text-2xl text-ink tabular-nums">
              {hydrated ? c.value : "—"}
              <span className="font-sans font-normal text-sm text-text-secondary ml-1">
                /{total}
              </span>
            </p>
            <div className="h-1.5 w-full rounded-full bg-surface-warm overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${
                  c.key === "done"
                    ? "bg-accent-olive"
                    : c.key === "in-progress"
                      ? "bg-brand"
                      : "bg-text-secondary"
                }`}
                style={{ width: `${hydrated ? (c.value / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Liste */}
      <div className="rounded-lg border border-hairline bg-canvas">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-hairline">
          <h2 className="font-sans font-semibold text-base text-ink">
            Compétences &amp; jalons qualitatifs
          </h2>
          <span className="font-sans text-xs text-text-muted tabular-nums">
            {hydrated ? doneCount : 0}/{total} terminés
          </span>
        </div>

        <div className="divide-y divide-hairline">
          {objectifsContent.checklist.map((item) => {
            const status = state.checklistStatus[item.id] ?? "not-started";
            return (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 px-5 py-4 flex-wrap"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <GoalIcon id={item.id} accent="fig" size="sm" />
                  <div className="min-w-0">
                    <Link
                      href={`/objectifs/goal/${item.id}`}
                      className="font-sans text-sm font-medium text-ink hover:text-brand transition-colors"
                    >
                      {item.label}
                    </Link>
                    {item.description && (
                      <p className="font-sans text-xs text-text-muted mt-0.5 leading-relaxed max-w-[520px]">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex rounded-md border border-hairline overflow-hidden">
                    {options.map((o) => {
                      const active = status === o.key;
                      return (
                        <button
                          key={o.key}
                          type="button"
                          onClick={() => setChecklistStatus(item.id, o.key)}
                          className={`font-sans text-xs px-3 py-1.5 transition-colors ${
                            active
                              ? o.key === "done"
                                ? "bg-accent-olive text-canvas"
                                : o.key === "in-progress"
                                  ? "bg-brand text-canvas"
                                  : "bg-surface-secondary text-ink"
                              : "text-text-muted hover:bg-surface-secondary"
                          }`}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                  <Link
                    href={`/objectifs/goal/${item.id}`}
                    aria-label={`Ouvrir ${item.label}`}
                    className="h-7 w-7 rounded-md border border-hairline text-text-muted hover:text-brand hover:border-brand flex items-center justify-center transition-colors"
                  >
                    <IconArrowUpRight width={11} height={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
