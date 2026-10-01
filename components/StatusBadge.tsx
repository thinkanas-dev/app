import { statusMeta, type GoalStatus } from "@/lib/goal-status";

export function StatusBadge({ status }: { status: GoalStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-sans text-[11px] font-medium ${meta.bgClass} ${meta.textClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
      {meta.label}
    </span>
  );
}
