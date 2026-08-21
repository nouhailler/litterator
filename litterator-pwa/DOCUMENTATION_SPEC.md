# Specification documentaire Littérator

Version de la specification: 1.0.0
Statut: obligatoire
Application: Littérator

## Objectif

Toute fonctionnalite visible ou utilisable dans Littérator doit etre documentee dans la documentation integree accessible depuis `/docs`.

La documentation couvre les parcours utilisateur, les fonctionnalites, les parametres, les permissions et capacites navigateur, les donnees, le mode hors connexion, le depannage, la FAQ, la reference, les versions, les informations legales et le support.

## Sources prioritaires

La documentation doit etre maintenue a partir des sources suivantes, dans cet ordre:

1. Code source reel.
2. Configuration reelle.
3. Tests.
4. Schemas et fichiers de donnees.
5. API effectivement utilisees.
6. Interface utilisateur.
7. Documentation existante.
8. Informations explicitement fournies par le developpeur.

Ne pas inventer de fonctionnalite, de traitement de donnees, de compatibilite ou de garantie juridique. Si un comportement n est pas verifiable, l indiquer avec `A verifier`.

## Architecture implementee

- Source documentaire structuree: `src/docs/documentationData.js`
- Interface documentaire React: `src/docs/DocumentationPage.jsx`
- Route applicative: `/docs/*`
- Audit automatique: `scripts/documentation-audit.mjs`
- Commande: `npm run docs:audit`
- Build bloquant: `npm run build` execute l audit avant `vite build`

## Regle de maintenance

Avant de considerer une modification fonctionnelle comme terminee, verifier:

- Code termine.
- Tests termines ou justification explicite.
- Routes et ecrans documentes.
- Fonctionnalites documentees.
- Parametres documentes.
- Permissions ou capacites navigateur documentees.
- Donnees et stockage documentes.
- Fonctionnement offline et online documente.
- Erreurs et depannage documentes.
- FAQ verifiee.
- Changelog verifie si la modification est importante.
- `npm run docs:audit` execute avec succes.

## Audit documentaire

L audit doit echouer en cas de page obligatoire manquante, route applicative non referencee, parametre non documente ou lien interne casse.

Les points marques `A verifier` sont autorises mais signales comme documentation potentiellement incomplete.
