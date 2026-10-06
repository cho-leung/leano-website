# Leano Website v0.1 — Deployment Checklist

**Migration status: NOT DEPLOYED. This checklist describes a future authorized stage.**

Local evidence is in `MIGRATION_AUDIT.md`; it does not satisfy the live RFQ technical gate in `RFQ_DEPLOYMENT.md`.

## Before public deployment

- [ ] Confirm the current commercial positioning still matches the latest Business / Validation decision.
- [ ] Confirm no legal entity name, office address, certification, customer logo, supplier authorization, or completed-transaction claim has been added without evidence.
- [ ] Confirm no paid hosting, domain, analytics, CRM, or form service has been activated without authorization.
- [ ] Decide the public domain / static host.
- [ ] Review all five language versions on desktop and mobile.
- [ ] Publish only the canonical source tree; exclude ignored ZIPs, obsolete previews, local audit artifacts, credentials and customer data.
- [ ] Preserve root `index.html`, relative assets and `.nojekyll` for GitHub Pages.
- [ ] Configure private Script Properties and confirm the existing 27-column RFQ ledger schema.
- [ ] Replace the endpoint placeholder with the authorized Apps Script `/exec` URL.
- [ ] Complete the live hosted Sheet + Gmail + Reply-To technical gate before using the form for prospects.

## Language QA

Check these URLs / states:

- [ ] English — `/`
- [ ] Chinese — `/?lang=zh`
- [ ] French — `/?lang=fr`
- [ ] Russian — `/?lang=ru`
- [ ] Spanish — `/?lang=es`

For each language confirm:

- [ ] header language switcher remains legible;
- [ ] hero does not overflow;
- [ ] section headings retain editorial spacing;
- [ ] capability rows do not collide;
- [ ] process labels remain readable;
- [ ] RFQ labels / help copy fit on mobile;
- [ ] page `<html lang>` changes correctly;
- [ ] page title and meta description change;
- [ ] RFQ clipboard template is localized;
- [ ] active language state is visible without relying on color alone.

## Functional QA

- [ ] Header changes border state after scroll.
- [ ] Anchor links work.
- [ ] Reveal motion works.
- [ ] Reduced-motion users receive static content.
- [ ] Copy RFQ checklist works over HTTPS.
- [ ] Clipboard failure produces a readable fallback message.
- [ ] Language preference persists where browser storage is available.
- [ ] Language switching still works if local storage or URL mutation is unavailable.

## Accessibility

- [ ] Keyboard can reach all language controls and links.
- [ ] Focus states are visible.
- [ ] Skip link works.
- [ ] Language controls expose pressed state.
- [ ] Content remains understandable without motion.

## Scope guard

This build remains a credibility / RFQ support site. Public deployment does not itself prove market validation, customer demand, completed transactions, or payment.
