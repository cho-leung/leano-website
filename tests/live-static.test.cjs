// Hosted static checks only. Every browser POST and every other external origin is blocked.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const base = 'https://leanosourcing.com/';
const root = path.join(__dirname, '..');
const dir = path.join(root, 'audit-artifacts/hosting');
const configuredEndpoint = fs.readFileSync(path.join(root, 'script.js'), 'utf8').match(/const RFQ_CONFIG = \{ endpoint: '([^']+)' \};/)[1];
fs.mkdirSync(dir, { recursive: true });
const report = { url: base, assets: [], renderings: [], frontend: [], blocked: [], errors: [], live_backend: 'NOT RUN' };
let browser;
(async () => {
  browser = await chromium.launch({ headless: true, channel: 'chrome' });
  report.browser = browser.version();
  const context = await browser.newContext({ reducedMotion: 'reduce',
    proxy: process.env.LEANO_TEST_PROXY ? { server: process.env.LEANO_TEST_PROXY } : undefined });
  await context.route('**/*', async route => {
    const req = route.request();
    if (req.method() !== 'GET' || !req.url().startsWith(base)) {
      report.blocked.push({ url: req.url(), method: req.method() });
      return route.abort();
    }
    return route.continue();
  });
  const p = await context.newPage(); p.on('pageerror', e => report.errors.push(e.message));
  const scriptResponse = p.waitForResponse(r => r.url() === base + 'script.js');
  const cssResponse = p.waitForResponse(r => r.url() === base + 'styles.css');
  const indexResponse = await p.goto(base + '?lang=en&controlled_test=1&utm_campaign=hosting_check');
  const responses = { 'index.html': indexResponse, 'styles.css': await cssResponse, 'script.js': await scriptResponse };
  for (const [file, response] of Object.entries(responses)) {
    assert.equal(response.status(), 200, file);
    const digest = createHash('sha256').update(await response.body()).digest('hex');
    assert.equal(digest, createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex'), file + ' hosted source differs');
    report.assets.push({ file, status: response.status(), sha256: digest });
  }
  const locales = { en: 'en', zh: 'zh-CN', fr: 'fr', ru: 'ru', es: 'es' };
  for (const width of [1440, 390]) {
    await p.setViewportSize({ width, height: 900 });
    for (const [lang, locale] of Object.entries(locales)) {
      await p.locator(`[data-lang="${lang}"]`).click();
      assert.equal(await p.locator('html').getAttribute('lang'), locale);
      assert.equal(await p.locator('[name="submission_type"]').inputValue(), 'controlled_test');
      assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert(await p.locator('h1').isVisible());
      report.renderings.push({ width, language: lang, status: 'PASS' });
      if (lang === 'en') await p.screenshot({ path: path.join(dir, `live-en-${width}.png`), fullPage: true });
    }
    await p.locator('[data-lang="en"]').click();
    await p.locator('form').evaluate(f => f.reset());
    await p.locator('[data-rfq-submit]').click();
    assert.equal(await p.locator('form').evaluate(f => f.checkValidity()), false);
    report.frontend.push({ width, check: 'required validation', status: 'PASS' });
    for (const [name, value] of Object.entries({ company: 'LEANO CONTROLLED TEST - FRONTEND ONLY', email: 'controlled-test@example.invalid', requirement: 'Hosted frontend check; no production backend request', destination: 'Controlled test only' })) {
      await p.locator(`[name="${name}"]`).fill(value);
    }
    await p.locator('[name="email"]').fill('invalid-email');
    await p.locator('[data-rfq-submit]').click();
    assert.equal(await p.locator('form').evaluate(f => f.checkValidity()), false);
    await p.locator('[name="email"]').fill('controlled-test@example.invalid');
    if (configuredEndpoint === 'PASTE_APPS_SCRIPT_EXEC_URL_HERE') {
      await p.locator('[data-rfq-submit]').click();
      assert.match(await p.locator('[data-rfq-status]').textContent(), /not connected yet/);
    } else {
      assert.equal(await p.locator('form').getAttribute('action'), configuredEndpoint);
      assert.equal(await p.locator('form').evaluate(f => f.checkValidity()), true);
      // Leave the valid form unsubmitted: controlled production tests require their own operator fixture.
    }
    assert.equal(new URL(p.url()).pathname, '/');
    assert.equal(await p.locator('[data-rfq-submit]').isDisabled(), false);
    report.frontend.push({ width, check: configuredEndpoint === 'PASTE_APPS_SCRIPT_EXEC_URL_HERE' ? 'invalid email and unconfigured-endpoint feedback' : 'invalid email and configured form action (no POST)', status: 'PASS' });
  }
  assert.deepEqual(report.blocked, []); assert.deepEqual(report.errors, []);
  report.status = 'PASS: static hosting/frontend only; backend technical gate NOT PASSED';
  console.log(report.status);
})().catch(e => { report.failure = e.stack; console.error(e); process.exitCode = 1; }).finally(async () => {
  fs.writeFileSync(path.join(dir, 'live-static-results.json'), JSON.stringify(report, null, 2) + '\n');
  if (browser) await browser.close();
});
