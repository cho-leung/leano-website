const LEANO_CONFIG = Object.freeze({
  sheetName: 'RFQ Ledger',
  headers: [
    'timestamp', 'lead_id', 'submission_type',
    'name', 'company', 'email',
    'requirement', 'quantity', 'destination', 'deadline', 'phone', 'additional_requirements',
    'language', 'source_page', 'referrer', 'campaign', 'outreach_source',
    'lead_status', 'owner_minutes', 'qualified', 'supplier_check_started', 'quoted', 'paid', 'delivered',
    'estimated_contribution', 'actual_contribution', 'notes_internal'
  ],
  allowedFields: [
    'name', 'company', 'email', 'requirement', 'quantity', 'destination', 'deadline', 'phone',
    'additional_requirements', 'language', 'source_page', 'referrer', 'campaign', 'outreach_source',
    'submission_type'
  ],
  limits: {
    name: 120,
    company: 160,
    email: 254,
    requirement: 4000,
    quantity: 120,
    destination: 180,
    deadline: 160,
    phone: 80,
    additional_requirements: 3000,
    language: 10,
    source_page: 1000,
    referrer: 1000,
    campaign: 200,
    outreach_source: 200,
    submission_type: 30
  }
});

function doGet() {
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><title>Leano RFQ</title>' +
    '<style>body{font:16px system-ui;margin:3rem;max-width:42rem;line-height:1.6;color:#1c231f;background:#f3efe5}</style>' +
    '<h1>Leano RFQ endpoint</h1><p>The web app is online. RFQs must be submitted through the Leano website form.</p>'
  );
}

// Run manually only during authorized configuration; reads services, sends no email and writes no rows.
function checkConfiguration() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = cleanText_(props.getProperty('SPREADSHEET_ID') || '', 200);
  const to = cleanText_(props.getProperty('NOTIFICATION_EMAIL') || '', 254);
  if (!spreadsheetId) throw new Error('CONFIG_SPREADSHEET_ID_MISSING');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error('CONFIG_NOTIFICATION_EMAIL_INVALID');
  if (!safeSiteUrl_(props.getProperty('SITE_BASE_URL'))) throw new Error('CONFIG_SITE_BASE_URL_INVALID');
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(LEANO_CONFIG.sheetName);
  if (!sheet) throw new Error('CONFIG_SHEET_MISSING');
  assertSchema_(sheet);
  GmailApp.getAliases();
  return 'Configuration and read access checked. No RFQ or notification created.';
}

function doPost(e) {
  let language = 'en';
  let persisted = false;
  let leadId = '';
  let siteBaseUrl = '';
  try {
    const params = normalizeRequest_(e);
    language = normalizeLanguage_(params.language);
    validateRequest_(params);

    const props = PropertiesService.getScriptProperties();
    siteBaseUrl = safeSiteUrl_(props.getProperty('SITE_BASE_URL') || '');
    const spreadsheetId = cleanText_(props.getProperty('SPREADSHEET_ID') || '', 200);
    if (!spreadsheetId) throw new Error('CONFIG_SPREADSHEET_ID_MISSING');

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(LEANO_CONFIG.sheetName);
    if (!sheet) throw new Error('CONFIG_SHEET_MISSING');

    const timestamp = new Date();
    leadId = createLeadId_(timestamp);
    const submissionType = params.submission_type === 'controlled_test' ? 'controlled_test' : 'rfq';
    const initialStatus = submissionType === 'controlled_test' ? 'controlled_test' : 'new';

    const row = [
      timestamp,
      leadId,
      submissionType,
      safeSheetText_(params.name),
      safeSheetText_(params.company),
      safeSheetText_(params.email),
      safeSheetText_(params.requirement),
      safeSheetText_(params.quantity),
      safeSheetText_(params.destination),
      safeSheetText_(params.deadline),
      safeSheetText_(params.phone),
      safeSheetText_(params.additional_requirements),
      safeSheetText_(language),
      safeSheetText_(params.source_page),
      safeSheetText_(params.referrer),
      safeSheetText_(params.campaign),
      safeSheetText_(params.outreach_source),
      initialStatus,
      '',
      false,
      false,
      false,
      false,
      false,
      '',
      '',
      ''
    ];

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    let rowNumber;
    try {
      assertSchema_(sheet);
      sheet.appendRow(row);
      SpreadsheetApp.flush();
      persisted = true;
      rowNumber = sheet.getLastRow();
    } finally {
      lock.releaseLock();
    }

    try {
      sendNotification_(params, language, leadId, submissionType, props);
    } catch (notificationError) {
      console.error('Leano notification failure', notificationError);
      try {
        markNotificationFailure_(sheet, rowNumber, leadId);
      } catch (statusError) {
        // Persistence is already confirmed; a recovery-write failure must not invite a duplicate RFQ.
        console.error('Leano notification status update failed', statusError);
      }
    }
  } catch (error) {
    console.error(persisted ? 'Leano post-persistence error' : 'Leano RFQ rejected', error);
  }
  return renderResult_(persisted, language, siteBaseUrl, persisted ? leadId : '');
}

