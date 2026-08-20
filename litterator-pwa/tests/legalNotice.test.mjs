import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  acknowledgeLegalNotice,
  hasAcknowledgedLegalNotice,
  LEGAL_NOTICE_ACKNOWLEDGED_KEY,
  LEGAL_NOTICE_VERSION_KEY,
  resetLegalNoticeAcknowledgement,
} from '../src/legal/legalStorage.js';
import { getLegalSections } from '../src/legal/legalNoticeConfig.js';

const createMemoryStorage = () => {
  const values = new Map();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
};

test('première ouverture: l’avertissement est nécessaire sans acceptation locale', () => {
  const storage = createMemoryStorage();

  assert.equal(hasAcknowledgedLegalNotice(storage), false);
});

test('clic sur J’ai compris: l’acceptation est enregistrée et l’avertissement disparaît', () => {
  const storage = createMemoryStorage();

  acknowledgeLegalNotice(storage, '1.0');

  assert.equal(storage.getItem(LEGAL_NOTICE_ACKNOWLEDGED_KEY), 'true');
  assert.equal(storage.getItem(LEGAL_NOTICE_VERSION_KEY), '1.0');
  assert.equal(hasAcknowledgedLegalNotice(storage), true);
});

test('rechargement et nouvelle ouverture: l’acceptation persistée évite le réaffichage', () => {
  const storage = createMemoryStorage();

  storage.setItem(LEGAL_NOTICE_ACKNOWLEDGED_KEY, 'true');

  assert.equal(hasAcknowledgedLegalNotice(storage), true);
});

test('suppression du stockage: l’avertissement redevient nécessaire', () => {
  const storage = createMemoryStorage();
  acknowledgeLegalNotice(storage);
  resetLegalNoticeAcknowledgement(storage);

  assert.equal(storage.getItem(LEGAL_NOTICE_ACKNOWLEDGED_KEY), null);
  assert.equal(hasAcknowledgedLegalNotice(storage), false);
});

test('Voir les détails: les mentions complètes contiennent les sections attendues', () => {
  const titles = getLegalSections().map((section) => section.title);

  assert.ok(titles.includes('Limitation de responsabilité'));
  assert.ok(titles.includes('Utilisation de l’application'));
  assert.ok(titles.includes('Exactitude des informations'));
  assert.ok(titles.includes('Dysfonctionnements et disponibilité'));
  assert.ok(titles.includes('Données et résultats'));
  assert.ok(titles.includes('Sources externes'));
  assert.ok(titles.includes('Évolution de l’application'));
});

test('application avec carte: la section Précision de la localisation est présente', () => {
  const titles = getLegalSections({ includeLocationPrecision: true }).map((section) => section.title);

  assert.ok(titles.includes('Précision de la localisation'));
});

test('application sans GPS ni carte: la section localisation peut être désactivée', () => {
  const titles = getLegalSections({ includeLocationPrecision: false }).map((section) => section.title);

  assert.equal(titles.includes('Précision de la localisation'), false);
});
