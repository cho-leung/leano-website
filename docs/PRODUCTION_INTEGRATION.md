# Leano production integration verification

Date: 2026-10-06 (Asia/Shanghai). **TECHNICAL GATE: PASSED** for the authorized controlled integration checks below. This is a technical result, not market validation or authorization to contact prospects.

The live site is [cho-leung.github.io/leano-website](https://cho-leung.github.io/leano-website/). Repository: [cho-leung/leano-website](https://github.com/cho-leung/leano-website). Endpoint configuration commit: `eb91ca028469ab3bce392efab0491b7fa466f7b1`, pushed to `main`. GitHub Pages reported a successful build for that commit. The actual hosted HTML, CSS and JavaScript response bodies matched local SHA-256 digests. Hosted `script.js`: `4470c6af241229255971b7c54a212bf507f03a6fdb4ca70c21e37104e9e0d045`.

## Live controlled results

| Check | Result and evidence |
| --- | --- |
| Production endpoint | The authorized `/exec` is configured in the single `RFQ_CONFIG.endpoint` setting; anonymous browser submission reaches it |
| Desktop native submission | PASS: one actual URL-encoded form POST from the hosted website; actual result page shows success with a server lead ID |
| Intended ledger | PASS: connected Drive located the intended Leano RFQ Ledger; its RFQ Ledger tab has the expected 27 headers; bounded marker searches returned exactly one matching row per successful fixture |
| Test classification | PASS: `submission_type = controlled_test` and `lead_status = controlled_test`; qualification, supplier-check, quoted, paid and delivered flags are FALSE; internal contribution/owner fields are blank |
| Attribution | PASS: synthetic company/requirement and unique campaign marker match the native POST; source page is the actual GitHub Pages project path |
| Gmail delivery | PASS: notifications are present in the connected operator inbox, with CONTROLLED TEST subjects and lead IDs matching the ledger and result page |
| Reply-To | PASS: actual Gmail Reply-To headers equal the submitted operator-controlled test email for desktop and mobile |
| Success after persistence | PASS: displayed server lead IDs match persisted rows; ledger timestamps precede observed success screens. Source and local service tests also enforce append/flush before success |
| Mobile live submission | PASS: 390px Android/Chrome emulation, touch enabled, headed browser; native POST, actual visible success screen, matching ledger row, delivered Gmail and matching Reply-To |
| Invalid request | PASS: an intentionally omitted required company field reaches the backend from the hosted form; actual result is Request not confirmed, without success or lead ID; bounded ledger and Gmail searches find no matching row/message |
| Hosted client validation | PASS: required-field and malformed-email validation at desktop/mobile widths, with POST blocked |

The test customer email was taken from the connected operator's Gmail profile. No customer or prospect address was used. Company, requirement, quantity and destination were explicitly synthetic, with no purchase, shipment, quote, sourcing or commercial action requested.

Six successful controlled fixtures and their notifications were retained during desktop/mobile verification, including diagnostic retries with distinct markers. The first desktop attempt encountered a network interruption and produced no matching row or notification. One mobile diagnostic persisted successfully while its Google result frame failed to load within the observation window. Ledger/Gmail were checked before any distinct-marker retry; no request was automatically replayed. A checker crash on Google's auxiliary report POST and blank headless full-page captures were resolved by adjusting the local checker and inspecting a headed viewport capture. No frontend/backend production repair was needed.

## Checks, evidence and limits

JavaScript/Apps Script syntax and static checks passed. Backend/i18n tests passed 60/60. Local browser verification passed 45 viewport/language states and 13 behavior groups. Hosted static checks passed for all five languages at 1440px and 390px; no backend request was sent by those static checks.

Raw browser receipts, screenshots, bounded connector verification and the operator fixture remain only in ignored `audit-artifacts/production/`; hosted static evidence remains in ignored `audit-artifacts/hosting/`. No private Script Property values, operator address, spreadsheet ID, row contents or mail contents are committed in this report. The operator reported successful configuration/consent/deployment; those private settings were not fabricated or read into source control.

Mobile verification used browser emulation, not a physical phone or Safari. Live controlled result pages were checked in English; the other four language/result variants have local coverage and hosted static language checks. Production Gmail-failure or Sheet-outage injection was not performed. Google still controls its wrapper/authorization banner and transient network behavior. These limits do not change the observed desktop/mobile persistence, delivery, Reply-To and rejection results.

Commercial content, languages, design, positioning and service scope are unchanged. No domains or hosting were purchased. No buyer, prospect or Eneden was contacted. No outstanding blocker remains for this authorized technical gate.
