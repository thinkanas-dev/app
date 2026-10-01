import Link from "next/link";

export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

export function Countdown({
  label,
  date,
  daysRemaining,
  editable = false,
  href,
  onChangeDate,
}: {
  label: string;
  date: string;
  daysRemaining: number | null;
  editable?: boolean;
  href?: string;
  onChangeDate?: (date: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        {label &&
          (href ? (
            <Link
              href={href}
              className="font-sans text-sm font-medium text-ink hover:text-brand transition-colors mb-1 inline-block"
            >
              {label}
            </Link>
          ) : (
            <p className="font-sans text-sm font-medium text-ink mb-1">{label}</p>
          ))}
        {editable ? (
          <input
            type="date"
            value={date}
            onChange={(e) => onChangeDate?.(e.target.value)}
            className="bg-canvas text-ink font-sans text-sm rounded-md border border-hairline px-2.5 py-1.5 outline-none focus:border-brand transition-colors"
          />
        ) : (
          <p className="font-sans text-sm text-text-muted">
            {new Date(date + "T00:00:00").toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>
      <p className="font-sans font-semibold text-2xl text-ink whitespace-nowrap tabular-nums">
        {daysRemaining === null ? "—" : `${daysRemaining} j`}
      </p>
    </div>
  );
}
