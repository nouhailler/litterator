export const LEGAL_NOTICE_VERSION = '1.0';

export const legalNotice = {
  version: LEGAL_NOTICE_VERSION,
  title: '⚠️ Information importante',
  shortWarning: [
    'Cette application est fournie à titre informatif et pratique. Malgré les précautions prises lors de son développement, elle peut contenir des erreurs, des imprécisions ou présenter des limitations techniques.',
    'L’utilisation de cette application se fait sous votre responsabilité. Les informations, résultats, données ou recommandations fournis par l’application ne doivent pas être considérés comme infaillibles.',
    'Pour toute information importante ou décision susceptible d’avoir des conséquences, vérifiez les données auprès de sources fiables et officielles ou auprès d’un professionnel compétent.',
    'En utilisant cette application, vous reconnaissez avoir pris connaissance de cet avertissement.',
  ],
  legalIdentity: [
    { label: 'Éditeur', value: 'Swinux' },
    { label: 'Adresse', value: 'Vaud, Switzerland' },
    { label: 'Email', value: 'contact@swinux.ch' },
    { label: 'Hébergeur', value: 'Infomaniak' },
    { label: 'Date de mise à jour', value: '20 Aout 2026' },
  ],
  sections: [
    {
      id: 'warning',
      title: 'Avertissement',
      paragraphs: [
        'Cette application est proposée à titre informatif, documentaire, éducatif et/ou pratique selon sa finalité. Elle est destinée à fournir à l’utilisateur des informations, données, outils ou fonctionnalités destinés à faciliter son utilisation.',
        'L’utilisation de l’application implique que l’utilisateur a pris connaissance du présent avertissement et accepte les conditions d’utilisation applicables à l’application.',
      ],
    },
    {
      id: 'liability',
      title: 'Limitation de responsabilité',
      paragraphs: [
        'L’éditeur s’efforce de fournir des informations aussi fiables, pertinentes et actualisées que possible. Toutefois, aucune garantie ne peut être donnée quant à l’exactitude, l’exhaustivité, l’actualité ou la pertinence des informations présentées.',
        'Certaines informations peuvent provenir de sources externes ou être générées, calculées ou interprétées automatiquement. Des erreurs, omissions, imprécisions ou incohérences peuvent donc subsister.',
        'L’utilisateur reconnaît utiliser l’application sous sa propre responsabilité et demeure seul responsable de l’utilisation qu’il fait des informations et fonctionnalités proposées.',
      ],
    },
    {
      id: 'use',
      title: 'Utilisation de l’application',
      paragraphs: [
        'L’application ne doit pas être considérée comme une source unique ou définitive d’information lorsqu’une décision importante, professionnelle, financière, médicale, juridique, scientifique, géographique ou liée à la sécurité est concernée.',
        'Lorsque cela est nécessaire, l’utilisateur doit vérifier les informations auprès de sources officielles, de documents de référence ou d’un professionnel qualifié.',
      ],
    },
    {
      id: 'accuracy',
      title: 'Exactitude des informations',
      paragraphs: [
        'Les résultats, calculs, estimations, localisations, statistiques, recommandations ou autres données produits par l’application sont fournis à titre indicatif, sauf indication contraire explicite.',
        'L’utilisateur doit apprécier leur pertinence en fonction de son propre contexte et procéder aux vérifications nécessaires avant toute utilisation susceptible d’entraîner des conséquences importantes.',
      ],
    },
    {
      id: 'availability',
      title: 'Dysfonctionnements et disponibilité',
      paragraphs: [
        'Malgré les efforts déployés pour assurer le bon fonctionnement de l’application, l’éditeur ne garantit pas que celle-ci sera disponible en permanence, exempte d’erreurs ou compatible avec tous les appareils, systèmes d’exploitation, navigateurs, réseaux ou configurations.',
        'Des interruptions, ralentissements, pertes de connexion, erreurs techniques ou indisponibilités temporaires peuvent notamment survenir.',
      ],
    },
    {
      id: 'data',
      title: 'Données et résultats',
      paragraphs: [
        'Dans les limites autorisées par la réglementation applicable, l’éditeur ne saurait être tenu responsable des dommages, pertes, préjudices ou conséquences résultant directement ou indirectement de l’utilisation, de l’impossibilité d’utiliser ou de l’interprétation des informations ou fonctionnalités proposées par l’application.',
        'Cette limitation concerne notamment, lorsque cela est applicable, les erreurs ou omissions dans les informations, les dysfonctionnements techniques, les interruptions de service, les pertes de données, les problèmes de connexion, les incompatibilités matérielles ou logicielles et les décisions prises par l’utilisateur sur la base des informations fournies.',
      ],
    },
    {
      id: 'external-sources',
      title: 'Sources externes',
      paragraphs: [
        'Lorsque l’application utilise ou référence des données provenant de sources externes, celles-ci peuvent évoluer, devenir indisponibles ou être modifiées indépendamment de l’éditeur. L’éditeur ne garantit donc pas la disponibilité permanente ni l’exactitude des contenus provenant de ces sources.',
      ],
    },
    {
      id: 'location-precision',
      title: 'Précision de la localisation',
      includeWhen: 'location',
      paragraphs: [
        'Les informations de localisation, distances, parcours, altitudes et autres données géographiques fournies par l’application dépendent notamment du GPS, du réseau, du matériel utilisé, des conditions météorologiques et environnementales ainsi que des performances du téléphone.',
        'Ces données peuvent être imprécises, incomplètes ou comporter des erreurs.',
        'L’application ne doit pas être utilisée comme unique moyen d’orientation ou de navigation dans une situation présentant un risque pour la sécurité des personnes.',
        'L’utilisateur reste responsable de son itinéraire, de ses déplacements et des décisions prises sur le terrain.',
      ],
    },
    {
      id: 'evolution',
      title: 'Évolution de l’application',
      paragraphs: [
        'Les fonctionnalités, contenus, données et services proposés par l’application peuvent être modifiés, mis à jour, suspendus ou supprimés à tout moment afin d’assurer son évolution et sa maintenance.',
      ],
    },
  ],
  privacyPlaceholder:
    'Une politique de confidentialité pourra être ajoutée ici si de futures fonctionnalités nécessitent un traitement spécifique.',
};

export const getLegalSections = ({ includeLocationPrecision = true } = {}) =>
  legalNotice.sections.filter((section) => section.includeWhen !== 'location' || includeLocationPrecision);
