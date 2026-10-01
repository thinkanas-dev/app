import Link from "next/link";
import type { ChecklistStatus } from "@/lib/objectifs-store";

const labels: Record<ChecklistStatus, string> = {
  "not-started": "Non commencé",
  "in-progress": "En cours",
  done: "Terminé",
};

export function StatusSelect({
  label,
  description,
  status,
  href,
  onChange,
}: {
  label: string;
  description?: string;
  status: ChecklistStatus;
  href?: string;
  onChange: (status: ChecklistStatus) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        {href ? (
          <Link
            href={href}
            className="font-sans font-medium text-sm text-ink hover:text-brand transition-colors"
          >
            {label}
          </Link>
        ) : (
          <p className="font-sans font-medium text-sm text-ink">{label}</p>
        )}
        {description && (
          <p className="font-sans text-xs text-text-muted mt-1 max-w-[480px] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as ChecklistStatus)}
        className="bg-canvas text-ink font-sans text-sm rounded-md border border-hairline px-3 py-1.5 outline-none focus:border-brand transition-colors"
      >
        {(Object.keys(labels) as ChecklistStatus[]).map((key) => (
          <option key={key} value={key}>
            {labels[key]}
          </option>
        ))}
      </select>
    </div>
  );
}
