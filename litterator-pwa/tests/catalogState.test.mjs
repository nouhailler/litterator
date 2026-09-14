import assert from 'node:assert/strict';
import test from 'node:test';
import { readEnum, readPositivePage, updateUrlState } from '../src/utils/urlState.js';

test('la pagination refuse les valeurs invalides sans accepter un préfixe numérique', () => {
  for (const value of [null, '', '0', '-1', '2suffix', '1.5', 'Infinity', '9007199254740992']) {
    assert.equal(readPositivePage(value), 1, String(value));
  }
  assert.equal(readPositivePage('12'), 12);
});

test('les valeurs énumérées inconnues utilisent le choix par défaut', () => {
  assert.equal(readEnum('alphabetical', ['chronological', 'alphabetical'], 'chronological'), 'alphabetical');
  assert.equal(readEnum('unknown', ['chronological', 'alphabetical'], 'chronological'), 'chronological');
});

test('un filtre remet la page à zéro, conserve les autres paramètres et crée un historique', () => {
  const original = new URLSearchParams('q=Hugo&movement=romantisme&page=3&sort=alphabetical');
  let result;
  updateUrlState(original, (params, options) => { result = { params, options }; }, { movement: 'realisme', page: null });
  assert.equal(original.get('page'), '3');
  assert.equal(result.params.get('q'), 'Hugo');
  assert.equal(result.params.get('movement'), 'realisme');
  assert.equal(result.params.get('sort'), 'alphabetical');
  assert.equal(result.params.has('page'), false);
  assert.equal(result.options.replace, false);
});

test('la saisie de recherche remplace l’entrée courante et encode les caractères français', () => {
  let result;
  updateUrlState(new URLSearchParams('page=2'), (params, options) => { result = { params, options }; }, { q: 'Été & poésie', page: null }, { replace: true });
  assert.equal(new URLSearchParams(result.params.toString()).get('q'), 'Été & poésie');
  assert.equal(result.options.replace, true);
});
