"use client";

function formatCompact(n: number) {
  return new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/**
 * Courbe de trajectoire : la ligne représente le rythme cible sur la durée du
 * plan, le repère vertical marque aujourd'hui, et le point plein marque la
 * valeur réellement atteinte.
 */
export function TrajectoryChart({
  target,
  current,
  elapsedPct,
  unit,
  height = 96,
}: {
  target: number;
  current: number;
  elapsedPct: number;
  unit: string;
  height?: number;
}) {
  const w = 320;
  const h = height;
  const padTop = 14;
  const padBottom = 22;
  const usableH = h - padTop - padBottom;

  // Trajectoire cible : légèrement incurvée (montée progressive)
  const points = Array.from({ length: 25 }, (_, i) => {
    const t = i / 24;
    const eased = Math.pow(t, 1.35);
    return { x: t * w, y: padTop + usableH - eased * usableH };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${w},${h - padBottom} L0,${h - padBottom} Z`;

  const clampedElapsed = Math.min(100, Math.max(0, elapsedPct)) / 100;
  const markerX = clampedElapsed * w;
  const expected = Math.pow(clampedElapsed, 1.35) * target;
  const markerY = padTop + usableH - Math.pow(clampedElapsed, 1.35) * usableH;

  const actualRatio = target > 0 ? Math.min(1, Math.max(0, current / target)) : 0;
  const actualY = padTop + usableH - actualRatio * usableH;

  const behind = current < expected;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        preserveAspectRatio="none"
        role="img"
        aria-label="Trajectoire cible du plan"
      >
        <defs>
          <linearGradient id="traj-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* lignes de repère */}
        {[0, 0.5, 1].map((g) => (
          <line
            key={g}
            x1="0"
            x2={w}
            y1={padTop + usableH - g * usableH}
            y2={padTop + usableH - g * usableH}
            stroke="var(--color-hairline)"
            strokeWidth="1"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={areaPath} fill="url(#traj-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* aujourd'hui */}
        <line
          x1={markerX}
          x2={markerX}
          y1={padTop - 6}
          y2={h - padBottom}
          stroke="var(--color-text-secondary)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={markerX} cy={markerY} r="4" fill="var(--color-brand)" />

        {/* position réelle */}
        <circle
          cx={markerX}
          cy={actualY}
          r="5"
          fill={behind ? "var(--color-accent-deep)" : "var(--color-accent-olive)"}
          stroke="var(--color-canvas)"
          strokeWidth="2"
        />
      </svg>

      <div className="flex items-center justify-between gap-3 -mt-3 flex-wrap">
        <span className="font-sans text-[11px] text-text-secondary">Départ</span>
        <span
          className={`font-sans text-[11px] font-medium rounded-full px-2 py-0.5 tabular-nums ${
            behind ? "bg-accent-coral text-accent-deep" : "bg-accent-cactus text-accent-olive"
          }`}
        >
          Aujourd&apos;hui : {formatCompact(current)} / attendu {formatCompact(expected)} {unit}
        </span>
        <span className="font-sans text-[11px] text-text-secondary">Cible</span>
      </div>
    </div>
  );
}
