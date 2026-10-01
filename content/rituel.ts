/**
 * Le rituel du jour : ce que la citation exige, et les dix mots qu'elle contient.
 *
 * La morale n'est pas une paraphrase de la citation — c'est ce qu'elle demande
 * aujourd'hui, dans ce plan-ci : les neuf modules de S3, les 37 jours de
 * formation, les 60 hizb, les certificats de langue, le Hajj 2028.
 *
 * Les dix mots sortent de la citation et de sa morale. Jamais tirés au hasard :
 * un mot rencontré dans une phrase qu'on a comprise se retient bien mieux qu'un
 * mot rencontré seul dans une liste.
 */

export type Rituel = {
  morale: string;
  /** Clés du lexique — dix par jour */
  mots: string[];
};

export const rituels: Record<string, Rituel> = {
  c01: {
    morale:
      "La facilité n'arrive pas après la difficulté, elle est logée dedans. Le module où vous ramez est exactement celui qui fera bouger la moyenne le plus vite.",
    mots: ["difficulte", "facilite", "epreuve", "patience", "espoir", "verite", "moment", "force", "avancer", "croire"],
  },
  c02: {
    morale:
      "L'excellence n'est pas un niveau, c'est un soin apporté à chaque geste. Une vidéo publiée bâclée coûte plus cher que trois jours de retard.",
    mots: ["excellence", "oeuvre", "soin", "travail", "rigueur", "maitrise", "accomplir", "acte", "metier", "precision"],
  },
  c03: {
    morale:
      "Votre radar, votre simulateur, votre moyenne prévisionnelle : tous faux, tous utiles. Servez-vous-en pour décider, jamais pour vous rassurer.",
    mots: ["modele", "faux", "utile", "donnee", "calcul", "prevision", "analyse", "resultat", "mesurer", "decider"],
  },
  c04: {
    morale:
      "Un hizb par semaine tenu douze mois bat dix hizb appris en une nuit et perdus. Choisissez le rythme que vous tiendrez en période d'examens, pas celui qui vous flatte aujourd'hui.",
    mots: ["constance", "habitude", "repetition", "durer", "quotidien", "effort", "oeuvre", "patience", "routine", "continuer"],
  },
  c05: {
    morale:
      "Ce qui vous bloque en Data Mining n'est pas difficile, il est inconnu. Nommez précisément ce que vous ne comprenez pas : la peur tombe avec le flou.",
    mots: ["craindre", "comprendre", "peur", "vie", "science", "etude", "curiosite", "doute", "clair", "apprendre"],
  },
  c06: {
    morale:
      "Sans cap, chaque opportunité ressemble à une bonne idée. Avant d'accepter un projet ce mois-ci, demandez-vous lequel des sept objectifs il sert.",
    mots: ["vent", "favorable", "chemin", "but", "voyage", "decision", "priorite", "route", "choisir", "savoir"],
  },
  c07: {
    morale:
      "La seule demande d'augmentation que le Coran enseigne porte sur le savoir. Le jour où vous hésitez entre réviser et scroller, la question est déjà tranchée.",
    mots: ["savoir", "connaissance", "etude", "apprendre", "priere", "esprit", "sagesse", "livre", "lecon", "chercher"],
  },
  c08: {
    morale:
      "Vous êtes le plus facile à tromper sur votre propre travail. Une note estimée dans votre tête n'est pas une note : saisissez-la dans le tableau et regardez le radar.",
    mots: ["principe", "tromper", "premier", "facile", "verite", "erreur", "preuve", "mesure", "voir", "note"],
  },
  c09: {
    morale:
      "Votre talent ne vous fera pas passer S3 : vos habitudes le feront. Décidez de l'heure à laquelle vous ouvrez le cours, pas de la motivation que vous aurez.",
    mots: ["habitude", "homme", "fils", "nature", "routine", "discipline", "repetition", "changer", "jour", "heure"],
  },
  c10: {
    morale:
      "Rosling ne montrait pas des chiffres, il démontait des préjugés. Sur think.anas, une donnée bien choisie renverse mieux une idée reçue qu'un long argument.",
    mots: ["donnee", "chiffre", "changer", "voir", "information", "analyse", "preuve", "opinion", "clair", "expliquer"],
  },
  c11: {
    morale:
      "Ce que vous construisez vous-même a un goût que rien n'imite. Votre compte doit vivre de ce que vous savez faire, pas de ce que vous republiez.",
    mots: ["travail", "main", "nourriture", "gagner", "manger", "metier", "oeuvre", "meilleur", "effort", "construire"],
  },
  c12: {
    morale:
      "2028 n'est pas une prédiction, c'est une commande que vous passez aujourd'hui. Chaque jour du plan est une ligne de cette commande.",
    mots: ["avenir", "creer", "predire", "plan", "projet", "decision", "construire", "but", "meilleur", "commencer"],
  },
  c13: {
    morale:
      "Un bon argument d'un concurrent reste un bon argument. Prenez-le, créditez-le, améliorez-le — c'est ce qui vous distinguera des comptes qui recopient sans citer.",
    mots: ["verite", "reconnaitre", "savoir", "philosophe", "humilite", "raison", "apprendre", "juste", "esprit", "chercher"],
  },
  c14: {
    morale:
      "Aucune circonstance ne bougera avant vous. Le premier changement est intérieur, et il se mesure en heures de travail réellement posées.",
    mots: ["changement", "changer", "peuple", "coeur", "ame", "volonte", "effort", "decider", "commencer", "jour"],
  },
  c15: {
    morale:
      "La chance existe, mais elle ne s'arrête que chez les gens prêts. Une opportunité en IA santé passera : la question est si votre portfolio est déjà en ligne ce jour-là.",
    mots: ["hasard", "favoriser", "esprit", "prepare", "observation", "science", "moment", "chercher", "trouver", "entrainement"],
  },
  c16: {
    morale:
      "Un hizb lent vaut mieux qu'un hizb abandonné. La seule vitesse qui compte est celle que vous tenez encore dans six mois.",
    mots: ["lenteur", "lent", "arreter", "continuer", "constance", "patience", "avancer", "pas", "durer", "perseverance"],
  },
  c17: {
    morale:
      "Regarder trente vidéos sur l'IA sans en coder une seule, c'est du savoir stérile. Chaque module de votre formation doit finir sur un livrable visible.",
    mots: ["savoir", "acte", "connaissance", "apprentissage", "oeuvre", "accomplir", "utile", "preuve", "construire", "resultat"],
  },
  c18: {
    morale:
      "Une moyenne prévisionnelle à 16,1 sur la bonne question vaut mieux qu'un calcul parfait sur la mauvaise. Demandez-vous d'abord ce que vous cherchez à décider.",
    mots: ["reponse", "question", "approximatif", "exact", "calcul", "precision", "analyse", "decider", "meilleur", "chercher"],
  },
  c19: {
    morale:
      "Rien ne vous sera crédité que ce que vous avez réellement fait. Ni l'intention, ni le plan, ni la vidéo prévue : l'effort posé.",
    mots: ["effort", "fruit", "homme", "obtenir", "travail", "acte", "gagner", "oeuvre", "resultat", "valoir"],
  },
  c20: {
    morale:
      "Vos sept objectifs ont des cibles chiffrées, c'est déjà rare. Ce qui manque parfois, c'est l'étape de cette semaine — écrivez-la avant ce soir.",
    mots: ["objectif", "plan", "etape", "projet", "decision", "semaine", "ecrire", "priorite", "but", "commencer"],
  },
  c21: {
    morale:
      "Un patrimoine se surveille, une compétence vous accompagne. Investissez dans ce que personne ne peut vous retirer avant d'investir dans ce qui peut fondre.",
    mots: ["savoir", "richesse", "garder", "competence", "perdre", "connaissance", "maitrise", "avenir", "force", "durer"],
  },
  c22: {
    morale:
      "Ne peaufinez pas le montage d'une vidéo dont le fond n'est pas bon. Sur S3 comme sur think.anas, réglez la substance avant la finition.",
    mots: ["precoce", "erreur", "simplifier", "priorite", "travail", "outil", "code", "perdre", "temps", "decider"],
  },
  c23: {
    morale:
      "Trois mots, aucune échappatoire. L'effort n'est pas une garantie de résultat, mais son absence est une garantie d'échec.",
    mots: ["effort", "trouver", "chercher", "perseverance", "reussir", "volonte", "travail", "obtenir", "essayer", "courage"],
  },
  c24: {
    morale:
      "C'est exactement votre créneau : la donnée de santé n'a de sens que ramenée à la personne derrière. Un dashboard qui oublie le patient est un bel objet inutile.",
    mots: ["medecin", "maladie", "malade", "patient", "soigner", "sante", "corps", "diagnostic", "hopital", "comprendre"],
  },
  c25: {
    morale:
      "La chaîne commence toujours par l'ignorance. Sur les sujets IA et santé, votre travail de vulgarisation coupe la première marche — c'est utile, pas décoratif.",
    mots: ["ignorance", "peur", "haine", "violence", "mener", "savoir", "expliquer", "comprendre", "raison", "clair"],
  },
  c26: {
    morale:
      "Pourquoi publiez-vous ? Si la réponse est « pour les vues », le contenu le montrera ; si c'est « pour rendre l'IA santé lisible », ça se verra aussi.",
    mots: ["acte", "intention", "valoir", "coeur", "sincerite", "oeuvre", "raison", "but", "juste", "choisir"],
  },
  c27: {
    morale:
      "Brutes, les données de santé ne valent rien et coûtent cher à stocker. Votre métier commence exactement là où le raffinage commence.",
    mots: ["donnee", "petrole", "valoir", "analyse", "information", "transformer", "utile", "metier", "resultat", "precision"],
  },
  c28: {
    morale:
      "733 jours devant vous, un seul disponible. Le premier pas d'aujourd'hui n'a pas besoin d'être grand, il a besoin d'être fait.",
    mots: ["voyage", "pas", "commencer", "chemin", "premier", "route", "avancer", "etape", "jour", "continuer"],
  },
  c29: {
    morale:
      "Le bilan hebdomadaire n'est pas une corvée administrative, c'est le seul moment où vous voyez la dérive avant qu'elle coûte. Faites-le le dimanche soir, pas en janvier.",
    mots: ["compte", "mesurer", "semaine", "resultat", "verite", "rigueur", "erreur", "ecart", "voir", "decider"],
  },
  c30: {
    morale:
      "C'est le test de votre formation en 37 jours : si la vidéo ne sort pas simplement, le sujet n'est pas encore acquis. Enseigner est la dernière étape d'apprendre.",
    mots: ["expliquer", "simple", "comprendre", "simplifier", "clair", "lecon", "mot", "phrase", "apprendre", "preuve"],
  },
  c31: {
    morale:
      "L'IELTS n'est pas dur, il est reporté. Inscrivez-vous d'abord, la difficulté se réduira dès que la date sera réelle.",
    mots: ["difficile", "oser", "courage", "essayer", "obstacle", "peur", "decider", "commencer", "volonte", "reussir"],
  },
  c32: {
    morale:
      "Votre avis sur votre niveau en Python ne vaut rien tant qu'une note ne l'a pas confirmé. Saisissez, mesurez, puis discutez.",
    mots: ["donnee", "opinion", "mesure", "preuve", "chiffre", "analyse", "verite", "note", "prouver", "decider"],
  },
  c33: {
    morale:
      "Une vidéo devient bonne quand on enlève, pas quand on ajoute. Coupez les trente premières secondes d'introduction : elles ne servent que votre confort.",
    mots: ["perfection", "ajouter", "retirer", "simplicite", "simplifier", "clair", "oeuvre", "soin", "meilleur", "fin"],
  },
  c34: {
    morale:
      "Vous ne gérez pas un emploi du temps, vous dépensez une vie. Trois heures perdues aujourd'hui ne se remboursent pas demain.",
    mots: ["temps", "vie", "homme", "heure", "jour", "perdre", "moment", "passe", "avenir", "garder"],
  },
  c35: {
    morale:
      "La promesse honnête d'un soignant, et le bon étalon pour vos contenus : ne promettez pas la guérison, apportez la clarté. Personne ne vous reprochera de ne pas avoir tout résolu.",
    mots: ["guerison", "soulagement", "soigner", "douleur", "sante", "patient", "espoir", "remede", "vrai", "soin"],
  },
  c36: {
    morale:
      "Vous ne serez pas excellent le jour de l'examen si vous ne l'êtes pas les mardis ordinaires. L'excellence se fabrique en dehors des moments qui comptent.",
    mots: ["excellence", "habitude", "acte", "repetition", "quotidien", "discipline", "routine", "maitrise", "durer", "entrainement"],
  },
  c37: {
    morale:
      "Vous avez vingt ans et neuf modules devant vous : c'est maintenant que ça grave. Ce que vous apprenez cette année tiendra vingt ans.",
    mots: ["savoir", "apprendre", "memoire", "etude", "debut", "durer", "annee", "profond", "connaissance", "lecon"],
  },
  c38: {
    morale:
      "Publier tous les jours sans ligne éditoriale, c'est du bruit. Votre créneau — l'IA santé en français — est la stratégie ; le reste n'est que tactique.",
    mots: ["tactique", "strategie", "bruit", "defaite", "plan", "but", "objectif", "decision", "priorite", "reseau"],
  },
  c39: {
    morale:
      "L'électricité n'a enrichi personne en elle-même : ce sont ceux qui ont su quoi brancher dessus. Ne vendez pas l'IA, vendez ce qu'elle résout en santé.",
    mots: ["intelligence", "electricite", "machine", "outil", "utile", "metier", "changement", "sante", "construire", "avenir"],
  },
  c40: {
    morale:
      "Trois mois d'avance sur le hizb ne servent à rien si vous abandonnez au quatrième. Ralentissez pour tenir : la précipitation est une dette.",
    mots: ["patience", "precipitation", "constance", "erreur", "lent", "durer", "avancer", "sagesse", "repos", "continuer"],
  },
  c41: {
    morale:
      "Le verset ne dit pas « prévoyez », il dit « œuvrez ». Le livrable du jour compte plus que le plan du trimestre.",
    mots: ["oeuvre", "travail", "acte", "voir", "accomplir", "effort", "resultat", "jour", "commencer", "finir"],
  },
  c42: {
    morale:
      "Turing ne voyait pas jusqu'ici, et il a quand même posé la première pierre. Votre visibilité à 733 jours est faible — la tâche d'aujourd'hui, elle, est parfaitement nette.",
    mots: ["voir", "avenir", "tache", "chemin", "commencer", "science", "machine", "etape", "travail", "clair"],
  },
  c43: {
    morale:
      "Le Hajj en 2028, un million d'abonnés, 16,7 de moyenne : trois choses qui paraissent impossibles vues d'aujourd'hui. Elles le resteront jusqu'au jour où elles ne le seront plus.",
    mots: ["impossible", "reussite", "but", "croire", "obstacle", "lutte", "avancer", "essayer", "jour", "changer"],
  },
  c44: {
    morale:
      "Rien de ce que vous avez appris en S1 et S2 n'a disparu, tout s'est transformé en base. Les heures qui semblent perdues sont souvent déplacées.",
    mots: ["transformer", "perdre", "creer", "science", "etude", "energie", "resultat", "apprentissage", "durer", "changement"],
  },
  c45: {
    morale:
      "Ibn Khaldoun parlait des empires, la règle vaut pour un compte : un contenu qui exagère ou triche ruine la confiance, et la confiance est votre seul capital.",
    mots: ["injustice", "justice", "civilisation", "ruine", "confiance", "verite", "peuple", "sincerite", "perdre", "durer"],
  },
  c46: {
    morale:
      "Un dashboard lisible en trois secondes est plus difficile à construire qu'un dashboard chargé. Le travail supplémentaire est invisible — c'est bien le signe qu'il est bien fait.",
    mots: ["simplicite", "simple", "profond", "clair", "difficile", "soin", "maitrise", "retirer", "construire", "oeuvre"],
  },
  c47: {
    morale:
      "Simplifier une explication n'est pas la fausser. La ligne est fine, et c'est exactement là que se joue la crédibilité d'un compte de vulgarisation santé.",
    mots: ["simple", "simplifier", "modele", "vrai", "faux", "expliquer", "precision", "clair", "erreur", "juste"],
  },
  c48: {
    morale:
      "La même donnée ne dit pas la même chose selon qui la porte. C'est toute la différence entre un modèle statistique et un outil clinique utilisable.",
    mots: ["maladie", "patient", "medecin", "corps", "diagnostic", "donnee", "savoir", "comprendre", "sante", "juste"],
  },
  c49: {
    morale:
      "Les jours où vous ne sentez rien avancer sont les jours où vous luttez. Ils comptent autant que les autres dans la série.",
    mots: ["lutte", "vie", "courage", "force", "obstacle", "continuer", "endurance", "jour", "avancer", "volonte"],
  },
  c50: {
    morale:
      "Republier un format anglophone en français n'est pas de l'innovation, c'est de la traduction. Votre avantage est l'angle marocain — utilisez-le.",
    mots: ["innovation", "creer", "suivre", "mener", "choix", "metier", "projet", "avancer", "premier", "changement"],
  },
  c51: {
    morale:
      "La confiance n'a jamais dispensé de l'action. Révisez, sauvegardez vos fichiers, inscrivez-vous à l'examen — puis remettez-vous-en à Allah.",
    mots: ["confiance", "monture", "attacher", "foi", "effort", "priere", "acte", "decider", "travail", "croire"],
  },
  c52: {
    morale:
      "Un script court demande plus de temps qu'un script long. Comptez ce temps dans votre planning de contenu, sinon vous publierez toujours la version bavarde.",
    mots: ["lettre", "ecrire", "temps", "simplifier", "retirer", "mot", "phrase", "soin", "clair", "travail"],
  },
  c53: {
    morale:
      "La série ne se mesure pas aux jours sans chute, mais aux reprises. Un module raté en contrôle continu ne décide de rien tant qu'il reste une session.",
    mots: ["tomber", "relever", "perseverance", "echec", "courage", "continuer", "reussir", "constance", "essayer", "force"],
  },
  c54: {
    morale:
      "Vous mesurez déjà la moyenne, les hizb, les abonnés. Ajoutez ce que vous évitez de regarder : c'est là que se cachent les progrès faciles.",
    mots: ["mesurer", "mesure", "ameliorer", "progres", "chiffre", "resultat", "ecart", "tendance", "voir", "decider"],
  },
  c55: {
    morale:
      "Aucun chemin tout tracé ne mène de la 2ᵉ année à l'IA santé au Maroc. C'est une mauvaise nouvelle pour le confort, une excellente pour la concurrence.",
    mots: ["chemin", "trouver", "tracer", "route", "obstacle", "decision", "courage", "avancer", "creer", "but"],
  },
  c56: {
    morale:
      "Après l'effort, le calme. Vous avez fait ce qui dépendait de vous aujourd'hui : le reste ne vous appartient pas, et c'est une bonne nouvelle.",
    mots: ["confiance", "foi", "coeur", "repos", "espoir", "priere", "force", "ame", "gratitude", "croire"],
  },
};
