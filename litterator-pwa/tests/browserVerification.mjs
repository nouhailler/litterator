import assert from 'node:assert/strict';
import http from 'node:http';

const getJson = (url) =>
  new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => resolve(JSON.parse(body)));
      })
      .on('error', reject);
  });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getWebSocketUrl = async () => {
  for (let index = 0; index < 40; index += 1) {
    try {
      const version = await getJson('http://127.0.0.1:9222/json/version');
      return version.webSocketDebuggerUrl;
    } catch {
      await wait(250);
    }
  }

  throw new Error('Chromium DevTools indisponible');
};

const createCdpClient = async () => {
  const browser = new WebSocket(await getWebSocketUrl());
  let id = 0;
  const pending = new Map();

  browser.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (!data.id || !pending.has(data.id)) {
      return;
    }

    const { resolve, reject } = pending.get(data.id);
    pending.delete(data.id);

    if (data.error) {
      reject(new Error(data.error.message));
    } else {
      resolve(data.result);
    }
  });

  await new Promise((resolve) => browser.addEventListener('open', resolve, { once: true }));

  const sendBrowser = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const messageId = ++id;
      pending.set(messageId, { resolve, reject });
      browser.send(JSON.stringify({ id: messageId, method, params, sessionId }));
    });

  return { browser, sendBrowser };
};

const main = async () => {
  const { browser, sendBrowser } = await createCdpClient();
  const target = await sendBrowser('Target.createTarget', { url: 'about:blank' });
  const attach = await sendBrowser('Target.attachToTarget', {
    targetId: target.targetId,
    flatten: true,
  });
  const sessionId = attach.sessionId;
  const send = (method, params = {}) => sendBrowser(method, params, sessionId);

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });

    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || 'Evaluation failed');
    }

    return result.result.value;
  };

  await send('Page.navigate', { url: 'http://127.0.0.1:4173/' });
  await wait(1200);
  await evaluate(
    "localStorage.removeItem('legal_notice_acknowledged'); localStorage.removeItem('legal_notice_acknowledged_version')"
  );
  await send('Page.reload', { ignoreCache: true });
  await wait(1200);

  assert.equal(await evaluate("document.body.innerText.includes('Information importante')"), true);
  assert.equal(await evaluate('document.scrollingElement.scrollWidth <= window.innerWidth'), true);
  assert.equal(
    await evaluate("document.querySelector('[role=\"dialog\"]')?.getAttribute('aria-modal')"),
    'true'
  );

  await evaluate(
    "Array.from(document.querySelectorAll('button')).find((button) => button.textContent.includes('Voir les détails')).click()"
  );
  await wait(300);
  assert.equal(
    await evaluate(
      "document.body.innerText.includes('Limitation de responsabilité') && document.body.innerText.includes('Précision de la localisation')"
    ),
    true
  );
  assert.equal(
    await evaluate(
      "Array.from(document.querySelectorAll('button')).find((button) => button.textContent.includes('J’ai compris')).click(); localStorage.getItem('legal_notice_acknowledged')"
    ),
    'true'
  );
  await wait(300);
  assert.equal(await evaluate("document.body.innerText.includes('Information importante')"), false);

  await send('Page.reload', { ignoreCache: true });
  await wait(1000);
  assert.equal(await evaluate("document.body.innerText.includes('Information importante')"), false);

  await evaluate(
    "localStorage.removeItem('legal_notice_acknowledged'); localStorage.removeItem('legal_notice_acknowledged_version')"
  );
  await send('Page.reload', { ignoreCache: true });
  await wait(1000);
  assert.equal(await evaluate("document.body.innerText.includes('Information importante')"), true);

  await evaluate(
    "localStorage.setItem('legal_notice_acknowledged', 'true'); document.documentElement.setAttribute('data-theme', 'dark')"
  );
  assert.equal(
    await evaluate(`(() => {
      const modal = document.querySelector('.legal-notice-modal');
      const style = getComputedStyle(modal);
      return style.backgroundColor !== 'rgba(0, 0, 0, 0)' && getComputedStyle(document.body).color !== style.backgroundColor;
    })()`),
    true
  );

  await send('Page.navigate', { url: 'http://127.0.0.1:4173/legal' });
  await wait(1000);
  assert.equal(
    await evaluate(
      "document.body.innerText.includes('Mentions légales') && document.body.innerText.includes('Limitation de responsabilité') && document.body.innerText.includes('Précision de la localisation')"
    ),
    true
  );
  assert.equal(await evaluate('document.scrollingElement.scrollWidth <= window.innerWidth'), true);

  await sendBrowser('Target.closeTarget', { targetId: target.targetId });
  browser.close();
};

await main();
console.log('Vérification Chromium mobile: OK');
