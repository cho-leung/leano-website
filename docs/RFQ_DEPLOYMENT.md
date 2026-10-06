# RFQ configuration and live technical gate

The production `/exec` endpoint is configured centrally and GitHub Pages serves the updated frontend. The operator completed private Script Properties, `checkConfiguration`, Sheets/Gmail consent and deployment. Current live results and the final gate decision are in [PRODUCTION_INTEGRATION.md](PRODUCTION_INTEGRATION.md).

## Prepared source

Five-language shared RFQ form; native `application/x-www-form-urlencoded` POST; one `/exec` endpoint configuration; localized unavailable/result UI; repeat-submit prevention; server validation; exact 27-column schema; formula protection; Script Lock; server timestamp and lead ID; Gmail after persistence with customer Reply-To; notification-failure recovery.

Required customer fields: company, email, requirement, destination. Optional: name, quantity, deadline, phone, additional_requirements. Metadata: language, source_page, referrer, campaign, outreach_source, submission_type. Attribution and test labels can be forged; no internal commercial state is accepted from the browser.

## Production configuration

Use `../apps-script/README.md` and `GOOGLE_CONFIGURATION_HANDOFF.md` as configuration references. The actual private `SPREADSHEET_ID` and `NOTIFICATION_EMAIL` are not in this repository. The authorized public site URL is `https://cho-leung.github.io/leano-website/`. Preserve `.nojekyll`, relative assets and the single `RFQ_CONFIG.endpoint` setting.

Do not publish ignored ZIPs, archives, previews, raw audit evidence, spreadsheet exports, credentials or customer data. Google configuration/deployment changes that require account approval remain operator actions.

## Required live gate

The hosted website must submit a synthetic `controlled_test` using an operator-controlled email, create the correct row in the intended 27-column RFQ ledger, and deliver the Gmail notification with matching Reply-To. Verify `submission_type`, `lead_status`, commercial defaults, success after persistence, mobile submission, and invalid-request rejection without false success.

Local mocks and static hosting alone cannot satisfy this gate. Notification-failure recovery, duplicate fields, unexpected fields and localized backend result variants have local coverage; production fault injection and live submissions in every language are outside this final integration test. Inspect execution logs and the ledger before resubmitting after an interrupted response, to avoid duplicate rows.
