# Leano Google configuration handoff

The static site is hosted at **https://cho-leung.github.io/leano-website/**. Its RFQ endpoint is unset and it cannot receive RFQs yet. The next steps require the operator's Google account, private Script Properties, service consent and Web App deployment interaction. The agent stopped at this boundary as instructed.

## Operator actions

1. Sign in to [Google Apps Script](https://script.google.com/) using the account that owns or can edit the intended RFQ ledger and will send operator notifications. Open the intended standalone Leano RFQ project, or create one named **Leano RFQ** if it does not exist. Do not paste code into an unrelated project.
2. Replace that project's `Code.gs` with [`../apps-script/Code.gs`](../apps-script/Code.gs). In Project Settings, enable **Show appsscript.json manifest file in editor**, then use [`../apps-script/appsscript.json`](../apps-script/appsscript.json). This sets V8, Asia/Shanghai time and the Sheets/Gmail scopes required by this source; it contains no credentials or private property values.
3. In **Project Settings → Script Properties**, enter the following privately:

| Property | Operator-supplied value |
| --- | --- |
| `SPREADSHEET_ID` | The correct existing RFQ ledger spreadsheet ID, from its URL; do not use a placeholder |
| `NOTIFICATION_EMAIL` | The operator inbox that should receive RFQ notifications |
| `SITE_BASE_URL` | `https://cho-leung.github.io/leano-website/` |

4. Verify that the intended spreadsheet contains the **RFQ Ledger** tab and the exact 27 headers documented in [`../apps-script/README.md`](../apps-script/README.md). Do not change existing customer data to make a check pass. If there is a schema mismatch, stop and report the mismatch without sending customer data in chat.
5. Save the project, select **checkConfiguration** and click **Run**. Complete Google's consent for the selected account's Sheets/Gmail access. This helper reads the schema and Gmail aliases; it creates no row and sends no notification. Confirm that execution completes successfully. Do not run `doPost` directly from the editor.
6. Select **Deploy → New deployment → Web app**. Choose **Execute as: Me** (deployment owner) and **Who has access: Anyone** so anonymous prospects can submit. If the account or organization does not offer anonymous public access, stop and report that restriction. Complete the deployment authorization and copy the Web App URL ending in **`/exec`**, not `/dev`.

The UI/deployment behavior follows [Google's Web Apps guide](https://developers.google.com/apps-script/guides/web). The explicit scopes follow the [SpreadsheetApp reference](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app) and [GmailApp reference](https://developers.google.com/apps-script/reference/gmail/gmail-app).

## Return to this chat

Provide only:

- The production `/exec` URL, which is a public application endpoint, not a credential.
- Confirmation that private Script Properties were set, `checkConfiguration` succeeded and anonymous Web App access is enabled.
- An operator-controlled email address to use as the test customer/Reply-To, or confirmation to use the configured operator inbox for that role. Do not use any buyer/prospect address.

Do not paste OAuth tokens, passwords, credential JSON, the private property values or customer/ledger data. If there is an authorization/deployment error, provide only its non-sensitive message.

The agent can then centrally configure `RFQ_CONFIG.endpoint`, commit and push the change, verify the updated Pages assets and run clearly labeled `controlled_test` submissions. The correct Sheet row, Gmail notification, Reply-To, success state, invalid/failure path and mobile submission must be verified before the technical gate can pass. No real RFQ or prospect contact is authorized.

**TECHNICAL GATE: NOT PASSED.** The hosted static site and earlier mocks do not satisfy the live backend gate.
