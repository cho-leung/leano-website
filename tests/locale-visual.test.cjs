// Locale art-direction QA. All production POSTs are intercepted before transmission.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.join(__dirname, '..');
const base = (process.env.LEANO_TEST_URL || 'http://127.0.0.1:4173/leano-website/').replace(/\/?$/, '/');
const live = new URL(base).hostname !== '127.0.0.1';
const dir = path.join(root, 'audit-artifacts/locale-v0.1.1', live ? 'live' : 'local');
fs.mkdirSync(dir, { recursive: true });
const endpoint = fs.readFileSync(path.join(root, 'script.js'), 'utf8').match(/const RFQ_CONFIG = \{ endpoint: '([^']+)' \};/)[1];
const report = { base, states: [], asset_matches: [], unexpected_requests: [], errors: [], intercepted_frontend_posts: 0 };
let browser, allowSmoke = false;
const selectors = ['.site-header', '.hero', '.requirement-strip', '#capabilities', '#process', '.audience-section', '#principle', '#rfq', '.site-footer'];
(async () => {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ reducedMotion: 'reduce', proxy: process.env.LEANO_TEST_PROXY ? { server: process.env.LEANO_TEST_PROXY } : undefined });
  await context.route('**/*', async route => {
    const req = route.request();
    if (req.method() === 'GET' && req.url().startsWith(base)) return route.continue();
    if (allowSmoke && req.method() === 'POST' && req.url() === endpoint && !report.intercepted_frontend_posts) {
      report.intercepted_frontend_posts++;
      const fields = new URLSearchParams(req.postData());
      assert.equal(fields.get('email'), 'locale-smoke@example.invalid');
      assert.equal(fields.get('submission_type'), 'controlled_test');
      assert.equal(fields.get('language'), 'zh');
      assert.equal(fields.get('campaign'), 'locale_frontend_smoke');
      assert(!fields.has('lead_status') && !fields.has('paid'));
      report.smoke_payload_checked = true;
      return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Frontend smoke intercepted</title><p>No production request was sent.</p>' });
    }
    report.unexpected_requests.push({ method: req.method(), origin: new URL(req.url()).origin });
    return route.abort();
  });
  const p = await context.newPage(); p.on('pageerror', e => report.errors.push(e.message));
  const cdp = await context.newCDPSession(p);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  for (const width of [1440, 1024, 768, 390]) {
    await p.setViewportSize({ width, height: 900 });
    for (const [lang, locale] of Object.entries({ en: 'en', zh: 'zh-CN', fr: 'fr', ru: 'ru', es: 'es' })) {
      const script = p.waitForResponse(r => r.url() === base + 'script.js');
      const css = p.waitForResponse(r => r.url() === base + 'styles.css');
      const html = await p.goto(base + '?lang=' + lang);
      if (!report.asset_matches.length) {
        for (const [file, r] of [['index.html', html], ['script.js', await script], ['styles.css', await css]]) {
          assert.equal(r.status(), 200);
          const digest = createHash('sha256').update(await r.body()).digest('hex');
          assert.equal(digest, createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex'), file + ' stale');
          report.asset_matches.push({ file, sha256: digest });
        }
      } else { await script; await css; }
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const state = await p.evaluate(selectors => {
        const rect = el => { const r = el.getBoundingClientRect(); return { x:r.x, y:r.y + scrollY, width:r.width, height:r.height }; };
        const issues = [];
        for (const el of document.querySelectorAll('h1,h2,h3,p,label,.audience-type span,.process-flow strong,.requirement-strip span,.header-link,.language-nav,.rfq-content')) {
          const box = el.getBoundingClientRect();
          if (el.scrollWidth > el.clientWidth + 3 || box.right > innerWidth + 3 || box.left < -3) issues.push('overflow: ' + el.textContent.trim().slice(0,70));
        }
        // Check actual word fragments; overflow-wrap can hide accidental mid-word splitting.
        if (document.documentElement.lang !== 'zh-CN') for (const el of document.querySelectorAll('h1,h2,h3,.audience-type span,.process-flow strong')) {
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          let node; while ((node = walker.nextNode())) for (const match of node.textContent.matchAll(/[\p{L}\p{M}]{3,}(?:-[\p{L}\p{M}]+)*/gu)) {
            const r = document.createRange(); r.setStart(node,match.index); r.setEnd(node,match.index+match[0].length);
            const tops = [...r.getClientRects()].map(r=>Math.round(r.top));
            if (new Set(tops).size > 1) issues.push('split word: ' + match[0]);
          }
        }
        // Grid cells should not intersect their neighbouring text cells.
        for (const grid of document.querySelectorAll('.header-inner,.hero-bottom,.editorial-head,.capability-row,.process-head,.process-flow,.process-flow li,.audience-layout,.principle-inner,.rfq-layout,.rfq-form-grid,.footer-top,.footer-bottom')) {
          const children = [...grid.children].filter(x=>getComputedStyle(x).display!=='none');
          for (let i=0;i<children.length;i++) for (let j=i+1;j<children.length;j++) {
            const a=children[i].getBoundingClientRect(),b=children[j].getBoundingClientRect();
            if (Math.min(a.right,b.right)-Math.max(a.left,b.left)>3 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>3) issues.push('overlap: '+grid.className);
          }
        }
        const h1 = document.querySelector('h1'), em = h1.querySelector('em');
        return { locale:document.documentElement.lang, scroll_width:document.documentElement.scrollWidth, issues,
          hero: { size:getComputedStyle(h1).fontSize, spacing:getComputedStyle(h1).letterSpacing, line_height:getComputedStyle(h1).lineHeight,
            emphasis_font:getComputedStyle(em).fontFamily, emphasis_style:getComputedStyle(em).fontStyle, emphasis_color:getComputedStyle(em).color },
          bounds: Object.fromEntries(selectors.map(s=>[s,rect(document.querySelector(s))])),
          form_action:document.forms[0].action, placeholders:[...document.querySelectorAll('[placeholder]')].map(x=>({name:x.name,text:x.placeholder})),
          labels:[...document.querySelectorAll('.rfq-form label')].map(x=>x.innerText.trim()) };
      }, selectors);
      assert.equal(state.locale, locale); assert.equal(state.form_action, endpoint);
      if (lang === 'zh') { assert.equal(state.hero.emphasis_style, 'normal'); assert(state.hero.emphasis_font.includes('PingFang SC')); }
      if (lang === 'en') assert.equal(state.hero.emphasis_style, 'italic');
      if (lang === 'ru') assert.equal(state.hero.emphasis_style, 'normal');
      const { root: dom } = await cdp.send('DOM.getDocument');
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: dom.nodeId, selector: '#hero-title' });
      state.hero_fonts = (await cdp.send('CSS.getPlatformFontsForNode', {nodeId})).fonts;
      assert(state.hero_fonts.length && state.hero_fonts.every(f=>f.glyphCount>0));
      await p.screenshot({ path: path.join(dir, `${lang}-${width}-full.png`), fullPage: true });
      for (const selector of selectors) {
        const name = selector.replace(/^[.#]/, '');
        await p.locator(selector).screenshot({ path: path.join(dir, `${lang}-${width}-${name}.png`),
          style: selector === '.site-header' || selector === '.hero' ? '' : '.site-header, .skip-link { visibility: hidden; }' });
      }
      report.states.push({ lang, width, ...state });
      console.log(`${lang} ${width}: ${state.issues.length ? state.issues.join('; ') : 'PASS'}`);
    }
  }
  await p.goto(base+'?lang=zh&controlled_test=1&utm_campaign=locale_frontend_smoke');
  await p.locator('[data-rfq-submit]').click();
  assert.equal(await p.locator('form').evaluate(f=>f.checkValidity()), false);
  for (const [name,value] of Object.entries({company:'Local synthetic frontend check',email:'locale-smoke@example.invalid',requirement:'Locale frontend check only, intercepted before network',destination:'Synthetic destination'})) await p.locator(`[name="${name}"]`).fill(value);
  allowSmoke = true;
  await p.locator('[data-rfq-submit]').click();
  await p.waitForURL(endpoint); assert.equal(await p.title(), 'Frontend smoke intercepted');
  assert.equal(report.intercepted_frontend_posts,1);
  assert.deepEqual(report.errors,[]); assert.deepEqual(report.unexpected_requests,[]);
  assert.deepEqual(report.states.filter(x=>x.issues.length),[], 'Visual geometry regressions');
  report.status='PASS: 20 locale/viewport states and one intercepted frontend smoke; zero production submissions';
})().catch(e=>{report.status='FAIL';report.failure=e.stack;console.error(e.message);process.exitCode=1;}).finally(async()=>{
  fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(report,null,2)+'\n');
  if(browser)await browser.close();
});
