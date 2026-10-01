/**
 * Drapeaux dessinés en SVG (pas d'emoji) : rendu identique sur toutes les
 * plateformes et net à petite taille.
 */

type FlagProps = { width?: number; height?: number; className?: string };

export function FlagFR({ width = 20, height = 14, className = "" }: FlagProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 16"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-[2px] ${className}`}
      role="img"
      aria-label="Français"
    >
      <rect width="8" height="16" fill="#002654" />
      <rect x="8" width="8" height="16" fill="#FFFFFF" />
      <rect x="16" width="8" height="16" fill="#ED2939" />
      <rect
        width="24"
        height="16"
        fill="none"
        stroke="rgba(15,23,42,0.12)"
        strokeWidth="1"
      />
    </svg>
  );
}

export function FlagMA({ width = 20, height = 14, className = "" }: FlagProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 16"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-[2px] ${className}`}
      role="img"
      aria-label="العربية"
    >
      <rect width="24" height="16" fill="#C1272D" />
      {/* Pentagramme entrelacé, tracé en ligne continue */}
      <path
        d="M12 3.4 L14.7 11.72 L7.63 6.58 L16.37 6.58 L9.3 11.72 Z"
        fill="none"
        stroke="#006233"
        strokeWidth="0.95"
        strokeLinejoin="round"
      />
      <rect
        width="24"
        height="16"
        fill="none"
        stroke="rgba(15,23,42,0.12)"
        strokeWidth="1"
      />
    </svg>
  );
}
