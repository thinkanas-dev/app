"use client";

import { formatNote } from "@/lib/format";

type Module = { id: string; nom: string };

const court: Record<string, string> = {
  ia: "IA",
  datamining: "Data Mining",
  sih: "SIH & Santé",
  python: "Python",
  bdd: "BDD",
  web: "Web",
  eco: "Économie",
  anglais: "Anglais",
  francais: "Français",
};

/**
 * Radar des notes : une branche par module. La ligne pointillée marque la
 * cible, la surface pleine le profil réel — on voit la forme, pas une suite
 * de barres.
 */
export function ModulesRadar({
  modules,
  grades,
  cible,
}: {
  modules: Module[];
  grades: Record<string, number>;
  cible: number;
}) {
  const size = 330;
  const cx = size / 2;
  const cy = 158;
  const R = 104;
  const n = modules.length;

  const angle = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180);
  const point = (i: number, ratio: number) => {
    const a = angle(i);
    return [cx + Math.cos(a) * R * ratio, cy + Math.sin(a) * R * ratio] as const;
  };

  const polygon = (ratioOf: (i: number) => number) =>
    modules
      .map((_, i) => {
        const [x, y] = point(i, ratioOf(i));
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  const saisies = modules.filter((m) => typeof grades[m.id] === "number");
  const aDesNotes = saisies.length > 0;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size - 40}`}
        width="100%"
        style={{ maxWidth: 380 }}
        role="img"
        aria-label="Radar des notes par module"
      >
        {/* Toile de fond : cercles à 5, 10, 15, 20 */}
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <polygon
            key={r}
            points={polygon(() => r)}
            fill="none"
            stroke="var(--color-hairline)"
            strokeWidth="1"
          />
        ))}

        {/* Branches */}
        {modules.map((m, i) => {
          const [x, y] = point(i, 1);
          return (
            <line
              key={m.id}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="var(--color-hairline)"
              strokeWidth="1"
            />
          );
        })}

        {/* Cible */}
        <polygon
          points={polygon(() => cible / 20)}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.55"
        />

        {/* Profil réel */}
        {aDesNotes && (
          <>
            <polygon
              points={polygon((i) => (grades[modules[i].id] ?? 0) / 20)}
              fill="var(--color-brand)"
              fillOpacity="0.16"
              stroke="var(--color-brand)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {modules.map((m, i) => {
              const g = grades[m.id];
              if (typeof g !== "number") return null;
              const [x, y] = point(i, g / 20);
              return (
                <circle
                  key={m.id}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill={g >= cible ? "var(--color-accent-olive)" : "var(--color-accent-deep)"}
                  stroke="var(--color-canvas)"
                  strokeWidth="1.5"
                />
              );
            })}
          </>
        )}

        {/* Étiquettes */}
        {modules.map((m, i) => {
          const [x, y] = point(i, 1.2);
          const g = grades[m.id];
          const dx = x - cx;
          const anchor = Math.abs(dx) < 12 ? "middle" : dx > 0 ? "start" : "end";
          return (
            <text
              key={m.id}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-text-muted"
              style={{ fontSize: 10, fontFamily: "var(--font-sans)" }}
            >
              {court[m.id] ?? m.nom.slice(0, 10)}
              {typeof g === "number" && (
                <tspan className="fill-ink" style={{ fontWeight: 600 }}>
                  {" "}
                  {formatNote(g)}
                </tspan>
              )}
            </text>
          );
        })}
      </svg>

      <div className="flex items-center gap-4 flex-wrap justify-center mt-1">
        {aDesNotes && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm bg-brand/25 border border-brand" />
            <span className="font-sans text-[11px] text-text-muted">Votre profil</span>
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-4 border-t-2 border-dashed border-ink/55" />
          <span className="font-sans text-[11px] text-text-muted tabular-nums">
            Cible {formatNote(cible)}
          </span>
        </span>
      </div>
    </div>
  );
}
