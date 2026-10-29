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
  for (const key of ['sectionProof', 'proofTitle', 'proofOutcome', 'proofEvidenceNote', 'proofPrinciple4']) {
    assert.equal((script.match(new RegExp(`${key}:`, 'g')) || []).length, 5, `${key} must exist in five locales`);
  }
  for (const number of ['05 /', '06 /', '07 /']) assert.ok(script.includes(number));
});

test('evidence boundary explicitly states no completed order/payment/delivery in every locale', () => {
  const phrases = [
    'no purchase order, payment or delivery was completed',
    '没有完成采购订单、付款或交付',
    'aucun bon de commande, paiement ni livraison n’a été finalisé',
    'заказ на покупку, оплата и поставка не были завершены',
    'no se completó ninguna orden de compra, pago ni entrega',
  ];
  for (const phrase of phrases) assert.ok(script.includes(phrase), `missing evidence-boundary phrase: ${phrase}`);
});

test('private buyer identity, location and forbidden exact SKUs are absent from public source', () => {
  const forbidden = [
    'Julius', 'Equilibrium General Supply', 'Uganda', 'Kampala', 'Cham Towers',
    'C7GG7AT#BH5', 'WD162PURX', 'WeChat', 'scam history'
  ];
  for (const token of forbidden) assert.ok(!publicSource.toLowerCase().includes(token.toLowerCase()), `private token leaked: ${token}`);
});

test('unsupported success claims are absent from the proof section source', () => {
  const proofStart = index.indexOf('id="selected-rfq-work"');
  const proofEnd = index.indexOf('audience-section', proofStart);
  const proofMarkup = index.slice(proofStart, proofEnd).toLowerCase();
  for (const phrase of ['successful project', 'client success', 'trusted by', 'completed procurement', 'we delivered']) {
    assert.ok(!proofMarkup.includes(phrase), `unsupported success claim: ${phrase}`);
  }
});

test('RFQ production endpoint remains unchanged', () => {
  assert.ok(script.includes("https://script.google.com/macros/s/AKfycbwny2Lu9DvREl_te12o7_KJxhgXUiwTNAEjWkK9zPImF3g7WevC03nyLt5DZLPNseqq/exec"));
});
