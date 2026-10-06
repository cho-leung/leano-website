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

`node tests/live-static.test.cjs` checks the hosted Pages assets against local source digests and checks all five languages at desktop/mobile widths. It uses `controlled_test=1` and synthetic test text for frontend validation/unconfigured feedback. It blocks every POST and other origin, so it cannot test production persistence or send Gmail. Evidence goes to ignored `audit-artifacts/hosting/`. This check expects the endpoint to remain unset and must be replaced with the separately authorized live backend gate once `/exec` is configured.

If the host uses a system HTTP proxy, set `LEANO_TEST_PROXY` to that existing proxy URL so Playwright's asset requests use the same route as Chrome. Do not place proxy credentials in this repository.

Static checks cover explicit tag structure, IDs, links/assets, ARIA references, form attributes, required fields, lexical CSS balance and the specified English claim phrases. They are not a full HTML standards validator, accessibility certification or translation certification. The browser suite checks 45 viewport/language combinations, URL preferences, metadata, native validation/POST, repeat submission, back-cache reset, no-JavaScript behavior, keyboard basics, clipboard feedback and motion. Apps Script tests establish local control-flow behavior only; Google runtime, quotas, permissions, delivery and live ledger state remain untested.
