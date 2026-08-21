export const documentationVersion = '1.0.0';
export const documentationUpdatedAt = '2026-08-21';

export const documentedAppRoutes = [
  '/', '/timeline', '/map', '/movements', '/authors', '/works', '/glossary', '/help', '/settings', '/legal', '/docs',
];

export const documentedSettings = [
  {
    id: 'theme',
    name: 'Theme clair ou sombre',
    type: 'selection',
    defaultValue: 'light',
    values: 'light, dark',
    description: 'Change les couleurs de l interface.',
    storage: 'localStorage, cle theme',
  },
  {
    id: 'dataType',
    name: 'Type de donnees a importer',
    type: 'selection',
    defaultValue: 'author',
    values: 'author, work, movement, location',
    description: 'Choisit le gabarit JSON et le fichier cible pour l import.',
    storage: 'Etat React, non persistant.',
  },
  {
    id: 'legal_notice_acknowledged',
    name: 'Acceptation des mentions legales',
    type: 'booleen',
    defaultValue: 'false',
    values: 'true, absent',
    description: 'Masque l avertissement legal apres acceptation.',
    storage: 'localStorage, cles legal_notice_acknowledged et legal_notice_acknowledged_version',
  },
];

export const documentedPermissions = [
  {
    name: 'Stockage local du navigateur',
    required: 'Non',
    when: 'Lors du changement de theme, de l acceptation legale, de l installation PWA et du cache.',
    why: 'Conserver les preferences locales, les fichiers PWA et les donnees mises en cache.',
    refused: 'Le theme et l acceptation legale peuvent ne pas persister. Le mode hors connexion peut etre limite.',
  },
  {
    name: 'Telechargement de fichiers',
    required: 'Non',
    when: 'Lors de l export JSON ou de la generation d un fichier de donnees modifie.',
    why: 'Permettre a l utilisateur de recuperer les donnees publiees avec l application.',
    refused: 'L export ne peut pas etre enregistre sur l appareil.',
  },
  {
    name: 'Acces reseau',
    required: 'Partiel',
    when: 'Au chargement initial, pour les tuiles OpenStreetMap, Leaflet et la recherche Wikimedia.',
    why: 'Charger les ressources externes qui ne sont pas deja en cache.',
    refused: 'Les contenus locaux deja caches restent utilisables, mais la carte et la recherche Wikimedia peuvent etre incompletes.',
  },
];

export const documentedErrors = [
  {
    code: 'JSON_INVALID',
    message: 'JSON invalide',
    meaning: 'Le texte colle dans l import n est pas un JSON valide.',
    solution: 'Verifier les guillemets, virgules, accolades et crochets, puis relancer l import.',
  },
  {
    code: 'REQUIRED_FIELD_MISSING',
    message: 'Champs obligatoires manquants',
    meaning: 'Le type choisi attend des champs comme id, name, title, author, period ou coordinates.',
    solution: 'Charger le gabarit et completer les champs obligatoires.',
  },
  {
    code: 'DUPLICATE_ID',
    message: 'Un element avec cet ID existe deja',
    meaning: 'Le nouvel element utilise un identifiant deja present dans le corpus charge.',
    solution: 'Changer l id ou modifier le fichier source manuellement.',
  },
  {
    code: 'DATA_LOAD_ERROR',
    message: 'Erreur lors du chargement des donnees',
    meaning: 'Un fichier JSON local ou une ressource externe n a pas pu etre charge.',
    solution: 'Verifier le reseau, le cache PWA, les fichiers public/data et relancer la mise a jour.',
  },
  {
    code: 'UPDATE_ERROR',
    message: 'Impossible de lancer la mise a jour',
    meaning: 'La mise a jour PWA ou le nettoyage du cache a echoue.',
    solution: 'Recharger la page, vider les donnees du site dans le navigateur, puis reessayer.',
  },
];