function normalizeRequest_(e) {
  if (!e || !e.parameters || !e.postData ||
      String(e.postData.type || '').split(';')[0].trim().toLowerCase() !== 'application/x-www-form-urlencoded') {
    throw new Error('INVALID_REQUEST');
  }

  const submittedKeys = Object.keys(e.parameters);
  const unexpected = submittedKeys.filter(function(key) {
    return LEANO_CONFIG.allowedFields.indexOf(key) === -1;
  });
  if (unexpected.length) throw new Error('UNEXPECTED_FIELDS');

  const result = {};
  LEANO_CONFIG.allowedFields.forEach(function(key) {
    const values = e.parameters[key] || [];
    if (!Array.isArray(values) || values.some(function(value) { return typeof value !== 'string'; })) {
      throw new Error('INVALID_FIELD_VALUES');
    }
    if (values.length > 1) throw new Error('MULTI_VALUE_FIELD');
    result[key] = cleanText_(values.length ? values[0] : '', LEANO_CONFIG.limits[key]);
  });
  return result;
}

function validateRequest_(params) {
  ['company', 'email', 'requirement', 'destination'].forEach(function(field) {
    if (!params[field]) throw new Error('MISSING_REQUIRED_FIELD');
  });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
    throw new Error('INVALID_EMAIL');
  }

  if (params.language && ['en', 'zh', 'fr', 'ru', 'es'].indexOf(params.language) === -1) {
    throw new Error('INVALID_LANGUAGE');
  }

  if (params.submission_type && ['rfq', 'controlled_test'].indexOf(params.submission_type) === -1) {
    throw new Error('INVALID_SUBMISSION_TYPE');
  }
}

function cleanText_(value, maxLength) {
  let text = String(value == null ? '' : value);
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  text = text.trim();
  if (text.length > maxLength) throw new Error('FIELD_TOO_LONG');
  return text;
}

function safeSheetText_(value) {
  const text = String(value == null ? '' : value);
  return /^\s*[=+\-@]/.test(text) ? "'" + text : text;
}

function normalizeLanguage_(language) {
  return ['en', 'zh', 'fr', 'ru', 'es'].indexOf(language) !== -1 ? language : 'en';
}

function assertSchema_(sheet) {
  if (sheet.getLastColumn() !== LEANO_CONFIG.headers.length) throw new Error('SCHEMA_WIDTH_MISMATCH');
  const actual = sheet.getRange(1, 1, 1, LEANO_CONFIG.headers.length).getDisplayValues()[0];
  for (let i = 0; i < LEANO_CONFIG.headers.length; i += 1) {
    if (actual[i] !== LEANO_CONFIG.headers[i]) throw new Error('SCHEMA_MISMATCH');
  }
}

function createLeadId_(date) {
  const datePart = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyyMMdd');
  const token = Utilities.getUuid().replace(/-/g, '').toUpperCase();
  return 'LNRFQ-' + datePart + '-' + token;
}

function sendNotification_(params, language, leadId, submissionType, props) {
  const to = cleanText_(props.getProperty('NOTIFICATION_EMAIL') || '', 254);
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error('CONFIG_NOTIFICATION_EMAIL_INVALID');

  const summary = params.requirement.replace(/\s+/g, ' ').slice(0, 90);
  const prefix = submissionType === 'controlled_test' ? '[Leano CONTROLLED TEST]' : '[Leano RFQ]';
  const subject = (prefix + ' ' + params.company.replace(/\s+/g, ' ') + ' — ' + summary).slice(0, 200);
  const body = [
    'Lead ID: ' + leadId,
    'Submission type: ' + submissionType,
    '',
    'Name: ' + (params.name || '—'),
    'Company: ' + params.company,
    'Email: ' + params.email,
    'Phone / WhatsApp: ' + (params.phone || '—'),
    '',
    'Requirement:',
    params.requirement,
    '',
    'Quantity: ' + (params.quantity || '—'),
    'Destination: ' + params.destination,
    'Deadline: ' + (params.deadline || '—'),
    '',
    'Additional requirements:',
    params.additional_requirements || '—',
    '',
    'Language: ' + language,
    'Source page: ' + (params.source_page || '—'),
    'Referrer: ' + (params.referrer || '—'),
    'Campaign: ' + (params.campaign || '—'),
    'Outreach source: ' + (params.outreach_source || '—')
  ].join('\n');

  GmailApp.sendEmail(to, subject, body, {
    name: 'Leano RFQ',
    replyTo: params.email
  });
}

