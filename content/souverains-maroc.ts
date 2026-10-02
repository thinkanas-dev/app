export type SouverainMaroc = {
  nom: string;
  dynastie: string;
  regne: string;
  recit: string;
  precision?: string;
};

export const SOURCE_SOUVERAINS = "https://www.maroc-patriotique.com/post/sultans-et-rois-du-maroc-depuis-789";

export const souverainsMaroc: SouverainMaroc[] = [
  { nom: "Idris Ier", dynastie: "Idrisside", regne: "789–791", recit: "Réfugié au Maghreb al-Aqsa, il fonde à Volubilis le premier État marocain durable et ouvre l’histoire dynastique du pays." },
  { nom: "Idris II", dynastie: "Idrisside", regne: "803–828", recit: "Il consolide l’héritage de son père, fait de Fès un centre politique majeur et donne au royaume une structure plus stable." },
  { nom: "Mohammed ben Idris", dynastie: "Idrisside", regne: "828–836", recit: "Il partage l’autorité entre ses frères, un choix qui maintient la famille au pouvoir mais fragmente progressivement le royaume." },
  { nom: "Ali ben Mohammed", dynastie: "Idrisside", regne: "836–849", recit: "Son règne relativement paisible illustre la capacité de Fès à demeurer le cœur du pouvoir malgré le partage territorial." },
  { nom: "Yahia Ier", dynastie: "Idrisside", regne: "849–863", recit: "Sous son autorité, Fès poursuit son essor urbain, religieux et commercial et attire de nouvelles populations." },
  { nom: "Yahia II", dynastie: "Idrisside", regne: "863–866", recit: "Son court règne est associé à une crise politique qui accélère l’affaiblissement de l’autorité centrale idrisside." },
  { nom: "Ali II", dynastie: "Idrisside", regne: "866–867", recit: "Il gouverne dans une période de rivalités familiales où l’unité du royaume devient de plus en plus difficile à préserver." },
  { nom: "Yahia III", dynastie: "Idrisside", regne: "880–904", recit: "Il rétablit une autorité idrisside à Fès après des années de troubles, sans pouvoir effacer les divisions régionales." },
  { nom: "Yahia IV", dynastie: "Idrisside", regne: "904–917", recit: "Son règne se déroule sous la pression croissante des Fatimides à l’est et des Omeyyades de Cordoue au nord." },
  { nom: "Al-Hassan ben Mohammed", dynastie: "Idrisside", regne: "925–927", recit: "Il tente brièvement de restaurer le pouvoir idrisside dans un Maroc devenu le terrain de puissances concurrentes." },
  { nom: "Al-Qasim Gannun", dynastie: "Idrisside", regne: "937–948", recit: "Installé dans le nord, il maintient une principauté idrisside autonome au milieu des luttes d’influence régionales." },
  { nom: "Ahmed ben Al-Qasim", dynastie: "Idrisside", regne: "948–954", recit: "Il poursuit la résistance de la branche du Nord alors que l’espace politique marocain reste très fragmenté." },
  { nom: "Al-Hassan ben Kannun", dynastie: "Idrisside", regne: "954–974", recit: "Dernier souverain de la séquence idrisside, il perd le pouvoir face aux interventions fatimides et omeyyades." },

  { nom: "Abdallah ben Yassin", dynastie: "Almoravide", regne: "1040–1059", recit: "Prédicateur et organisateur, il donne au mouvement almoravide sa discipline religieuse et son projet d’unification." , precision: "Fondateur spirituel plutôt que sultan régnant." },
  { nom: "Youssef ben Tachfine", dynastie: "Almoravide", regne: "1061–1106", recit: "Il fonde Marrakech, unifie le Maroc et étend l’empire almoravide jusqu’en al-Andalus après la bataille de Zallaqa." },
  { nom: "Ali ben Youssef", dynastie: "Almoravide", regne: "1106–1143", recit: "Il administre un vaste empire et développe Marrakech, mais doit affronter la montée du mouvement almohade." },
  { nom: "Tachfin ben Ali", dynastie: "Almoravide", regne: "1143–1145", recit: "Il hérite d’un pouvoir encerclé et tente de contenir l’offensive almohade dans une phase de recul rapide." },
  { nom: "Ibrahim ben Tachfin", dynastie: "Almoravide", regne: "1145–1146", recit: "Son règne très bref révèle la crise de succession et l’effondrement des institutions almoravides." },
  { nom: "Ishaq ben Ali", dynastie: "Almoravide", regne: "1146–1147", recit: "Dernier souverain almoravide à Marrakech, il disparaît lorsque les Almohades prennent la capitale en 1147." },

  { nom: "Abd al-Moumin", dynastie: "Almohade", regne: "1147–1163", recit: "Successeur d’Ibn Toumert, il transforme un mouvement réformateur en un empire organisé couvrant une grande partie du Maghreb." },
  { nom: "Abu Yaqub Yusuf", dynastie: "Almohade", regne: "1163–1184", recit: "Souverain lettré et bâtisseur, il soutient les sciences, les arts et l’expansion almohade en al-Andalus." },
  { nom: "Abu Yusuf Yaqub al-Mansur", dynastie: "Almohade", regne: "1184–1199", recit: "Son règne marque l’apogée almohade, illustré par la victoire d’Alarcos et de grands monuments à Rabat et Marrakech." },
  { nom: "Mohammed an-Nasir", dynastie: "Almohade", regne: "1199–1213", recit: "La défaite de Las Navas de Tolosa en 1212 ouvre une phase de recul militaire et de contestation de l’empire." },
  { nom: "Yusuf II al-Mustansir", dynastie: "Almohade", regne: "1213–1224", recit: "Son jeune âge et l’influence de la cour accentuent les rivalités qui affaiblissent le centre almohade." },
  { nom: "Abd al-Wahid Ier", dynastie: "Almohade", regne: "1224", recit: "Son règne de quelques mois déclenche une lutte de succession qui accélère la désagrégation politique." },
  { nom: "Abdallah al-Adil", dynastie: "Almohade", regne: "1224–1227", recit: "Il s’impose au cours d’une guerre dynastique, mais son pouvoir reste contesté des deux côtés du détroit." },
  { nom: "Yahya al-Mutasim", dynastie: "Almohade", regne: "1227–1235", recit: "Retranché à Marrakech, il incarne l’une des branches rivales qui se disputent l’héritage almohade." },
  { nom: "Idris al-Mamoun", dynastie: "Almohade", regne: "1229–1232", recit: "Il reprend Marrakech avec un appui castillan et rompt avec une partie de la doctrine fondatrice almohade." },
  { nom: "Abd al-Wahid II", dynastie: "Almohade", regne: "1232–1242", recit: "Il tente de préserver l’empire alors que les Hafsides, les Mérinides et les royaumes ibériques gagnent du terrain." },
  { nom: "Ali al-Saïd", dynastie: "Almohade", regne: "1242–1248", recit: "Il cherche à rétablir l’autorité militaire du califat, mais meurt durant une campagne contre les Mérinides." },
  { nom: "Umar al-Murtada", dynastie: "Almohade", regne: "1248–1266", recit: "Son pouvoir se réduit autour de Marrakech tandis que les Mérinides imposent progressivement leur domination." },

  { nom: "Abu Yahya ibn Abd al-Haqq", dynastie: "Mérinide", regne: "1244–1258", recit: "Il transforme la confédération mérinide en puissance territoriale et prépare la conquête du Maroc almohade." },
  { nom: "Uthman", dynastie: "Mérinide", regne: "1258–1266", recit: "Cette phase de transition poursuit l’avancée mérinide pendant que l’ancien pouvoir almohade se contracte." },
  { nom: "Abu Yusuf Yaqub", dynastie: "Mérinide", regne: "1269–1286", recit: "Il prend Marrakech, met fin au pouvoir almohade et établit définitivement la souveraineté mérinide sur le Maroc." },
  { nom: "Abu Yaqub Yusuf an-Nasr", dynastie: "Mérinide", regne: "1286–1307", recit: "Il consolide l’État et poursuit les campagnes au Maghreb et en péninsule Ibérique, avec des résultats contrastés." },
  { nom: "Abu Thabit Amir", dynastie: "Mérinide", regne: "1307–1308", recit: "Son court règne est consacré à contenir les révoltes et à maintenir l’autorité après une longue succession." },
  { nom: "Abu al-Rabi Sulayman", dynastie: "Mérinide", regne: "1308–1310", recit: "Il rétablit temporairement l’ordre et cherche des équilibres diplomatiques avec les puissances voisines." },
  { nom: "Abu Saïd Uthman II", dynastie: "Mérinide", regne: "1310–1331", recit: "Son règne stabilise le royaume et favorise les médersas, l’urbanisme et le rayonnement culturel de Fès." },
  { nom: "Abu al-Hassan Ali ibn Uthman", dynastie: "Mérinide", regne: "1331–1351", recit: "Il tente la dernière grande unification du Maghreb, avant que défaites, révoltes et peste n’épuisent son projet." },
  { nom: "Abu Inan Faris", dynastie: "Mérinide", regne: "1351–1358", recit: "Il restaure brièvement l’empire et protège les savoirs, mais sa mort ouvre une longue instabilité successorale." },
  { nom: "Abd al-Haqq II", dynastie: "Mérinide", regne: "1420–1465", recit: "Dernier Mérinide, il règne sous la tutelle wattasside avant d’être renversé lors de la révolte de Fès." , precision: "La source résume plusieurs règnes intermédiaires entre 1358 et 1420." },

  { nom: "Mohammed ach-Chaykh al-Wattassi", dynastie: "Wattasside", regne: "1472–1505", recit: "Il rétablit un pouvoir à Fès, mais doit composer avec la fragmentation intérieure et l’expansion portugaise." },
  { nom: "Mohammed al-Burtuqali", dynastie: "Wattasside", regne: "1505–1524", recit: "Ancien captif au Portugal, il gouverne un royaume soumis à une pression croissante sur ses côtes." },
  { nom: "Abu al-Abbas Ahmad", dynastie: "Wattasside", regne: "1524–1545", recit: "Il affronte simultanément les positions portugaises et la montée des Saadiens dans le Sud." },
  { nom: "Nasir ad-Din al-Qasri", dynastie: "Wattasside", regne: "1545–1547", recit: "Son autorité brève illustre la crise terminale d’une dynastie encerclée par ses rivaux." },
  { nom: "Mohammed al-Qasri", dynastie: "Wattasside", regne: "1547–1549", recit: "Il représente les dernières tentatives wattassides de conserver Fès face à l’offensive saadienne." },

  { nom: "Mohammed ach-Chaykh", dynastie: "Saadienne", regne: "1554–1557", recit: "Il chasse les Wattassides, réunifie le Maroc et affirme une souveraineté indépendante face aux Ottomans et aux Portugais." },
  { nom: "Abdallah al-Ghalib", dynastie: "Saadienne", regne: "1557–1574", recit: "Il consolide le pouvoir saadien et pratique une diplomatie d’équilibre entre l’Europe et l’Empire ottoman." },
  { nom: "Abou Marwan Abd al-Malik", dynastie: "Saadienne", regne: "1576–1578", recit: "Formé dans l’espace ottoman, il reprend le trône et remporte la bataille des Trois Rois, où il trouve la mort." },
  { nom: "Ahmad al-Mansur", dynastie: "Saadienne", regne: "1578–1603", recit: "Il porte l’État saadien à son apogée diplomatique et architectural et lance la conquête de l’empire songhaï." },
  { nom: "Zidan Abu Maali", dynastie: "Saadienne", regne: "1603–1627", recit: "Son règne est dominé par les luttes entre héritiers d’al-Mansur et par la division du royaume." },
  { nom: "Mohammed esh-Sheikh es-Seghir", dynastie: "Saadienne", regne: "1627–1659", recit: "Dernière figure de la liste saadienne, il gouverne dans un Maroc morcelé où de nouveaux pouvoirs régionaux émergent." },

  { nom: "Moulay Rachid", dynastie: "Alaouite", regne: "1666–1672", recit: "Il réunifie une grande partie du Maroc, prend Fès puis Marrakech et établit durablement la dynastie alaouite." },
  { nom: "Moulay Ismaïl", dynastie: "Alaouite", regne: "1672–1727", recit: "Il renforce l’État central, bâtit Meknès et s’appuie sur une armée permanente pour contenir les autonomies locales." },
  { nom: "Moulay Abdallah", dynastie: "Alaouite", regne: "1729–1757", recit: "Déposé et rétabli plusieurs fois, il incarne les décennies d’instabilité qui suivent la mort de Moulay Ismaïl." },
  { nom: "Mohammed III", dynastie: "Alaouite", regne: "1757–1790", recit: "Aussi appelé Sidi Mohammed ben Abdallah, il restaure l’autorité, développe Essaouira et ouvre le commerce extérieur." },
  { nom: "Moulay Yazid", dynastie: "Alaouite", regne: "1790–1792", recit: "Son règne violent et conflictuel montre combien une rupture brutale peut fragiliser les équilibres politiques et sociaux." , precision: "Complément chronologique absent de la liste de référence." },
  { nom: "Moulay Slimane", dynastie: "Alaouite", regne: "1792–1822", recit: "Il cherche à rétablir l’ordre, mène une réforme religieuse et adopte une diplomatie prudente face à l’Europe." },
  { nom: "Moulay Abd al-Rahman", dynastie: "Alaouite", regne: "1822–1859", recit: "Son soutien à l’émir Abdelkader entraîne le choc avec la France et la défaite marocaine de l’Isly en 1844." },
  { nom: "Mohammed IV", dynastie: "Alaouite", regne: "1859–1873", recit: "Après la guerre de Tétouan, il engage des réformes militaires et administratives sous une forte contrainte financière." },
  { nom: "Hassan Ier", dynastie: "Alaouite", regne: "1873–1894", recit: "Par ses mehallas, il réaffirme la présence de l’État dans les régions et tente de préserver l’indépendance du royaume." },
  { nom: "Abd al-Aziz", dynastie: "Alaouite", regne: "1894–1908", recit: "Ses projets de modernisation se heurtent à la dette, aux révoltes et à l’accélération des ingérences européennes." },
  { nom: "Abd al-Hafid", dynastie: "Alaouite", regne: "1908–1912", recit: "Porté au pouvoir dans une crise nationale, il signe en 1912 le traité qui instaure le Protectorat français." },
  { nom: "Moulay Youssef", dynastie: "Alaouite", regne: "1912–1927", recit: "Il règne pendant l’installation du Protectorat, le déplacement de la capitale à Rabat et la guerre du Rif." },
  { nom: "Mohammed V", dynastie: "Alaouite", regne: "1927–1961", recit: "Son lien avec le mouvement national, son exil et son retour en font la figure centrale de l’indépendance de 1956." },
  { nom: "Hassan II", dynastie: "Alaouite", regne: "1961–1999", recit: "Il façonne les institutions du Maroc contemporain, conduit la Marche verte et traverse les tensions des années de plomb." },
  { nom: "Mohammed VI", dynastie: "Alaouite", regne: "Depuis 1999", recit: "Son règne associe réformes sociales, grands projets d’infrastructure, diplomatie africaine et nouveaux défis économiques." },
];

export function semaineSouverain(date = new Date()) {
  const depart = new Date(2026, 9, 1).getTime();
  const numero = Math.floor((date.getTime() - depart) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.min(souverainsMaroc.length, Math.max(1, numero));
}

export function datesSemaineSouverain(numero: number) {
  const debut = new Date(2026, 9, 1 + (numero - 1) * 7);
  const fin = new Date(2026, 9, 7 + (numero - 1) * 7);
  const format = (date: Date) => date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  return `${format(debut)} – ${format(fin)}`;
}
