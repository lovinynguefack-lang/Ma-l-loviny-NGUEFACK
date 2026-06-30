import { Course, LibraryItem, PresetImageProblem, Post, RoadmapMilestone } from "./types";

export const LEVELS = [
  "Primaire",
  "Collège",
  "Lycée",
  "Université",
  "BTS",
  "Concours",
  "Professionnel"
] as const;

export const SUBJECTS = [
  "Mathématiques",
  "Physique-Chimie",
  "Français & Lettres",
  "SVT (Biologie)",
  "Histoire-Géographie",
  "Informatique & Tech",
  "Langues",
  "Entrepreneuriat"
] as const;

export const INITIAL_COURSES: Course[] = [
  {
    id: "c1",
    title: "Équations du Second Degré & Discriminant",
    subject: "Mathématiques",
    level: "Lycée",
    summary: "Maîtrisez le calcul du discriminant delta, la recherche des racines réelles et complexes, et les applications de factorisation.",
    chapters: [
      "Introduction historique (Al-Khwarizmi)",
      "Forme canonique d'un trinôme",
      "Calcul du discriminant Delta (Δ)",
      "Racines et signes du trinôme",
      "Exercices d'application concrets"
    ],
    duration: "2h 30m",
    isPremium: false,
    isDownloaded: false,
    content: `### Cours Complet : Équations du Second Degré

Une équation du second degré est une équation de la forme :
**ax² + bx + c = 0** (où a, b et c sont des réels et a ≠ 0).

#### 1. Le Discriminant Delta (Δ)
Pour résoudre cette équation, on calcule le nombre discriminant Δ :
**Δ = b² - 4ac**

#### 2. Analyse des trois cas possibles :
* **Si Δ > 0** : L'équation admet deux solutions réelles distinctes :
  * x₁ = (-b - √Δ) / 2a
  * x₂ = (-b + √Δ) / 2a
* **Si Δ = 0** : L'équation admet une solution double :
  * x₀ = -b / 2a
* **Si Δ < 0** : L'équation n'admet aucune solution réelle (mais deux solutions complexes conjuguées).

#### 3. Exemple d'application :
Résoudre : *2x² - 5x + 3 = 0*
* a = 2, b = -5, c = 3
* Δ = (-5)² - 4 * 2 * 3 = 25 - 24 = 1.
* Δ > 0, deux solutions :
  * x₁ = (5 - 1) / 4 = 1
  * x₂ = (5 + 1) / 4 = 1.5`
  },
  {
    id: "c2",
    title: "Mécanique Newtonienne : Plan Incliné",
    subject: "Physique-Chimie",
    level: "Lycée",
    summary: "Comprendre les lois de Newton appliquées au glissement sur un plan incliné avec ou sans frottements physiques.",
    chapters: [
      "Première et Deuxième Loi de Newton",
      "Système et Référentiel Terrestre Galiléen",
      "Inventaire des forces (Poids, Réaction, Frottements)",
      "Projection sur les axes du mouvement",
      "Calcul de l'accélération 'a'"
    ],
    duration: "3h 15m",
    isPremium: true,
    isDownloaded: false,
    content: `### Cours Complet : Dynamique d'un solide sur Plan Incliné

Dans cette leçon, nous analysons le mouvement d'un solide de masse *m* glissant sur un plan incliné faisant un angle *α* avec l'horizontale.

#### 1. Inventaire des Forces :
1. **Le Poids (P)** : Force verticale vers le bas, d'intensité P = m * g.
2. **La Réaction Normale du support (Rn)** : Perpendiculaire au plan incliné.
3. **La Force de Frottement (f)** : Parallèle au plan incliné, de sens opposé au mouvement.

#### 2. Application de la Deuxième Loi de Newton :
La somme des forces extérieures est égale au produit de la masse par le vecteur accélération :
**Σ F_ext = m * a** => **P + Rn + f = m * a**

#### 3. Projection sur l'axe du mouvement (parallèle au plan, vers le bas) :
* P_x = m * g * sin(α)
* f_x = -f
* Rn_x = 0
D'où l'équation d'accélération :
**m * g * sin(α) - f = m * a** => **a = g * sin(α) - (f / m)**`
  },
  {
    id: "c3",
    title: "Grands Empires de l'Afrique de l'Ouest",
    subject: "Histoire-Géographie",
    level: "Collège",
    summary: "Découvrez l'organisation politique, économique et culturelle des empires du Ghana, du Mali et de l'Empire Songhaï.",
    chapters: [
      "L'Empire du Ghana (Berceau de l'or)",
      "L'Empire du Mali (Kouroukan Fouga et Mansa Moussa)",
      "L'Empire Songhaï (Soni Ali Ber et Askia Mohammed)",
      "Les routes transsahariennes et le commerce",
      "L'impact culturel des universités de Tombouctou"
    ],
    duration: "4h",
    isPremium: false,
    isDownloaded: false,
    content: `### Cours complet : Les Empires Médiévaux Ouest-Africains

L'Afrique de l'Ouest a vu naître certains des empires les plus riches et les plus organisés de l'histoire de l'humanité.

#### 1. L'Empire du Mali (XIIIe - XVIe siècle)
Fondé par **Sundiata Keïta** après la bataille de Kirina en 1235.
* **Charte de Kouroukan Fouga** : L'une des premières déclarations des droits de l'homme au monde (1236).
* **Mansa Moussa** : Connu pour son célèbre pèlerinage à La Mecque en 1324, distribuant tant d'or qu'il a temporairement dévalué le métal précieux en Égypte.

#### 2. L'Empire Songhaï (XVe - XVIe siècle)
Ayant pour capitale Gao, il s'est étendu sous la direction de :
* **Soni Ali Ber** : Le conquérant militaire pragmatique.
* **Askia Mohammed** : Administrateur hors pair qui fit de Tombouctou et de Djenné de grands centres intellectuels universitaires.`
  },
  {
    id: "c4",
    title: "Algorithmes et Structures de Données",
    subject: "Informatique & Tech",
    level: "BTS",
    summary: "Apprenez les bases solides de la programmation structurée : boucles, tableaux, récursivité et tris élémentaires.",
    chapters: [
      "Variables, types de données et opérateurs",
      "Instructions conditionnelles et structures de choix",
      "Boucles itératives (Pour, Tant Que)",
      "Tableaux et matrices",
      "Algorithmes de tri (tri à bulles, tri rapide)"
    ],
    duration: "5h 30m",
    isPremium: true,
    isDownloaded: false,
    content: `### Cours Complet : Algorithmique Fondamentale

Un algorithme est une suite finie et ordonnée d'instructions permettant de résoudre un problème donné.

#### 1. Les Structures Itératives (Boucles)
La boucle **Tant Que** est utilisée lorsque le nombre d'itérations n'est pas connu à l'avance :
\`\`\`pseudo
Tant Que (condition) Faire
  // Instructions
Fin Tant Que
\`\`\`

La boucle **Pour** est privilégiée lorsque le nombre de répétitions est prédéterminé :
\`\`\`pseudo
Pour i allant de 1 à N Faire
  // Instructions
Fin Pour
\`\`\`

#### 2. Exemple d'application : Algorithme du Tri à Bulles
Le tri à bulles parcourt le tableau, compare les éléments adjacents et les échange s'ils sont dans le mauvais ordre.`
  },
  {
    id: "c5",
    title: "Création de Projets de Mobile Money en Afrique",
    subject: "Entrepreneuriat",
    level: "Professionnel",
    summary: "Développez et déployez des solutions Fintech performantes, adaptées aux réalités du marché informel et bancaire africain.",
    chapters: [
      "Paysage Fintech Africain (MoMo, Orange Money, Wave)",
      "Réglementations BCEAO et CEMAC sur la monnaie électronique",
      "Conception d'une passerelle API de paiement sécurisée",
      "Gestion des réseaux d'agents physiques et de liquidités",
      "Modèle économique de commissionnement et micro-assurance"
    ],
    duration: "6h 45m",
    isPremium: true,
    isDownloaded: false,
    content: `### Cours d'Élite : Écosystème Mobile Money & Fintech

Le Mobile Money a révolutionné l'inclusion financière en Afrique subsaharienne en contournant les infrastructures bancaires traditionnelles.

#### 1. Architecture Technique d'un Service de Portefeuille Électronique
* **Core Ledger (Grand Livre)** : Base de données hautement transactionnelle et sécurisée qui enregistre chaque crédit/débit de manière immuable.
* **USSD & Menu Mobile** : Canal privilégié pour le réseau non-connecté à Internet à haut débit.
* **Passerelles API de paiement** : Connexion entre les commerçants, les banques partenaires et le réseau télécom.

#### 2. Réglementations régionales :
Dans la zone UEMOA, la BCEAO exige des agréments stricts d'Établissement de Monnaie Électronique (EME) ou des partenariats solides avec des banques agréées pour garantir la couverture des fonds à 100% auprès de la banque centrale.`
  }
];

