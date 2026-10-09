# Leano website

Leano is an independent cross-border sourcing and second-source procurement desk. ICT is the current specialization. This website supports credibility and RFQ intake; the website and controlled technical tests are not market validation.

## Canonical source and migration

This shared five-language build was extracted from `leano-website-v0.1-rfq.zip`. Production browser sources are `index.html`, `styles.css` and `script.js` at repository root, with `.nojekyll` preserved. There is no build step, external font, CDN, analytics or paid service.

`docs/MIGRATION_MANIFEST.json` records the ZIP digest, original file digests and destinations. The original ZIP remains untouched and excluded from Git. The package single-file preview is frozen in `preview/`; two earlier standalone previews are preserved in `archive/obsolete/`. Both directories are ignored and are not production sources. Do not regenerate production from them.

## Structure

```text
index.html
styles.css
script.js
.nojekyll
.gitignore
README.md
apps-script/
  Code.gs
  appsscript.json
  README.md
docs/
  DESIGN_SYSTEM.md
  DEPLOYMENT_CHECKLIST.md
  RFQ_DEPLOYMENT.md
  MIGRATION_MANIFEST.json
  MIGRATION_AUDIT.md
  GOOGLE_CONFIGURATION_HANDOFF.md
  HOSTING_STATUS.md
  PRODUCTION_INTEGRATION.md
tests/
  README.md
  serve.mjs
  static_checks.py
  backend.test.cjs
  i18n.test.cjs
  browser.test.cjs
  live-static.test.cjs
```

## Languages

EN, 中文, FR, RU and ES use one HTML structure and a translation dictionary in `script.js`. Switching updates visible content, placeholders, accessible labels, document language, title, description, clipboard template and RFQ language metadata. URL selection takes priority over a stored preference. A URL without `lang` uses the stored preference when available, otherwise English. Selecting English removes `lang` while preserving other query parameters and the fragment.

Examples: `/?lang=zh`, `/?lang=fr`, `/?lang=ru`, `/?lang=es`. These also work below a GitHub Pages project path such as `/leano-website/?lang=fr`; browser asset links are relative.

## Local preview and checks

Run `node tests/serve.mjs`, then open `http://127.0.0.1:4173/`. The server binds only to loopback and serves only the three browser assets. It refuses POST and does not expose backend, archives or audit files.

Run `python3 tests/static_checks.py` and `node --test tests/backend.test.cjs tests/i18n.test.cjs`. Browser checks require a locally available Playwright package and Chrome; see `tests/README.md`. Tests use synthetic `.invalid` addresses, in-memory Google-service mocks and intercepted form requests. They never create a Google Sheet row or send email. Evidence is saved in ignored `audit-artifacts/`.

## RFQ architecture

Static website → native URL-encoded HTML form POST → Apps Script `/exec` → Sheet persistence → Gmail notification → localized result page. The static page alone cannot receive RFQs.

The production `/exec` endpoint is configured once in `RFQ_CONFIG.endpoint` in `script.js`. The hosted form now posts to the authorized Apps Script deployment. If the configuration is absent or invalid, valid form attempts display a localized disconnected message and send nothing. `/dev` endpoints are refused. JavaScript is needed to connect the form; without it, readable content and an email-thread fallback remain, and submit is disabled.

Configure `SPREADSHEET_ID`, `SITE_BASE_URL` and `NOTIFICATION_EMAIL` privately through Script Properties. No credentials, spreadsheet exports or customer data belong in Git. Public attribution and `controlled_test` labels are untrusted metadata, not authenticated commercial state. The client never sets qualification, payment or other internal ledger fields.

## Production integration status

GitHub Pages is live at [leanosourcing.com](https://leanosourcing.com/), serving `main` from repository root over HTTPS with the custom domain configured. The operator completed private Google configuration, consent and Web App deployment. The endpoint is configured and live controlled submissions have been checked against the intended ledger and delivered Gmail notifications, including Reply-To.

See [PRODUCTION_INTEGRATION.md](docs/PRODUCTION_INTEGRATION.md) for the final technical gate and its evidence limits, and [HOSTING_STATUS.md](docs/HOSTING_STATUS.md) for hosting status. The accepted migration audit is a historical snapshot. Raw ledger/email evidence and operator identifiers remain in ignored local artifacts; none belong in Git.

Only synthetic `controlled_test` fixtures are authorized by this stage. These checks do not establish market validation or authorize contacting prospects, buyers or Eneden. Commercial copy, languages, positioning, design and service scope are unchanged.
