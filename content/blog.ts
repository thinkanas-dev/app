export type AccentColor = "clay" | "fig" | "cactus" | "sky";

export const blogContent = {
  eyebrow: "Recherche",
  heading: "Dernières entrées",
  intro: "Ceci est une grille d'espace réservé. Remplacez chaque entrée par vos propres articles — le tag coloré illustre la palette d'accent dormante du design system, réservée à ce type de page.",
  posts: [
    {
      slug: "premiere-entree",
      accent: "clay" as AccentColor,
      category: "Recherche technique",
      title: "Titre d'article d'exemple numéro un",
      excerpt: "Un court résumé d'exemple décrivant le contenu de cet article de recherche.",
      date: "2026-08-01",
    },
    {
      slug: "deuxieme-entree",
      accent: "fig" as AccentColor,
      category: "Société & économie",
      title: "Titre d'article d'exemple numéro deux",
      excerpt: "Un court résumé d'exemple décrivant le contenu de cet article.",
      date: "2026-07-18",
    },
    {
      slug: "troisieme-entree",
      accent: "cactus" as AccentColor,
      category: "Recherche technique",
      title: "Titre d'article d'exemple numéro trois",
      excerpt: "Un court résumé d'exemple décrivant le contenu de cet article.",
      date: "2026-07-02",
    },
    {
      slug: "quatrieme-entree",
      accent: "sky" as AccentColor,
      category: "Sécurité de l'IA",
      title: "Titre d'article d'exemple numéro quatre",
      excerpt: "Un court résumé d'exemple décrivant le contenu de cet article.",
      date: "2026-06-20",
    },
  ],
};