export const INITIAL_LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: "lib1",
    title: "Annales Corrigées du Baccalauréat (Série C, D)",
    author: "Prof. N'Guessan - Inspecteur d'Académie",
    type: "PDF",
    sizeOrDuration: "14.2 Mo (340 pages)",
    subject: "Mathématiques",
    level: "Concours",
    downloadUrl: "#",
    isDownloaded: false
  },
  {
    id: "lib2",
    title: "Guide de Préparation au Concours d'Entrée de l'INP-HB",
    author: "Association des Anciens Élèves",
    type: "PDF",
    sizeOrDuration: "8.5 Mo (120 pages)",
    subject: "Physique-Chimie",
    level: "Concours",
    downloadUrl: "#",
    isDownloaded: false
  },
  {
    id: "lib3",
    title: "Vidéo : Maîtriser l'intégration par parties en 15 min",
    author: "M. Diallo - Enseignant agrégé",
    type: "Vidéo",
    sizeOrDuration: "15:20 min (HD 1080p)",
    subject: "Mathématiques",
    level: "Lycée",
    downloadUrl: "#",
    isDownloaded: false
  },
  {
    id: "lib4",
    title: "Fiche Mémo : Rédaction de la dissertation philosophique",
    author: "Mme. Kamara - Enseignante d'Université",
    type: "Présentation",
    sizeOrDuration: "2.4 Mo (35 slides)",
    subject: "Français & Lettres",
    level: "Lycée",
    downloadUrl: "#",
    isDownloaded: false
  }
];

