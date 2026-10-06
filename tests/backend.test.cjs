const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../apps-script/Code.gs'), 'utf8');

// Independent fixture for the promised ledger contract; never imported from the producer config.
const headers = [
  'timestamp', 'lead_id', 'submission_type', 'name', 'company', 'email',
  'requirement', 'quantity', 'destination', 'deadline', 'phone', 'additional_requirements',
  'language', 'source_page', 'referrer', 'campaign', 'outreach_source',
  'lead_status', 'owner_minutes', 'qualified', 'supplier_check_started', 'quoted', 'paid', 'delivered',
  'estimated_contribution', 'actual_contribution', 'notes_internal'
];
const limits = { name: 120, company: 160, email: 254, requirement: 4000, quantity: 120,
  destination: 180, deadline: 160, phone: 80, additional_requirements: 3000,
  language: 10, source_page: 1000, referrer: 1000, campaign: 200, outreach_source: 200, submission_type: 30 };
const base = { company: 'Local audit fixture', email: 'tester@example.invalid',
  requirement: 'Local mock only', destination: 'Test destination', language: 'en', submission_type: 'controlled_test' };
function event(fields = {}, type = 'application/x-www-form-urlencoded') {
  return { postData: { type }, parameters: Object.fromEntries(
    Object.entries({ ...base, ...fields }).map(([k, v]) => [k, Array.isArray(v) ? v : [v]])
  ) };
}
function fixture(options = {}) {
  const state = { rows: [], emails: [], log: [], locked: false, lockCount: 0, errors: [] };
  const fail = (message) => { throw new Error('MOCK_PRIVATE_ERROR_' + message); };
  const sheet = {
    getLastColumn: () => options.extraColumn ? 28 : 27,
    getLastRow: () => options.rowLookupFailure ? fail('ROW_LOOKUP') : state.rows.length + 1,
    getRange: (row, col, height, width) => ({
      getDisplayValues: () => row === 1 ? [(options.badHeader ? ['wrong', ...headers.slice(1)] : headers).slice(col - 1, col - 1 + width)] :
        [[options.movedRow ? 'different-lead' : String(state.rows[row - 2][col - 1])]],
      setValue: (value) => {
        assert.equal(state.locked, true);
        if (options.statusFailure) fail('STATUS');
        state.log.push('mark'); state.rows[row - 2][col - 1] = value;
      }
    }),
    appendRow: (row) => {
      assert.equal(state.locked, true);
      if (options.appendFailure) fail('APPEND');
      assert.equal(row.length, headers.length);
      state.log.push('append'); state.rows.push(row);
    }
  };
  const props = { SPREADSHEET_ID: 'local-mock-id', NOTIFICATION_EMAIL: 'operator@example.invalid', SITE_BASE_URL: 'https://example.invalid/leano-website/', ...options.props };
  const context = vm.createContext({
    console: { error: (...args) => state.errors.push(args) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (key) => props[key] }) },
    SpreadsheetApp: {
      openById: () => { if (options.openFailure) fail('OPEN'); return { getSheetByName: (name) => { assert.equal(name, 'RFQ Ledger'); return options.missingSheet ? null : sheet; } }; },
      flush: () => { state.log.push('flush'); if (options.flushFailure) fail('FLUSH'); }
    },
    LockService: { getScriptLock: () => ({
      waitLock: () => { state.lockCount++; if (options.lockFailure || (options.recoveryLockFailure && state.lockCount === 2)) fail('LOCK'); assert.equal(state.locked, false); state.locked = true; state.log.push('lock'); },
      releaseLock: () => { state.locked = false; state.log.push('release'); if (options.releaseFailure) fail('RELEASE'); }
    }) },
    Utilities: { formatDate: () => '20261006', getUuid: randomUUID },
    Session: { getScriptTimeZone: () => 'Asia/Shanghai' },
    GmailApp: {
      getAliases: () => { state.log.push('gmail-read'); return []; },
      sendEmail: (to, subject, body, config) => {
        assert(state.log.indexOf('flush') < state.log.length);
        assert.equal(state.locked, false);
        state.log.push('mail');
        if (options.mailFailure) fail('MAIL');
        state.emails.push({ to, subject, body, config });
      }
    },
    HtmlService: { createHtmlOutput: (content) => ({ content, setTitle(title) { this.title = title; return this; } }) }
  });
  vm.runInContext(source, context);
  return { context, state, submit: (e = event()) => context.doPost(e) };
}
function rejected(f, e) {
  const output = f.submit(e);
  assert.equal(output.title, 'Request not confirmed.');
  assert.equal(f.state.rows.length, 0);
  assert.equal(f.state.emails.length, 0);
  assert(!output.content.includes('MOCK_PRIVATE_ERROR'));
  assert.equal(f.state.locked, false);
}
test('persists the exact row before sending with customer Reply-To and server ID/time', () => {
  const f = fixture(); const before = Date.now(); const out = f.submit();
  assert.equal(out.title, 'Requirement received.');
  assert.equal(f.state.rows.length, 1); const row = f.state.rows[0];
  assert(row[0].getTime() >= before && row[0].getTime() <= Date.now());
  assert.match(row[1], /^LNRFQ-20261006-[0-9A-F]{32}$/);
  assert.equal(row[2], 'controlled_test'); assert.equal(row[17], 'controlled_test');
  assert.equal(row[4], base.company); assert.equal(row[5], base.email);
  assert.deepEqual(Array.from(row.slice(18)), ['', false, false, false, false, false, '', '', '']);
  assert.deepEqual(f.state.log, ['lock', 'append', 'flush', 'release', 'mail']);
  assert.equal(f.state.emails[0].config.replyTo, base.email);
  assert(out.content.includes(row[1]));
});
test('normal RFQ initializes only server-owned commercial state', () => {
  const f = fixture(); f.submit(event({ submission_type: 'rfq' }));
  assert.equal(f.state.rows[0][17], 'new');
});
for (const field of ['company', 'email', 'requirement', 'destination']) {
  test('rejects missing/whitespace required ' + field, () => { for (const value of ['', '  \n  ']) rejected(fixture(), event({ [field]: value })); });
}
for (const [field, max] of Object.entries(limits)) {
  test('rejects overlength ' + field, () => rejected(fixture(), event({ [field]: 'x'.repeat(max + 1) })));
  test('rejects duplicate values for ' + field, () => rejected(fixture(), event({ [field]: ['a', 'b'] })));
}
test('rejects invalid email/language/submission type and malformed events', () => {
  for (const email of ['broken', 'a@b', 'a b@c.com', 'a@b@c.com', 'a@b.com\nBcc: other']) rejected(fixture(), event({ email }));
  for (const language of ['de', 'constructor', '__proto__']) rejected(fixture(), event({ language }));
  rejected(fixture(), event({ submission_type: 'paid' }));
  rejected(fixture(), null); rejected(fixture(), { parameters: {} });
  rejected(fixture(), event({}, 'application/json'));
  const e = event(); e.parameters.company = 'string'; rejected(fixture(), e);
  const e2 = event(); e2.parameters.company = [42]; rejected(fixture(), e2);
});
test('rejects every internal ledger column and unknown input', () => {
  for (const field of ['timestamp', 'lead_id', ...headers.slice(17), 'unexpected']) rejected(fixture(), event({ [field]: 'attacker' }));
});
test('guards all sheet text fields against each formula prefix', () => {
  for (const prefix of ['=', '+', '-', '@']) {
    const f = fixture(); f.submit(event({ company: ' \t' + prefix + 'payload', requirement: prefix + 'payload', name: prefix + 'payload', quantity: prefix + 'payload', destination: prefix + 'payload', deadline: prefix + 'payload', phone: prefix + 'payload', additional_requirements: prefix + 'payload', source_page: prefix + 'payload', referrer: prefix + 'payload', campaign: prefix + 'payload', outreach_source: prefix + 'payload' }));
    for (const col of [3, 4, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16]) assert.equal(f.state.rows[0][col], "'" + prefix + 'payload');
  }
});
test('normal notification failure marks new_notification_failed and still confirms storage', () => {
  const f = fixture({ mailFailure: true }); assert.equal(f.submit().title, 'Requirement received.');
  assert.equal(f.state.rows[0][17], 'new_notification_failed'); assert.equal(f.state.locked, false);
});
for (const option of ['statusFailure', 'recoveryLockFailure', 'movedRow']) {
  test('notification plus ' + option + ' never reports a saved RFQ as failed', () => {
    const f = fixture({ mailFailure: true, [option]: true }); const out = f.submit();
    assert.equal(out.title, 'Requirement received.'); assert.equal(f.state.rows.length, 1);
    assert(!out.content.includes('MOCK_PRIVATE_ERROR')); assert.equal(f.state.locked, false);
  });
}
for (const option of ['rowLookupFailure', 'releaseFailure']) {
  test('post-flush ' + option + ' keeps persisted success', () => {
    const f = fixture({ [option]: true }); assert.equal(f.submit().title, 'Requirement received.');
  });
}
for (const option of ['badHeader', 'extraColumn', 'openFailure', 'missingSheet', 'appendFailure', 'lockFailure']) {
  test(option + ' blocks persistence and mail safely', () => rejected(fixture({ [option]: true }), event()));
}
test('flush failure never claims confirmed persistence or sends mail', () => {
  const f = fixture({ flushFailure: true }); assert.equal(f.submit().title, 'Request not confirmed.');
  assert.equal(f.state.emails.length, 0); assert.equal(f.state.locked, false);
});
test('configuration stays external; missing IDs reject, missing email follows recovery path', () => {
  rejected(fixture({ props: { SPREADSHEET_ID: '' } }), event());
  const f = fixture({ props: { NOTIFICATION_EMAIL: '' } }); assert.equal(f.submit().title, 'Requirement received.');
  assert.equal(f.state.rows[0][17], 'new_notification_failed');
});
test('result HTML rejects dangerous return URLs and escapes lead text', () => {
  const f = fixture();
  for (const url of ['javascript:alert(1)', 'data:text/html,x', 'https://example.invalid/" onmouseover="bad']) {
    assert(!f.context.renderResult_(true, 'en', url, '<script>bad</script>').content.includes('<a href='));
  }
  const out = f.context.renderResult_(true, 'zh', 'https://example.invalid/', '<script>bad</script>');
  assert(out.content.includes('lang="zh-CN"')); assert(out.content.includes('&lt;script&gt;'));
  assert(out.content.includes('target="_top"'));
});
test('all five localized success and failure pages render', () => {
  const f = fixture();
  for (const lang of ['en', 'zh', 'fr', 'ru', 'es']) {
    for (const success of [true, false]) {
      const out = f.context.renderResult_(success, lang, '', 'local-id');
      assert(out.title); assert(out.content.includes('name="viewport"'));
      assert.equal(out.content.includes('local-id'), success);
    }
  }
});
test('maximum company/requirement lengths cannot overflow the Gmail subject', () => {
  const f = fixture(); f.submit(event({ company: 'Company\n' + 'x'.repeat(150), requirement: 'x'.repeat(4000) }));
  assert(f.state.emails[0].subject.length <= 200); assert(!f.state.emails[0].subject.includes('\n'));
});
test('read-only configuration helper makes no row or email', () => {
  const f = fixture(); assert.match(f.context.checkConfiguration(), /No RFQ or notification/);
  assert.equal(f.state.rows.length, 0); assert.equal(f.state.emails.length, 0);
});
