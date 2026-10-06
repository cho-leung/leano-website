# Local audit reproduction

No tests contact Google or send real RFQs. The backend suite uses in-memory mocks. The browser suite blocks every external request and intercepts a synthetic `/exec` URL before network transmission.

From repository root:

```sh
python3 tests/static_checks.py
node --check script.js
node --check < apps-script/Code.gs
node --test tests/backend.test.cjs tests/i18n.test.cjs
node tests/serve.mjs
```

Leave the loopback server running. In another terminal, run:

```sh
node tests/browser.test.cjs
```

The browser suite needs Playwright resolvable through Node and locally installed Chrome. When Playwright is supplied by a runtime bundle, set `NODE_PATH` to that bundle's `node_modules` directory. `LEANO_TEST_URL` defaults to `http://127.0.0.1:4173`; `LEANO_BROWSER_CHANNEL` defaults to `chrome`. No package manager or browser download is needed when those tools are already available. Failure to resolve them is an environment limitation, not a backend result.

The server serves only browser assets at both `/` and `/leano-website/`; every POST is refused. It never simulates a production backend. Test screenshots and JSON reports are written to ignored `audit-artifacts/`.

## Hosted static check before backend connection

`node tests/live-static.test.cjs` checks the hosted Pages assets against local source digests and checks all five languages at desktop/mobile widths. It uses `controlled_test=1` and synthetic text. It checks validation and either disconnected feedback or the configured form action, leaving valid configured forms unsubmitted. It blocks every POST and other origin, so it cannot test production persistence or send Gmail. Evidence goes to ignored `audit-artifacts/hosting/`. A separately authorized production test is required for the live backend gate.

If the host uses a system HTTP proxy, set `LEANO_TEST_PROXY` to that existing proxy URL so Playwright's asset requests use the same route as Chrome. Do not place proxy credentials in this repository.

Static checks cover explicit tag structure, IDs, links/assets, ARIA references, form attributes, required fields, lexical CSS balance and the specified English claim phrases. They are not a full HTML standards validator, accessibility certification or translation certification. The browser suite checks 45 viewport/language combinations, URL preferences, metadata, native validation/POST, repeat submission, back-cache reset, no-JavaScript behavior, keyboard basics, clipboard feedback and motion. Apps Script tests establish local control-flow behavior only; Google runtime, quotas, permissions, delivery and live ledger state remain untested.

The local browser suite substitutes only the endpoint value in its in-memory script responses to exercise disconnected and synthetic endpoint cases. All actual browser logic remains the production source. It never submits to the configured production Web App.

## Locale art-direction QA

Run `node tests/locale-visual.test.cjs` with the same Playwright `NODE_PATH` and local server. It checks all five locales at 1440, 1024, 768 and 390px, including overflow, adjacent grid-cell overlap, split heading words, actual system-font usage and emphasis styles. It saves full-page and section screenshots in ignored `audit-artifacts/locale-v0.1.1/local/`. Section captures hide the fixed header and off-screen skip link; the header is captured separately and keyboard behavior remains covered by the existing browser suite.

This suite uses the actual production script and endpoint configuration. Its one valid frontend smoke submission is intercepted and fulfilled locally **before any production network transmission**. The synthetic address is `.invalid`; no Sheet row or Gmail message is created.

After deployment, run the same suite with `LEANO_TEST_URL=https://cho-leung.github.io/leano-website/` and, if required, the existing `LEANO_TEST_PROXY`. It verifies actual hosted asset hashes against local files and checks the same 20 live states. Evidence goes to the ignored `live/` directory. The intercepted frontend smoke still sends nothing to Google. Browser emulation and system-font inspection on the test host do not certify every OS/browser or native-speaker wording.
