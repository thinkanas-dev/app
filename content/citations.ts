/**
 * Citations du jour.
 *
 * Choisies pour ce plan précis : la constance, le savoir, le travail bien fait,
 * les données, le cap. Rien de décoratif.
 *
 * Attribution : quand une citation circule sans source établie, l'auteur est
 * préfixé de « Attribué à ». Mieux vaut une paternité honnête qu'une jolie
 * signature fausse.
 */

export type ThemeCitation =
  | "foi"
  | "savoir"
  | "constance"
  | "travail"
  | "donnees"
  | "sante"
  | "cap";

export type Citation = {
  /** Identifiant stable : c'est lui qui relie une citation à sa morale et à ses mots */
  id: string;
  fr: string;
  /** Texte d'origine, affiché en arabe quand il existe */
  ar?: string;
  auteur: string;
  source?: string;
  theme: ThemeCitation;
};

export const themeMeta: Record<ThemeCitation, { label: string; couleur: string }> = {
  foi: { label: "Foi", couleur: "var(--color-accent-olive)" },
  savoir: { label: "Savoir", couleur: "var(--color-brand)" },
  constance: { label: "Constance", couleur: "var(--color-accent-fig)" },
  travail: { label: "Travail", couleur: "var(--color-accent-clay)" },
  donnees: { label: "Données", couleur: "var(--color-accent-sky)" },
  sante: { label: "Santé", couleur: "var(--color-accent-deep)" },
  cap: { label: "Cap", couleur: "var(--color-ink)" },
};

