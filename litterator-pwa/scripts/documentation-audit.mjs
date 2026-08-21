import { readFileSync } from 'node:fs';
import {
  docPages,
  documentedAppRoutes,
  documentedErrors,
  documentedPermissions,
  documentedSettings,
  requiredDocumentationPaths,
} from '../src/docs/documentationData.js';

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const settingsSource = readFileSync(new URL('../src/pages/SettingsPage.jsx', import.meta.url), 'utf8');
const legalStorageSource = readFileSync(new URL('../src/legal/legalStorage.js', import.meta.url), 'utf8');

const pagePaths = new Set(docPages.map((page) => page.path));
const failures = [];
const warnings = [];

const check = (condition, message) => {
  if (!condition) {
    failures.push(message);
  }
};

for (const path of requiredDocumentationPaths) {
  check(pagePaths.has(path), `Page obligatoire manquante: ${path}`);
}

for (const page of docPages) {
  check(page.title && page.description && page.category, `Metadonnees incompletes: ${page.path}`);
  check(page.sections.length > 0, `Page sans section: ${page.path}`);

  for (const link of page.links || []) {
    const isAppRoute = link === '/' || link === '/legal';
    check(pagePaths.has(link) || isAppRoute, `Lien interne casse dans ${page.path}: ${link}`);
  }
}

const routeMatches = [...appSource.matchAll(/<Route path="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((route) => route !== '*')
  .map((route) => route.replace('/*', ''));

for (const route of routeMatches) {
  check(documentedAppRoutes.includes(route), `Route applicative non referencee dans la documentation: ${route}`);
}

const settingSignals = [
  ['theme', settingsSource.includes("localStorage.setItem('theme'")],
  ['dataType', settingsSource.includes("useState('author')")],
  ['legal_notice_acknowledged', legalStorageSource.includes('LEGAL_NOTICE_ACKNOWLEDGED_KEY')],
];

for (const [settingId, exists] of settingSignals) {
  check(exists, `Signal de parametre non trouve dans le code: ${settingId}`);
  check(documentedSettings.some((setting) => setting.id === settingId), `Parametre non documente: ${settingId}`);
}

check(documentedPermissions.length >= 3, 'Permissions/capacites navigateur insuffisamment documentees');
check(documentedErrors.length >= 5, 'Erreurs connues insuffisamment documentees');

const unresolvedCount = docPages
  .flatMap((page) => page.sections)
  .flatMap((section) => [
    ...(section.content || []),
    ...(section.list || []),
    ...(section.faq || []).flat(),
    ...(section.table?.rows || []).flat(),
  ])
  .filter((text) => String(text).includes('A verifier')).length;

if (unresolvedCount > 0) {
  warnings.push(`${unresolvedCount} point(s) marques A verifier`);
}

const status = failures.length === 0 ? 'OK' : 'DOCUMENTATION INCOMPLETE';

console.log('DOCUMENTATION AUDIT');
console.log(`Pages obligatoires: ${requiredDocumentationPaths.filter((path) => pagePaths.has(path)).length} / ${requiredDocumentationPaths.length}`);
console.log(`Routes applicatives: ${routeMatches.length} / ${routeMatches.length} referencees`);
console.log(`Parametres: ${documentedSettings.length} documentes`);
console.log(`Permissions: ${documentedPermissions.length} documentees`);
console.log(`Erreurs: ${documentedErrors.length} documentees`);
console.log(`Liens internes: ${failures.filter((item) => item.includes('Lien interne casse')).length === 0 ? '100 % valides' : 'invalides'}`);
console.log(`STATUT: ${status}`);

if (warnings.length > 0) {
  console.log('\nDocumentation potentiellement incomplete:');
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

if (failures.length > 0) {
  console.log('\nElements manquants ou invalides:');
  for (const failure of failures) {
    console.log(`- ${failure}`);
  }

  process.exitCode = 1;
}
