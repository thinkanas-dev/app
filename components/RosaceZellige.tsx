"use client";

import { useId, type KeyboardEvent } from "react";

/*
 * La rosace de zellige du khatam.
 *
 * Comme sur un mur de Fès, chaque pièce est taillée à la main et posée sur un
 * joint de ciment clair. Les 60 hizb forment l'anneau : 30 juz, chacun partagé
 * en deux tesselles à pointe. Tant qu'un hizb n'est pas mémorisé, sa tesselle
 * reste en terre cuite brute ; mémorisé, il reçoit son émail — vert et bleu en
 * alternance, miel tous les cinq juz — et son reflet. Au-dehors, une couronne
 * de créneaux, comme ceux des remparts : un juz complet émaille le sien.
 * Au centre, l'étoile à seize branches du zellige, qui tourne doucement à
 * mesure que la khatma avance.
 *
 * Au clavier : une seule tabulation pour la rosace, puis les flèches.
 */

const C = 160;
const R_INTERIEUR = 104;
const R_EXTERIEUR = 136;
const R_POINTE = 143;
const R_CRENEAU = 146;

const JOINT = "#efe4cc";
const MANGANESE = "#1e1b18";
const EMAIL = { vert: "#0f6b4f", bleu: "#1d4f9a", miel: "#c38a2c" };
const TERRES = ["#c77c56", "#bb6f49", "#cd8762"];

const CHIFFRES = "٠١٢٣٤٥٦٧٨٩";
const indoArabe = (n: number) => String(n).replace(/\d/g, (d) => CHIFFRES[Number(d)]);

