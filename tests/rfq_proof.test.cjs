const fs = require('node:fs');
const assert = require('node:assert/strict');
const test = require('node:test');

const index = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('script.js', 'utf8');
const styles = fs.readFileSync('styles.css', 'utf8');
const publicSource = `${index}\n${script}\n${styles}`;

test('selected RFQ work is located between process and audience sections', () => {
  const process = index.indexOf('id="process"');
  const proof = index.indexOf('id="selected-rfq-work"');
  const audience = index.indexOf('audience-section');
  assert.ok(process >= 0 && proof > process && audience > proof);
});

test('five-language proof keys and downstream numbering exist', () => {
  for (const key of ['sectionProof', 'proofTitle', 'proofIntro', 'proofOutcomeLabel', 'proofOutcome', 'proofPrinciple4']) {
    assert.equal((script.match(new RegExp(`${key}:`, 'g')) || []).length, 5, `${key} must exist in five locales`);
  }
  assert.equal((script.match(/proofEvidenceNote:/g) || []).length, 0, 'obsolete transaction-disclaimer key must be removed');
  for (const number of ['05 /', '06 /', '07 /']) assert.ok(script.includes(number));
});

test('work-completed copy states only the sourcing and quotation work actually performed', () => {
  const phrases = [
    'Supplier-route research, exact-spec verification and commercial quotation preparation for the verifiable portion of the RFQ.',
    '针对 RFQ 中可核实部分完成供应路径研究、精准规格核验与商业报价准备。',
    'Recherche des routes d’approvisionnement, vérification des spécifications exactes et préparation d’une cotation commerciale pour la partie vérifiable de la RFQ.',
    'Исследование маршрутов поставки, проверка точной спецификации и подготовка коммерческого предложения по проверяемой части RFQ.',
    'Investigación de rutas de suministro, verificación de especificaciones exactas y preparación de cotización comercial para la parte verificable de la RFQ.',
  ];
  for (const phrase of phrases) assert.ok(script.includes(phrase), `missing factual work-completed copy: ${phrase}`);
});

test('public copy does not foreground uncompleted-transaction disclaimers', () => {
  const oldDisclaimers = [
    'does not represent a completed transaction',
    'no purchase order, payment or delivery was completed',
    '不代表已经完成交易',
    '没有完成采购订单、付款或交付',
    'Il ne représente pas une transaction finalisée',
    'aucun bon de commande, paiement ni livraison n’a été finalisé',
    'Он не означает, что сделка была завершена',
    'заказ на покупку, оплата и поставка не были завершены',
    'No representa una transacción completada',
    'no se completó ninguna orden de compra, pago ni entrega',
  ];
  for (const phrase of oldDisclaimers) assert.ok(!publicSource.includes(phrase), `obsolete disclaimer remains public: ${phrase}`);
});

test('private buyer identity, location and forbidden exact SKUs are absent from public source', () => {
  const forbidden = [
    'Julius', 'Equilibrium General Supply', 'Uganda', 'Kampala', 'Cham Towers',
    'C7GG7AT#BH5', 'WD162PURX', 'WeChat', 'scam history'
  ];
  for (const token of forbidden) assert.ok(!publicSource.toLowerCase().includes(token.toLowerCase()), `private token leaked: ${token}`);
});

test('unsupported commercial-success claims are absent from public source', () => {
  const normalized = publicSource.toLowerCase();
  for (const phrase of [
    'successful project', 'client success', 'trusted by', 'completed procurement',
    'we delivered', 'order completed', 'payment received'
  ]) {
    assert.ok(!normalized.includes(phrase), `unsupported success claim: ${phrase}`);
  }
});

test('RFQ production endpoint remains unchanged', () => {
  assert.ok(script.includes("https://script.google.com/macros/s/AKfycbwny2Lu9DvREl_te12o7_KJxhgXUiwTNAEjWkK9zPImF3g7WevC03nyLt5DZLPNseqq/exec"));
});
