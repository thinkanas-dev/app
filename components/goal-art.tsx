import { useId, type SVGProps } from "react";

/**
 * Illustrations dessinées pour ce projet — un pictogramme par objectif.
 * Chaque dessin est monochrome tonal : il hérite de `currentColor` et
 * superpose 3 niveaux d'opacité (masse / forme / détail) pour donner du relief.
 */

type ArtProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 48 48",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

/**
 * Véhicule — une berline allemande de face, dans l'esprit des bavaroises :
 * double calandre « haricot » au centre, doubles optiques annulaires étirées
 * vers les ailes, capot nervuré. Un dessin original, sans aucun emblème de marque.
 */
export function ArtVehicule({ width = 28, height = 28, ...props }: ArtProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      {/* Pneus, visibles sous la caisse */}
      <rect x="6" y="33.4" width="6.4" height="6.6" rx="1.6" fill="currentColor" />
      <rect x="35.6" y="33.4" width="6.4" height="6.6" rx="1.6" fill="currentColor" />
      {/* Caisse large et basse, pavillon resserré */}
      <path
        d="M13.8 12.8c.4-1 1.3-1.6 2.4-1.6h15.6c1.1 0 2 .6 2.4 1.6l3.2 7.8 4.4 1.2c1.4.4 2.4 1.7 2.4 3.2v9.6c0 1.3-1.1 2.4-2.4 2.4H6.2c-1.3 0-2.4-1.1-2.4-2.4V25c0-1.5 1-2.8 2.4-3.2l4.4-1.2z"
        fill="currentColor"
        opacity="0.24"
      />
      {/* Pare-brise et rétroviseurs */}
      <path d="M16.6 13.4h14.8l4.4 7H12.2z" fill="currentColor" opacity="0.6" />
      <path d="M5.2 18.2h4.6l.6 2.2H6.4a1.2 1.2 0 0 1-1.2-1.2zM42.8 18.2h-4.6l-.6 2.2h4a1.2 1.2 0 0 0 1.2-1.2z" fill="currentColor" opacity="0.55" />
      {/* Nervures du capot, qui plongent vers la calandre */}
      <path d="M20.6 21.4l.9 2.4M27.4 21.4l-.9 2.4" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.45" />
      {/* Optiques : boîtier effilé et doubles anneaux lumineux */}
      <path d="M5.8 23.2l11.6.5-.9 4.5-9.6-.5c-.8 0-1.4-.7-1.4-1.5v-1.5c0-.8.6-1.5 1.4-1.5z" fill="currentColor" opacity="0.55" />
      <path d="M42.2 23.2l-11.6.5.9 4.5 9.6-.5c.8 0 1.4-.7 1.4-1.5v-1.5c0-.8-.6-1.5-1.4-1.5z" fill="currentColor" opacity="0.55" />
      <g stroke="currentColor" strokeWidth="1.1">
        <circle cx="9.3" cy="25.6" r="1.7" />
        <circle cx="13.6" cy="25.8" r="1.6" />
        <circle cx="38.7" cy="25.6" r="1.7" />
        <circle cx="34.4" cy="25.8" r="1.6" />
      </g>
      {/* Double calandre à lamelles verticales */}
      <g stroke="currentColor" strokeLinecap="round">
        <rect x="18.6" y="23.6" width="4.8" height="7.8" rx="2" strokeWidth="1.4" />
        <rect x="24.6" y="23.6" width="4.8" height="7.8" rx="2" strokeWidth="1.4" />
        <path d="M20.2 25.4v4.2M21.8 25.4v4.2M26.2 25.4v4.2M27.8 25.4v4.2" strokeWidth="0.7" opacity="0.6" />
      </g>
      {/* Bouclier : prises d'air latérales et lame centrale */}
      <path d="M7.4 31.6h6.6M34 31.6h6.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      <rect x="16.6" y="33.2" width="14.8" height="2" rx="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

/**
 * Bien immobilier — un appartement de nouvelle génération, dans l'esprit de la
 * tour de Casablanca Finance City : un cristal à facettes qui s'affine vers le
 * haut comme vers le sol (la « double couronne »), couronne biseautée, et une
 * peau de brise-soleil en losanges, cousine des moucharabiehs. De part et
 * d'autre, les tours plus basses du quartier.
 */
export function ArtImmobilier({ width = 28, height = 28, ...props }: ArtProps) {
  const treillis = `treillis-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg {...base} width={width} height={height} {...props}>
      <defs>
        {/* Le brise-soleil : des losanges évidés dans les facettes */}
        <mask id={treillis} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
          <rect width="48" height="48" fill="white" />
          <g stroke="black" strokeWidth="0.75">
            {Array.from({ length: 28 }, (_, k) => {
              const c = -24 + k * 3.6;
              return <path key={k} d={`M${c} 0L${c + 24} 48M${c + 24} 0L${c} 48`} />;
            })}
          </g>
        </mask>
      </defs>

      {/* Le quartier : deux tours plus basses */}
      <path d="M7.4 42V30.6l5.6-1.8V42z" fill="currentColor" opacity="0.2" />
      <path d="M35.4 42V19.6l5-2.8V42z" fill="currentColor" opacity="0.2" />

      {/* La tour : quatre facettes, plus sombres côté ombre */}
      <g mask={`url(#${treillis})`}>
        <path d="M16.2 9.6L25.2 6.2l-1 20.8-9.6-1z" fill="currentColor" opacity="0.55" />
        <path d="M14.6 26l9.6 1 .4 14.6h-5z" fill="currentColor" opacity="0.4" />
        <path d="M25.2 6.2l7.2 5.6 1.8 13.2-10 2z" fill="currentColor" opacity="0.9" />
        <path d="M24.2 27l10-2-4.4 16.6h-5.2z" fill="currentColor" opacity="0.72" />
      </g>
      {/* Arêtes du cristal */}
      <path
        d="M16.2 9.6L25.2 6.2l7.2 5.6M14.6 26l9.6 1 10-2M25.2 6.2l-1 20.8.4 14.6"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinejoin="round"
        opacity="0.5"
      />
      {/* L'esplanade au pied de la tour */}
      <path d="M5.6 42.2h36.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Patrimoine — pile de pièces */
export function ArtPatrimoine({ width = 28, height = 28, ...props }: ArtProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <ellipse cx="24" cy="34.6" rx="14" ry="5.2" fill="currentColor" opacity="0.22" />
      <path d="M10 27.6v7c0 2.9 6.3 5.2 14 5.2s14-2.3 14-5.2v-7z" fill="currentColor" opacity="0.35" />
      <ellipse cx="24" cy="27.6" rx="14" ry="5.2" fill="currentColor" opacity="0.55" />
      <path d="M13.4 19.2v6.2c0 2.5 4.8 4.4 10.6 4.4s10.6-1.9 10.6-4.4v-6.2z" fill="currentColor" opacity="0.62" />
      <ellipse cx="24" cy="19.2" rx="10.6" ry="4.4" fill="currentColor" />
      <path d="M24 11.4v5.4M21.2 13.2h5.6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

/** Moyenne académique — toque de diplômé */
export function ArtDiplome({ width = 28, height = 28, ...props }: ArtProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path d="M13 24.5v7.8c0 2.9 4.9 5.2 11 5.2s11-2.3 11-5.2v-7.8z" fill="currentColor" opacity="0.28" />
      <path
        d="M23 12.6a2.4 2.4 0 0 1 2 0l17.4 7.6a1.4 1.4 0 0 1 0 2.6L25 30.4a2.4 2.4 0 0 1-2 0L5.6 22.8a1.4 1.4 0 0 1 0-2.6z"
        fill="currentColor"
        opacity="0.6"
      />
      <path d="M24 17.8l11.6 5.1L24 28 12.4 22.9z" fill="currentColor" />
      <path d="M39.6 23.8v8.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="39.6" cy="34.4" r="2.4" fill="currentColor" />
    </svg>
  );
}

/** Coran — livre ouvert avec marque-page */
export function ArtCoran({ width = 28, height = 28, ...props }: ArtProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path
        d="M6 13.4c4.8-1.8 9.6-2.4 15-.6a2 2 0 0 1 1.4 1.9v20.6c-5.6-2.2-10.8-1.6-15.7.4A1.4 1.4 0 0 1 4.6 34.4V15.3c0-.8.5-1.6 1.4-1.9z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M42 13.4c-4.8-1.8-9.6-2.4-15-.6a2 2 0 0 0-1.4 1.9v20.6c5.6-2.2 10.8-1.6 15.7.4a1.4 1.4 0 0 0 2.1-1.3V15.3c0-.8-.5-1.6-1.4-1.9z"
        fill="currentColor"
        opacity="0.55"
      />
      <path d="M24 14.8v21.4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M30.6 10.8h6.8v11l-3.4-2.6-3.4 2.6z" fill="currentColor" />
    </svg>
  );
}

/** Langues — bulles de dialogue */
export function ArtLangues({ width = 28, height = 28, ...props }: ArtProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path
        d="M8 13.6A4.6 4.6 0 0 1 12.6 9h16.8A4.6 4.6 0 0 1 34 13.6v8.2a4.6 4.6 0 0 1-4.6 4.6H19.8L12 32.2v-5.8h-.4A3.6 3.6 0 0 1 8 22.8z"
        fill="currentColor"
        opacity="0.28"
      />
      <path
        d="M20 24.6a4.6 4.6 0 0 1 4.6-4.6h10.8A4.6 4.6 0 0 1 40 24.6v6.6a4.6 4.6 0 0 1-4.6 4.6h-.6v5l-6.8-5h-3.4a4.6 4.6 0 0 1-4.6-4.6z"
        fill="currentColor"
        opacity="0.62"
      />
      <circle cx="26.6" cy="28" r="1.9" fill="currentColor" />
      <circle cx="32.4" cy="28" r="1.9" fill="currentColor" />
      <circle cx="38" cy="28" r="1.9" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

/** Spécialisation — tête et connexions */
export function ArtSpecialisation({ width = 28, height = 28, ...props }: ArtProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path
        d="M24 7c8.3 0 15 6.3 15 14 0 4.7-2.5 8.8-6.3 11.3V38a2 2 0 0 1-2 2H17.3a2 2 0 0 1-2-2v-5.7C11.5 29.8 9 25.7 9 21c0-7.7 6.7-14 15-14z"
        fill="currentColor"
        opacity="0.24"
      />
      <circle cx="18.6" cy="19.4" r="3.4" fill="currentColor" opacity="0.75" />
      <circle cx="29.4" cy="17" r="2.6" fill="currentColor" opacity="0.75" />
      <circle cx="29.8" cy="26.4" r="3" fill="currentColor" />
      <path
        d="M21.4 20.6l6 4.6M21 17.6l6-1M29.6 19.6v3.8"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

/** Histoire du Maroc — la carte du Maroc avec l'étoile chérifienne et la date 789 */
export function ArtHistoire({ width = 28, height = 28, ...props }: ArtProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      {/* Halo de fond architectural marocain (Arc outrepassé) */}
      <path
        d="M 12 18 C 12 10.5 17.4 6 24 6 C 30.6 6 36 10.5 36 18 L 36 40 L 12 40 Z"
        fill="currentColor"
        opacity="0.14"
      />
      {/* Silhouette emblématique de la carte du Maroc (de Tanger au Sahara) */}
      <path
        d="M 22 7
           C 24 7.2, 26 7.5, 27.5 8
           C 29.5 8.6, 31.5 9, 33 10.2
           C 34.2 11.2, 34 12.8, 33 14.2
           C 32 15.8, 30.5 17, 29.8 18.8
           C 29 20.8, 29.5 22.8, 28.8 24.8
           C 28 26.8, 26.5 28.2, 25.5 30
           C 24.2 32.2, 23.8 34.8, 22.5 36.8
           C 21.2 38.5, 19.5 39.8, 18 41.5
           C 16.8 42.8, 15.8 44.5, 14.5 45.5
           C 13.5 46.2, 12.2 45.8, 11.2 45.2
           C 10.2 44.5, 10 43, 9.8 41.5
           C 9.4 39.5, 9.6 37.5, 9.8 35.5
           C 10 33.2, 10.5 31, 11.2 28.8
           C 12 26.2, 13 23.8, 14.2 21.5
           C 15.4 19.2, 16.8 17, 18.2 14.8
           C 19.5 12.5, 20.5 9.8, 22 7 Z"
        fill="currentColor"
        opacity="0.45"
      />
      {/* Contour / relief côtier de la carte */}
      <path
        d="M 22 7
           C 24 7.2, 26 7.5, 27.5 8
           C 29.5 8.6, 31.5 9, 33 10.2
           C 34.2 11.2, 34 12.8, 33 14.2
           C 32 15.8, 30.5 17, 29.8 18.8
           C 29 20.8, 29.5 22.8, 28.8 24.8
           C 28 26.8, 26.5 28.2, 25.5 30
           C 24.2 32.2, 23.8 34.8, 22.5 36.8
           C 21.2 38.5, 19.5 39.8, 18 41.5
           C 16.8 42.8, 15.8 44.5, 14.5 45.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* Étoile chérifienne à 5 branches du drapeau marocain au centre */}
      <path
        d="M 22.5 14.5 L 23.5 17.5 L 26.5 17.5 L 24 19.3 L 25 22.3 L 22.5 20.5 L 20 22.3 L 21 19.3 L 18.5 17.5 L 21.5 17.5 Z"
        fill="currentColor"
        opacity="0.95"
      />
      {/* Socle temporel "789" stylisé au bas du logo */}
      <text
        x="24"
        y="38.5"
        textAnchor="middle"
        fontSize="7"
        fontWeight="800"
        fill="currentColor"
        fontFamily="sans-serif"
        letterSpacing="0.6"
        opacity="0.95"
      >
        789
      </text>
      {/* Ligne de sol / socle impérial */}
      <path d="M 8 42 L 40 42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}


/** Prière — mosquée */
export function ArtPriere({ width = 28, height = 28, ...props }: ArtProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path d="M11 24.4h26V39a1.6 1.6 0 0 1-1.6 1.6H12.6A1.6 1.6 0 0 1 11 39z" fill="currentColor" opacity="0.24" />
      <path d="M24 10.6c5.2 3.3 8 7.2 8 10.8 0 1.3-.4 2.3-1 3H17c-.6-.7-1-1.7-1-3 0-3.6 2.8-7.5 8-10.8z" fill="currentColor" opacity="0.6" />
      <path d="M24 30.2c2.4 0 4 1.8 4 4.2v6.2h-8v-6.2c0-2.4 1.6-4.2 4-4.2z" fill="currentColor" />
      <rect x="6.4" y="19.4" width="3.6" height="21.2" rx="1.6" fill="currentColor" opacity="0.55" />
      <rect x="38" y="19.4" width="3.6" height="21.2" rx="1.6" fill="currentColor" opacity="0.55" />
      <circle cx="8.2" cy="16.4" r="2.2" fill="currentColor" opacity="0.75" />
      <circle cx="39.8" cy="16.4" r="2.2" fill="currentColor" opacity="0.75" />
      <path d="M24 5.4v4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

/** Hajj — Kaaba */
export function ArtHajj({ width = 28, height = 28, ...props }: ArtProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <ellipse cx="24" cy="39.4" rx="16" ry="3.4" fill="currentColor" opacity="0.18" />
      <path d="M11.6 15.6L24 10.6l12.4 5v20.2L24 40.8l-12.4-5z" fill="currentColor" opacity="0.55" />
      <path d="M24 15.6v25.2l12.4-5V15.6z" fill="currentColor" opacity="0.32" />
      <path d="M11.6 22.6l12.4 5 12.4-5v4.2l-12.4 5-12.4-5z" fill="currentColor" />
      <path d="M21 7.4l3-2.4 3 2.4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

/** Audience — croissance de communauté */
export function ArtAudience({ width = 28, height = 28, ...props }: ArtProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <circle cx="16" cy="15.6" r="6.4" fill="currentColor" opacity="0.6" />
      <path d="M4.6 36c0-5.7 5.1-9.6 11.4-9.6S27.4 30.3 27.4 36a1.6 1.6 0 0 1-1.6 1.6H6.2A1.6 1.6 0 0 1 4.6 36z" fill="currentColor" opacity="0.28" />
      <circle cx="32.6" cy="18.4" r="4.8" fill="currentColor" opacity="0.4" />
      <path d="M30.4 27.2c6 .3 13 3 13 8.8a1.6 1.6 0 0 1-1.6 1.6H31.4z" fill="currentColor" opacity="0.22" />
      <path d="M35.6 13.4l2.6-2.6M38.2 10.8h-3M38.2 10.8v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const goalArt: Record<string, (p: ArtProps) => React.ReactElement> = {
  vehicule: ArtVehicule,
  immobilier: ArtImmobilier,
  patrimoine: ArtPatrimoine,
  moyenne: ArtDiplome,
  hizb: ArtCoran,
  "instagram-tiktok": ArtAudience,
  linkedin: ArtAudience,
  langues: ArtLangues,
  francais: ArtLangues,
  anglais: ArtLangues,
  espagnol: ArtLangues,
  allemand: ArtLangues,
  specialisation: ArtSpecialisation,
  "histoire-maroc": ArtHistoire,
  priere: ArtPriere,
  hajj: ArtHajj,
  "hizb-deadline": ArtCoran,
};
