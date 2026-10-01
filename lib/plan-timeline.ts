export const PLAN_START = "2026-10-01";
export const PLAN_END = "2028-09-25";

const DAY_MS = 86_400_000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function totalPlanDays(): number {
  return Math.round(
    (new Date(PLAN_END + "T00:00:00").getTime() - new Date(PLAN_START + "T00:00:00").getTime()) /
      DAY_MS
  );
}

export function daysElapsed(): number {
  const start = new Date(PLAN_START + "T00:00:00").getTime();
  const today = startOfDay(new Date()).getTime();
  return Math.min(totalPlanDays(), Math.max(0, Math.round((today - start) / DAY_MS)));
}

export function timeElapsedPct(): number {
  return (daysElapsed() / totalPlanDays()) * 100;
}
