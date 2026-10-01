"use client";

type Module = { id: string; nom: string; utilite: number };

const court: Record<string, string> = {
  ia: "IA",
  datamining: "Data Mining",
  sih: "SIH",
  python: "Python",
  bdd: "BDD",
  web: "Web",
  eco: "Économie",
  anglais: "Anglais",
  francais: "Français",
};

/**
 * Croise la note obtenue et l'utilité du module pour le projet think.anas.
 * Le quadrant en haut à gauche est celui qui doit recevoir le temps de révision.
 */
export function ModulesQuadrant({
  modules,
  grades,
  cible,
}: {
  modules: Module[];
  grades: Record<string, number>;
  cible: number;
}) {
  const w = 420;
  const h = 300;
  const pad = { l: 48, r: 16, t: 28, b: 40 };
  const plotW = w - pad.l - pad.r;
  const plotH = h - pad.t - pad.b;

  const x = (note: number) => pad.l + (note / 20) * plotW;
  // utilité 1 → bas, 3 → haut
  const y = (u: number) => pad.t + plotH - ((u - 1) / 2) * plotH;

  const cibleX = x(cible);
  const midY = y(2);

  const places = modules.filter((m) => typeof grades[m.id] === "number");
  const manquants = modules.length - places.length;

  const prioritaires = places.filter(
    (m) => m.utilite >= 2.5 && grades[m.id] < cible
  );

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        role="img"
        aria-label="Modules croisés par note et utilité pour le projet"
      >
        {/* Fonds de quadrant */}
        <rect
          x={pad.l}
          y={pad.t}
          width={cibleX - pad.l}
          height={midY - pad.t}
          fill="var(--color-accent-deep)"
          opacity="0.06"
        />
        <rect
          x={cibleX}
          y={pad.t}
          width={pad.l + plotW - cibleX}
          height={midY - pad.t}
          fill="var(--color-accent-olive)"
          opacity="0.07"
        />

        {/* Axes */}
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + plotH} stroke="var(--color-hairline)" strokeWidth="1" />
        <line x1={pad.l} y1={pad.t + plotH} x2={pad.l + plotW} y2={pad.t + plotH} stroke="var(--color-hairline)" strokeWidth="1" />

        {/* Séparateurs */}
        <line
          x1={cibleX}
          y1={pad.t}
          x2={cibleX}
          y2={pad.t + plotH}
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.5"
        />
        <line
          x1={pad.l}
          y1={midY}
          x2={pad.l + plotW}
          y2={midY}
          stroke="var(--color-hairline)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Libellés de quadrant */}
        <text x={pad.l + 8} y={pad.t + 14} className="fill-accent-deep" style={{ fontSize: 10, fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          Priorité de révision
        </text>
        <text x={pad.l + plotW - 8} y={pad.t + 14} textAnchor="end" className="fill-accent-olive" style={{ fontSize: 10, fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          Solide et stratégique
        </text>

        {/* Graduations */}
        {[0, 5, 10, 15, 20].map((v) => (
          <text
            key={v}
            x={x(v)}
            y={pad.t + plotH + 16}
            textAnchor="middle"
            className="fill-text-secondary"
            style={{ fontSize: 10, fontFamily: "var(--font-sans)" }}
          >
            {v}
          </text>
        ))}
        <text x={pad.l + plotW / 2} y={h - 6} textAnchor="middle" className="fill-text-muted" style={{ fontSize: 10, fontFamily: "var(--font-sans)" }}>
          Note obtenue
        </text>

        {[
          { u: 3, label: "Direct" },
          { u: 2, label: "Indirect" },
          { u: 1, label: "Hors projet" },
        ].map(({ u, label }) => (
          <text
            key={u}
            x={pad.l - 8}
            y={y(u)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-text-secondary"
            style={{ fontSize: 9, fontFamily: "var(--font-sans)" }}
          >
            {label}
          </text>
        ))}

        {/* Points */}
        {places.map((m) => {
          const g = grades[m.id];
          const atteint = g >= cible;
          return (
            <g key={m.id}>
              <circle
                cx={x(g)}
                cy={y(m.utilite)}
                r="6"
                fill={atteint ? "var(--color-accent-olive)" : "var(--color-accent-deep)"}
                fillOpacity="0.9"
                stroke="var(--color-canvas)"
                strokeWidth="2"
              />
              <text
                x={x(g)}
                y={y(m.utilite) - 11}
                textAnchor="middle"
                className="fill-ink"
                style={{ fontSize: 10, fontFamily: "var(--font-sans)", fontWeight: 500 }}
              >
                {court[m.id] ?? m.nom.slice(0, 8)}
              </text>
            </g>
          );
        })}
      </svg>

      {places.length === 0 ? (
        <p className="font-sans text-sm text-text-muted mt-2">
          Saisissez au moins une note pour positionner vos modules.
        </p>
      ) : (
        <div className="mt-3 rounded-md bg-surface-secondary px-4 py-3">
          {prioritaires.length > 0 ? (
            <p className="font-sans text-sm text-ink leading-snug">
              <span className="font-semibold">À traiter en premier :</span>{" "}
              {prioritaires.map((m) => court[m.id] ?? m.nom).join(", ")} — sous la cible
              alors que ces modules servent directement le projet.
            </p>
          ) : (
            <p className="font-sans text-sm text-text-muted leading-snug">
              Aucun module stratégique sous la cible pour l&apos;instant.
            </p>
          )}
          {manquants > 0 && (
            <p className="font-sans text-xs text-text-muted mt-1 tabular-nums">
              {manquants} module{manquants > 1 ? "s" : ""} sans note, non positionné
              {manquants > 1 ? "s" : ""}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