function markNotificationFailure_(sheet, rowNumber, leadId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    assertSchema_(sheet);
    // Verify identity before touching the recorded row; operators may have sorted the ledger.
    if (sheet.getRange(rowNumber, 2).getDisplayValues()[0][0] !== leadId) {
      throw new Error('NOTIFICATION_ROW_ID_MISMATCH');
    }
    // Column R = lead_status = 18.
    sheet.getRange(rowNumber, 18).setValue('new_notification_failed');
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function safeSiteUrl_(value) {
  const url = String(value || '').trim();
  return /^https:\/\/[A-Za-z0-9.-]+(?::\d+)?(?:[/?#][^\s<>"']*)?$/.test(url) ? url : '';
}

function renderResult_(success, language, siteBaseUrl, leadId) {
  const copy = {
    en: {
      successTitle: 'Requirement received.',
      successBody: 'Your RFQ has been recorded. Leano will review the requirement and respond using the contact details you provided.',
      failureTitle: 'Request not confirmed.',
      failureBody: 'We could not confirm that this RFQ was stored. Please return to Leano and try again, or reply to the Leano email you received.',
      back: 'Return to Leano'
    },
    zh: {
      successTitle: '采购需求已收到。',
      successBody: '你的 RFQ 已记录。Leano 将审核需求，并通过你提供的联系方式回复。',
      failureTitle: '请求未确认。',
      failureBody: '系统未能确认本次 RFQ 已成功存储。请返回 Leano 后重试，或直接回复你收到的 Leano 邮件。',
      back: '返回 Leano'
    },
    fr: {
      successTitle: 'Besoin reçu.',
      successBody: 'Votre RFQ a été enregistrée. Leano examinera le besoin et répondra via les coordonnées fournies.',
      failureTitle: 'Demande non confirmée.',
      failureBody: 'Nous ne pouvons pas confirmer que cette RFQ a été enregistrée. Revenez sur Leano et réessayez, ou répondez à l’e-mail Leano reçu.',
      back: 'Retourner sur Leano'
    },
    ru: {
      successTitle: 'Запрос получен.',
      successBody: 'RFQ сохранён. Leano рассмотрит требование и ответит по указанным контактным данным.',
      failureTitle: 'Запрос не подтверждён.',
      failureBody: 'Мы не смогли подтвердить сохранение RFQ. Вернитесь на сайт Leano и попробуйте снова или ответьте на полученное письмо Leano.',
      back: 'Вернуться на Leano'
    },
    es: {
      successTitle: 'Requerimiento recibido.',
      successBody: 'Tu RFQ ha quedado registrada. Leano revisará el requerimiento y responderá usando los datos de contacto proporcionados.',
      failureTitle: 'Solicitud no confirmada.',
      failureBody: 'No pudimos confirmar que esta RFQ se haya guardado. Vuelve a Leano e inténtalo de nuevo o responde al correo de Leano que recibiste.',
      back: 'Volver a Leano'
    }
  };

  const text = copy[normalizeLanguage_(language)];
  const title = success ? text.successTitle : text.failureTitle;
  const body = success ? text.successBody : text.failureBody;
  const safeUrl = safeSiteUrl_(siteBaseUrl);
  const link = safeUrl ? '<p><a href="' + escapeHtml_(safeUrl) + '" target="_top">' + escapeHtml_(text.back) + ' →</a></p>' : '';
  const id = success && leadId ? '<p class="id">' + escapeHtml_(leadId) + '</p>' : '';

  return HtmlService.createHtmlOutput(
    '<!doctype html><html lang="' + escapeHtml_(language === 'zh' ? 'zh-CN' : normalizeLanguage_(language)) + '"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml_(title) + '</title>' +
    '<style>body{margin:0;background:#f3efe5;color:#1c231f;font:16px/1.65 system-ui,-apple-system,sans-serif}.wrap{max-width:760px;margin:0 auto;padding:10vh 7vw}.brand{letter-spacing:.18em;font-weight:700;font-size:.8rem;color:#24473b}h1{font-family:Georgia,serif;font-weight:400;font-size:clamp(2.7rem,8vw,5.8rem);line-height:.95;max-width:10ch;margin:14vh 0 2rem}p{max-width:42rem}a{color:#24473b}.id{font-family:ui-monospace,monospace;font-size:.78rem;opacity:.65;margin-top:2rem}</style></head>' +
    '<body><main class="wrap"><div class="brand">LEANO</div><h1>' + escapeHtml_(title) + '</h1><p>' + escapeHtml_(body) + '</p>' + link + id + '</main></body></html>'
  ).setTitle(title);
}

function escapeHtml_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
