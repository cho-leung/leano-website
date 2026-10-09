# Leano hosting and production configuration status

Date: 2026-10-06 (Asia/Shanghai). The user authorized publishing `main`, GitHub Pages from repository root and controlled final integration. The operator completed Google authorization, private Script Properties and Web App deployment before the final integration.

| Required return | Status |
| --- | --- |
| GIT COMMIT | Canonical import `7b08046c8e265c39776e7e749eb17de782765dc3`; Google handoff `a7ba79fb4395b1e3d045ba7cf9b2fd4a902f0b82`; production endpoint `eb91ca028469ab3bce392efab0491b7fa466f7b1` |
| GITHUB REPO | [cho-leung/leano-website](https://github.com/cho-leung/leano-website), public |
| GITHUB PUSH | Production endpoint committed and pushed to `main` |
| LIVE URL | [leanosourcing.com](https://leanosourcing.com/) |
| GITHUB PAGES STATUS | Built and publicly reachable over HTTPS, serving `main` / `/`; hosted assets match configured local sources |
| APPS SCRIPT CONFIG STATUS | Operator reports properties, checkConfiguration and Sheets/Gmail consent completed; successful live persistence/notification verifies the working path |
| APPS SCRIPT /exec STATUS | Supplied by operator; publicly reachable and accepting actual native form submissions |
| FRONTEND ENDPOINT STATUS | Single central production endpoint configured and verified in actual hosted script.js |
| SHEET CONTROLLED TEST | PASS: correct intended ledger, expected schema and matching synthetic rows; submission_type and lead_status controlled_test |
| GMAIL CONTROLLED TEST | PASS: actual notification delivery to connected operator inbox |
| REPLY-TO TEST | PASS: actual headers match submitted operator-controlled email |
| MOBILE LIVE TEST | PASS: native submission and visible success at 390px in headed Android/Chrome emulation; matching row and notification |
| FAILURE-PATH TEST | PASS: hosted client validation and live missing-company rejection; no matching row/mail or false success for the invalid request |
| KNOWN BLOCKERS | None for the authorized gate; browser-emulation and fault-injection limits are documented in the integration report |
| TECHNICAL GATE | **PASSED** |

Full results, controlled-fixture accounting, local evidence locations and testing limits are in [PRODUCTION_INTEGRATION.md](PRODUCTION_INTEGRATION.md). The accepted [migration audit](MIGRATION_AUDIT.md) remains a historical snapshot.

Public author metadata uses GitHub's noreply address. ZIPs, obsolete/frozen previews, local evidence, spreadsheet exports and credentials remain excluded from Git. No private property values or customer data were published. The custom domain `leanosourcing.com` is now configured for the existing GitHub Pages deployment. No pricing, commercial positioning or prospect contact was changed.

The [Google handoff](GOOGLE_CONFIGURATION_HANDOFF.md) remains a configuration reference. Later Google account or deployment approval still requires the operator; this stage required no additional Google interaction.