export const PRESET_IMAGE_PROBLEMS: PresetImageProblem[] = [
  {
    id: "math",
    title: "Équation quadratique manuscrite",
    subject: "Mathématiques",
    previewUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=120&auto=format&fit=crop&q=60",
    description: "Une équation du type ax² + bx + c = 0 écrite au tableau : 2x² - 5x + 3 = 0"
  },
  {
    id: "physics",
    title: "Forces sur Plan Incliné",
    subject: "Physique-Chimie",
    previewUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=120&auto=format&fit=crop&q=60",
    description: "Schéma d'un solide de masse m glissant avec frottements f sur un plan incliné de 30°"
  },
  {
    id: "chemistry",
    title: "Formule de la Photosynthèse",
    subject: "SVT (Biologie)",
    previewUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=60",
    description: "Réaction d'oxydoréduction de la photosynthèse cellulaire"
  }
];

export const INITIAL_FORUM_POSTS: Post[] = [
  {
    id: "p1",
    author: "Professeur Koffi Yao",
    role: "Enseignant",
    avatar: "👨‍🏫",
    content: "Bonjour à tous les candidats au Baccalauréat ! J'ai partagé un document complet résumant toutes les formules de trigonométrie indispensables pour l'épreuve de mathématiques. N'hésitez pas à poser vos questions ici !",
    timestamp: "Il y a 2 heures",
    likes: 42,
    commentsCount: 15,
    hasLiked: false,
    attachmentName: "Formulaire_Trigono_Bac.pdf",
    attachmentType: "pdf"
  },
  {
    id: "p2",
    author: "Mariam Diallo",
    role: "Élève",
    avatar: "👩‍🎓",
    content: "Quelqu'un pourrait m'expliquer la différence fondamentale entre l'Empire du Ghana et l'Empire du Mali dans l'organisation commerciale de l'or ? Je m'embrouille un peu dans mes fiches d'histoire de collègue.",
    timestamp: "Il y a 5 heures",
    likes: 12,
    commentsCount: 3,
    hasLiked: false
  },
  {
    id: "p3",
    author: "Tuteur IA AfriLearn",
    role: "Tuteur IA",
    avatar: "🤖",
    content: "En réponse à Mariam Diallo : L'Empire du Ghana contrôlait principalement les routes caravanières transsahariennes et agissait comme un intermédiaire fiscal (impôts sur l'import-export de l'or et du sel), alors que l'Empire du Mali possédait directement les mines d'or de Bambouk et de Bouré sous son contrôle souverain territorial !",
    timestamp: "Il y a 4 heures",
    likes: 56,
    commentsCount: 0,
    hasLiked: true
  }
];

