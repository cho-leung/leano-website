const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.LEANO_BROWSER_CHANNEL || 'chromium' });
  const page = await browser.newPage({ viewport: { width: 768, height: 900 }, reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:4173/leano-website/?lang=fr');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const result = await page.evaluate(() => {
    const el = document.querySelector('[data-i18n="sectionProof"]');
    const head = el.closest('.proof-head');
    const shell = head.parentElement;
    const cs = getComputedStyle(el);
    const hs = getComputedStyle(head);
    const rect = el.getBoundingClientRect();
    const hrect = head.getBoundingClientRect();
    const srect = shell.getBoundingClientRect();
    return {
      viewport: innerWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      text: el.textContent,
      element: { clientWidth: el.clientWidth, scrollWidth: el.scrollWidth, left: rect.left, right: rect.right, width: rect.width },
      elementStyle: { display: cs.display, width: cs.width, minWidth: cs.minWidth, maxWidth: cs.maxWidth, whiteSpace: cs.whiteSpace, overflowWrap: cs.overflowWrap, wordBreak: cs.wordBreak, fontSize: cs.fontSize, letterSpacing: cs.letterSpacing },
      head: { clientWidth: head.clientWidth, scrollWidth: head.scrollWidth, left: hrect.left, right: hrect.right, width: hrect.width },
      headStyle: { display: hs.display, width: hs.width, gridTemplateColumns: hs.gridTemplateColumns, gap: hs.gap },
      shell: { clientWidth: shell.clientWidth, scrollWidth: shell.scrollWidth, left: srect.left, right: srect.right, width: srect.width }
    };
  });
  console.log('PROOF_LAYOUT_DIAGNOSTIC=' + JSON.stringify(result));
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
