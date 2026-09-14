import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { DataLoadError, loadJson } from '../src/data/corpus.js';

test('le catalogue reste inférieur à 1 Mo et ne contient plus de couvertures SVG intégrées', async () => {
  const content = await readFile(new URL('../public/data/works.json', import.meta.url));
  const works = JSON.parse(content);
  assert.equal(works.length, 760);
  assert.equal(new Set(works.map((work) => work.id)).size, works.length);
  assert.ok(content.byteLength < 1_000_000, `${content.byteLength} octets`);
  assert.equal(works.filter((work) => !work.cover).length, 705);
  assert.equal(works.some((work) => work.cover?.startsWith('data:')), false);
  const adaptations = works.flatMap((work) => work.adaptations || []);
  assert.equal(adaptations.length, 333);
  assert.ok(adaptations.every((adaptation) => Number.isInteger(adaptation.year)));
  const completed = adaptations.filter((adaptation) => adaptation.yearSource);
  assert.equal(completed.length, 31);
  assert.ok(completed.every((adaptation) => adaptation.dateType && /^https:\/\//.test(adaptation.yearSource)));
  assert.ok(adaptations.find((adaptation) => adaptation.link.endsWith('/Q130267117')).yearNote);
  assert.equal(adaptations.find((adaptation) => adaptation.link.endsWith('/Q108260386')).type, 'performance');
  assert.equal(adaptations.find((adaptation) => adaptation.link.endsWith('/Q133839248')).type, 'stage');
  assert.equal(adaptations.find((adaptation) => adaptation.link.endsWith('/Q7799905')).type, 'opera');
});

test('le chargeur partage les requêtes et autorise un nouvel essai après une erreur', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let requests = 0;
  globalThis.fetch = async () => {
    requests += 1;
    if (requests === 1) return { ok: false, status: 503 };
    return { ok: true, json: async () => ({ loaded: true }) };
  };
  await assert.rejects(loadJson('/test/retry.json'), (error) => error instanceof DataLoadError && error.status === 503 && error.path === '/test/retry.json');
  const first = loadJson('/test/retry.json');
  assert.equal(first, loadJson('/test/retry.json'));
  assert.deepEqual(await first, { loaded: true });
  assert.equal(requests, 2);
});

test('le chargeur distingue un JSON invalide d’une panne réseau', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => ({ ok: true, json: async () => { throw new SyntaxError('invalid'); } });
  await assert.rejects(loadJson('/test/invalid.json'), /JSON invalide/);
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(loadJson('/test/network.json'), /inaccessible/);
});
