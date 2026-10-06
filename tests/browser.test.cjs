const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const baseUrl = process.env.LEANO_TEST_URL || 'http://127.0.0.1:4173';
const artifacts = path.join(__dirname, '../audit-artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const source = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
const configuredEndpoint = source.match(/const RFQ_CONFIG = \{ endpoint: '([^']+)' \};/)[1];
const unconfiguredSource = source.replace(configuredEndpoint, 'PASTE_APPS_SCRIPT_EXEC_URL_HERE');
const locales = { en: 'en', zh: 'zh-CN', fr: 'fr', ru: 'ru', es: 'es' };
const labels = { en: 'Company', zh: '公司', fr: 'Entreprise', ru: 'Компания', es: 'Empresa' };
const report = { browser: '', source_sha256: createHash('sha256').update(source).digest('hex'),
  rendering: [], rfq_bounds: [], checks: [], external_requests: [], errors: [] };
const check = (name) => { report.checks.push(name); console.log('PASS ' + name); };
let browser;
const contexts = [];
async function context(options = {}) {
  const c = await browser.newContext({ reducedMotion: 'reduce', ...options }); contexts.push(c);
  await c.route('**/*', async route => {
    const url = route.request().url();
    if (url.startsWith(baseUrl + '/')) return route.continue();
    report.external_requests.push(url); await route.abort();
  });
  // Local tests never use the real endpoint; exercise disconnected and synthetic endpoint modes.
  await c.route('**/script.js', route => route.fulfill({ contentType: 'text/javascript', body: unconfiguredSource }));
  c.on('page', p => { p.on('pageerror', e => report.errors.push(e.message)); });
  return c;
}
async function fill(page) {
  for (const [name, value] of Object.entries({ company: 'Local browser fixture', email: 'tester@example.invalid', requirement: 'No production submission', destination: 'Local test only' })) {
    await page.locator(`[name="${name}"]`).fill(value);
  }
}
(async () => {
  browser = await chromium.launch({ headless: true, channel: process.env.LEANO_BROWSER_CHANNEL || 'chrome' });
  report.browser = browser.version();
  const c = await context(); const p = await c.newPage();
  const titles = new Set(); const descriptions = new Set();
  for (const width of [1440, 1024, 980, 768, 720, 680, 390, 375, 320]) {
    await p.setViewportSize({ width, height: 900 });
    for (const [lang, locale] of Object.entries(locales)) {
      await p.goto(`${baseUrl}/leano-website/?lang=${lang}&utm_campaign=local-audit&utm_source=local-fixture&controlled_test=1#rfq`);
      // Locale fonts and balanced wrapping must settle before measuring geometry.
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const result = await p.evaluate(() => ({
        lang: document.documentElement.lang, title: document.title,
        description: document.querySelector('meta[name="description"]').content,
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        overflows: [...document.querySelectorAll('h1,h2,h3,p,label,.audience-type span,.process-flow strong,.rfq-content')]
          .filter(x => x.scrollWidth > x.clientWidth + 2 || x.getBoundingClientRect().right > innerWidth + 2)
          .map(x => x.textContent.trim().slice(0, 60)),
        form: { method: document.forms[0].method, enctype: document.forms[0].enctype },
        metadata: Object.fromEntries([...document.querySelectorAll('[data-rfq-meta]')].map(x => [x.name, x.value])),
        translatedCompany: document.querySelector('[data-i18n="formCompany"]').textContent,
        active: document.querySelector('[aria-pressed="true"]').dataset.lang
      }));
      assert.equal(result.lang, locale); assert.equal(result.active, lang);
      assert.equal(result.translatedCompany, labels[lang]);
      assert(result.scrollWidth <= width + 1, JSON.stringify(result));
      assert.deepEqual(result.overflows, [], JSON.stringify(result));
      assert.deepEqual(result.form, { method: 'post', enctype: 'application/x-www-form-urlencoded' });
      assert.equal(result.metadata.language, lang); assert.equal(result.metadata.campaign, 'local-audit');
      assert.equal(result.metadata.outreach_source, 'local-fixture'); assert.equal(result.metadata.submission_type, 'controlled_test');
      assert(result.metadata.source_page.startsWith('/leano-website/'));
      titles.add(result.title); descriptions.add(result.description);
      report.rendering.push({ width, language: lang, locale, overflow: false });
      if ([1440, 390].includes(width)) {
        await p.evaluate(() => window.scrollTo(0, 0));
        await p.screenshot({ path: path.join(artifacts, `${lang}-${width}-full.png`), fullPage: true });
        report.rfq_bounds.push({ language: lang, width, ...(await p.locator('#rfq').boundingBox()) });
      }
    }
  }
  assert.equal(titles.size, 5); assert.equal(descriptions.size, 5);
  check('45 rendered language/width combinations; localized metadata, RFQ labels, project subpath and no clipping');

  await p.goto(`${baseUrl}/?utm_campaign=keep-me#rfq`);
  for (const lang of ['zh', 'fr', 'ru', 'es', 'en']) {
    await p.locator(`[data-lang="${lang}"]`).click();
    assert.equal(await p.locator('html').getAttribute('lang'), locales[lang]);
    const url = new URL(p.url()); assert.equal(url.searchParams.get('utm_campaign'), 'keep-me');
    assert.equal(url.hash, '#rfq'); assert.equal(url.searchParams.get('lang'), lang === 'en' ? null : lang);
    assert.equal(await p.locator('[name="language"]').inputValue(), lang);
  }
  await p.locator('[data-lang="fr"]').click(); await p.goto(baseUrl + '/');
  assert.equal(await p.locator('html').getAttribute('lang'), 'fr');
  await p.goto(baseUrl + '/?lang=es'); assert.equal(await p.locator('html').getAttribute('lang'), 'es');
  await p.goto(baseUrl + '/?lang=constructor'); assert.equal(await p.locator('html').getAttribute('lang'), 'es');
  check('all language switches, URL/hash preservation, preference persistence, URL precedence and inherited-key rejection');

  const restricted = await context();
  await restricted.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('storage blocked'); } });
    history.replaceState = () => { throw new Error('URL mutation blocked'); };
  });
  const rp = await restricted.newPage(); await rp.goto(baseUrl + '/?lang=__proto__');
  assert.equal(await rp.locator('html').getAttribute('lang'), 'en');
  await rp.locator('[data-lang="ru"]').click(); assert.equal(await rp.locator('html').getAttribute('lang'), 'ru');
  check('language switching survives blocked storage/history and invalid query keys');

  await p.goto(baseUrl + '/?lang=en');
  await p.locator('[data-rfq-submit]').click();
  assert.equal(await p.locator('form').evaluate(f => f.checkValidity()), false);
  for (const name of ['company', 'email', 'requirement', 'destination']) {
    await fill(p); await p.locator(`[name="${name}"]`).fill('');
    assert.equal(await p.locator('form').evaluate(f => f.checkValidity()), false);
  }
  await fill(p); await p.locator('[name="email"]').fill('invalid-email');
  assert.equal(await p.locator('form').evaluate(f => f.checkValidity()), false);
  await fill(p); await p.locator('[data-rfq-submit]').click();
  assert.match(await p.locator('[data-rfq-status]').textContent(), /not connected yet/);
  assert.equal(await p.locator('[data-rfq-submit]').isDisabled(), false);
  check('required/email validation and unconfigured endpoint safely block submission');

  await p.goto(baseUrl + '/?lang=fr&utm_campaign=' + 'x'.repeat(300) + '&controlled_test=1');
  assert.equal((await p.locator('[name="campaign"]').inputValue()).length, 200);
  await fill(p); await p.locator('[data-rfq-submit]').click();
  assert.match(await p.locator('[data-rfq-status]').textContent(), /pas encore connecté/);
  check('metadata length cap and localized disconnected-form feedback');

  const nojs = await context({ javaScriptEnabled: false }); const np = await nojs.newPage();
  await np.goto(baseUrl + '/'); assert(await np.locator('h1').isVisible());
  assert.equal(await np.locator('h1').evaluate(x => getComputedStyle(x).opacity), '1');
  assert.equal(await np.locator('[data-rfq-submit]').isDisabled(), true);
  await fill(np); await np.locator('[name="company"]').press('Enter');
  assert.equal(np.url(), baseUrl + '/');
  assert(await np.locator('noscript').isVisible());
  check('JavaScript-free content stays visible; disabled submit and implicit Enter cannot POST to static host');

  // Only an in-memory test response substitutes this endpoint. No Google request is sent.
  const endpoint = 'https://script.google.com/macros/s/LOCAL_TEST_ONLY/exec';
  const tc = await context();
  await tc.route('**/script.js', route => route.fulfill({ contentType: 'text/javascript', body: source.replace(configuredEndpoint, endpoint) }));
  const tp = await tc.newPage(); const posts = [];
  await tc.route(endpoint, async route => {
    const request = route.request();
    posts.push({ method: request.method(), headers: request.headers(), body: request.postData() });
    await route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Local intercepted form</title><p>No Google services called.</p>' });
  });
  await tp.goto(baseUrl + '/leano-website/?lang=zh&controlled_test=1&utm_campaign=local-audit&utm_source=fixture');
  await fill(tp);
  const cancelled = await tp.locator('form').evaluate(form => {
    const one = new Event('submit', { bubbles: true, cancelable: true });
    const two = new Event('submit', { bubbles: true, cancelable: true });
    return [!form.dispatchEvent(one), !form.dispatchEvent(two), form.querySelector('[type="submit"]').disabled, form.getAttribute('aria-busy')];
  });
  assert.deepEqual(cancelled, [false, true, true, 'true']);
  await tp.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  assert.equal(await tp.locator('[data-rfq-submit]').isDisabled(), false);
  await tp.locator('[data-rfq-submit]').click();
  await tp.waitForURL(endpoint); assert.equal(posts.length, 1); assert.equal(posts[0].method, 'POST');
  assert(posts[0].headers['content-type'].startsWith('application/x-www-form-urlencoded'));
  const payload = new URLSearchParams(posts[0].body);
  assert.equal(payload.get('company'), 'Local browser fixture'); assert.equal(payload.get('language'), 'zh');
  assert.equal(payload.get('submission_type'), 'controlled_test'); assert.equal(payload.get('outreach_source'), 'fixture');
  assert(payload.get('source_page').startsWith('/leano-website/'));
  for (const field of ['lead_status', 'paid', 'qualified']) assert.equal(payload.has(field), false);
  check('intercepted native URL-encoded POST; single request, metadata, submit latch and back-cache reset');

  const dev = await context();
  await dev.route('**/script.js', route => route.fulfill({ contentType: 'text/javascript', body: source.replace(configuredEndpoint, endpoint.replace('/exec', '/dev')) }));
  const dp = await dev.newPage(); await dp.goto(baseUrl + '/?lang=en'); await fill(dp);
  await dp.locator('[data-rfq-submit]').click(); assert.equal(dp.url(), baseUrl + '/?lang=en');
  assert.match(await dp.locator('[data-rfq-status]').textContent(), /not connected yet/);
  check('/dev endpoints are refused');

  await p.goto(baseUrl + '/?lang=en');
  await p.evaluate(() => { navigator.clipboard.writeText = async text => { window.clipboardFixture = text; }; });
  await p.locator('[data-copy-rfq]').click(); assert.match(await p.evaluate(() => window.clipboardFixture), /Leano RFQ/);
  await p.locator('[data-lang="es"]').click();
  await p.waitForTimeout(3300);
  assert.equal((await p.locator('[data-copy-label]').textContent()).trim(), 'Copiar lista RFQ');
  await p.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('blocked'); }; });
  await p.locator('[data-copy-rfq]').click(); assert.match(await p.locator('[data-copy-status]').textContent(), /bloqueó/);
  check('clipboard copy/error and delayed label stays in current language');

  await p.goto(baseUrl + '/?lang=en'); await p.keyboard.press('Tab');
  assert.equal(await p.evaluate(() => document.activeElement.className), 'skip-link');
  await p.keyboard.press('Enter'); assert.equal(new URL(p.url()).hash, '#main');
  for (const lang of Object.keys(locales)) {
    const button = p.locator(`[data-lang="${lang}"]`); await button.focus();
    assert.equal(await button.evaluate(x => getComputedStyle(x).outlineStyle), 'solid');
  }
  const submit = p.locator('[data-rfq-submit]'); await submit.focus();
  assert.equal(await submit.evaluate(x => getComputedStyle(x).outlineStyle), 'solid');
  assert.equal(await p.locator('input:not([type="hidden"]), textarea').evaluateAll(nodes => nodes.every(x => x.labels.length === 1)), true);
  const viewport = await p.locator('meta[name="viewport"]').getAttribute('content'); assert(viewport.includes('width=device-width'));
  check('skip link, visible keyboard focus, nested form labels and responsive viewport');

  const contrast = await p.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    const rgba = color => {
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data].map(v => v / 255);
    };
    const blend = (a, b) => a.slice(0, 3).map((v, i) => v * a[3] + b[i] * (1 - a[3])).concat(1);
    const background = el => blend(rgba(getComputedStyle(el).backgroundColor), el.parentElement ? background(el.parentElement) : [1, 1, 1, 1]);
    const luminance = color => color.slice(0, 3).map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4).reduce((n, x, i) => n + x * [0.2126, 0.7152, 0.0722][i], 0);
    return [...document.querySelectorAll('.section-index,.cap-number,.process-flow li>span,.rfq-privacy,.rfq-intro,.hero-side p,.language-nav button,input:not([type="hidden"]),textarea')].map(el => {
      const bg = background(el);
      const color = rgba(getComputedStyle(el, ['INPUT', 'TEXTAREA'].includes(el.tagName) ? '::placeholder' : null).color);
      const a = luminance(blend(color, bg)); const b = luminance(bg);
      return { sample: el.textContent.trim().slice(0, 40) || el.name, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
    });
  });
  assert(contrast.every(x => x.ratio >= 4.5), JSON.stringify(contrast.filter(x => x.ratio < 4.5)));
  report.contrast_samples = contrast;
  assert(await p.locator('[data-lang]').evaluateAll(nodes => nodes.every(x => x.getBoundingClientRect().width >= 24 && x.getBoundingClientRect().height >= 24)));
  check('selected small-text/placeholder contrast samples reach 4.5:1 and language targets reach 24px');

  const motion = await context({ reducedMotion: 'no-preference' }); const mp = await motion.newPage();
  await mp.goto(baseUrl + '/?lang=en'); await mp.locator('h1').waitFor({ state: 'visible' });
  await mp.waitForTimeout(600); assert.equal(await mp.locator('h1').evaluate(x => getComputedStyle(x).opacity), '1');
  await mp.locator('#rfq').scrollIntoViewIfNeeded(); await mp.waitForTimeout(600);
  assert.equal(await mp.locator('.rfq-content').evaluate(x => getComputedStyle(x).opacity), '1');
  check('normal reveal motion and reduced-motion rendering');
  assert.deepEqual(report.external_requests, []); assert.deepEqual(report.errors, []);
  check('zero external network requests and zero browser script errors');
})().catch(e => { report.failure = e.stack; console.error(e); process.exitCode = 1; }).finally(async () => {
  fs.writeFileSync(path.join(artifacts, 'browser-results.json'), JSON.stringify(report, null, 2) + '\n');
  for (const c of contexts) await c.close(); if (browser) await browser.close();
});
