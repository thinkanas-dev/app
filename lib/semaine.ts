/** Utilitaires de semaine scolaire : lundi → vendredi, libellés en français. */

const mois = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function parseISO(iso: string) {
  return new Date(iso + "T00:00:00");
}

export function toISO(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Ramène n'importe quelle date au lundi de sa semaine. */
export function lundiDe(d: Date): Date {
  const copie = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const jour = (copie.getDay() + 6) % 7; // lundi = 0
  copie.setDate(copie.getDate() - jour);
  return copie;
}

/** Numéro de semaine ISO, utilisé pour le tri et le badge. */
export function numeroSemaine(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const jour = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - jour + 3); // jeudi de la semaine
  const premierJeudi = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const decalage = (premierJeudi.getUTCDay() + 6) % 7;
  premierJeudi.setUTCDate(premierJeudi.getUTCDate() - decalage + 3);
  return 1 + Math.round((date.getTime() - premierJeudi.getTime()) / (7 * 86_400_000));
}

/**
 * « du 14 au 18 septembre », ou « du 28 septembre au 2 octobre » si la semaine
 * est à cheval sur deux mois. L'année n'apparaît que si elle diffère de l'année
 * en cours.
 */
export function libelleSemaine(debutISO: string): string {
  const lundi = parseISO(debutISO);
  const vendredi = new Date(lundi);
  vendredi.setDate(lundi.getDate() + 4);

  const memeMois = lundi.getMonth() === vendredi.getMonth();
  const anneeCourante = new Date().getFullYear();
  const suffixeAnnee =
    vendredi.getFullYear() !== anneeCourante ? ` ${vendredi.getFullYear()}` : "";

  if (memeMois) {
    return `du ${lundi.getDate()} au ${vendredi.getDate()} ${mois[vendredi.getMonth()]}${suffixeAnnee}`;
  }
  return `du ${lundi.getDate()} ${mois[lundi.getMonth()]} au ${vendredi.getDate()} ${mois[vendredi.getMonth()]}${suffixeAnnee}`;
}

/** Lundi de la semaine en cours, au format ISO. */
export function lundiCourantISO(): string {
  return toISO(lundiDe(new Date()));
}

/**
 * Lundi à proposer par défaut : celui de la semaine en cours du lundi au
 * mercredi, puis celui de la semaine suivante — à partir de jeudi on prépare
 * la semaine à venir, pas celle qui s'achève.
 */
export function lundiPertinentISO(): string {
  const aujourdhui = new Date();
  const jour = (aujourdhui.getDay() + 6) % 7; // lundi = 0
  const lundi = lundiDe(aujourdhui);
  if (jour >= 3) lundi.setDate(lundi.getDate() + 7);
  return toISO(lundi);
}
