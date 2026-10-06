# Leano RFQ Apps Script backend

`Code.gs` is server code. It is not loaded by the website. Local mocked checks passed. The configuration/hosting stage is now authorized, but Google account consent, private Script Properties and Web App deployment require operator interaction. No Google service has been contacted by the agent. Follow `../docs/GOOGLE_CONFIGURATION_HANDOFF.md`.

## Private configuration

Use Apps Script Project Settings → Script Properties. Supply these values privately:

| Property | Value |
| --- | --- |
| `SPREADSHEET_ID` | Operator-owned RFQ spreadsheet ID |
| `NOTIFICATION_EMAIL` | Operator notification email |
| `SITE_BASE_URL` | Final HTTPS homepage URL, including its GitHub Pages project path when applicable |

Actual operator identifiers from the source package have been removed from public documentation. They remain only in the untouched, ignored source ZIP. Do not copy credentials or customer exports into this repository.

## Exact ledger contract

The existing sheet must be named **RFQ Ledger**. Row 1 must contain these 27 headers, in order, with no extra populated columns:

```text
timestamp, lead_id, submission_type, name, company, email,
requirement, quantity, destination, deadline, phone, additional_requirements,
language, source_page, referrer, campaign, outreach_source,
lead_status, owner_minutes, qualified, supplier_check_started, quoted, paid,
delivered, estimated_contribution, actual_contribution, notes_internal
```

These are schema documentation, not a customer-data export. The backend neither creates the sheet nor repairs its schema. It rejects mismatches before writing. Script Lock covers checking, appending and flushing. It cannot lock out manual operator edits; avoid physically sorting or deleting rows during active intake. Failure-status updates verify the lead ID before touching the recorded row.

## Request and persistence behavior

- Accept only URL-encoded POST requests and the documented public fields.
- Reject unexpected fields, duplicate values, malformed field arrays, missing required data, invalid email/language/type and overlength content.
- Generate timestamp and a date-prefixed full UUID lead ID on the server.
- Prefix every user-controlled sheet text value beginning with `=`, `+`, `-` or `@` with an apostrophe.
- Set internal commercial fields on the server. `submission_type` is an untrusted public classification; `controlled_test` is not proof of operator identity.
- Confirm success only after append and successful flush. Send Gmail afterward, using the customer email as Reply-To.
- On Gmail failure, attempt `new_notification_failed` under Script Lock. If that recovery write also fails, log it and still acknowledge the saved RFQ. Operators must inspect execution logs if a notification or recovery update is missing.
- Visitors see localized generic failures, never raw backend errors. Return links accept only HTTPS and target the top window.

No server idempotency or abuse/rate-limit service is implemented. The frontend latch stops repeated submits within a pending page; retries from other tabs are distinct requests. A transport failure or ambiguous append/flush failure still requires an operator check before retrying to avoid duplicates.

## Authorized configuration awaiting operator

1. Open the intended standalone Apps Script project, or create one if needed. Copy `Code.gs` and the provided `appsscript.json` manifest (V8, Asia/Shanghai and explicit Sheets/Gmail scopes).
2. Set the private properties, confirm the exact ledger schema, and set the project timezone.
3. Run `checkConfiguration` from the editor and approve the required Sheets/Gmail authorization. This helper reads the schema and Gmail aliases; it writes no row and sends no email. Do not run `doPost` manually without an event.
4. Deploy a Web App executing as the deployment owner, with access suitable for anonymous prospects.
5. Copy the URL ending in `/exec` and replace the single endpoint placeholder in `script.js`. `/dev` is not a production endpoint.
6. Publish the static site only when authorized and run the live gate in `../docs/RFQ_DEPLOYMENT.md`.

Checking `doGet` only shows the endpoint page; it does not verify Sheet or Gmail access, request persistence or delivery.

The production URL and identity behavior follow [Google's Web Apps guide](https://developers.google.com/apps-script/guides/web). Gmail options and authorization follow the [GmailApp reference](https://developers.google.com/apps-script/reference/gmail/gmail-app); return-link targeting follows [HTML Service restrictions](https://developers.google.com/apps-script/guides/html/restrictions).
