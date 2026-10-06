# RFQ configuration and live technical gate

**Current state: static Pages site LIVE; Apps Script NOT CONFIGURED by the agent. Live backend test: NOT RUN. TECHNICAL GATE: NOT PASSED.**

The user authorized the configuration/hosting stage. The static site is https://cho-leung.github.io/leano-website/. The remaining Google account, private-property and deployment actions require the operator; follow `GOOGLE_CONFIGURATION_HANDOFF.md`.

## Prepared source

Five-language shared RFQ form; native `application/x-www-form-urlencoded` POST; one `/exec` endpoint configuration; localized unavailable/result UI; repeat-submit prevention; server validation; exact 27-column schema; formula protection; Script Lock; server timestamp and lead ID; Gmail after persistence with customer Reply-To; notification-failure recovery.

Required customer fields: company, email, requirement, destination. Optional: name, quantity, deadline, phone, additional_requirements. Metadata: language, source_page, referrer, campaign, outreach_source, submission_type. Attribution and test labels can be forged; no internal commercial state is accepted from the browser.

## Backend configuration awaiting operator

Follow `../apps-script/README.md` for private Script Properties and the exact **RFQ Ledger** schema. Configure `SPREADSHEET_ID`, `NOTIFICATION_EMAIL` and an HTTPS `SITE_BASE_URL`; the repository does not contain their actual values. The read-only `checkConfiguration` helper can verify access without writing a row or sending mail, after private configuration and human Google authorization.

Then create the authorized Web App deployment, execute as owner with access appropriate for anonymous prospects, and configure its `/exec` URL in `../script.js`. The static website is already published from `main` at repository root; configuring the endpoint will require a new commit/push. Preserve `.nojekyll` and relative asset paths. Do not publish ignored ZIPs, archives, frozen previews, audit artifacts, spreadsheet files, credentials or customer data.

## Live gate — all remain unchecked

- [ ] Required-field and email validation work on the hosted site.
- [ ] Native hosted POST reaches the configured `/exec` deployment.
- [ ] A controlled submission creates exactly the intended row in the correct sheet, matching all 27 columns.
- [ ] Timestamp and unique lead ID are generated server-side; commercial defaults are correct.
- [ ] `submission_type = controlled_test`; this is a technical fixture, not a real RFQ or market validation.
- [ ] Gmail notification arrives at the configured operator inbox.
- [ ] Reply-To equals the controlled customer address.
- [ ] Visitor success follows persistence.
- [ ] Invalid/duplicate/extra-field requests create no row and show no false success.
- [ ] Mobile hosted submission works.
- [ ] All five localized result pages are checked.
- [ ] Notification-failure handling is checked under a controlled, separately authorized procedure; a persisted request remains successful and the recovery status/log is inspected.

**Do not mark the gate passed until a live hosted submission creates the correct Sheet row and Gmail notification.** Local mock tests cannot satisfy this gate.

Operators should inspect execution logs for notification/recovery failures. An interrupted response or ambiguous Sheet flush may require checking the ledger before resubmission. This stage did not inspect any live ledger or account, so current backend configuration and deployment state outside the repository are unknown.
