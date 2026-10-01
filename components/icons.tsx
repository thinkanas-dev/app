import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

/** Vue d'ensemble — grille avec une tuile pleine */
export function IconGrid({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <rect x="3" y="3" width="8" height="8" rx="2.5" fill="currentColor" />
      <rect x="13" y="3" width="8" height="8" rx="2.5" fill="currentColor" opacity="0.28" />
      <rect x="3" y="13" width="8" height="8" rx="2.5" fill="currentColor" opacity="0.28" />
      <rect x="13" y="13" width="8" height="8" rx="2.5" fill="currentColor" opacity="0.28" />
    </svg>
  );
}

/** Progression — barres croissantes, la dernière pleine */
export function IconTrendingUp({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <rect x="3" y="13" width="4.6" height="8" rx="1.6" fill="currentColor" opacity="0.28" />
      <rect x="9.7" y="9" width="4.6" height="12" rx="1.6" fill="currentColor" opacity="0.28" />
      <rect x="16.4" y="4" width="4.6" height="17" rx="1.6" fill="currentColor" />
    </svg>
  );
}

/** Le Coran — livre fermé avec marque-page */
export function IconBook({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path
        d="M5 5.2A3.2 3.2 0 0 1 8.2 2H18a1.2 1.2 0 0 1 1.2 1.2v16.3A1.2 1.2 0 0 1 18 20.7H8.2A3.2 3.2 0 0 0 5 23.9z"
        fill="currentColor"
        opacity="0.28"
      />
      <path d="M10.4 2h4.6v7.4l-2.3-1.7-2.3 1.7z" fill="currentColor" />
    </svg>
  );
}

/** Constance — flamme duotone */
export function IconFlame({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path
        d="M12.6 1.8c3.9 4.2 6.4 6.7 6.4 10.6a7 7 0 0 1-14 0c0-2.3 1-4 2.5-5.6.2 1.4 1 2.3 2.1 2.3.8-3.9-.5-5.3 3-7.3z"
        fill="currentColor"
        opacity="0.28"
      />
      <path
        d="M12 22.2a4 4 0 0 0 4-4c0-2.2-1.5-3.4-2.6-4.8-.8 1.2-1.4 1.9-2.5 1.9-1 0-1.6-.6-1.9-1.5-.7 1-1 2.2-1 3.4a4 4 0 0 0 4 5z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Échéances — calendrier avec jour marqué */
export function IconCalendar({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <rect x="2.8" y="4.6" width="18.4" height="16.6" rx="3.4" fill="currentColor" opacity="0.28" />
      <path
        d="M7.4 2v3.2M16.6 2v3.2"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <rect x="6.4" y="11.2" width="5.2" height="5.2" rx="1.7" fill="currentColor" />
    </svg>
  );
}

/** Statuts — fiche avec coche */
export function IconChecklist({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <rect x="3.6" y="2.6" width="16.8" height="18.8" rx="3.4" fill="currentColor" opacity="0.28" />
      <path
        d="M8.4 12.4l2.4 2.4 4.8-5"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Patrimoine — pièce / valeur */
export function IconWallet({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <rect x="2.6" y="5.4" width="18.8" height="14.4" rx="3.4" fill="currentColor" opacity="0.28" />
      <path d="M15.2 10.6h6.2v4.6h-6.2a2.3 2.3 0 0 1 0-4.6z" fill="currentColor" />
    </svg>
  );
}

/** Réseaux — signal / audience */
export function IconAudience({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <circle cx="9" cy="8.2" r="3.6" fill="currentColor" />
      <circle cx="16.8" cy="9.4" r="2.6" fill="currentColor" opacity="0.28" />
      <path
        d="M2.8 19.4c0-3.1 2.8-5.2 6.2-5.2s6.2 2.1 6.2 5.2z"
        fill="currentColor"
        opacity="0.28"
      />
      <path d="M16.6 14.6c2.6.2 4.6 1.9 4.6 4.2h-4.2z" fill="currentColor" opacity="0.28" />
    </svg>
  );
}

export function IconArrowRight({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path
        d="M5 12h13M12.5 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconArrowUpRight({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path
        d="M7 17L17 7M9.2 7H17v7.8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconMenu({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path
        d="M4 7h16M4 12h16M4 17h10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Double chevron — replie le panneau vers la gauche */
export function IconChevronsLeft({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path
        d="M14.5 6.5L9 12l5.5 5.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 6.5L13.5 12 19 17.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
    </svg>
  );
}

/** Double chevron — déplie le panneau vers la droite */
export function IconChevronsRight({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path
        d="M9.5 6.5L15 12l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 6.5L10.5 12 5 17.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
    </svg>
  );
}

export function IconClose({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSearch({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.1" />
      <path d="M20 20l-3.6-3.6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

export function IconBell({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path
        d="M18 8.6a6 6 0 1 0-12 0c0 6.4-2.6 8.2-2.6 8.2h17.2S18 15 18 8.6z"
        fill="currentColor"
        opacity="0.28"
      />
      <path d="M13.8 20.6a2 2 0 0 1-3.6 0z" fill="currentColor" />
    </svg>
  );
}

export function IconRefresh({ width = 13, height = 13, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path
        d="M20.4 12a8.4 8.4 0 1 1-2.6-6.1"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path d="M20.8 3.4v5.2h-5.2" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDownload({ width = 13, height = 13, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path d="M12 3v11" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M7.6 10.2L12 14.6l4.4-4.4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17.6v1.2A2.2 2.2 0 0 0 6.2 21h11.6a2.2 2.2 0 0 0 2.2-2.2v-1.2" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

/** Programme — cadran avec son aiguille */
export function IconClock({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <circle cx="12" cy="12" r="9.4" fill="currentColor" opacity="0.28" />
      <path
        d="M12 6.8V12l3.6 2.2"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Navigateur — un globe et son méridien */
export function IconGlobe({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <circle cx="12" cy="12" r="9.4" fill="currentColor" opacity="0.28" />
      <path
        d="M2.8 12h18.4M12 2.6c2.6 2.6 3.9 5.7 3.9 9.4s-1.3 6.8-3.9 9.4c-2.6-2.6-3.9-5.7-3.9-9.4S9.4 5.2 12 2.6z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tapisserie — une tuile de zellige : quatre pétales et un cœur */
export function IconMosaique({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg {...base} width={width} height={height} {...props}>
      <path d="M3 3h18L12 12z" fill="currentColor" />
      <path d="M21 3v18l-9-9zM3 21V3l9 9z" fill="currentColor" opacity="0.28" />
      <path d="M21 21H3l9-9z" fill="currentColor" opacity="0.55" />
    </svg>
  );
}
