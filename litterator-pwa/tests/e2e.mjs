import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const project = dirname(dirname(fileURLToPath(import.meta.url)));
const baselines = join(project, 'tests/visual-regression');
const results = join(project, 'test-results/visual');
const updateSnapshots = process.argv.includes('--update-snapshots');
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const checks = [];
const captures = [];

async function waitFor(check, description, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try { if (await check()) return; } catch { /* Navigation may replace the execution context. */ }
    await pause(100);
  }
  throw new Error(`Délai dépassé : ${description}`);
}

async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function connect(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  const exceptions = [];
  let id = 0;
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timeout);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const messageId = ++id;
    const timeout = setTimeout(() => { pending.delete(messageId); reject(new Error(`CDP sans réponse : ${method}`)); }, 15_000);
    pending.set(messageId, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id: messageId, method, params, sessionId }));
  });
  return { socket, send, exceptions };
}

async function main() {
  const serverPort = await freePort();
  const browserPort = await freePort();
  const origin = `http://127.0.0.1:${serverPort}`;
  const profile = await mkdtemp(join(tmpdir(), 'litterator-e2e-'));
  const children = [];
  let client;
  let debugPage;
  let output = '';
  const launch = (command, args) => {
    const child = spawn(command, args, { cwd: project, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', (data) => { output += data; });
    child.stderr.on('data', (data) => { output += data; });
    child.on('error', (error) => { output += error.message; });
    children.push(child);
    return child;
  };
  try {
    await mkdir(results, { recursive: true });
    launch(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(serverPort), '--strictPort']);
    launch(process.env.CHROMIUM_PATH || '/usr/bin/chromium', [
      '--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--hide-scrollbars',
      '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
      `--user-data-dir=${profile}`, `--remote-debugging-port=${browserPort}`, 'about:blank',
    ]);
    await waitFor(async () => (await fetch(origin)).ok, 'serveur preview');
    let version;
    await waitFor(async () => { version = await (await fetch(`http://127.0.0.1:${browserPort}/json/version`)).json(); return version.webSocketDebuggerUrl; }, 'Chromium');
    client = await connect(version.webSocketDebuggerUrl);
    const target = await client.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await client.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
    const send = (method, params) => client.send(method, params, sessionId);
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Network.setBypassServiceWorker', { bypass: true });
    await send('Network.setCacheDisabled', { cacheDisabled: true });
    const { identifier: deterministicScript } = await send('Page.addScriptToEvaluateOnNewDocument', {
      source: "try { localStorage.setItem('legal_notice_acknowledged', 'true'); } catch {} delete Navigator.prototype.serviceWorker;",
    });
    // External imagery is excluded to make the regression matrix reproducible without internet.
    const externalBlocks = ['*commons.wikimedia.org*', '*upload.wikimedia.org*', '*covers.openlibrary.org*', '*tile.openstreetmap.org*'];
    await send('Network.setBlockedURLs', { urls: externalBlocks });
    const evaluate = async (expression) => {
      const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
      return response.result.value;
    };
    debugPage = async () => {
      const state = await evaluate("({ url: location.href, online: navigator.onLine, controlled: Boolean(navigator.serviceWorker?.controller), text: document.body.innerText, images: [...document.images].map(img => ({ src: img.src, complete: img.complete, naturalWidth: img.naturalWidth, loading: img.loading, rect: img.getBoundingClientRect().toJSON() })) })");
      await writeFile(join(results, 'failure-state.json'), JSON.stringify(state, null, 2));
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      await writeFile(join(results, 'failure.png'), Buffer.from(data, 'base64'));
    };
    const navigate = async (path, selector = 'main h1') => {
      await send('Page.navigate', { url: `${origin}${path}` });
      await waitFor(() => evaluate(`location.pathname + location.search + location.hash === ${JSON.stringify(path)} && Boolean(document.querySelector(${JSON.stringify(selector)})) && !document.querySelector('.loading-state')`), path);
      await pause(150);
    };
    const click = async (selector) => {
      assert.ok(await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`), `Élément absent : ${selector}`);
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
      await pause(150);
    };
    const select = async (selector, value) => {
      await waitFor(() => evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`), `champ ${selector}`);
      await evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); input.value = ${JSON.stringify(value)}; input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
      await pause(150);
    };
    const viewport = (width) => send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width === 375 });
    const check = async (name, callback) => { await callback(); checks.push(name); console.log(`✓ ${name}`); };

    await viewport(1440);
    await check('Œuvres : filtres, tri et pagination restaurés par précédent/suivant', async () => {
      const start = '/works?genre=roman&sort=alphabetical&page=2';
      await navigate(start, '.work-card');
      assert.equal(await evaluate("document.querySelectorAll('.work-card').length"), 24);
      assert.ok(await evaluate("document.querySelector('.pagination').textContent.includes('Page 2')"));
      const firstTitle = await evaluate("document.querySelector('.work-card h2').textContent");
      await click('.work-card .catalog-actions a');
      await waitFor(() => evaluate("Boolean(document.querySelector('.detail-page h1')) && !document.querySelector('.loading-state')"), 'fiche œuvre');
      await evaluate('history.back()');
      await waitFor(() => evaluate(`location.pathname + location.search === ${JSON.stringify(start)} && Boolean(document.querySelector('.work-card'))`), 'retour catalogue');
      assert.equal(await evaluate("document.querySelector('#work-genre').value"), 'roman');
      assert.equal(await evaluate("document.querySelector('#work-sort').value"), 'alphabetical');
      assert.equal(await evaluate("document.querySelector('.work-card h2').textContent"), firstTitle);
      await click('.pagination button:last-child');
      await waitFor(() => evaluate("new URLSearchParams(location.search).get('page') === '3'"), 'page 3');
      await evaluate('history.back()');
      await waitFor(() => evaluate("new URLSearchParams(location.search).get('page') === '2'"), 'page 2');
      await evaluate('history.forward()');
      await waitFor(() => evaluate("new URLSearchParams(location.search).get('page') === '3'"), 'page 3 restaurée');
      await select('#work-genre', 'poésie');
      assert.equal(await evaluate("new URLSearchParams(location.search).has('page')"), false);
    });
    await check('Auteurs, glossaire, carte et frise : état initial transmis dans l’URL', async () => {
      await navigate('/authors?movement=modernite&sort=alphabetical&page=2', '.author-card');
      assert.equal(await evaluate("document.querySelector('#author-sort').value"), 'alphabetical');
      assert.ok(await evaluate("document.querySelector('.pagination').textContent.includes('Page 2')"));
      await navigate('/glossary?letter=M&q=figure', '.results-toolbar');
      assert.equal(await evaluate("document.querySelector('#glossary-search').value"), 'figure');
      assert.equal(await evaluate("document.querySelector('.letter-button.active').textContent"), 'M');
      await navigate('/map?author=hugo&page=2', '.leaflet-container');
      assert.equal(await evaluate("document.querySelector('#map-author').value"), 'hugo');
      await navigate('/timeline?type=work&movement=romantisme', '#timeline-type');
      assert.equal(await evaluate("document.querySelector('#timeline-type').value"), 'work');
      assert.equal(await evaluate("document.querySelector('#timeline-movement').value"), 'romantisme');
      await send('Page.navigate', { url: `${origin}/timeline#movement-romantisme` });
      await waitFor(() => evaluate("location.hash === '#movement-romantisme' && document.querySelector('#timeline-type')?.value === 'movement'"), 'ancre de mouvement conservée');
      await select('#timeline-type', 'work');
      assert.equal(await evaluate("document.querySelector('#timeline-type').value"), 'work');
    });
    await check('Recherche globale : saisie reflétée dans l’URL', async () => {
      await navigate('/search?q=Hugo', 'input[type=search]');
      assert.equal(await evaluate("document.querySelector('input[type=search]').value"), 'Hugo');
      await evaluate("document.querySelector('input[type=search]').focus()");
      await send('Input.insertText', { text: 'Victor Hugo' });
      await waitFor(() => evaluate("new URLSearchParams(location.search).get('q')?.includes('Victor Hugo')"), 'recherche URL');
    });
    await check('Images indisponibles : portrait et couverture de remplacement', async () => {
      await navigate('/authors/stael', '.detail-page');
      await waitFor(() => evaluate("Boolean(document.querySelector('[data-image-fallback=error]'))"), 'portrait de remplacement');
      await navigate('/works/le-bossu', '.detail-page');
      await waitFor(() => evaluate("Boolean(document.querySelector('[data-generated-cover=true][data-image-fallback=error]'))"), 'couverture de remplacement');
      await navigate('/works?author=chateaubriand', '.work-card');
      assert.ok(await evaluate("Boolean(document.querySelector('[data-generated-cover=true]'))"));
      assert.equal(await evaluate("Boolean(document.querySelector('img[src^=\"data:image/svg\"]'))"), false);
    });
    await check('Panne de données : diagnostic et nouvel essai sans perte de filtres', async () => {
      await send('Network.setBlockedURLs', { urls: [...externalBlocks, '*data/works.json*'] });
      await navigate('/works?author=hugo', '[data-testid=load-error-state]');
      assert.ok(await evaluate("document.querySelector('.load-error-state code').textContent.includes('/data/works.json')"));
      await send('Network.setBlockedURLs', { urls: externalBlocks });
      await click('.load-error-state button');
      await waitFor(() => evaluate("Boolean(document.querySelector('.work-card'))"), 'nouvel essai réussi');
      assert.equal(await evaluate("document.querySelector('#work-author').value"), 'hugo');
    });
    await check('Carte : avertissement de tuiles et annuaire utilisable', async () => {
      await navigate('/map', '.leaflet-container');
      await waitFor(() => evaluate("Boolean(document.querySelector('.map-status'))"), 'fond de carte indisponible');
      assert.ok(await evaluate("document.querySelectorAll('.location-card').length > 0"));
      await click('.map-status button');
      await waitFor(() => evaluate("Boolean(document.querySelector('.map-status'))"), 'nouvel essai des tuiles');
    });
    await check('Paramètres : erreur de recherche d’images sans faux résultat', async () => {
      await navigate('/settings', '.settings-tabs');
      await evaluate("[...document.querySelectorAll('[role=tab]')].find(tab => tab.textContent.includes('Images')).click()");
      await waitFor(() => evaluate("Boolean(document.querySelector('#wikimedia-search'))"), 'recherche Wikimedia');
      await evaluate("document.querySelector('#wikimedia-search').focus()");
      await send('Input.insertText', { text: 'Victor Hugo' });
      await evaluate("document.querySelector('#wikimedia-search').parentElement.querySelector('button').click()");
      await waitFor(() => evaluate("Boolean(document.querySelector('[data-testid=image-search-error]'))"), 'erreur Wikimedia');
      assert.equal(await evaluate("document.querySelectorAll('.image-preview-error, img').length"), 0);
    });
    await check('Hors connexion : avertissement explicite sur le contenu déjà chargé', async () => {
      await navigate('/', '.hero-panel');
      await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
      await waitFor(() => evaluate("Boolean(document.querySelector('.connectivity-banner'))"), 'bandeau hors connexion');
      await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
      await waitFor(() => evaluate("!document.querySelector('.connectivity-banner')"), 'retour en ligne');
    });

    for (const width of [375, 768, 1440]) {
      await viewport(width);
      for (const theme of ['light', 'dark']) {
        await navigate('/', '.hero-panel');
        await evaluate(`localStorage.setItem('theme', ${JSON.stringify(theme)})`);
        // App reads the persisted theme on mount; a fresh document verifies the bootstrap too.
        for (const [name, path, selector] of [['home', '/', '.hero-panel'], ['works', '/works?author=chateaubriand', '.work-card']]) {
          await navigate(path, selector);
          assert.equal(await evaluate("document.documentElement.dataset.theme"), theme);
          await evaluate("(() => { const style = document.createElement('style'); style.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }'; document.head.append(style); window.scrollTo(0, 0); })()");
          await evaluate('document.fonts.ready');
          await pause(200);
          assert.equal(await evaluate('document.scrollingElement.scrollWidth <= innerWidth'), true, `${name} déborde à ${width}px (${theme})`);
          const { cssContentSize } = await send('Page.getLayoutMetrics');
          const { data } = await send('Page.captureScreenshot', {
            format: 'png', captureBeyondViewport: true, fromSurface: true,
            clip: { x: 0, y: 0, width, height: Math.ceil(cssContentSize.height), scale: 1 },
          });
          const filename = `${name}-${width}-${theme}.png`;
          const actual = Buffer.from(data, 'base64');
          await writeFile(join(results, filename), actual);
          if (updateSnapshots) {
            await mkdir(baselines, { recursive: true });
            await writeFile(join(baselines, filename), actual);
            captures.push({ filename, width, theme, updated: true });
          } else {
            const expected = PNG.sync.read(await readFile(join(baselines, filename)));
            const current = PNG.sync.read(actual);
            assert.equal(current.width, expected.width, `${filename} largeur`);
            assert.equal(current.height, expected.height, `${filename} hauteur`);
            const diff = new PNG({ width: current.width, height: current.height });
            const pixels = pixelmatch(expected.data, current.data, diff.data, current.width, current.height, { threshold: 0.1 });
            const ratio = pixels / (current.width * current.height);
            if (pixels) await writeFile(join(results, `diff-${filename}`), PNG.sync.write(diff));
            captures.push({ filename, width, theme, changedPixels: pixels, ratio });
            assert.ok(ratio <= 0.003, `${filename} : ${(ratio * 100).toFixed(2)}% de différence (maximum 0,3%)`);
          }
          console.log(`✓ Capture ${filename}`);
        }
      }
    }
    await check('PWA : catalogue et données réellement disponibles après réouverture hors connexion', async () => {
      await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: deterministicScript });
      await send('Network.setBypassServiceWorker', { bypass: false });
      await send('Network.setCacheDisabled', { cacheDisabled: false });
      await navigate('/', '.hero-panel');
      await waitFor(() => evaluate('Boolean(navigator.serviceWorker?.controller)'), 'activation PWA', 25_000);
      await pause(500);
      await navigate('/works?author=chateaubriand', '.work-card');
      await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
      await send('Page.reload');
      await waitFor(() => evaluate("Boolean(document.querySelector('.work-card'))"), 'catalogue hors connexion');
      assert.equal(await evaluate("fetch('/__e2e-network-probe__', { cache: 'no-store' }).then(() => false, () => true)"), true, 'Le réseau doit réellement être indisponible');
      assert.equal(await evaluate("document.querySelectorAll('.work-card').length"), 3);
      assert.equal(await evaluate("document.querySelector('#work-author').value"), 'chateaubriand');
      await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    });
    assert.deepEqual(client.exceptions, [], 'Exception JavaScript non gérée');
    await writeFile(join(results, 'report.json'), `${JSON.stringify({ browser: version.Browser, checks, captures }, null, 2)}\n`);
    console.log(`\n${checks.length} scénarios E2E et ${captures.length} captures : OK (${version.Browser}).`);
  } catch (error) {
    await mkdir(results, { recursive: true });
    await writeFile(join(results, 'failure.log'), `${error.stack}\n\n${output}`);
    try { await debugPage?.(); } catch { /* Retain the original failure if the target is gone. */ }
    throw error;
  } finally {
    client?.socket.close();
    await Promise.all(children.map(async (child) => {
      if (child.exitCode !== null) return;
      const stopped = new Promise((resolve) => child.once('exit', resolve));
      child.kill('SIGTERM');
      await Promise.race([stopped, pause(2000)]);
      if (child.exitCode === null) child.kill('SIGKILL');
    }));
    // Only the exact temporary browser profile created by this run is removed.
    await rm(profile, { recursive: true, force: true });
  }
}

await main();
