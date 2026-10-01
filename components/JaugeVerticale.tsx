"use client";

import { useCountUp } from "@/lib/use-count-up";
import { formatNote } from "@/lib/format";

/**
 * Jauge verticale sur 20 : la cible est une ligne franche, le niveau atteint
 * monte depuis le bas. Un élément vertical dans une page de bandes horizontales.
 */
export function JaugeVerticale({
  valeur,
  cible,
  hauteur = 208,
}: {
  valeur: number | null;
  cible: number;
  hauteur?: number;
}) {
  const anime = useCountUp(valeur);
  const v = anime ?? 0;
  const ratio = Math.min(1, Math.max(0, v / 20));
  const ratioCible = cible / 20;
  const atteint = v >= cible;

  return (
    <div className="flex items-stretch gap-3" style={{ height: hauteur }}>
      {/* Colonne de la jauge */}
      <div className="relative w-3.5 rounded-full bg-surface-warm overflow-hidden shrink-0">
        <div
          className={`absolute bottom-0 inset-x-0 rounded-full transition-[height] duration-500 ${
            valeur === null
              ? "bg-transparent"
              : atteint
                ? "bg-accent-olive"
                : "bg-accent-deep"
          }`}
          style={{ height: `${ratio * 100}%` }}
        />
      </div>

      {/* Graduations et repère de cible */}
      <div className="relative flex-1 min-w-0">
        {[20, 15, 10, 5, 0].map((g) => (
          <div
            key={g}
            className="absolute left-0 right-0 flex items-center gap-1.5"
            style={{ bottom: `${(g / 20) * 100}%`, transform: "translateY(50%)" }}
          >
            <span className="h-px w-1.5 bg-hairline shrink-0" />
            <span className="font-sans text-[10px] text-text-secondary tabular-nums">{g}</span>
          </div>
        ))}

        {/* Cible */}
        <div
          className="absolute left-0 right-0 flex items-center gap-1.5"
          style={{ bottom: `${ratioCible * 100}%`, transform: "translateY(50%)" }}
        >
          <span className="h-px w-3 bg-ink shrink-0" />
          <span className="font-sans text-[10px] font-semibold text-ink tabular-nums whitespace-nowrap">
            {formatNote(cible)}
          </span>
        </div>

        {/* Niveau atteint */}
        {valeur !== null && (
          <div
            className="absolute left-0 right-0 flex items-center gap-1.5 transition-[bottom] duration-500"
            style={{ bottom: `${ratio * 100}%`, transform: "translateY(50%)" }}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                atteint ? "bg-accent-olive" : "bg-accent-deep"
              }`}
            />
            {/* Pas de chiffre ici : la moyenne est écrite en grand juste à côté,
                le repère coloré suffit à situer le niveau sur l'échelle. */}
            <span
              className={`h-px flex-1 ${atteint ? "bg-accent-olive/40" : "bg-accent-deep/40"}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
