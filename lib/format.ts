/**
 * Chiffres à la française : virgule décimale, et aucune décimale inutile
 * (16,1 et non 16.10 ; 16,7 et non 17).
 */
export function formatNote(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n);
}
