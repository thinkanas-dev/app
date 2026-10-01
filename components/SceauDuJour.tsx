"use client";

/**
 * Le sceau du jour : un tampon de bibliothèque, daté, posé de travers.
 *
 * Le bord n'est pas un cercle parfait — un filtre de turbulence déforme
 * légèrement le tracé, comme un tampon encré à la main. C'est ce défaut
 * volontaire qui empêche la carte de ressembler à un composant générique.
 */
export function SceauDuJour({
  jour,
  mois,
  annee,
  couleur,
  taille = 76,
}: {
  jour: number;
  mois: string;
  annee: number;
  couleur: string;
  taille?: number;
}) {
  // Identifiant unique : deux sceaux sur une même page ne doivent pas
  // se partager le même filtre SVG.
  const id = `sceau-${jour}-${annee}`;

  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Sceau du ${jour} ${mois} ${annee}`}
      style={{ color: couleur }}
      className="shrink-0"
    >
      <defs>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves={2} seed={jour} />
          <feDisplacementMap in="SourceGraphic" scale="1.7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <path id={`${id}-arc`} d="M 20,50 A 30,30 0 0 1 80,50" fill="none" />
      </defs>

      <g
        filter={`url(#${id})`}
        transform="rotate(-7 50 50)"
        fill="none"
        stroke="currentColor"
        opacity={0.9}
      >
        <circle cx="50" cy="50" r="45" strokeWidth="2.4" />
        <circle cx="50" cy="50" r="38.5" strokeWidth="0.9" />

        <text
          fill="currentColor"
          stroke="none"
          fontSize="7.6"
          fontWeight={600}
          letterSpacing="1.6"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">
            RITUEL DU JOUR
          </textPath>
        </text>

        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
          fontSize="30"
          fontWeight={600}
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {jour}
        </text>

        <text
          x="50"
          y="70"
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
          fontSize="7.2"
          letterSpacing="1.2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {mois.slice(0, 4).toUpperCase()} {annee}
        </text>

        <line x1="30" y1="35" x2="70" y2="35" strokeWidth="0.8" />
      </g>
    </svg>
  );
}
