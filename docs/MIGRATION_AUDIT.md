# Leano canonical migration and local engineering audit

Date: 2026-10-06 (Asia/Shanghai). Workspace: `/Users/junhaoliang/leano-website`.

**Migration complete. Local checks passed. LIVE BACKEND TEST: NOT RUN. DEPLOYMENT STATUS: NOT DEPLOYED. TECHNICAL GATE: NOT PASSED.**

This is a local source/control-flow/rendering audit with targeted repairs. It is not a Google runtime or production delivery pass, a full accessibility certification, an independent external audit, or market validation.

## Source identity

Canonical package: `leano-website-v0.1-rfq.zip`.

SHA-256: `63897572124939b9d5316259fba92d6df677cfac29403b8537acbe575441d96a`.

The archive inventory and integrity were inspected before extraction. It contained one outer `leano-website-v0.1/` directory, the three browser sources, `.nojekyll`, four Markdown documents, a single-file preview, and the Apps Script source/README. No customer ledger or credentials file was extracted. The ZIP remains unchanged. Original file digests and destination mappings are in `MIGRATION_MANIFEST.json`.

## CANONICAL REPO TREE

```text
leano-website/
├── index.html
├── styles.css
├── script.js
├── .nojekyll
├── .gitignore
├── README.md
├── apps-script/
│   ├── Code.gs
│   └── README.md
├── docs/
│   ├── DESIGN_SYSTEM.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── RFQ_DEPLOYMENT.md
│   ├── MIGRATION_MANIFEST.json
│   └── MIGRATION_AUDIT.md
└── tests/
    ├── README.md
    ├── serve.mjs
    ├── static_checks.py
    ├── backend.test.cjs
    ├── i18n.test.cjs
    └── browser.test.cjs
```

Local-only, ignored material: the original ZIP, `preview/`, `archive/obsolete/`, and `audit-artifacts/`. A local Git repository was initialized on `main`; no files were staged, committed, pushed or published and no remote was configured.

## FILES MOVED

- Removed the ZIP's outer directory through extraction mapping, placing browser sources, README and `.nojekyll` at repository root; retained `apps-script/` separately.
- Package `DESIGN_SYSTEM.md`, `DEPLOYMENT_CHECKLIST.md`, `RFQ_DEPLOYMENT.md` → `docs/`.
- Package `leano-preview-single-file.html` → `preview/leano-preview-single-file.html`, frozen as reference.
- Pre-existing root `leano-preview-single-file.html` and `leano-preview-single-file-2.html` → the same filenames under `archive/obsolete/`.

## FILES CLASSIFIED AS OBSOLETE

Both pre-existing standalone previews are obsolete production sources. They were preserved without modification and their hashes verified. The package's preview is a frozen portable reference and no longer tracks repaired production sources. No duplicate `Code.gs` existed in this workspace. Nothing potentially useful was silently deleted; the untouched ZIP preserves all original source/documentation.

## CODE CHANGES MADE

### Backend

- Fixed the critical saved-RFQ failure path: Gmail failure followed by failure-status write failure previously escaped into the visitor rejection handler. Confirmed persistence is now tracked separately, and post-persistence errors do not turn a saved RFQ into a customer failure.
- Added exact schema width checking, URL-encoded request checking and strict field-array/string checking; retained unknown-field and multi-value rejection, required/email/length validation and formula guards for all public sheet text.
- Retained Script Lock around schema/write/flush and recovery updates. Recovery checks schema and row lead identity before updating `new_notification_failed`.
- Use the full UUID in server-generated lead IDs. Sanitize whitespace and bound Gmail subject length; preserve customer Reply-To.
- Guard return links against unsafe schemes, target the top window and use `zh-CN` for Chinese result HTML.
- Added a read-only `checkConfiguration` helper for a future authorized configuration phase. It was tested only against mocks and was not run on Google services.

The request is successful after `appendRow` and successful `flush`. Notification follows that persistence point. If notification fails, the normal recovery state is `new_notification_failed`; if the recovery write itself fails, success is retained and an execution-log entry is the fallback. A flush failure remains unconfirmed and sends no notification.

### Frontend and CSS

