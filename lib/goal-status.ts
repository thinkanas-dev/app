export type GoalStatus = "not-started" | "behind" | "on-track" | "ahead" | "done";

export function classifyStatus(progressPct: number, elapsedPct: number): GoalStatus {
  if (progressPct >= 100) return "done";
  if (progressPct <= 0) return "not-started";
  const delta = progressPct - elapsedPct;
  if (delta < -10) return "behind";
  if (delta > 10) return "ahead";
  return "on-track";
}

export const statusMeta: Record<
  GoalStatus,
  { label: string; textClass: string; bgClass: string; dotClass: string }
> = {
  "not-started": {
    label: "Non commencé",
    textClass: "text-text-muted",
    bgClass: "bg-surface-secondary",
    dotClass: "bg-text-secondary",
  },
  behind: {
    label: "En retard",
    textClass: "text-accent-deep",
    bgClass: "bg-accent-coral",
    dotClass: "bg-accent-deep",
  },
  "on-track": {
    label: "Dans les temps",
    textClass: "text-brand",
    bgClass: "bg-brand-soft",
    dotClass: "bg-brand",
  },
  ahead: {
    label: "En avance",
    textClass: "text-accent-olive",
    bgClass: "bg-accent-cactus",
    dotClass: "bg-accent-olive",
  },
  done: {
    label: "Terminé",
    textClass: "text-accent-olive",
    bgClass: "bg-accent-cactus",
    dotClass: "bg-accent-olive",
  },
};
