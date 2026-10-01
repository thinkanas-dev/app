"use client";

import { useCountUp } from "@/lib/use-count-up";

/**
 * Anneau de progression. La couleur est héritée du parent (`currentColor`),
 * ce qui permet de le teinter par catégorie sans multiplier les variantes.
 */
export function ProgressRing({
  value,
  size = 56,
  stroke = 5,
  showLabel = true,
}: {
  value: number | null;
  size?: number;
  stroke?: number;
  showLabel?: boolean;
}) {
  const animated = useCountUp(value);
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const pct = animated === null ? 0 : Math.min(100, Math.max(0, animated));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-surface-warm"
        />
        {pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            stroke="currentColor"
          />
        )}
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-sans font-semibold text-ink tabular-nums"
            style={{ fontSize: Math.max(10, size * 0.26) }}
          >
            {animated === null ? "—" : `${Math.round(pct)}%`}
          </span>
        </div>
      )}
    </div>
  );
}