- Tightened endpoint acceptance to the expected HTTPS `script.google.com/macros/s/.../exec` path; kept the placeholder unset.
- Added an explicit pending-submit latch, canceled invalid/repeat submit events, disabled the pending button and reset it on page restoration.
- Reject inherited object names as language codes; preserve five dictionaries and existing copy/positioning.
- Limit hidden metadata lengths to the server contract. Separate form feedback from clipboard feedback; prevent a delayed clipboard reset from reverting the selected language.
- Disable HTML-default submit until JavaScript initializes, provide a no-JavaScript email-thread fallback, and leave content visible until reveal motion is initialized.
- Group required-field marks with their label text; associate the form with its privacy explanation and add visible form focus.
- Fix narrow multilingual clipping with shrinkable grids, safe wrapping and language-specific heading scaling. Add anchor offset, minimum 24px language targets and darker small text/placeholders/process numerals.

### Repository and documentation

Added `.gitignore`, migration provenance, tests, an asset-only loopback preview server and this report. Updated stale documentation that described a clipboard-only site with no backend dependency. Removed actual operator email/spreadsheet identifiers from public docs, retaining them only inside the ignored original ZIP. Documented exact schema, private properties and the unpassed live gate. No commercial copy or service category changed; no paid service or credentials were added.

## HTML CHECK

PASS for checked structure: HTML doctype, balanced explicit tags, unique IDs, one main/h1, resolving anchors/assets/ARIA references, responsive viewport, native POST semantics, correct required/optional fields and maxlength attributes. Browser labels, skip link and keyboard focus passed. Dependency-free structural checks and browser DOM checks are not a full HTML standards validator.

## CSS CHECK

PASS: lexical brace/parenthesis balance; no missing image/font assets, external CSS imports or URL dependencies. All tested layouts have no page overflow or checked-element clipping. Selected small text and placeholder samples reach 4.5:1 contrast. Original breakpoints were preserved with additional narrow language scaling. This is not a full accessibility certification.

## JAVASCRIPT CHECK

PASS: Node syntax check; five-language switching, query/hash preservation, stored preference and URL precedence; blocked storage/history fallback; invalid language keys; endpoint guards; metadata lengths; native validation; repeat-submit prevention; restored-page reset; localized disconnected feedback; clipboard success/failure and current-language timeout; normal and reduced-motion rendering. Zero browser script errors and zero external network requests were recorded.

## MULTILINGUAL CHECK

PASS: EN, 中文, FR, RU, ES retain a single shared HTML structure. Three translation tests check equal dictionary keys, every page binding, and typographic-only HTML translations. Browser checks confirm `html lang`, unique localized titles/descriptions, RFQ labels/metadata, pressed state and URL behavior in all five languages. Existing translations were preserved; no native-speaker translation certification was performed.

## RFQ FRONTEND CHECK

PASS locally: empty required fields and malformed email block submission; valid inputs with the unset endpoint show localized unavailable feedback and send nothing; `/dev` is refused. A synthetic endpoint substituted only in the in-memory test response received exactly one intercepted native POST with `application/x-www-form-urlencoded`, customer fields and metadata. The request never reached Google. No internal commercial fields appeared. No-JavaScript submit/implicit Enter cannot POST to the static server.

The source form remains intentionally unconnected. Native browser validation does not replace backend validation, including trimming whitespace-only required values.

## APPS SCRIPT CHECK

PASS for Node/V8-compatible syntax and 57 mocked contract tests: exact 27-column schema, timestamp/ID, internal defaults, URL-encoded events, required/email/length checks, unexpected/internal fields, duplicate values, four formula prefixes, locks, write/flush-before-email ordering, Reply-To, safe/localized result HTML, notification recovery and persistence-sensitive failure paths. Tests include Gmail plus recovery failure, schema drift, lock/write/flush faults and missing configuration. Google runtime, authorization, quotas, actual Sheet storage and Gmail delivery were not tested.

The three private Script Properties remain external: `SPREADSHEET_ID`, `SITE_BASE_URL`, `NOTIFICATION_EMAIL`. The exact header contract is documented in `../apps-script/README.md`.

## CLAIM CHECK

No matches for the ten requested English phrases in production HTML/JavaScript: global leader, world-class, trusted globally, hundreds of clients, authorized distributor, procurement platform, guaranteed savings, guaranteed lowest price, guaranteed stock, guaranteed delivery. Review of the localized dictionaries found no added statistics, testimonials, client logos, distributor authorization or price/stock/delivery guarantees. Audience references to distributors describe intended buyers, not Leano authorization. Freight/export-document copy remains coordination, not carrier, customs-broker or trade-law advice. The non-competition wording is an operating policy, not evidence of completed transactions. Positioning remains independent sourcing/second-source procurement with ICT as its beachhead.

