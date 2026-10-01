/*
 * Les objectifs dessinés en lumière : des silhouettes au trait blanc, que le feu
 * d'artifice échantillonne pour placer ses particules. Les tracés reprennent
 * ceux des pictogrammes de l'app (components/goal-art.tsx).
 */

const trait = (contenu: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${contenu}</svg>`;

function etoile8(rayon: number, decalage: number) {
  return (
    Array.from({ length: 16 }, (_, k) => {
      const r = k % 2 ? rayon * 0.7654 : rayon;
      const a = ((k * 22.5 + decalage - 90) * Math.PI) / 180;
      return `${k ? "L" : "M"}${(24 + r * Math.cos(a)).toFixed(2)} ${(24 + r * Math.sin(a)).toFixed(2)}`;
    }).join("") + "Z"
  );
}

export const SILHOUETTES = {
  /** Le rub el-hizb du mushaf */
  coran: trait(`<path d="${etoile8(20, 0)}"/><path d="${etoile8(20, 22.5)}"/><circle cx="24" cy="24" r="6.5"/>`),

  /** La berline, de face : calandre double et optiques annulaires */
  vehicule: trait(
    `<path d="M13.8 12.8c.4-1 1.3-1.6 2.4-1.6h15.6c1.1 0 2 .6 2.4 1.6l3.2 7.8 4.4 1.2c1.4.4 2.4 1.7 2.4 3.2v9.6c0 1.3-1.1 2.4-2.4 2.4H6.2c-1.3 0-2.4-1.1-2.4-2.4V25c0-1.5 1-2.8 2.4-3.2l4.4-1.2z"/>` +
      `<path d="M16.6 13.4h14.8l4.4 7H12.2z"/>` +
      `<rect x="18.6" y="23.6" width="4.8" height="7.8" rx="2"/><rect x="24.6" y="23.6" width="4.8" height="7.8" rx="2"/>` +
      `<circle cx="9.3" cy="25.6" r="1.7"/><circle cx="13.6" cy="25.8" r="1.6"/><circle cx="38.7" cy="25.6" r="1.7"/><circle cx="34.4" cy="25.8" r="1.6"/>` +
      `<path d="M7.4 31.6h6.6M34 31.6h6.6M16.6 34.2h14.8"/>`
  ),

  /** La tour de cristal, façon Casablanca Finance City */
  immobilier: trait(
    `<path d="M16.2 9.6L25.2 6.2l7.2 5.6 1.8 13.2-4.4 16.6H19.6L14.6 26z"/>` +
      `<path d="M14.6 26l9.6 1 10-2M25.2 6.2l-1 20.8.4 14.6"/>` +
      `<path d="M18.5 15l10 10M17 21l12 12M29.5 11l-12 12M31.5 19l-11 11"/>` +
      `<path d="M7.4 42V30.6l5.6-1.8V42M35.4 42V19.6l5-2.8V42M5.6 42.2h36.8"/>`
  ),
};