export const citations: Citation[] = [
  {
    id: "c01",
    fr: "En vérité, avec la difficulté il y a une facilité.",
    ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    auteur: "Coran",
    source: "Sourate Ash-Sharh, verset 6",
    theme: "foi",
  },
  {
    id: "c02",
    fr: "Allah aime que, lorsque l'un de vous accomplit une œuvre, il l'accomplisse avec excellence.",
    ar: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ",
    auteur: "Hadith",
    source: "Rapporté par al-Bayhaqi",
    theme: "travail",
  },
  {
    id: "c03",
    fr: "Tous les modèles sont faux ; certains sont utiles.",
    auteur: "George Box",
    source: "Statisticien, 1976",
    theme: "donnees",
  },
  {
    id: "c04",
    fr: "Les œuvres les plus aimées d'Allah sont les plus constantes, même si elles sont peu.",
    ar: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    auteur: "Hadith",
    source: "Sahih al-Bukhari",
    theme: "constance",
  },
  {
    id: "c05",
    fr: "Dans la vie, rien n'est à craindre, tout est à comprendre.",
    auteur: "Marie Curie",
    theme: "savoir",
  },
  {
    id: "c06",
    fr: "Il n'est pas de vent favorable pour qui ne sait où il va.",
    auteur: "Sénèque",
    source: "Lettres à Lucilius",
    theme: "cap",
  },
  {
    id: "c07",
    fr: "Seigneur, augmente-moi en savoir.",
    ar: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    auteur: "Coran",
    source: "Sourate Ta-Ha, verset 114",
    theme: "savoir",
  },
  {
    id: "c08",
    fr: "Le premier principe est de ne pas se tromper soi-même — et l'on est la personne la plus facile à tromper.",
    auteur: "Richard Feynman",
    source: "Caltech, 1974",
    theme: "travail",
  },
  {
    id: "c09",
    fr: "L'homme est fils de ses habitudes et de ce qui lui est familier, non de sa nature.",
    ar: "الإنسان ابن عوائده ومألوفه لا ابن طبيعته ومزاجه",
    auteur: "Ibn Khaldoun",
    source: "Al-Muqaddima",
    theme: "constance",
  },
  {
    id: "c10",
    fr: "Laissez mes données changer votre façon de voir.",
    auteur: "Hans Rosling",
    source: "Médecin et statisticien",
    theme: "donnees",
  },
  {
    id: "c11",
    fr: "Nul n'a jamais mangé meilleure nourriture que celle gagnée du travail de ses mains.",
    ar: "مَا أَكَلَ أَحَدٌ طَعَامًا قَطُّ خَيْرًا مِنْ أَنْ يَأْكُلَ مِنْ عَمَلِ يَدِهِ",
    auteur: "Hadith",
    source: "Sahih al-Bukhari",
    theme: "travail",
  },
  {
    id: "c12",
    fr: "La meilleure façon de prédire l'avenir, c'est de le créer.",
    auteur: "Attribué à Peter Drucker",
    theme: "cap",
  },
  {
    id: "c13",
    fr: "Nous ne devons pas rougir de reconnaître la vérité, d'où qu'elle vienne.",
    auteur: "Al-Kindi",
    source: "Philosophe, IXᵉ siècle",
    theme: "savoir",
  },
  {
    id: "c14",
    fr: "Allah ne change rien à l'état d'un peuple tant qu'ils ne changent pas ce qui est en eux.",
    ar: "إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ",
    auteur: "Coran",
    source: "Sourate Ar-Ra'd, verset 11",
    theme: "foi",
  },
  {
    id: "c15",
    fr: "Dans les champs de l'observation, le hasard ne favorise que les esprits préparés.",
    auteur: "Louis Pasteur",
    source: "Lille, 1854",
    theme: "travail",
  },
  {
    id: "c16",
    fr: "Peu importe la lenteur, tant que tu ne t'arrêtes pas.",
    auteur: "Attribué à Confucius",
    theme: "constance",
  },
  {
    id: "c17",
    fr: "Le savoir sans action est stérile, et l'action sans savoir est égarement.",
    auteur: "Al-Ghazali",
    source: "Théologien, XIᵉ siècle",
    theme: "savoir",
  },
  {
    id: "c18",
    fr: "Mieux vaut une réponse approximative à la bonne question qu'une réponse exacte à la mauvaise.",
    auteur: "John Tukey",
    source: "Statisticien, 1962",
    theme: "donnees",
  },
  {
    id: "c19",
    fr: "L'homme n'obtient que le fruit de ses efforts.",
    ar: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ",
    auteur: "Coran",
    source: "Sourate An-Najm, verset 39",
    theme: "foi",
  },
  {
    id: "c20",
    fr: "Un objectif sans plan n'est qu'un vœu.",
    auteur: "Attribué à Antoine de Saint-Exupéry",
    theme: "cap",
  },
  {
    id: "c21",
    fr: "Le savoir te garde, tandis que la richesse, c'est toi qui dois la garder.",
    ar: "الْعِلْمُ يَحْرُسُكَ وَأَنْتَ تَحْرُسُ الْمَالَ",
    auteur: "Ali ibn Abi Talib",
    theme: "savoir",
  },
  {
    id: "c22",
    fr: "L'optimisation prématurée est la racine de tous les maux.",
    auteur: "Donald Knuth",
    source: "Informaticien, 1974",
    theme: "travail",
  },
  {
    id: "c23",
    fr: "Qui s'efforce, trouve.",
    ar: "مَنْ جَدَّ وَجَدَ",
    auteur: "Proverbe arabe",
    theme: "constance",
  },
  {
    id: "c24",
    fr: "Le bon médecin soigne la maladie ; le grand médecin soigne le malade qui a la maladie.",
    auteur: "William Osler",
    source: "Médecin, 1849-1919",
    theme: "sante",
  },
  {
    id: "c25",
    fr: "L'ignorance mène à la peur, la peur mène à la haine, et la haine mène à la violence.",
    auteur: "Attribué à Averroès",
    theme: "savoir",
  },
  {
    id: "c26",
    fr: "Les actes ne valent que par les intentions.",
    ar: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
    auteur: "Hadith",
    source: "Sahih al-Bukhari, hadith 1",
    theme: "foi",
  },
  {
    id: "c27",
    fr: "Les données sont le nouveau pétrole : brutes, elles ne valent rien ; raffinées, elles valent tout.",
    auteur: "Clive Humby",
    source: "Mathématicien, 2006",
    theme: "donnees",
  },
  {
    id: "c28",
    fr: "Un voyage de mille lieues commence toujours par un premier pas.",
    auteur: "Lao Tseu",
    source: "Tao Te King",
    theme: "cap",
  },
  {
    id: "c29",
    fr: "Faites vos comptes avant qu'on ne vous les demande.",
    ar: "حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا",
    auteur: "Omar ibn al-Khattab",
    theme: "travail",
  },
  {
    id: "c30",
    fr: "Si vous ne pouvez pas l'expliquer simplement, c'est que vous ne l'avez pas assez compris.",
    auteur: "Attribué à Albert Einstein",
    theme: "savoir",
  },
  {
    id: "c31",
    fr: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas ; c'est parce que nous n'osons pas qu'elles sont difficiles.",
    auteur: "Sénèque",
    source: "Lettres à Lucilius",
    theme: "constance",
  },
  {
    id: "c32",
    fr: "Sans données, vous n'êtes qu'une personne de plus avec une opinion.",
    auteur: "Attribué à W. Edwards Deming",
    theme: "donnees",
  },
  {
    id: "c33",
    fr: "La perfection est atteinte non pas lorsqu'il n'y a plus rien à ajouter, mais lorsqu'il n'y a plus rien à retirer.",
    auteur: "Antoine de Saint-Exupéry",
    source: "Terre des hommes, 1939",
    theme: "cap",
  },
  {
    id: "c34",
    fr: "Le temps d'un homme, c'est sa vie même.",
    auteur: "Ibn al-Qayyim",
    source: "Théologien, XIVᵉ siècle",
    theme: "foi",
  },
  {
    id: "c35",
    fr: "Guérir parfois, soulager souvent, réconforter toujours.",
    auteur: "Adage médical",
    source: "Anonyme, XVᵉ siècle",
    theme: "sante",
  },
  {
    id: "c36",
    fr: "Nous sommes ce que nous faisons de façon répétée. L'excellence n'est donc pas un acte, mais une habitude.",
    auteur: "Will Durant",
    source: "Résumant Aristote, 1926",
    theme: "travail",
  },
  {
    id: "c37",
    fr: "Le savoir acquis dans la jeunesse est comme une gravure dans la pierre.",
    ar: "الْعِلْمُ فِي الصِّغَرِ كَالنَّقْشِ عَلَى الْحَجَرِ",
    auteur: "Proverbe arabe",
    theme: "savoir",
  },
  {
    id: "c38",
    fr: "La tactique sans stratégie, c'est le bruit avant la défaite.",
    auteur: "Attribué à Sun Tzu",
    theme: "cap",
  },
  {
    id: "c39",
    fr: "L'intelligence artificielle est la nouvelle électricité.",
    auteur: "Andrew Ng",
    source: "Chercheur en IA, 2017",
    theme: "donnees",
  },
  {
    id: "c40",
    fr: "Dans la patience, le salut ; dans la précipitation, le regret.",
    ar: "فِي التَّأَنِّي السَّلَامَةُ وَفِي الْعَجَلَةِ النَّدَامَةُ",
    auteur: "Proverbe arabe",
    theme: "constance",
  },
  {
    id: "c41",
    fr: "Œuvrez, car Allah va voir votre œuvre.",
    ar: "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ",
    auteur: "Coran",
    source: "Sourate At-Tawba, verset 105",
    theme: "travail",
  },
  {
    id: "c42",
    fr: "Nous ne voyons pas loin devant nous, mais nous voyons déjà beaucoup de choses à faire.",
    auteur: "Alan Turing",
    source: "Computing Machinery and Intelligence, 1950",
    theme: "savoir",
  },
  {
    id: "c43",
    fr: "Cela semble toujours impossible, jusqu'à ce que ce soit fait.",
    auteur: "Nelson Mandela",
    theme: "cap",
  },
  {
    id: "c44",
    fr: "Rien ne se perd, rien ne se crée, tout se transforme.",
    auteur: "Antoine Lavoisier",
    source: "Chimiste, 1789",
    theme: "travail",
  },
  {
    id: "c45",
    fr: "L'injustice annonce la ruine de la civilisation.",
    ar: "الظُّلْمُ مُؤْذِنٌ بِخَرَابِ الْعُمْرَانِ",
    auteur: "Ibn Khaldoun",
    source: "Al-Muqaddima",
    theme: "constance",
  },
  {
    id: "c46",
    fr: "La simplicité est la sophistication suprême.",
    auteur: "Attribué à Léonard de Vinci",
    theme: "savoir",
  },
  {
    id: "c47",
    fr: "Tout doit être rendu aussi simple que possible, mais pas plus simple.",
    auteur: "Attribué à Albert Einstein",
    theme: "donnees",
  },
  {
    id: "c48",
    fr: "Il importe plus de savoir quel genre de personne a une maladie que de savoir quelle maladie a cette personne.",
    auteur: "Attribué à Hippocrate",
    theme: "sante",
  },
  {
    id: "c49",
    fr: "Ceux qui vivent, ce sont ceux qui luttent.",
    auteur: "Victor Hugo",
    source: "Les Châtiments, 1853",
    theme: "cap",
  },
  {
    id: "c50",
    fr: "L'innovation, c'est ce qui distingue celui qui mène de celui qui suit.",
    auteur: "Steve Jobs",
    theme: "travail",
  },
  {
    id: "c51",
    fr: "Attache ta monture, puis place ta confiance en Allah.",
    ar: "اعْقِلْهَا وَتَوَكَّلْ",
    auteur: "Hadith",
    source: "Rapporté par at-Tirmidhi",
    theme: "foi",
  },
  {
    id: "c52",
    fr: "Je n'ai fait cette lettre plus longue que parce que je n'ai pas eu le loisir de la faire plus courte.",
    auteur: "Blaise Pascal",
    source: "Les Provinciales, 1657",
    theme: "savoir",
  },
  {
    id: "c53",
    fr: "Tombe sept fois, relève-toi huit.",
    auteur: "Proverbe japonais",
    theme: "constance",
  },
  {
    id: "c54",
    fr: "Ce qui se mesure s'améliore.",
    auteur: "Attribué à Peter Drucker",
    theme: "donnees",
  },
  {
    id: "c55",
    fr: "Nous trouverons un chemin, ou nous en tracerons un.",
    auteur: "Attribué à Hannibal Barca",
    theme: "cap",
  },
  {
    id: "c56",
    fr: "Quiconque place sa confiance en Allah, Il lui suffit.",
    ar: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    auteur: "Coran",
    source: "Sourate At-Talaq, verset 3",
    theme: "foi",
  },
];
