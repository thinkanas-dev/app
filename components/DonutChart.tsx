"use client";

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

/**
 * Anneaux concentriques : un arc par segment, épaisseur constante.
 * Les segments vides sont ignorés pour éviter les arcs fantômes.
 */
export function DonutChart({
  segments,
  size = 140,
  total,
  centerLabel,
  centerValue,
}: {
  segments: DonutSegment[];
  size?: number;
  total: number;
  centerLabel: string;
  centerValue: string;
}) {
  const stroke = 12;
  const radius = size / 2 - stroke / 2 - 2;
  const circumference = 2 * Math.PI * radius;

  let offsetAcc = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const fraction = total > 0 ? s.value / total : 0;
      const dash = fraction * circumference;
      const arc = {
        ...s,
        dash,
        gap: circumference - dash,
        rotation: (offsetAcc / circumference) * 360,
      };
      offsetAcc += dash;
      return arc;
    });

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
        {arcs.map((a) => (
          <circle
            key={a.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="butt"
            stroke={a.color}
            strokeDasharray={`${a.dash} ${a.gap}`}
            transform={`rotate(${a.rotation} ${size / 2} ${size / 2})`}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-sans font-semibold text-xl text-ink tabular-nums leading-none">
          {centerValue}
        </span>
        <span className="font-sans text-[11px] text-text-muted mt-0.5">{centerLabel}</span>
      </div>
    </div>
  );
}
