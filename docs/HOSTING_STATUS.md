# Leano hosting and Google configuration status

Date: 2026-10-06 (Asia/Shanghai). The user accepted the migration and authorized committing/pushing `main`, GitHub Pages from repository root, production configuration preparation and later controlled tests. The agent must stop for human Google authorization, private Script Properties and deployment interaction.

| Required return | Status |
| --- | --- |
| GIT COMMIT | Canonical import: `7b08046c8e265c39776e7e749eb17de782765dc3`; configuration manifest, hosting status and handoff are in the subsequent preparation commit |
| GITHUB REPO | [cho-leung/leano-website](https://github.com/cho-leung/leano-website), public |
| GITHUB PUSH | Canonical code pushed to `main`; preparation changes are committed/pushed as part of this stage |
| LIVE URL | [https://cho-leung.github.io/leano-website/](https://cho-leung.github.io/leano-website/) |
| GITHUB PAGES STATUS | Enabled, built and publicly reachable over HTTPS; source is `main` / `/` (repository root) |
| APPS SCRIPT CONFIG STATUS | Source and V8/timezone/service-scope manifest prepared; private properties and Google consent await operator interaction |
| APPS SCRIPT /exec STATUS | Not supplied; no Apps Script deployment was created by the agent |
| FRONTEND ENDPOINT STATUS | Central placeholder remains unset in `script.js`; valid attempts display localized disconnected feedback |
| SHEET CONTROLLED TEST | NOT RUN |
| GMAIL CONTROLLED TEST | NOT RUN |
| REPLY-TO TEST | NOT RUN |
| MOBILE LIVE TEST | Hosted mobile rendering/frontend checks passed at 390px; successful backend submission NOT RUN |
| FAILURE-PATH TEST | Hosted required/email validation and unconfigured-endpoint feedback passed; backend invalid/failure paths NOT RUN live |
| KNOWN BLOCKERS | Human private configuration, service consent, anonymous Web App deployment and production `/exec` URL; an operator-controlled test customer address is also needed |
| TECHNICAL GATE | **NOT PASSED** |

## Hosting verification

GitHub's Pages API reported `source.branch = main`, `source.path = /`, `https_enforced = true`, site status `built` and a successful build for the canonical import commit. The public homepage and both browser assets returned HTTP 200 and matched local SHA-256 digests. A live Chrome smoke test subsequently verified the actual page's HTML/CSS/JavaScript response bodies against local sources, all five language switches at 1440px and 390px, no horizontal page overflow, required/email validation and disconnected-form feedback. This test blocked POST and any other origin, recorded no such blocked requests and no page errors, and sent no backend request.

Earlier reads hit intermittent connection resets/timeouts; successful HTTP reads and the final browser check are the evidence used here. This was a static hosting/frontend check, not a production RFQ or market validation.

Local evidence (ignored, not pushed): `../audit-artifacts/hosting/http-asset-verification.json`, `live-static-results.json`, `live-en-1440.png`, `live-en-390.png` and Pages build receipts. Public commit author metadata uses the GitHub noreply address. The source ZIP, obsolete/frozen previews, local evidence, customer exports and credentials are excluded from Git. No domains, paid hosting/services, prospects, pricing or commercial positioning were changed.

## Google handoff

Follow [GOOGLE_CONFIGURATION_HANDOFF.md](GOOGLE_CONFIGURATION_HANDOFF.md). It provides the exact source/manifest, private property names, public `SITE_BASE_URL`, ledger schema reference, read-only configuration check, consent step and deployment settings.

Do not paste secrets or ledger/customer data into chat. Return the public production `/exec` URL, confirmation of private configuration/check/anonymous access, and an operator-controlled test email choice. Then the agent can make the already-authorized central endpoint commit/push and run controlled live tests. The gate remains unpassed until the correct Sheet row, Gmail notification and Reply-To are verified from the hosted site, including mobile and failure paths.

The accepted [migration audit](MIGRATION_AUDIT.md) remains a historical snapshot of the earlier non-deployed stage; this file records the subsequent hosting stage.