export const docPages = [
  {
    path: '/docs/getting-started',
    title: 'Bien demarrer',
    category: 'Premiers pas',
    description: 'Installation, premier lancement et premiere utilisation de Littérator.',
    sections: [
      {
        title: 'Presentation',
        content: [
          'Littérator est une PWA editoriale pour explorer la litterature francaise depuis 1800 par frise, carte, auteurs, oeuvres, mouvements et glossaire.',
          'Le premier lancement affiche un avertissement legal. L utilisateur doit l accepter pour continuer.',
        ],
      },
      {
        title: 'Installation PWA',
        list: [
          'Android: ouvrir l application dans Chrome, utiliser le menu du navigateur, puis Ajouter a l ecran d accueil ou Installer l application.',
          'iOS: ouvrir dans Safari, utiliser le bouton de partage, puis Ajouter a l ecran d accueil.',
          'Desktop: Chrome et Edge peuvent proposer l installation PWA. La compatibilite Firefox n est pas declaree comme verifiee dans le projet.',
        ],
      },
      {
        title: 'Premier lancement',
        list: [
          'Afficher l avertissement legal.',
          'Lire ou ouvrir les details.',
          'Cliquer sur J ai compris.',
          'Arriver sur l accueil et choisir Frise, Carte, Mouvements, Auteurs, Oeuvres ou Glossaire.',
        ],
      },
      {
        title: 'Mise a jour et desinstallation',
        content: [
          'La page Parametres contient une action Mettre a jour l application qui verifie le service worker, vide les caches et recharge la PWA.',
          'La desinstallation se fait depuis le systeme ou le navigateur. Effacer les donnees du site supprime les preferences locales et les caches.',
        ],
      },
    ],
    links: ['/docs/offline', '/docs/settings', '/docs/legal'],
  },
  {
    path: '/docs/guide',
    title: 'Guide utilisateur',
    category: 'Guide',
    description: 'Documentation des ecrans principaux.',
    sections: [
      {
        title: 'Accueil',
        list: [
          'Objectif: donner une vue d ensemble du corpus et orienter vers les vues principales.',
          'Acces: lien Accueil ou logo Littérator.',
          'Donnees: fichiers JSON authors, works, movements, locations, glossary et place-coordinates.',
        ],
      },
      {
        title: 'Frise',
        list: [
          'Objectif: situer les evenements et les oeuvres dans le temps.',
          'Actions: filtrer par type, mouvement ou auteur, puis ouvrir les fiches liees.',
          'Erreur possible: donnees locales indisponibles ou anciennes a cause du cache PWA.',
        ],
      },
      {
        title: 'Carte',
        list: [
          'Objectif: explorer les lieux litteraires sur une carte Leaflet.',
          'Actions: filtrer par mouvement ou auteur, toucher un marqueur, consulter les lieux associes.',
          'Cas particulier: les tuiles de carte et certaines images peuvent necessiter Internet si elles ne sont pas en cache.',
        ],
      },
      {
        title: 'Parametres',
        list: [
          'Objectif: importer, exporter, rechercher des images Wikimedia, changer le theme, mettre a jour la PWA et consulter les mentions legales.',
          'Resultats: les imports generent un fichier JSON a telecharger; ils ne modifient pas directement le depot.',
        ],
      },
    ],
    links: ['/docs/features', '/docs/settings', '/docs/troubleshooting'],
  },
  {
    path: '/docs/features',
    title: 'Fonctionnalites',
    category: 'Fonctionnalites',
    description: 'Fonctionnalites visibles ou utilisables dans Littérator.',
    sections: [
      {
        title: 'Exploration du corpus',
        list: [
          'Description: consulter auteurs, oeuvres, mouvements, lieux et notions litteraires.',
          'Prerequis: donnees JSON locales disponibles.',
          'Offline: fonctionne si les fichiers ont ete precaches ou deja charges par la PWA.',
          'Online: necessaire au premier chargement et pour les ressources externes non cachees.',
        ],
      },
      {
        title: 'Recherche et filtres',
        list: [
          'Description: filtrer les contenus dans les pages specialisees.',
          'Donnees utilisees: fichiers JSON publies dans public/data.',
          'Limite: la recherche documentaire et applicative est locale, sans index serveur.',
        ],
      },
      {
        title: 'Import et export JSON',
        list: [
          'Description: generer ou telecharger des fichiers JSON pour le corpus.',
          'Prerequis: navigateur autorisant le telechargement de fichiers.',
          'Resultat: fichier telecharge. Le remplacement dans public/data reste une action developpeur.',
          'Erreurs: JSON invalide, champs obligatoires manquants, id duplique.',
        ],
      },
      {
        title: 'Mise a jour PWA',
        list: [
          'Description: forcer la verification du service worker et le nettoyage des caches.',
          'Prerequis: service worker disponible dans le navigateur.',
          'Offline: impossible de recuperer une nouvelle version sans reseau.',
        ],
      },
    ],
    links: ['/docs/reference/errors', '/docs/offline', '/docs/faq'],
  },
  {
    path: '/docs/settings',
    title: 'Parametres',
    category: 'Parametres',
    description: 'Parametres exposes a l utilisateur.',
    sections: documentedSettings.map((setting) => ({
      title: setting.name,
      list: [
        `Identifiant interne: ${setting.id}.`,
        `Type: ${setting.type}.`,
        `Valeur par defaut: ${setting.defaultValue}.`,
        `Valeurs possibles: ${setting.values}.`,
        `Effet: ${setting.description}`,
        `Stockage: ${setting.storage}.`,
        'Application: immediate pour le theme et les choix de formulaire; apres rechargement pour l acceptation legale reinitialisee.',
      ],
    })),
    links: ['/docs/reference/settings', '/docs/data'],
  },
  {
    path: '/docs/permissions',
    title: 'Permissions',
    category: 'Confidentialite',
    description: 'Permissions et capacites navigateur utilisees.',
    sections: documentedPermissions.map((permission) => ({
      title: permission.name,
      list: [
        `Pourquoi: ${permission.why}`,
        `Quand: ${permission.when}`,
        `Obligatoire: ${permission.required}.`,
        `Si refuse: ${permission.refused}`,
        'Reactivation: depuis les parametres du navigateur, les reglages du site ou les reglages de l application installee.',
      ],
    })),
    links: ['/docs/data', '/docs/offline'],
  },
  {
    path: '/docs/data',
    title: 'Donnees et confidentialite',
    category: 'Confidentialite',
    description: 'Donnees chargees, stockees, exportees et transmises.',
    sections: [
      {
        title: 'Tableau des donnees',
        table: {
          headers: ['Donnee', 'Origine', 'Stockage', 'Transmission', 'Finalite'],
          rows: [
            ['Auteurs, oeuvres, mouvements, lieux, glossaire', 'public/data/*.json', 'Cache PWA et memoire de la page', 'Non, sauf chargement depuis l hebergement de l application', 'Explorer le corpus litteraire'],
            ['Theme', 'Choix utilisateur', 'localStorage', 'Non', 'Conserver l apparence choisie'],
            ['Acceptation legale', 'Clic utilisateur', 'localStorage', 'Non', 'Eviter de reafficher l avertissement'],
            ['Images et tuiles externes', 'Wikimedia, OpenStreetMap, Leaflet', 'Cache Storage selon Workbox', 'Oui, vers les services externes lors du chargement', 'Afficher images et carte'],
          ],
        },
      },
      {
        title: 'Suppression et export',
        list: [
          'L export cree des fichiers JSON sur l appareil.',
          'Effacer les donnees du site supprime localStorage, Cache Storage et service worker selon le navigateur.',
          'La duree exacte de conservation des caches depend aussi du navigateur. Les politiques Workbox configurees vont de 1 jour pour data-json a 1 an pour certains assets Leaflet.',
        ],
      },
      {
        title: 'Point juridique',
        content: ['La politique de confidentialite definitive est a verifier humainement. Le projet contient actuellement un placeholder legal pour les traitements futurs.'],
      },
    ],
    links: ['/docs/legal', '/docs/reference/compatibility'],
  },
  {
    path: '/docs/offline',
    title: 'Fonctionnement hors connexion',
    category: 'PWA',
    description: 'Comportement offline, cache et reconnexion.',
    sections: [
      {
        title: 'Disponibilite',
        table: {
          headers: ['Fonction', 'Offline', 'Online', 'Synchronisation'],
          rows: [
            ['Navigation dans l application deja chargee', 'Oui', 'Oui', 'Aucune file d attente'],
            ['Donnees JSON locales deja cachees', 'Oui', 'Oui', 'NetworkFirst pour verifier les nouvelles donnees'],
            ['Carte et tuiles non cachees', 'Partiel', 'Oui', 'CacheFirst pour les ressources chargees'],
            ['Recherche Wikimedia', 'Non', 'Oui', 'Aucune synchronisation'],
            ['Export JSON', 'Oui si donnees presentes', 'Oui', 'Aucune synchronisation'],
            ['Mise a jour PWA', 'Non', 'Oui', 'Service worker autoUpdate'],
          ],
        },
      },
      {
        title: 'Synchronisation',
        content: [
          'Aucune synchronisation de donnees utilisateur n est implementee dans le code. La seule synchronisation observee concerne le service worker et les caches de ressources.',
          'Schema: reseau disponible -> verification du service worker -> cache mis a jour -> rechargement de l application si necessaire.',
        ],
      },
    ],
    links: ['/docs/troubleshooting', '/docs/features'],
  },
  {
    path: '/docs/troubleshooting',
    title: 'Depannage',
    category: 'Support',
    description: 'Problemes frequents et diagnostics.',
    sections: [
      {
        title: 'L application affiche une ancienne version',
        list: [
          'Symptome: l interface ou les donnees ne correspondent pas au dernier deploiement.',
          'Causes: service worker actif, Cache Storage, deploiement non termine.',
          'Solution: Parametres, Mise a jour, Mettre a jour l application. Si le probleme persiste, vider les donnees du site.',
        ],
      },
      {
        title: 'La carte est incomplete',
        list: [
          'Symptome: fond de carte absent ou marqueurs incomplets.',
          'Causes: reseau indisponible, tuiles non encore cachees, donnees locations indisponibles.',
          'Solution: verifier la connexion, recharger la page, puis relancer la mise a jour PWA.',
        ],
      },
      {
        title: 'L import JSON echoue',
        list: [
          'Symptome: message JSON invalide, champs obligatoires ou id duplique.',
          'Diagnostic: charger le gabarit du bon type et comparer les champs.',
          'Solution: corriger le JSON, choisir un id unique, puis importer a nouveau.',
        ],
      },
      {
        title: 'Informations a fournir au support',
        list: ['Version, URL, appareil, OS, navigateur, taille d ecran, message d erreur, etapes de reproduction, etat reseau.'],
      },
    ],
    links: ['/docs/support', '/docs/reference/errors'],
  },
  {
    path: '/docs/faq',
    title: 'FAQ',
    category: 'Support',
    description: 'Questions frequentes.',
    sections: [
      {
        title: 'Questions',
        faq: [
          ['Comment installer l application ?', 'Utilisez le menu du navigateur puis Ajouter a l ecran d accueil ou Installer. Voir Bien demarrer.'],
          ['Puis-je utiliser Littérator sans Internet ?', 'Oui partiellement apres chargement ou installation. La carte et Wikimedia peuvent necessiter Internet.'],
          ['Ou sont mes donnees ?', 'Le corpus est publie dans les fichiers JSON de l application. Les preferences et caches restent dans le navigateur.'],
          ['Comment supprimer mes donnees locales ?', 'Effacez les donnees du site dans le navigateur ou desinstallez la PWA.'],
          ['Comment exporter les donnees ?', 'Ouvrez Parametres, Exporter des donnees, puis choisissez une categorie ou l export complet.'],
          ['Pourquoi accepter les mentions legales ?', 'L avertissement informe des limites et responsabilites d usage. Son acceptation est stockee localement.'],
        ],
      },
    ],
    links: ['/docs/getting-started', '/docs/data', '/docs/troubleshooting'],
  },
  {
    path: '/docs/reference',
    title: 'Reference',
    category: 'Reference',
    description: 'Index technique des parametres, permissions, erreurs, limites et compatibilite.',
    sections: [
      { title: 'Contenu', list: ['Parametres', 'Permissions', 'Erreurs', 'Formats de donnees', 'Compatibilite', 'Glossaire', 'Limites connues.'] },
    ],
    links: ['/docs/reference/settings', '/docs/reference/errors', '/docs/reference/glossary', '/docs/reference/compatibility', '/docs/reference/limitations'],
  },
  {
    path: '/docs/reference/settings',
    title: 'Reference des parametres',
    category: 'Reference',
    description: 'Tableau recapitulatif des parametres.',
    sections: [
      {
        title: 'Parametres',
        table: {
          headers: ['Parametre', 'Type', 'Defaut', 'Valeurs', 'Description'],
          rows: documentedSettings.map((setting) => [setting.name, setting.type, setting.defaultValue, setting.values, setting.description]),
        },
      },
    ],
    links: ['/docs/settings'],
  },
  {
    path: '/docs/reference/errors',
    title: 'Codes et erreurs',
    category: 'Reference',
    description: 'Erreurs connues detectees dans le code.',
    sections: [
      {
        title: 'Erreurs',
        table: {
          headers: ['Code', 'Message', 'Signification', 'Solution'],
          rows: documentedErrors.map((error) => [error.code, error.message, error.meaning, error.solution]),
        },
      },
    ],
    links: ['/docs/troubleshooting'],
  },
  {
    path: '/docs/reference/glossary',
    title: 'Glossaire documentaire',
    category: 'Reference',
    description: 'Termes utiles pour comprendre la documentation.',
    sections: [
      {
        title: 'Termes',
        faq: [
          ['PWA', 'Application web installable qui peut fonctionner partiellement hors connexion grace au service worker.'],
          ['Service worker', 'Script navigateur qui gere le cache et les mises a jour de l application.'],
          ['Cache Storage', 'Stockage navigateur utilise pour conserver les fichiers et ressources de la PWA.'],
          ['Corpus', 'Ensemble des donnees litteraires publiees avec Littérator.'],
        ],
      },
    ],
    links: ['/docs/offline', '/docs/data'],
  },
  {
    path: '/docs/reference/compatibility',
    title: 'Compatibilite',
    category: 'Reference',
    description: 'Plateformes explicitement documentees.',
    sections: [
      {
        title: 'Compatibilite verifiee ou explicite',
        list: [
          'PWA Vite React avec service worker, compatible avec les navigateurs modernes prenant en charge les modules ES et les service workers.',
          'Android Chrome et iOS Safari sont documentes pour l installation PWA.',
          'Chrome et Edge desktop sont documentes comme plateformes PWA courantes.',
          'Versions minimales exactes: A verifier, non declarees dans le projet.',
        ],
      },
    ],
    links: ['/docs/getting-started', '/docs/reference/limitations'],
  },
  {
    path: '/docs/reference/limitations',
    title: 'Limites connues',
    category: 'Reference',
    description: 'Limites fonctionnelles et techniques connues.',
    sections: [
      {
        title: 'Limites',
        list: [
          'Les imports ne modifient pas directement le depot: ils generent un fichier a remplacer manuellement.',
          'La recherche Wikimedia depend du reseau et des reponses de Commons.',
          'Les tuiles de carte dependent de services externes si elles ne sont pas en cache.',
          'Aucune synchronisation multi-appareil des donnees utilisateur n est implementee.',
          'La documentation juridique definitive doit etre validee humainement.',
        ],
      },
    ],
    links: ['/docs/data', '/docs/legal'],
  },
  {
    path: '/docs/versions',
    title: 'Versions',
    category: 'Versions',
    description: 'Suivi des versions de l application et de la documentation.',
    sections: [
      {
        title: 'Version actuelle',
        list: [
          'Application: lue depuis package.json ou VITE_COMMIT_SHA.',
          `Documentation: ${documentationVersion}.`,
          `Derniere mise a jour documentaire: ${documentationUpdatedAt}.`,
          'Changelog source: CHANGELOG.md.',
        ],
      },
    ],
    links: ['/docs/reference/limitations'],
  },
  {
    path: '/docs/legal',
    title: 'Informations legales',
    category: 'Legal',
    description: 'Acces aux mentions legales et limites de validation juridique.',
    sections: [
      {
        title: 'Documents',
        list: [
          'Mentions legales disponibles dans la route /legal.',
          'Editeur indique dans le code: Swinux, Vaud, Switzerland, contact@swinux.ch.',
          'Hebergeur indique: Infomaniak.',
          'Politique de confidentialite definitive: A verifier et valider humainement.',
          'Licences et credits: consulter public/images/ATTRIBUTIONS.md et les dependances package.json.',
        ],
      },
    ],
    links: ['/legal', '/docs/data', '/docs/support'],
  },
  {
    path: '/docs/support',
    title: 'Support',
    category: 'Support',
    description: 'Signaler un probleme ou demander de l aide.',
    sections: [
      {
        title: 'Contacter le support',
        list: [
          'Depuis Aide, utiliser le lien e-mail contact@swinux.ch.',
          'Depuis A propos, utiliser le lien e-mail ou ouvrir une issue GitHub pour les developpeurs.',
          'Fournir version, URL, appareil, OS, navigateur, message d erreur, etapes de reproduction et etat reseau.',
        ],
      },
    ],
    links: ['/docs/troubleshooting', '/docs/faq'],
  },
];

export const documentationHomeLinks = [
  ['/docs/getting-started', 'Commencer'],
  ['/docs/guide', 'Guide utilisateur'],
  ['/docs/features', 'Fonctionnalites'],
  ['/docs/settings', 'Parametres'],
  ['/docs/data', 'Donnees et confidentialite'],
  ['/docs/troubleshooting', 'Depannage'],
  ['/docs/faq', 'FAQ'],
  ['/docs/reference', 'Reference'],
  ['/docs/versions', 'Versions'],
  ['/docs/legal', 'Informations legales'],
  ['/docs/support', 'Support'],
];

export const requiredDocumentationPaths = [
  '/docs/getting-started',
  '/docs/guide',
  '/docs/features',
  '/docs/settings',
  '/docs/permissions',
  '/docs/data',
  '/docs/offline',
  '/docs/troubleshooting',
  '/docs/faq',
  '/docs/reference',
  '/docs/reference/settings',
  '/docs/reference/errors',
  '/docs/reference/glossary',
  '/docs/reference/compatibility',
  '/docs/reference/limitations',
  '/docs/versions',
  '/docs/legal',
  '/docs/support',
];
