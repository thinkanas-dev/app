export type AccentColor = "clay" | "sky" | "cactus" | "fig";
export type BrandKey = "instagram" | "tiktok" | "linkedin";

export const objectifsContent = {
  eyebrow: "Objectif",
  bismillah: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
  heading: "Du 1er octobre 2026 au 25 septembre 2028",

  milestones: [
    {
      id: "vehicule",
      label: "Véhicule",
      unit: "MAD",
      target: 400_000,
      note: "≈ 42 751,28 $",
      accent: "clay" as AccentColor,
      image: "/goals/vehicule.jpg",
      actionSteps: [
        "Définir le budget mensuel d'épargne",
        "Comparer 3 modèles cibles",
        "Ouvrir un compte d'épargne dédié",
        "Négocier le prix final",
        "Finaliser l'achat et l'assurance",
      ],
    },
    {
      id: "immobilier",
      label: "Bien immobilier",
      unit: "MAD",
      target: 2_700_000,
      note: "≈ 288 571,11 $",
      accent: "clay" as AccentColor,
      image: "/goals/immobilier.jpg",
      actionSteps: [
        "Définir la zone géographique",
        "Obtenir une simulation de prêt",
        "Visiter au moins 5 biens",
        "Faire une offre",
        "Signer chez le notaire",
      ],
    },
    {
      id: "patrimoine",
      label: "Objectif financier",
      unit: "$",
      target: 1_877_493.54,
      note: "≈ 17 566 666,92 MAD ≈ 24,17 BTC",
      accent: "clay" as AccentColor,
      actionSteps: [
        "Lister tous les actifs actuels",
        "Mettre à jour le suivi chaque mois",
        "Diversifier entre immobilier, cash et BTC",
      ],
    },
    {
      id: "moyenne",
      label: "Moyenne académique (S3–S5)",
      unit: "/20",
      target: 16.7,
      accent: "sky" as AccentColor,
      actionSteps: [
        "Réviser chaque semaine",
        "Suivre les notes après chaque examen",
        "Identifier les matières à risque",
      ],
      modules: {
        semestre: "S3 — 2ᵉ année cycle ingénieur, Génie des Données de Santé",
        note: "Quatre modules alimentent directement le projet think.anas : ce que vous révisez peut devenir du contenu le soir même.",
        liste: [
          {
            id: "ia",
            utilite: 3,
            nom: "Intelligence Artificielle",
            lien: "Socle direct du projet — les notions à maîtriser pour juger toute annonce d'IA santé",
          },
          {
            id: "datamining",
            utilite: 3,
            nom: "DATA Mining et analyse de données : Techniques et Applications Médicales",
            lien: "Le cœur du sujet — applications médicales, exactement votre niche",
          },
          {
            id: "sih",
            utilite: 3,
            nom: "Système d'Information Hospitalier et Santé Digital",
            lien: "Le terrain : comment circule vraiment la donnée dans un hôpital",
          },
          {
            id: "python",
            utilite: 3,
            nom: "Programmation Avancée en Python",
            lien: "L'outil avec lequel vous construirez vos automatisations",
          },
          {
            id: "bdd",
            utilite: 2,
            nom: "Bases de Données Avancée",
            lien: "Stocker les données patients correctement — et légalement",
          },
          {
            id: "web",
            utilite: 2,
            nom: "Développement WEB",
            lien: "Les interfaces des outils que vous livrerez aux cabinets",
          },
          {
            id: "eco",
            utilite: 2,
            nom: "Environnement Économique et institutionnel d'Entreprise",
            lien: "Chiffrer un retour sur investissement, comprendre le marché",
          },
          { id: "anglais",
            utilite: 1, nom: "Anglais", lien: "" },
          { id: "francais",
            utilite: 1, nom: "Français", lien: "" },
        ],
      },
    },
    {
      id: "hizb",
      label: "Mémorisation du Coran",
      unit: "hizb",
      target: 60,
      accent: "cactus" as AccentColor,
      actionSteps: [
        "Mémoriser au moins 1 hizb par semaine",
        "Réviser les hizb précédents chaque vendredi",
        "Trouver un partenaire de récitation",
      ],
    },
    {
      id: "instagram-tiktok",
      label: "Instagram + TikTok (@think.anas)",
      unit: "abonnés",
      target: 1_000_000,
      accent: "fig" as AccentColor,
      logoKeys: ["instagram", "tiktok"] as BrandKey[],
      actionSteps: [
        "Définir une ligne éditoriale claire",
        "Publier au moins 3 fois par semaine",
        "Analyser les publications qui performent",
      ],
      contentStrategy: {
        theme: "Santé digitale, IA en santé & AI Automation — en français, avec l'angle marocain",
        cadence: "Une publication par jour minimum, en alternant les 3 formats ci-dessous",
        weighting:
          "Plus de 50% du contenu dédié à l'AI Automation en santé (généraliste + les 9 spécialités) — le reste couvre histoire, mythes, éthique et actu",
        positioning:
          "En français, l'intersection IA × santé est quasi vide : les comptes IA sont anglophones et généralistes, les comptes santé francophones manquent de profondeur technique. Profil d'ingénieur orienté santé = créneau libre.",
        pillars2: [
          {
            name: "IA en santé & AI Automation",
            weight: 40,
            role: "Le cœur technique : diagnostic assisté, imagerie, workflows et agents qui font gagner du temps aux soignants. C'est ce qui fonde la légitimité.",
          },
          {
            name: "Vulgarisation patient",
            weight: 20,
            role: "Le volume d'audience : « ce que l'IA change concrètement quand tu vas chez le médecin ». Sujet compris par tous, fort potentiel de partage.",
          },
          {
            name: "Le cas marocain & Afrique francophone",
            weight: 15,
            role: "Le vrai différenciateur : déserts médicaux, télémédecine en zone rurale, digitalisation de l'AMO, startups healthtech locales. Créneau non occupé.",
          },
          {
            name: "Le test d'outil",
            weight: 10,
            role: "Format le plus partageable : un outil testé en direct, verdict chiffré, limites assumées.",
          },
          {
            name: "Éthique, données & limites",
            weight: 10,
            role: "Biais algorithmiques, protection des données de santé, loi 09-08 au Maroc, AI Act européen. C'est ce qui crée l'autorité et protège la crédibilité.",
          },
          {
            name: "Carrière & opportunités healthtech",
            weight: 5,
            role: "Masters, bourses, métiers, salaires. Pilier LinkedIn, et celui qui ouvre la monétisation (accompagnement, formations).",
          },
        ],
        platforms: [
          {
            name: "TikTok",
            role: "Découverte pure",
            spec: "Hook en moins de 1,5 s, 25-45 s, une seule idée par vidéo, sous-titres systématiques",
            pillars: "Vulgarisation patient + tests d'outils",
          },
          {
            name: "Instagram",
            role: "Communauté & sauvegardes",
            spec: "Reels recyclés depuis TikTok + carrousels pédagogiques (les sauvegardes portent la portée plus que les likes)",
            pillars: "Cœur technique + cas marocain",
          },
          {
            name: "LinkedIn",
            role: "Autorité professionnelle",
            spec: "Posts texte structurés et carrousels, ton analytique, une étude de cas par semaine",
            pillars: "Carrière, éthique, études de cas",
          },
        ],
        series: [
          { name: "Ça existe déjà", pitch: "Une technologie d'IA santé réellement déployée, en 40 secondes" },
          { name: "Le Test", pitch: "Un outil testé en direct, verdict chiffré et limites assumées" },
          { name: "60 secondes pour comprendre", pitch: "Un concept technique vulgarisé sans jargon" },
          { name: "Vrai ou faux", pitch: "Un mythe sur l'IA médicale démonté avec une source" },
          { name: "Le cas marocain", pitch: "L'angle local : ce que ça change ici, concrètement" },
          { name: "Jour X", pitch: "Build in public : l'avancée du parcours, ce qui marche et ce qui rate" },
        ],
        dailyFormats: [
          {
            type: "Astuce",
            description:
              "Un outil, un prompt ou un workflow concret utilisable dès aujourd'hui, appliqué au généraliste ou à une spécialité",
          },
          {
            type: "Modèle",
            description:
              "Présentation d'un modèle ou d'une plateforme d'IA santé — open-source ou commercial, démo en 30 secondes",
          },
          {
            type: "Opportunité",
            description:
              "Bourse, poste, hackathon, formation ou collaboration en IA santé à saisir cette semaine",
          },
        ],
        specialties: [
          "Généraliste — triage IA, aide à la décision en soins primaires",
          "Radiologie — détection automatisée sur l'imagerie médicale",
          "Cardiologie — analyse ECG/écho, prédiction de risque",
          "Dermatologie — détection de cancer de la peau par photo",
          "Ophtalmologie — dépistage de la rétinopathie diabétique",
          "Oncologie — pathologie digitale, dosage personnalisé",
          "Psychiatrie & santé mentale — détection de la dépression, chatbots thérapeutiques",
          "Anatomopathologie — analyse de lames digitales",
          "Pédiatrie — dépistage précoce, suivi de croissance",
          "Chirurgie — assistance robotique, planification opératoire",
        ],
        programme: {
          rythme:
            "5 jours par semaine, 2 jours tampons — environ 7 semaines et demie de calendrier. Un jour manqué se rattrape sur un jour tampon, il ne décale pas le programme.",
          principe:
            "Chaque jour produit deux choses : ce que vous apprenez (piste privée) et ce que vous publiez (piste publique). Le contenu n'est jamais le cours — c'est l'angle grand public de ce que vous venez d'apprendre.",
          blocs: [
            {
              id: "socle",
              titre: "Socle — savoir démonter une annonce",
              jours: "J1 – J4",
              but: "Acquérir le minimum qui permet de juger n'importe quelle annonce d'IA santé. Sans ce bloc, vous relayez du marketing.",
              items: [
                {
                  day: 1,
                  formation: "Sensibilité, spécificité, valeur prédictive positive et négative, sur un tableau 2×2 réel",
                  livrable: "Les calculer à la main sur un cas concret",
                  contenu: "« Une IA fiable à 99 % peut se tromper 9 fois sur 10. Voici pourquoi. »",
                  format: "Texte à l'écran + calcul animé",
                },
                {
                  day: 2,
                  formation: "L'effet de la prévalence : pourquoi un dépistage de masse produit une majorité de faux positifs",
                  livrable: "Construire votre propre exemple chiffré",
                  contenu: "« Si 1 personne sur 1000 est malade, ce test se trompe presque à chaque fois. »",
                  format: "Démonstration au tableau, 30 s",
                },
                {
                  day: 3,
                  formation: "Hallucination, fenêtre de contexte, RAG — provoquer volontairement 5 erreurs médicales sur un LLM",
                  livrable: "Captures des 5 erreurs, avec la bonne réponse à côté",
                  contenu: "« J'ai piégé une IA médicale en 5 questions. »",
                  format: "Capture d'écran commentée",
                },
                {
                  day: 4,
                  formation: "Prompting structuré : rôle, contexte, format attendu, garde-fous",
                  livrable: "10 prompts santé testés et notés",
                  contenu: "« Le prompt qui change tout quand vous posez une question santé à une IA. »",
                  format: "Avant / après à l'écran",
                },
              ],
            },
            {
              id: "terrain",
              titre: "Le réel — parler aux praticiens",
              jours: "J5 – J7",
              but: "Le bloc le plus important. Sans lui, vous construirez une solution à un problème que personne n'a.",
              items: [
                {
                  day: 5,
                  formation: "Rédiger un guide de 8 questions ouvertes sur les irritants quotidiens, puis contacter 10 praticiens",
                  livrable: "Guide d'entretien + 10 messages envoyés",
                  contenu: "« Je vais demander à 8 soignants ce qui leur fait perdre le plus de temps. »",
                  format: "Face caméra — lancement de série",
                },
                {
                  day: 6,
                  formation: "Mener 4 entretiens, prendre des notes au mot près",
                  livrable: "Verbatims bruts",
                  contenu: "« Ce qu'un médecin m'a dit sur sa paperasse. »",
                  format: "Citation anonymisée à l'écran",
                },
                {
                  day: 7,
                  formation: "4 entretiens de plus, puis classer les irritants par fréquence et par temps perdu",
                  livrable: "Les 3 problèmes les plus cités, chiffrés",
                  contenu: "« J'ai interrogé 8 soignants. Voici les 3 problèmes qui reviennent. »",
                  format: "Liste animée",
                },
              ],
            },
            {
              id: "cadre",
              titre: "Cadre légal — votre avantage concurrentiel",
              jours: "J8 – J9",
              but: "La contrainte d'hébergement écarte une partie des outils étrangers. Qui la maîtrise peut vendre une solution conforme.",
              items: [
                {
                  day: 8,
                  formation: "Loi 09-08 et CNDP : la donnée de santé est sensible ; les articles 43-44 encadrent tout transfert hors du Maroc",
                  livrable: "Fiche « ce qu'on ne peut pas faire avec des données patients ici »",
                  contenu: "« Pourquoi beaucoup d'outils IA américains sont inutilisables dans un cabinet marocain. »",
                  format: "Face caméra, sujet clivant",
                },
                {
                  day: 9,
                  formation: "AI Act et MDR : à partir de quand un système devient un dispositif médical à haut risque",
                  livrable: "Arbre de décision sur une page",
                  contenu: "« À partir de quand une app santé devient un dispositif médical ? »",
                  format: "Arbre animé",
                },
              ],
            },
            {
              id: "verification",
              titre: "Vérification clinique",
              jours: "J10 – J12",
              but: "Savoir vérifier une allégation en deux minutes, plutôt que survoler dix spécialités.",
              items: [
                {
                  day: 10,
                  formation: "Lire la base des dispositifs autorisés par la FDA (1 524 au 30 mars 2026, dont 1 163 en radiologie)",
                  livrable: "Retrouver et lire une fiche 510(k) par vous-même",
                  contenu: "« Comment vérifier en 2 minutes si une IA santé est vraiment approuvée. »",
                  format: "Tutoriel en capture d'écran",
                },
                {
                  day: 11,
                  formation: "Approfondissement 1 — la radiologie, domaine le plus mature",
                  livrable: "Un dispositif réel, ses chiffres, sa limite documentée",
                  contenu: "« L'IA qui lit les radios existe déjà. Voici ce qu'elle ne voit pas. »",
                  format: "Étude de cas chiffrée",
                },
                {
                  day: 12,
                  formation: "Approfondissement 2 — la spécialité la plus citée dans vos entretiens du bloc 2",
                  livrable: "Même format : dispositif, chiffres, limite",
                  contenu: "Étude de cas reliée au problème que vous allez résoudre",
                  format: "Infographie animée",
                },
              ],
            },
            {
              id: "construction",
              titre: "Construction — résoudre le problème n° 1",
              jours: "J13 – J29",
              but: "Le cœur du programme. Vous construisez pour le problème identifié au bloc 2, pas pour un problème imaginé.",
              items: [
                { day: 13, formation: "Cadrer : le problème retenu, l'utilisateur, le résultat mesurable visé", livrable: "Fiche de cadrage d'une page", contenu: "« Je construis une solution pour [le problème]. Jour 1. »", format: "Lancement de la série « je construis en public »" },
                { day: 14, formation: "Prise en main de n8n ou Make : déclencheur, condition, action", livrable: "Un premier scénario qui tourne", contenu: "« J'automatise ma première tâche en 20 minutes. »", format: "Capture d'écran accélérée" },
                { day: 15, formation: "Rappel de rendez-vous, version 1 (24 h avant)", livrable: "Scénario fonctionnel avec message de test", contenu: "Démonstration de 30 s", format: "Écran + voix off" },
                { day: 16, formation: "Version 2 : double rappel 24 h + 2 h, avec confirmation", livrable: "Scénario v2", contenu: "« Le deuxième rappel change tout. »", format: "Avant / après chiffré" },
                { day: 17, formation: "Traiter les réponses : confirmé, annulé, à replanifier", livrable: "Logique conditionnelle complète", contenu: "« Que se passe-t-il quand le patient répond NON ? »", format: "Démo" },
                { day: 18, formation: "Connexion à un agenda réel", livrable: "Chaîne de bout en bout", contenu: "Coulisses du branchement", format: "Time-lapse" },
                { day: 19, formation: "Casser volontairement : numéro invalide, doublon, annulation tardive", livrable: "Journal des pannes", contenu: "« Mon automatisation a planté. C'est une bonne nouvelle. »", format: "Face caméra, honnêteté" },
                { day: 20, formation: "Agent de réponse aux questions fréquentes : périmètre et garde-fous", livrable: "Spécification écrite : jamais de conseil médical, escalade humaine", contenu: "« Ce que l'IA ne doit jamais répondre à un patient. »", format: "Liste, ton ferme" },
                { day: 21, formation: "Construire l'agent", livrable: "Agent v1 opérationnel", contenu: "Démonstration en direct", format: "Écran partagé" },
                { day: 22, formation: "Le tester sur 20 vraies questions issues de vos entretiens", livrable: "Taux de réponse correcte mesuré", contenu: "« J'ai testé mon agent sur 20 vraies questions de patients. »", format: "Résultats chiffrés" },
                { day: 23, formation: "Transcription de consultation : étudier Abridge, Nuance DAX Copilot, Nabla, Suki", livrable: "Comparatif + spécification d'une version simple", contenu: "« Les médecins américains ont déjà ça. Nous, non. »", format: "Comparatif visuel" },
                { day: 24, formation: "Construire la transcription sur un audio fictif", livrable: "Un compte rendu généré", contenu: "Démonstration", format: "Écran + audio" },
                { day: 25, formation: "Structurer la sortie : motif, examen, conclusion", livrable: "Gabarit de compte rendu", contenu: "Avant / après du texte brut au compte rendu", format: "Split screen" },
                { day: 26, formation: "Conformité de vos 3 scénarios : où sont les données, pseudonymisation, ce qui ne sort jamais du Maroc", livrable: "Fiche de conformité par scénario", contenu: "« J'ai dû refaire mon automatisation pour respecter la loi marocaine. »", format: "Face caméra" },
                { day: 27, formation: "Chiffrer le retour : temps de secrétariat, rendez-vous manqués évités, valeur d'une consultation", livrable: "Un calculateur simple", contenu: "« Combien rapporte une automatisation à un cabinet ? »", format: "Calcul à l'écran" },
                { day: 28, formation: "Documenter chaque automatisation : mode d'emploi, limites, ce qui casse", livrable: "Une page par outil", contenu: "Coulisses de la documentation", format: "Court, coulisses" },
                { day: 29, formation: "Répéter la démonstration en 5 minutes chrono", livrable: "Démo enregistrée, prête à montrer", contenu: "La démo elle-même", format: "Vidéo de démonstration" },
              ],
            },
            {
              id: "deploiement",
              titre: "Déploiement chez un vrai praticien",
              jours: "J30 – J34",
              but: "Ce bloc transforme un exercice en preuve. C'est lui qui produit le témoignage et les chiffres.",
              items: [
                { day: 30, formation: "Proposer l'installation gratuite aux praticiens interrogés au bloc 2", livrable: "3 propositions envoyées", contenu: "« Je l'installe gratuitement dans 3 cabinets. »", format: "Annonce face caméra" },
                { day: 31, formation: "Installer chez le premier praticien", livrable: "Mise en service réelle", contenu: "Coulisses de l'installation", format: "Reportage court" },
                { day: 32, formation: "Relever les chiffres d'avant : taux de rendez-vous manqués, temps passé", livrable: "Base de comparaison datée", contenu: "« On mesure avant. Sinon on ne prouve rien. »", format: "Tableau à l'écran" },
                { day: 33, formation: "Corriger selon les retours réels du cabinet", livrable: "Version 2 ajustée", contenu: "« Ce que le terrain m'a appris en 48 h. »", format: "Face caméra" },
                { day: 34, formation: "Recueillir un témoignage et les premiers chiffres", livrable: "Témoignage filmé ou écrit", contenu: "Le témoignage lui-même", format: "Parole du praticien" },
              ],
            },
            {
              id: "preuve",
              titre: "Preuve et bilan",
              jours: "J35 – J37",
              but: "Transformer 37 jours en un actif réutilisable : un dossier de preuve et des enseignements chiffrés.",
              items: [
                { day: 35, formation: "Constituer le dossier de preuve : captures, démos de 60 s, chiffres avant / après", livrable: "Dossier partageable", contenu: "« Résultat après 37 jours : voici les chiffres. »", format: "Récapitulatif chiffré" },
                { day: 36, formation: "Analyser vos 37 publications : rétention à 3 s, partages, abonnés gagnés par vidéo", livrable: "Vos 3 meilleures accroches, vos 3 formats à abandonner", contenu: "« Ce que 37 vidéos m'ont appris sur ce qui marche. »", format: "Analyse de données personnelle" },
                { day: 37, formation: "Auto-évaluation honnête sur 10 questions, puis plan des 30 jours suivants", livrable: "Verdict écrit sur ce qui n'est pas acquis", contenu: "« Ce que je n'ai pas réussi. »", format: "Face caméra, vulnérabilité assumée" },
              ],
            },
          ],
        },
        program37Legacy: [
          { day: 1, domain: "Lancement", formation: "Définir la ligne éditoriale et l'identité visuelle du compte (bio, palette, gabarit de reel)", reel: "Vidéo d'intro : « Je documente mon parcours en IA santé, jour après jour »" },
          { day: 2, domain: "Généraliste", formation: "Comprendre le principe du triage assisté par IA en soins primaires (symptom checkers type Ada Health)", reel: "Explication en 30s : comment un symptom-checker IA oriente un patient" },
          { day: 3, domain: "Généraliste", formation: "Étudier la dictée médicale automatisée (ambient AI scribing type Nuance DAX, Suki) et tester un outil gratuit équivalent", reel: "Démo : un compte-rendu médical généré automatiquement à partir d'une consultation fictive" },
          { day: 4, domain: "Généraliste", formation: "Lister 3 tâches administratives d'un cabinet qui peuvent être automatisées par IA aujourd'hui", reel: "« 3 tâches de ton médecin déjà automatisées par l'IA sans que tu le saches »" },
          { day: 5, domain: "Radiologie", formation: "Comprendre le CAD (computer-aided detection) : comment une IA repère un nodule pulmonaire ou une fracture", reel: "« Voici comment une IA \"regarde\" une radio différemment d'un œil humain »" },
          { day: 6, domain: "Radiologie", formation: "Étudier une étude publiée comparant IA vs radiologues sur le dépistage du cancer du sein", reel: "Chiffres clés de l'étude, format infographie animée" },
          { day: 7, domain: "Radiologie", formation: "Identifier 2 outils de radiologie assistée par IA utilisés en pratique clinique aujourd'hui", reel: "« 2 outils IA que les radiologues utilisent déjà en 2026 »" },
          { day: 8, domain: "Cardiologie", formation: "Comprendre l'analyse ECG automatisée par IA (détection d'arythmies)", reel: "Démo visuelle : un ECG annoté par IA en temps réel" },
          { day: 9, domain: "Cardiologie", formation: "Étudier un modèle de prédiction du risque cardiovasculaire basé sur l'IA", reel: "« Cette IA prédit ton risque cardiaque avant les symptômes »" },
          { day: 10, domain: "Cardiologie", formation: "Comparer l'échographie cardiaque assistée par IA à l'interprétation manuelle", reel: "Gain de temps : format avant/après pour un cardiologue" },
          { day: 11, domain: "Dermatologie", formation: "Comprendre le deep learning appliqué à la détection de mélanome par photo", reel: "« Cette IA détecte un cancer de la peau avec une simple photo »" },
          { day: 12, domain: "Dermatologie", formation: "Tester une application grand public de dépistage cutané par smartphone et noter ses limites", reel: "Test filmé de l'app, avec les précautions à connaître" },
          { day: 13, domain: "Dermatologie", formation: "Lister les biais connus des IA de dermatologie (sous-représentation des peaux foncées dans les données)", reel: "« Le vrai problème des IA de dermatologie qu'on ne te dit pas »" },
          { day: 14, domain: "Ophtalmologie", formation: "Étudier IDx-DR, premier dispositif IA autonome approuvé pour diagnostiquer sans médecin (rétinopathie diabétique)", reel: "« La première IA autorisée à diagnostiquer seule — son histoire »" },
          { day: 15, domain: "Ophtalmologie", formation: "Comprendre le fonctionnement d'un scanner de fond d'œil automatisé", reel: "Démo schématique du parcours patient avec dépistage IA" },
          { day: 16, domain: "Ophtalmologie", formation: "Étudier l'impact du dépistage IA dans les zones à faible accès aux ophtalmologues", reel: "« Comment l'IA amène le dépistage oculaire là où il n'y a pas de spécialiste »" },
          { day: 17, domain: "Oncologie", formation: "Comprendre la pathologie digitale : analyse de lames par IA", reel: "Visualisation d'une lame analysée par IA, zones surlignées" },
          { day: 18, domain: "Oncologie", formation: "Étudier AlphaFold et son impact sur la découverte de traitements", reel: "« Comment l'IA a résolu un problème vieux de 50 ans en biologie »" },
          { day: 19, domain: "Oncologie", formation: "Comprendre la personnalisation des dosages de chimiothérapie assistée par IA", reel: "« Vers une chimio calculée sur-mesure par IA »" },
          { day: 20, domain: "Psychiatrie", formation: "Étudier la détection de la dépression via l'analyse vocale ou textuelle", reel: "« Ta voix peut révéler une dépression à une IA — voici comment »" },
          { day: 21, domain: "Psychiatrie", formation: "Tester un chatbot de soutien psychologique (type Woebot, Wysa) et noter ses limites éthiques", reel: "Test filmé + avertissement clair sur les limites de l'outil" },
          { day: 22, domain: "Psychiatrie", formation: "Lister les garde-fous nécessaires avant de déployer une IA en santé mentale", reel: "« Ce que l'IA ne doit jamais faire seule en santé mentale »" },
          { day: 23, domain: "Anatomopathologie", formation: "Comprendre l'histopathologie computationnelle (analyse de lames digitales à grande échelle)", reel: "« L'IA qui lit des milliers de lames pendant que tu dors »" },
          { day: 24, domain: "Anatomopathologie", formation: "Étudier un cas de détection automatisée de cancer sur biopsie", reel: "Étude de cas chiffrée, format avant/après" },
          { day: 25, domain: "Anatomopathologie", formation: "Comprendre le rôle du pathologiste face à l'IA (second avis vs premier tri)", reel: "« Le pathologiste ne disparaît pas — son rôle change »" },
          { day: 26, domain: "Pédiatrie", formation: "Étudier la détection précoce de troubles du développement via analyse vidéo/vocale", reel: "« Cette IA repère des signes précoces via une simple vidéo »" },
          { day: 27, domain: "Pédiatrie", formation: "Comprendre le suivi de croissance automatisé par IA", reel: "Démo d'un outil de suivi de croissance pédiatrique" },
          { day: 28, domain: "Pédiatrie", formation: "Lister les précautions spécifiques à l'usage de l'IA chez l'enfant (consentement, biais)", reel: "« IA et enfants : les 3 règles à ne jamais oublier »" },
          { day: 29, domain: "Chirurgie", formation: "Comprendre la chirurgie assistée par robot et le rôle de l'IA dans la planification pré-opératoire", reel: "« Comment l'IA prépare une opération avant le premier geste »" },
          { day: 30, domain: "Chirurgie", formation: "Étudier un cas de réalité augmentée guidée par IA en salle d'opération", reel: "Visualisation schématique d'un geste guidé par IA" },
          { day: 31, domain: "Chirurgie", formation: "Comparer les résultats cliniques chirurgie assistée vs conventionnelle sur un cas publié", reel: "Chiffres clés en infographie" },
          { day: 32, domain: "Bilan", formation: "Analyser les statistiques des 31 premiers posts : formats et spécialités qui ont le mieux performé", reel: "« Ce que 31 jours de contenu IA santé m'ont appris »" },
          { day: 33, domain: "Bilan", formation: "Compiler les 10 outils les plus marquants du mois (un par domaine couvert)", reel: "Carrousel/reel « Top 10 outils IA santé à connaître »" },
          { day: 34, domain: "Réseau", formation: "Identifier et contacter 5 comptes IA santé pour une collaboration ou un repost croisé", reel: "Annonce d'une collaboration ou d'un shoutout croisé" },
          { day: 35, domain: "Réseau", formation: "Cadrer un format hebdomadaire récurrent (actu IA santé de la semaine) pour la suite", reel: "Lancement du premier épisode du format récurrent" },
          { day: 36, domain: "Réseau", formation: "Sonder la communauté (stories/commentaires) sur les spécialités qu'elle veut voir approfondir", reel: "Story interactive de sondage + reel présentant les résultats" },
          { day: 37, domain: "Bilan", formation: "Écrire le plan de contenu du mois 2 à partir des retours et des statistiques collectées", reel: "« Voici ce qui arrive le mois prochain » — teaser du programme suivant" },
        ],
        formations: [
          "AI For Everyone — Andrew Ng (Coursera, gratuit) : bases non-techniques de l'IA",
          "AI in Healthcare Specialization — Stanford (Coursera)",
          "Certificat HIMSS Digital Health",
          "Ethics of AI in Health — Harvard (edX)",
          "Veille continue : newsletter The Batch (DeepLearning.AI), Nature Digital Medicine",
        ],
        pillars: [
          "AI Automation en santé : généraliste + 9 spécialités (>50% du contenu)",
          "Histoire : des systèmes experts (MYCIN, 1976) au machine learning prédictif, puis au deep learning et aux LLM",
          "Mythes vs réalité : l'IA va-t-elle remplacer le médecin ?",
          "Éthique & régulation : biais algorithmiques, FDA, AI Act européen",
          "Actu hebdomadaire : les percées IA santé de la semaine",
        ],
        reelIdeas: [
          "Astuce du jour : « ce prompt IA pour rédiger un compte-rendu médical plus vite » (généraliste)",
          "Outil à connaître : automatisation IA en radiologie, démo en 30 secondes",
          "« Cette IA détecte le cancer de la peau par simple photo » — dermatologie, étude de cas chiffrée",
          "Opportunité de la semaine : bourse ou formation IA santé à ne pas rater",
          "« L'automatisation qui fait gagner 1h/jour à un cardiologue » — format gain de temps",
          "« De MYCIN à ChatGPT : 50 ans d'IA médicale en 60 secondes » — format historique accéléré",
          "« Non, l'IA ne va pas remplacer ton médecin — voici pourquoi » — format mythe/nuance",
          "Coulisses : « Ce que j'apprends cette semaine sur l'IA santé » — format personnel, construit la confiance",
        ],
      },
    },
    {
      id: "linkedin",
      label: "LinkedIn (@think.anas)",
      unit: "abonnés",
      target: 20_000,
      accent: "fig" as AccentColor,
      logoKeys: ["linkedin"] as BrandKey[],
      actionSteps: [
        "Compléter le profil à 100%",
        "Publier une fois par semaine",
        "Interagir avec le réseau académique",
      ],
    },
  ],

  streak: {
    label: "Prière quotidienne",
    recordTarget: 237,
  },

  countdowns: [
    {
      id: "hajj",
      label: "Hajj",
      date: "2028-08-06",
      editable: false,
      image: "/goals/hajj.jpg",
      actionSteps: [
        "Économiser le budget du voyage",
        "Obtenir le visa Hajj",
        "Suivre les formalités sanitaires",
        "Préparer l'itinéraire des rites",
      ],
    },
    {
      id: "hizb-deadline",
      label: "Échéance mémorisation — veille de la remise des diplômes (cycle ingénieur)",
      date: "2028-09-24",
      editable: true,
      actionSteps: [
        "Planifier un rythme de mémorisation régulier",
        "Prévoir des sessions de révision avant l'échéance",
      ],
    },
  ],

  checklist: [
    {
      id: "francais",
      label: "Français",
      description: "Certificat officiel",
      actionSteps: [
        "Choisir l'organisme certifiant (DELF/TCF)",
        "S'inscrire à l'examen",
        "Suivre un programme de révision",
        "Passer l'examen",
      ],
    },
    {
      id: "anglais",
      label: "Anglais",
      description: "Certificat officiel",
      actionSteps: [
        "Choisir l'organisme certifiant (IELTS/TOEFL)",
        "S'inscrire à l'examen",
        "Suivre un programme de révision",
        "Passer l'examen",
      ],
    },
    {
      id: "espagnol",
      label: "Espagnol",
      description: "Certificat officiel",
      actionSteps: [
        "Choisir l'organisme certifiant (DELE)",
        "S'inscrire à l'examen",
        "Suivre un programme de révision",
        "Passer l'examen",
      ],
    },
    {
      id: "allemand",
      label: "Allemand",
      description: "Certificat officiel",
      actionSteps: [
        "Choisir l'organisme certifiant (Goethe-Zertifikat)",
        "S'inscrire à l'examen",
        "Suivre un programme de révision",
        "Passer l'examen",
      ],
    },
    {
      id: "specialisation",
      label: "Spécialisation",
      description:
        "Devenir expert en sciences sexologiques — évaluer ce domaine face à généraliste en psychologie",
      actionSteps: [
        "Lister les formations en sciences sexologiques",
        "Comparer avec un cursus généraliste en psychologie",
        "Échanger avec des professionnels des deux domaines",
        "Prendre une décision finale",
      ],
    },
    {
      id: "histoire-maroc",
      label: "Histoire du Maroc",
      description: "Toute l'histoire du Maroc depuis 789",
      image: "/goals/histoire-maroc.png",
      actionSteps: [
        "Lister les grandes périodes (789 à aujourd'hui)",
        "Lire une source de référence par période",
        "Résumer chaque période dans les notes",
        "Lire 20 pages par jour de Histoire du Maroc de Michel Abitbol",
        "Écrire une morale personnelle après chaque séance",
        "Découvrir un souverain marocain par semaine depuis 789",
        "Terminer les 31 séances du parcours de lecture",
      ],
    },
  ],
};

export type GoalDossier =
  | ({ kind: "milestone" } & (typeof objectifsContent.milestones)[number])
  | ({ kind: "checklist" } & (typeof objectifsContent.checklist)[number])
  | ({ kind: "countdown" } & (typeof objectifsContent.countdowns)[number]);

export function findGoal(id: string): GoalDossier | undefined {
  const milestone = objectifsContent.milestones.find((m) => m.id === id);
  if (milestone) return { kind: "milestone", ...milestone };
  const item = objectifsContent.checklist.find((c) => c.id === id);
  if (item) return { kind: "checklist", ...item };
  const countdown = objectifsContent.countdowns.find((c) => c.id === id);
  if (countdown) return { kind: "countdown", ...countdown };
  return undefined;
}