export const ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    month: 1,
    title: "Lancement du MVP",
    phase: "MVP",
    objectives: [
      "Déploiement de l'application Web progressive (PWA)",
      "Intégration de l'assistant de cours IA (Gemini API)",
      "Mise en ligne des 100 cours fondamentaux et quiz de base",
      "Simulation de l'OCR pour les équations scientifiques"
    ],
    acquisitionGoal: "5 000 Utilisateurs Actifs",
    status: "completed"
  },
  {
    month: 3,
    title: "Applications Mobiles Natives & Mobile Money",
    phase: "MVP",
    objectives: [
      "Publication des applications Android (Play Store) et iOS (App Store)",
      "Intégration complète des paiements MTN MoMo, Orange Money et Wave",
      "Option de téléchargement local complet des cours pour le mode hors-ligne",
      "Ouverture de la marketplace pour les documents d'enseignants tiers"
    ],
    acquisitionGoal: "25 000 Utilisateurs",
    status: "current"
  },
  {
    month: 6,
    title: "Intelligence Artificielle Personnalisée",
    phase: "Croissance",
    objectives: [
      "Reconnaissance d'image OCR réelle intégrée dans le smartphone",
      "Planificateur d'étude dynamique IA selon les faiblesses détectées",
      "Partenariats officiels avec 5 grandes écoles et 10 lycées pilotes",
      "Lancement de la certification AfriLearn avec examens blancs surveillés"
    ],
    acquisitionGoal: "100 000 Utilisateurs",
    status: "upcoming"
  },
  {
    month: 12,
    title: "Expansion Internationale Francophone",
    phase: "Expansion",
    objectives: [
      "Ouverture des bureaux au Sénégal, Bénin, Cameroun, RDC et Gabon",
      "Lancement d'une déclinaison du programme pour les concours professionnels",
      "Modèle B2B d'abonnements collectifs pour ministères de l'Éducation nationale",
      "Seuil d'autonomie financière et de rentabilité pour investisseurs de Série A"
    ],
    acquisitionGoal: "500 000 Utilisateurs",
    status: "upcoming"
  }
];

export const MARKETING_CHANNELS = [
  {
    name: "TikTok",
    icon: "📱",
    description: "Vidéos courtes (60s) d'astuces de révision rapide, résolution magique d'équations en live avec l'IA, humour d'élèves en période d'examens.",
    role: "Acquisition de masse des élèves et étudiants (12-25 ans). Viralité organique immédiate.",
    strategy: "3 publications par jour par nos ambassadeurs étudiants."
  },
  {
    name: "Facebook",
    icon: "👥",
    description: "Groupes de parents d'élèves, communautés de professeurs, partages de sujets d'annales corrigés et de questions de concours nationaux.",
    role: "Ciblage des décideurs payeurs (parents d'élèves) et recrutement des enseignants partenaires pour la marketplace.",
    strategy: "Publicités ciblées sur la rentrée scolaire et modération active de groupes d'aide aux devoirs."
  },
  {
    name: "WhatsApp",
    icon: "💬",
    description: "Création de canaux de diffusion AfriLearn par niveau (ex. 'Groupe d'entraide Bac D 2026') et chatbots de quiz automatiques quotidiens.",
    role: "Rétention et engagement communautaire ultra-direct de proximité, contournant l'absence d'accès constant à la 4G.",
    strategy: "Diffusion chaque matin d'une question d'examen avec explication en format d'image ultra légère."
  },
  {
    name: "LinkedIn & B2B",
    icon: "💼",
    description: "Articles de fond sur l'inclusion EdTech en Afrique francophone, démonstrations pour les universités et formations professionnelles BTS.",
    role: "Vente d'offres d'abonnements d'écoles privées, d'universités et de formations pour salariés d'entreprises.",
    strategy: "Prospection directe par notre équipe commerciale EdTech."
  }
];