## DESKTOP CHECK

PASS in local installed Chrome (version recorded in `../audit-artifacts/browser-results.json`), including 1440px and 1024px widths. Full-page desktop screenshots in all five languages and hero/RFQ contact sheets were visually reviewed. No cloud or hosted site was used.

## MOBILE CHECK

PASS in Chrome viewport emulation at 320, 375, 390, 680, 720, 768 and 980px as well as desktop widths: 9 widths × 5 languages = 45 combinations. French/Russian/Spanish clipping observed in the baseline was repaired. Final 390px screenshots and RFQ crops in all five languages were visually reviewed. This is viewport emulation, not testing on physical phones or Safari/Firefox.

## KNOWN BLOCKERS

- Production endpoint is deliberately unset; the source cannot accept live RFQs yet.
- Private properties, live ledger schema/access, Google authorization and any pre-existing external deployment state are unknown. No account or customer data was inspected.
- A separately authorized configuration/deployment and live hosted Sheet/Gmail/Reply-To test are needed. The technical gate has not passed.

Operational limits: no backend idempotency across tabs/retries, no rate-limiting service, and Script Lock cannot prevent manual row edits. Notification recovery is best effort if Sheets/Lock itself fails; execution logs need operator attention. Interrupted responses and ambiguous flush failures require checking the ledger before retry. Full accessibility, native-speaker translation, cross-browser and physical-device checks remain outside this local pass.

## LIVE BACKEND TEST

**NOT RUN.** No Google Sheet row, Gmail notification, real customer submission or live production test was created.

## DEPLOYMENT STATUS

**NOT DEPLOYED.** No Pages activation, Apps Script project/deployment, domain, hosting purchase, prospect contact or remote publication occurred.

## READY FOR GITHUB

**YES** — normalized source, root entry point, relative assets, `.nojekyll`, sanitized docs and checked ignore rules are ready. Local Git exists with no commits or remote. This does not authorize public hosting.

## READY FOR APPS SCRIPT CONFIGURATION

**YES** — source and private configuration/schema instructions are prepared. This does not mean configured, deployed or production verified.

## NEXT RECOMMENDED ACTION

Review this local migration delta, then explicitly authorize the separate private Apps Script configuration and hosting stage. Complete the live hosted controlled-submission gate before prospect use. Stop at this migration/audit stage now.

## Evidence and reproduction

- `MIGRATION_MANIFEST.json`: source ZIP identity, original hashes and destination mapping.
- `../audit-artifacts/source-changes.diff`: production code delta against the canonical ZIP; private original documentation is excluded.
- `../audit-artifacts/static-results.json`: final browser/backend input digests and structural checks.
- `../audit-artifacts/unit-tests.txt`: **60/60** tests, comprising 57 backend and 3 translation tests.
- `../audit-artifacts/browser-results.json` and `browser-tests.txt`: 45 rendering states, 13 grouped behavior checks, Chrome version, selected contrast samples, no external requests and no page errors.
- `../audit-artifacts/*-full.png`, `*-rfq.png`, `mobile-contact-sheet.png`, `desktop-contact-sheet.png`: local visual evidence; RFQ crops come from full-page images to avoid fixed-element artifacts in tall element screenshots.
- `../audit-artifacts/SHA256SUMS.txt`: final source, test and evidence digests. Audit artifacts remain ignored and local.

Reproduce with `python3 tests/static_checks.py`, `node --check script.js`, `node --check < apps-script/Code.gs`, `node --test tests/backend.test.cjs tests/i18n.test.cjs`, then `node tests/serve.mjs` and `node tests/browser.test.cjs` in another terminal. Browser execution requires local Playwright resolution and installed Chrome; see `../tests/README.md`. These commands do not satisfy the live gate.

Google API assumptions were checked against the official [Web Apps guide](https://developers.google.com/apps-script/guides/web), [GmailApp reference](https://developers.google.com/apps-script/reference/gmail/gmail-app) and [HTML Service restrictions](https://developers.google.com/apps-script/guides/html/restrictions).