const polaire = (r: number, degres: number) => {
  const a = ((degres - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
};
const pt = (r: number, degres: number) => polaire(r, degres).map((v) => v.toFixed(2)).join(" ");

/** Une tesselle à pointe : le premier hizb du juz à gauche de l'axe, le second à droite */
function tesselle(n: number) {
  const juz = Math.ceil(n / 2);
  const a0 = (juz - 1) * 12 + (n % 2 === 1 ? 0 : 6);
  return `M${pt(R_INTERIEUR, a0)}L${pt(R_EXTERIEUR, a0)}L${pt(R_POINTE, a0 + 3)}L${pt(R_EXTERIEUR, a0 + 6)}L${pt(R_INTERIEUR, a0 + 6)}Z`;
}

function couleurEmail(n: number) {
  if (Math.ceil(n / 2) % 5 === 0) return EMAIL.miel;
  return n % 2 === 1 ? EMAIL.vert : EMAIL.bleu;
}

/** Étoile à huit branches (deux carrés croisés), tracée d'un seul contour */
function etoile8(rayon: number, decalage: number) {
  const creux = rayon * 0.7654;
  return (
    Array.from({ length: 16 }, (_, k) => `${k ? "L" : "M"}${pt(k % 2 ? creux : rayon, decalage + k * 22.5)}`).join("") + "Z"
  );
}

/** Un créneau de rempart, dessiné en haut puis tourné sur l'axe de son juz */
const CRENEAU =
  [
    [-7, 0],
    [-7, 4.5],
    [-4.5, 4.5],
    [-4.5, 8.5],
    [-2, 8.5],
    [-2, 12],
    [2, 12],
    [2, 8.5],
    [4.5, 8.5],
    [4.5, 4.5],
    [7, 4.5],
    [7, 0],
  ]
    .map(([dx, h], i) => `${i ? "L" : "M"}${(C + dx).toFixed(1)} ${(C - R_CRENEAU - h).toFixed(1)}`)
    .join("") + "Z";

export function RosaceZellige({
  faits,
  selection,
  onChoisir,
  pret,
}: {
  faits: number[];
  selection: number;
  onChoisir: (n: number) => void;
  pret: boolean;
}) {
  const lustre = `lustre-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ensemble = new Set(pret ? faits : []);
  const nombre = ensemble.size;
  const juzComplet = (j: number) => ensemble.has(2 * j - 1) && ensemble.has(2 * j);
  const rotation = (nombre / 60) * 45;

  function clavier(e: KeyboardEvent<SVGGElement>) {
    const pas: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, PageDown: 2, PageUp: -2 };
    if (e.key in pas) {
      e.preventDefault();
      onChoisir(((selection - 1 + pas[e.key] + 60) % 60) + 1);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      onChoisir(e.key === "Home" ? 1 : 60);
    }
  }

  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[300px] mx-auto block select-none" role="group" aria-label="Les 60 hizb du Coran, en rosace de zellige">
      <defs>
        <linearGradient id={lustre} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.14" />
        </linearGradient>
      </defs>

      {/* La couronne de créneaux */}
      {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
        const complet = juzComplet(j);
        return (
          <g key={j} transform={`rotate(${(j - 1) * 12 + 6} ${C} ${C})`} aria-hidden>
            <path d={CRENEAU} fill={TERRES[j % 3]} />
            <path d={CRENEAU} fill={j % 5 === 0 ? EMAIL.miel : EMAIL.vert} opacity={complet ? 1 : 0} className="transition-opacity duration-700" />
            <path d={CRENEAU} fill={`url(#${lustre})`} opacity={complet ? 1 : 0} className="transition-opacity duration-700" />
            <path d={CRENEAU} fill="none" stroke={JOINT} strokeWidth={1} strokeLinejoin="round" />
          </g>
        );
      })}

      {/* Le lit de ciment */}
      <circle cx={C} cy={C} r={R_POINTE + 2} fill={JOINT} />
      <circle cx={C} cy={C} r={R_POINTE + 2.5} fill="none" stroke={MANGANESE} strokeWidth={0.8} opacity={0.35} />

      {/* Les dents de scie, en manganèse */}
      <g aria-hidden>
        {Array.from({ length: 60 }, (_, k) => (
          <path key={k} d={`M${pt(92, k * 6)}L${pt(101, k * 6 + 3)}L${pt(92, (k + 1) * 6)}Z`} fill={MANGANESE} />
        ))}
      </g>

      {/* L'étoile à seize branches, qui tourne avec la khatma */}
      <g
        style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${C}px ${C}px`, transition: "transform 900ms cubic-bezier(.2,.8,.2,1)" }}
        aria-hidden
      >
        <path d={etoile8(84, 22.5)} fill={EMAIL.vert} stroke={JOINT} strokeWidth={2} strokeLinejoin="round" />
        <path d={etoile8(84, 0)} fill={EMAIL.bleu} stroke={JOINT} strokeWidth={2} strokeLinejoin="round" />
        <path d={etoile8(84, 0)} fill={`url(#${lustre})`} />
        <path d={etoile8(46, 22.5)} fill={EMAIL.miel} stroke={JOINT} strokeWidth={2} strokeLinejoin="round" />
        <path d={etoile8(46, 22.5)} fill={`url(#${lustre})`} />
      </g>

      {/* Le médaillon */}
      <circle cx={C} cy={C} r={31} fill={JOINT} stroke={MANGANESE} strokeWidth={1.2} />
      <circle cx={C} cy={C} r={27} fill="none" stroke={MANGANESE} strokeWidth={0.6} opacity={0.35} />
      {/* Tout en arabe. À zéro, pas de « ٠ » (un simple point à l'œil) : la khatma commence par la basmala */}
      <text
        x={C}
        y={nombre === 0 || nombre === 60 ? C + 3 : C + 5}
        textAnchor="middle"
        direction="rtl"
        fontSize={nombre === 0 ? 13 : nombre === 60 ? 17 : 25}
        fill={MANGANESE}
        style={{ fontFamily: "var(--font-arabic)" }}
      >
        {!pret ? "" : nombre === 0 ? "بِسْمِ اللّٰه" : nombre === 60 ? "خَتْمَة" : indoArabe(nombre)}
      </text>
      <text
        x={C}
        y={C + 18}
        textAnchor="middle"
        direction="rtl"
        fontSize={9}
        fill="#6b5a45"
        style={{ fontFamily: "var(--font-arabic)" }}
      >
        {!pret ? "" : nombre === 0 ? "٦٠ حِزْبًا" : nombre === 60 ? "مُبَارَكَة" : "مِنْ ٦٠ حِزْبًا"}
      </text>

      {/* Les 60 tesselles */}
      <g
        role="listbox"
        aria-label="Choisir un hizb"
        tabIndex={0}
        onKeyDown={clavier}
        className="outline-none focus-visible:[&_.hizb-choisi]:stroke-[3.4]"
      >
        {Array.from({ length: 60 }, (_, i) => i + 1).map((n) => {
          const d = tesselle(n);
          const fait = ensemble.has(n);
          const juz = Math.ceil(n / 2);
          return (
            <g
              key={n}
              role="option"
              aria-selected={n === selection}
              aria-label={`Hizb ${n}, juz ${juz}${fait ? ", mémorisé" : ""}`}
              onClick={() => onChoisir(n)}
              className="cursor-pointer transition-opacity hover:opacity-85"
            >
              <title>{`Hizb ${n} · juz ${juz}${fait ? " · mémorisé" : ""}`}</title>
              <path d={d} fill={TERRES[(n * 7) % 3]} />
              <path d={d} fill={couleurEmail(n)} opacity={fait ? 1 : 0} className="transition-opacity duration-700" />
              <path d={d} fill={`url(#${lustre})`} opacity={fait ? 1 : 0} className="transition-opacity duration-700" />
              <path d={d} fill="none" stroke={JOINT} strokeWidth={1.6} strokeLinejoin="round" />
            </g>
          );
        })}
        <path
          d={tesselle(selection)}
          fill="none"
          stroke={MANGANESE}
          strokeWidth={2.4}
          strokeLinejoin="round"
          pointerEvents="none"
          className="hizb-choisi"
        />
      </g>
    </svg>
  );
}
