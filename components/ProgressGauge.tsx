import Link from "next/link";
import type { AccentColor, BrandKey } from "@/content/objectifs";
import { StatusBadge } from "./StatusBadge";
import { classifyStatus } from "@/lib/goal-status";
import { InstagramIcon, TikTokIcon, LinkedInIcon } from "./brand-icons";

const accentFill: Record<AccentColor, string> = {
  clay: "bg-accent-clay",
  sky: "bg-accent-sky",
  cactus: "bg-accent-olive",
  fig: "bg-accent-fig",
};

const brandIcon: Record<BrandKey, (size?: number) => React.ReactNode> = {
  instagram: (size) => <InstagramIcon size={size} />,
  tiktok: (size) => <TikTokIcon size={size} />,
  linkedin: (size) => <LinkedInIcon size={size} />,
};

function formatNumber(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n);
}

export function ProgressGauge({
  label,
  unit,
  current,
  target,
  accent,
  note,
  elapsedPct,
  href,
  logoKeys,
  onChange,
}: {
  label: string;
  unit: string;
  current: number;
  target: number;
  accent: AccentColor;
  note?: string;
  elapsedPct?: number;
  href?: string;
  logoKeys?: BrandKey[];
  onChange: (value: number) => void;
}) {
  const pct = target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;
  const status = elapsedPct !== undefined ? classifyStatus(pct, elapsedPct) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {href ? (
            <Link
              href={href}
              className="font-sans text-sm font-medium text-ink hover:text-brand transition-colors"
            >
              {label}
            </Link>
          ) : (
            <p className="font-sans text-sm font-medium text-ink">{label}</p>
          )}
          {status && <StatusBadge status={status} />}
          {logoKeys && (
            <div className="flex items-center gap-1">
              {logoKeys.map((key) => (
                <div key={key} className="rounded-sm overflow-hidden">
                  {brandIcon[key](16)}
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="font-sans text-sm text-text-muted whitespace-nowrap tabular-nums">
          {formatNumber(current)} / {formatNumber(target)} {unit}
        </p>
      </div>
      <div className="h-2 w-full rounded-full bg-surface-warm overflow-hidden mb-2">
        {pct > 0 && (
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${accentFill[accent]}`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-4">
        {note && <p className="font-sans text-xs text-text-muted">{note}</p>}
        <input
          type="number"
          value={Number.isFinite(current) ? current : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="ml-auto w-28 bg-canvas text-ink font-sans text-sm tabular-nums rounded-md border border-hairline px-2.5 py-1.5 outline-none focus:border-brand transition-colors"
          aria-label={`Valeur actuelle — ${label}`}
        />
      </div>
    </div>
  );
}
